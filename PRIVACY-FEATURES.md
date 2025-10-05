# 🔐 Privacy & Ephemeral Features

**Project**: SnapIT Forum - Privacy-Focused Messenger & Forum
**Last Updated**: October 5, 2025

---

## 🎯 Privacy Architecture

### Core Principles
1. **Zero-Knowledge**: Server never sees plaintext private messages
2. **Ephemeral by Default**: Private messages auto-delete after delivery
3. **User Control**: Only users can save messages to their device
4. **P2P File Sharing**: Files transmitted peer-to-peer, auto-delete after receipt
5. **Public Forum Posts**: Text-only, no media uploads (prevents tracking/fingerprinting)

---

## 💬 Private Messages (Ephemeral)

### Current Implementation
- Messages stored in DynamoDB `messages` table
- PGP encrypted (4096-bit RSA)
- Server stores ciphertext only

### Required Changes for Ephemeral Messaging

#### 1. Auto-Delete After Delivery
```javascript
// messages table schema (UPDATED)
{
  conversationId: "user1#user2",
  timestamp: 1696003200000,
  fromUserId: "user_abc123",
  toUserId: "user_xyz789",
  encryptedContent: "-----BEGIN PGP MESSAGE-----...",
  delivered: false,  // NEW: Track delivery status
  ttl: 1696006800,   // NEW: Auto-expire 1 hour after creation OR after delivery
  expiresAt: 1696006800  // NEW: Explicit expiration timestamp
}
```

#### 2. Delivery Tracking
- When recipient fetches messages, mark as `delivered: true`
- Set TTL to `current_time + 60 seconds` (delete 1 minute after delivery)
- DynamoDB TTL automatically deletes expired items

#### 3. Client-Side Storage
```typescript
// Client can optionally save decrypted messages to localStorage
interface SavedMessage {
  conversationId: string;
  timestamp: number;
  fromUserId: string;
  decryptedContent: string;
  savedAt: number;
}

// Only saved if user explicitly enables "Save Message History"
localStorage.setItem('saved_messages', JSON.stringify(savedMessages));
```

---

## 📁 P2P File Sharing (Ephemeral)

### Implementation Strategy

#### 1. WebRTC Direct Connection
```javascript
// File transfer flow:
Alice                          WebRTC Signaling                  Bob
  │                                  │                              │
  ├─ Select file ───────────────────►│                              │
  │                                  │                              │
  │  ◄───── Signal via WebSocket ───┤─────── Offer ───────────────►│
  │                                  │                              │
  │  ◄────────────────────────────────────── Answer ───────────────┤
  │                                  │                              │
  ├──────────────── P2P File Transfer (Direct) ───────────────────►│
  │                                  │                              │
  │  [File sent]                     │                   [File received]
  │  [Delete from memory]            │          [Save to Downloads or discard]
```

#### 2. No Server Storage
- Files **NEVER** touch DynamoDB or S3
- Files transmitted in encrypted chunks via WebRTC DataChannel
- Files only exist in sender's memory during transfer
- Recipient can choose to save or discard

#### 3. Auto-Delete After Receipt
```typescript
// Sender
const fileChunks = splitFileIntoChunks(file);
for (const chunk of fileChunks) {
  dataChannel.send(encryptChunk(chunk));
}
// Clear from memory immediately
fileChunks = null;
file = null;

// Receiver
let receivedChunks: ArrayBuffer[] = [];
dataChannel.onmessage = (event) => {
  receivedChunks.push(event.data);

  if (isLastChunk(event.data)) {
    const file = reconstructFile(receivedChunks);

    // Prompt user: Save or Discard?
    if (userWantsToSave) {
      downloadFile(file);
    }

    // Clear from memory
    receivedChunks = [];
    file = null;
  }
};
```

---

## 📋 Public Forum Posts (Text-Only)

### Current Implementation
- Posts stored in DynamoDB `posts` table
- Users can post any content (including images, links, etc.)

### Required Changes

#### 1. Text-Only Validation
```javascript
// Backend: src/handlers/posts.js
exports.createPost = async (event) => {
  const { content, threadId } = JSON.parse(event.body);

  // Validate: text only, no images/videos/files
  if (containsMediaUrls(content)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Media uploads not allowed in public posts' })
    };
  }

  // Validate: no base64 encoded images
  if (containsBase64Images(content)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Embedded images not allowed' })
    };
  }

  // Allow text, markdown, and external links
  // ...
};

function containsMediaUrls(text) {
  const mediaExtensions = /\.(jpg|jpeg|png|gif|mp4|webm|avi|mov|pdf|zip)/i;
  return mediaExtensions.test(text);
}

function containsBase64Images(text) {
  return /data:image\/(png|jpeg|jpg|gif|webp);base64,/.test(text);
}
```

#### 2. Frontend Validation
```typescript
// forum-app/src/components/PostEditor.tsx
const handleSubmit = () => {
  if (content.includes('data:image/') || /\.(jpg|jpeg|png|gif|mp4)$/i.test(content)) {
    alert('Media uploads are not allowed in public forum posts. Please use text only.');
    return;
  }

  // Submit post
  submitPost(content);
};
```

