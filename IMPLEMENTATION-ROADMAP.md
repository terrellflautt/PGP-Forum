# SnapIT Forums - Complete Implementation Roadmap

## Current Status: Backend 100% Deployed ✅

**Last Updated:** 2025-10-05
**Backend:** LIVE with SSM secrets
**OAuth:** Client secret configured, needs redirect URI in Google Console

---

## Phase 1: OAuth Completion (30 minutes)

### Task 1.1: Configure Google OAuth Redirect URI
**Location:** https://console.cloud.google.com/apis/credentials

**Steps:**
1. Select project
2. Find OAuth Client ID: `242648112266-iglul54tuis9mhucsp1pmpqg0a48l8i0`
3. Click "Edit"
4. Add to **Authorized redirect URIs:**
   ```
   https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/auth/google/callback
   ```
5. Save

**Status:** ⏳ WAITING - User needs to add redirect URI

---

## Phase 2: Complete Messenger UI (4-6 hours)

### Priority 1: Core Chat Interface (WhatsApp Quality)

**File:** `/forum-app/src/components/Messenger/ChatInterface.tsx`

**Features:**
- Real-time message list with auto-scroll
- Message bubbles (sent/received styling)
- Timestamp display
- Read receipts (✓✓)
- Typing indicators ("Alice is typing...")
- Message status (sending, sent, delivered, read)
- Encryption indicators (🔒 badge)
- Auto-delete countdown timers
- Group chat support
- File attachment previews
- Voice message waveforms
- Reply/forward functionality

**Components to create:**
```
Messenger/
├── ChatInterface.tsx       (Main chat view)
├── MessageBubble.tsx      (Individual message)
├── MessageInput.tsx       (Send message box)
├── ConversationList.tsx   (Sidebar with chats)
├── ContactList.tsx        (Select recipients)
├── GroupChatModal.tsx     (Create group)
├── MessageActions.tsx     (Reply, forward, delete)
└── TypingIndicator.tsx    (Show who's typing)
```

### Priority 2: Username Selection Flow

**File:** `/forum-app/src/components/UsernameSetup.tsx`

**Features:**
- Show on first login (check if `user.username` exists)
- Input field with validation (@username format)
- "Randomize" button (generates secure random username)
- Check availability against DynamoDB
- Preview public URL: `forum.snapitsoftware.com/@username`
- Explanation of anonymous inbox feature

**Backend endpoint needed:**
```javascript
// POST /users/me/username
{
  "username": "whistleblower-reporter"
}
```

### Priority 3: Public Profile Pages

**File:** `/forum-app/src/pages/PublicProfile.tsx`

**Route:** `/@{username}`

**Features:**
- Public PGP key display
- Anonymous message form
- "Send encrypted tip" button
- No personal info shown
- Explanation text for sources
- Proof of ownership (signed message)

**Backend endpoint:**
```javascript
// GET /users/@{username}
{
  "username": "whistleblower-reporter",
  "pgpPublicKey": "-----BEGIN PGP PUBLIC KEY BLOCK-----...",
  "bio": "Investigative journalist specializing in...",
  "createdAt": 1234567890
}

// POST /messages/anonymous
{
  "recipient": "@whistleblower-reporter",
  "encryptedMessage": "...",
  "encryptedFile": "..." // optional
}
```

### Priority 4: Message Auto-Delete Controls

**File:** `/forum-app/src/components/Messenger/AutoDeleteControl.tsx`

**Features:**
- Dropdown in message input
- Options: Never, 1 hour, 1 day, 1 week, 1 month, Custom
- Visual countdown timer on messages
- "This message will self-destruct in 23:45:12"
- Server-side deletion job (Lambda scheduled event)
- Client-side secure shredder (7-pass overwrite)

**Backend:**
```javascript
// Message schema addition
{
  messageId: "msg_123",
  autoDeleteAt: 1234567890, // Unix timestamp
  autoDeleteEnabled: true
}

// Lambda scheduled event (every 5 minutes)
// Check for expired messages, delete with 7-pass shredder
```

---

## Phase 3: Advanced Messenger Features (2-3 days)

### Group Chats
- Create group modal
- Add/remove members
- Group key rotation
- Admin controls
- Group settings (name, icon, description)

### Voice/Video Calls
- WebRTC P2P setup
- Call UI (incoming/outgoing)
- Screen sharing
- Group calls (up to 8 free, 50 pro)

### File Sharing Enhanced
- Drag-and-drop upload
- File encryption before transfer
- P2P transfer progress bar
- Fallback to server if peer offline
- File preview (images, PDFs)

### Message Features
- Reply to message
- Forward message
- Edit message (within 5 min)
- Delete for everyone
- Pin messages
- Search messages
- Message reactions (emoji)

---

## Phase 4: Forum Features (1-2 days)

### Forum Management
- Create forum modal
- Forum settings page
- Category management
- Thread creation/editing
- Post composer (rich text)
- Moderation tools

### Public vs Private Forums
- Toggle forum visibility
- Invite-only access
- Password-protected forums
- Encrypted forum posts (private forums)

---

## Phase 5: Production Polish (1 day)

### Performance
- Virtual scrolling for message lists
- Image lazy loading
- Message pagination
- WebSocket reconnection logic
- Offline message queue

### UX Improvements
- Loading states
- Error handling
- Toast notifications
- Keyboard shortcuts
- Mobile responsiveness
- Dark mode toggle