#### 3. Why Text-Only?
- **Privacy**: Images contain EXIF metadata (location, device info)
- **Fingerprinting**: Media uploads can be tracked across platforms
- **Storage Costs**: Images/videos are expensive to store
- **Bandwidth**: Text-only keeps the platform fast and accessible
- **Censorship Resistance**: Text is harder to censor than images

---

## 🔒 Zero-Knowledge Message Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     ALICE (Sender)                              │
├─────────────────────────────────────────────────────────────────┤
│  1. Fetch Bob's PGP public key                                  │
│  2. Encrypt message with openpgp.js (client-side)               │
│  3. Send ciphertext to server                                   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SERVER (DynamoDB)                             │
├─────────────────────────────────────────────────────────────────┤
│  ❌ Cannot decrypt! Only has ciphertext:                        │
│     "-----BEGIN PGP MESSAGE-----                                │
│      wcBMA+mK2SvwhiKpAQf/..."                                   │
│                                                                 │
│  ✅ Stores ciphertext temporarily                               │
│  ✅ Sets TTL for auto-delete                                    │
│  ✅ Marks as delivered when Bob fetches                         │
│  ✅ Deletes 1 minute after delivery                             │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BOB (Receiver)                              │
├─────────────────────────────────────────────────────────────────┤
│  1. Fetch encrypted messages                                    │
│  2. Decrypt with private key (client-side)                      │
│  3. Display plaintext message                                   │
│  4. (Optional) Save to localStorage                             │
│                                                                 │
│  Server deletes ciphertext 1 minute later!                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Implementation Checklist

### Phase 1: Ephemeral Messages (Week 1)
- [x] Add `delivered` and `ttl` fields to messages table
- [ ] Update `sendMessage` Lambda to set TTL
- [ ] Update `getMessages` Lambda to mark as delivered
- [ ] Add client-side "Save Message History" toggle
- [ ] Test auto-delete after delivery

### Phase 2: P2P File Sharing (Week 2)
- [ ] Implement WebRTC DataChannel file transfer
- [ ] Add file chunking and encryption
- [ ] Build file transfer UI (progress bar, cancel)
- [ ] Add "Save or Discard" prompt on receipt
- [ ] Test large file transfers (up to 100MB)

### Phase 3: Text-Only Posts (Week 1)
- [ ] Add backend validation for media URLs
- [ ] Add frontend validation in PostEditor
- [ ] Update API documentation
- [ ] Add user-facing warning when media detected
- [ ] Test with various media types

---

## 🚀 Deployment Strategy

### Backend Updates
```bash
# Update Lambda functions
npm run deploy:prod

# Verify DynamoDB TTL is enabled
aws dynamodb describe-time-to-live --table-name snapit-forum-api-messages-prod

# Enable TTL if not already enabled
aws dynamodb update-time-to-live \
  --table-name snapit-forum-api-messages-prod \
  --time-to-live-specification "Enabled=true, AttributeName=ttl"
```

### Frontend Updates
```bash
# Rebuild React app
cd forum-app
npm run build

# Deploy to S3
aws s3 sync build/ s3://snapit-forum-static/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id E1X8SJIRPSICZ4 --paths "/*"
```

---

## 🔍 Testing Plan

### Ephemeral Messages
1. Send message from Alice to Bob
2. Bob fetches message (should mark as delivered)
3. Wait 1 minute
4. Query DynamoDB - message should be gone
5. Check Bob's localStorage - message should be saved if enabled

### P2P File Sharing
1. Alice sends 10MB file to Bob
2. Monitor network - file should NOT go through API Gateway
3. Bob receives file
4. Check Alice's memory - file should be cleared
5. Bob saves or discards - file should not persist in browser

### Text-Only Posts
1. Try posting with image URL - should fail
2. Try posting with base64 image - should fail
3. Post plain text - should succeed
4. Post markdown with external link - should succeed

---

## 💡 User Education

### Landing Page Copy
```
🔐 Your Privacy, Guaranteed

Unlike other platforms, we can't read your messages - even if we wanted to.
Here's how we protect you:

✅ Zero-Knowledge Encryption: All messages encrypted on your device
✅ Ephemeral by Default: Messages auto-delete after delivery
✅ P2P File Sharing: Files never touch our servers
✅ Text-Only Forums: No tracking pixels or metadata in images

Your data. Your control. Always.
```

---

## 📚 References

- [DynamoDB TTL Documentation](https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html)
- [WebRTC DataChannel API](https://developer.mozilla.org/en-US/docs/Web/API/RTCDataChannel)
- [OpenPGP.js Encryption](https://openpgpjs.org/)
- [Zero-Knowledge Architecture](https://en.wikipedia.org/wiki/Zero-knowledge_proof)

---

**Status**: Ready for Implementation ✅
**Priority**: High 🔥
**Impact**: Critical for user trust and privacy 🔐