### Security Indicators
- 🔒 Encryption status always visible
- 🕵️ Anonymous mode indicator
- Key verification UI
- Security warnings

---

## Implementation Priority Queue

### **NOW (Critical Path)**
1. ✅ OAuth redirect URI in Google Console
2. 🔄 Build ChatInterface.tsx (core messenger)
3. 🔄 Build UsernameSetup.tsx
4. 🔄 Build PublicProfile.tsx (@username)
5. 🔄 Auto-delete functionality

### **NEXT (Essential Features)**
6. Group chat UI
7. File sharing interface
8. Voice/video call skeleton
9. Forum create/manage UI

### **LATER (Polish)**
10. Message reactions
11. Message search
12. Advanced moderation
13. Dark mode
14. Mobile optimizations

---

## File Structure (Complete)

```
forum-app/src/
├── components/
│   ├── Messenger/
│   │   ├── ChatInterface.tsx         [PRIORITY 1]
│   │   ├── MessageBubble.tsx         [PRIORITY 1]
│   │   ├── MessageInput.tsx          [PRIORITY 1]
│   │   ├── ConversationList.tsx      [PRIORITY 1]
│   │   ├── ContactList.tsx
│   │   ├── GroupChatModal.tsx
│   │   ├── AutoDeleteControl.tsx     [PRIORITY 4]
│   │   └── TypingIndicator.tsx
│   ├── Forum/
│   │   ├── ForumView.tsx             [EXISTS]
│   │   ├── ThreadView.tsx
│   │   ├── PostComposer.tsx
│   │   └── CategoryManager.tsx
│   ├── Profile/
│   │   ├── UsernameSetup.tsx         [PRIORITY 2]
│   │   ├── PublicProfile.tsx         [PRIORITY 3]
│   │   └── ProfileSettings.tsx
│   ├── Security/
│   │   ├── PGPKeyManager.tsx
│   │   ├── DeadManSwitch.tsx
│   │   └── AnonymousInbox.tsx
│   ├── Header.tsx                     [EXISTS]
│   ├── Sidebar.tsx                    [EXISTS]
│   ├── LandingPage.tsx               [EXISTS]
│   └── LoginModal.tsx                [EXISTS]
├── hooks/
│   ├── useWebSocket.ts
│   ├── usePGPEncryption.ts
│   ├── useWebRTCRelay.ts
│   └── useAutoDelete.ts
└── utils/
    ├── encryption.ts
    ├── websocket.ts
    └── storage.ts
```

---

## Backend Endpoints Status

### ✅ Implemented
- `GET /auth/google` - Initiate OAuth
- `GET /auth/google/callback` - OAuth callback
- `POST /auth/refresh` - Refresh JWT
- `GET /forums` - List forums
- `POST /forums` - Create forum
- `GET /messages` - Get messages
- `POST /messages` - Send message
- `GET /users/{userId}` - Get user
- `PUT /users/me` - Update current user
- `POST /create-checkout-session` - Stripe checkout
- `POST /webhooks/stripe` - Stripe webhook
- `wss://...` - WebSocket signaling (9 endpoints)

### ⏳ Needed
- `POST /users/me/username` - Set username
- `GET /users/@{username}` - Public profile
- `POST /messages/anonymous` - Anonymous inbox
- `POST /messages/{id}/auto-delete` - Set auto-delete
- `POST /groups` - Create group
- `POST /groups/{id}/members` - Add member
- `DELETE /messages/{id}` - Delete message (7-pass)

---

## Testing Checklist

### OAuth Flow
- [ ] Click "Sign In with Google" redirects to Google
- [ ] After Google login, redirects to callback
- [ ] JWT token generated and stored
- [ ] User created in DynamoDB
- [ ] Free forum auto-created
- [ ] User redirected to app with token

### Messaging
- [ ] Send encrypted message
- [ ] Receive message with push notification
- [ ] Typing indicator shows
- [ ] Read receipt updates
- [ ] Message auto-delete works
- [ ] File transfer (P2P) works

### Profile
- [ ] Username selection on first login
- [ ] Public profile accessible at @username
- [ ] Anonymous message sending works
- [ ] PGP key displayed correctly

### Security
- [ ] Encryption indicators show
- [ ] Anonymous mode always on
- [ ] Keys stored in IndexedDB
- [ ] Messages encrypted in DynamoDB
- [ ] IP anonymized through relay

---

## Performance Targets

- **Message send latency:** < 100ms
- **WebSocket RTT:** < 50ms
- **Initial load time:** < 2s
- **Message list render:** < 100ms for 1000 messages
- **Encryption overhead:** < 10ms per message

---

## Success Metrics

### Week 1
- 100 signups
- 50 active users
- 1,000 messages sent
- 10 forums created

### Month 1
- 1,000 signups
- 500 active users
- 50,000 messages sent
- 100 forums created
- 5 paid subscribers

### Month 3
- 10,000 signups
- 5,000 active users
- 1M messages sent
- 1,000 forums created
- 100 paid subscribers

---

## Next Session Priorities

1. **Immediate:** Add OAuth redirect URI to Google Console
2. **Build:** ChatInterface.tsx (core messenger UI)
3. **Build:** UsernameSetup.tsx (first-login flow)
4. **Build:** PublicProfile.tsx (@username pages)
5. **Deploy:** Updated React app to S3
6. **Test:** Complete OAuth → Messaging flow

---

**Status:** Backend 100% deployed. Frontend 40% complete. OAuth ready (needs redirect URI). Messenger UI next priority.
