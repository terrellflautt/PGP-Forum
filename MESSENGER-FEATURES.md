# SnapIT Messenger - Simple, Secure, Full-Featured

## Design Philosophy

**Maximum Security + Minimum Complexity = Best User Experience**

---

## Core Features

### 1. Private Messaging (1-on-1)
✅ **Already Built:**
- PGP encrypted (4096-bit RSA)
- Anonymous IP relay (3-5 peer hops)
- Non-extractable keys (browser enforced)
- File sharing (< 5MB, P2P transfer)
- Read receipts
- Typing indicators

**Security:** End-to-end encrypted. Server cannot read messages.

---

### 2. Private Group Chats (NEW)

**How It Works:**
1. Create group (up to 100 members for free tier)
2. Each message encrypted with group key
3. Group key encrypted individually for each member
4. Server only stores encrypted ciphertext

**Features:**
- ✅ Up to 100 members (free), 500 (pro), 1000 (business), unlimited (enterprise)
- ✅ Group admin controls (add/remove members, manage permissions)
- ✅ Encrypted group files (shared documents, images)
- ✅ Group encryption key rotation (when members leave)
- ✅ Group anonymous mode (all members' IPs anonymized)
- ✅ Disappearing messages (auto-delete after time limit)

**Simple UX:**
```
User clicks: "New Group Chat"
→ Select members (from contacts)
→ Name the group
→ Done! Group created and encrypted automatically
```

**Security:** Each message encrypted with rotating group key. When member leaves, new key generated and distributed to remaining members.

---

### 3. Ephemeral Messages (Auto-Delete)

**How It Works:**
1. When composing message, click ⏱️ icon
2. Set timer: 1 hour, 1 day, 1 week, 1 month
3. Send message
4. After timer expires: 7-pass secure shredder deletes message

**Features:**
- ✅ Works in 1-on-1 and group chats
- ✅ Timer countdown visible in chat
- ✅ Forensically unrecoverable after deletion
- ✅ Recipient cannot disable timer

**Simple UX:**
```
Click ⏱️ → Choose "1 day" → Send
Message shows: "This message will self-destruct in 23:59:45"
```

**Security:** DoD 5220.22-M standard 7-pass overwrite. Even with server access, deleted messages cannot be recovered.

---

### 4. Anonymous Inbox (Public PGP Directory)

**How It Works:**
1. User enables "Anonymous Inbox" in settings
2. Publishes PGP public key + username to directory
3. Anyone can send encrypted messages to username
4. Sender stays anonymous (WebRTC relay)

**Features:**
- ✅ Receive messages from anyone without revealing contact info
- ✅ Sender anonymity (no phone number, email, or IP logged)
- ✅ Spam protection (require proof-of-work for anonymous senders)
- ✅ Ephemeral delivery (messages auto-delete after pickup)

**Simple UX:**
```
Settings → Enable "Anonymous Inbox"
Share your username: @securewhistleblower
Anyone can send you encrypted messages at:
https://forum.snapitsoftware.com/inbox/@securewhistleblower
```

**Security:** Senders use WebRTC relay (anonymous IP). Server never knows sender identity. Messages deleted after delivery.

---

### 5. Dead Man's Switch

**How It Works:**
1. Create encrypted message/file
2. Set check-in interval (24h, 48h, 72h)
3. Add recipients (who receive if you fail to check in)
4. Check in regularly to prevent release
5. If you miss 2 check-ins: message auto-released to recipients

**Use Cases:**
- Whistleblower protection (release docs if compromised)
- Digital inheritance (share passwords with family after death)
- Backup key recovery (release recovery phrase if locked out)

**Simple UX:**
```
Messenger → Dead Man's Switch → New Switch
→ Upload encrypted file / Write message
→ Set check-in: Every 72 hours
→ Add recipients: spouse@example.com, lawyer@firm.com
→ Done! You'll get reminders to check in
```

**Security:** Message encrypted with recipient's public keys. Server cannot decrypt even if switch triggers.

---

### 6. File Sharing (P2P, Zero Server Storage)

**How It Works:**
1. Select file (< 5MB free, < 100MB pro)
2. File encrypted with PGP
3. Transferred directly peer-to-peer via WebRTC
4. Server never stores file content (only metadata)

**Features:**
- ✅ Direct P2P transfer (bypasses server)
- ✅ End-to-end encrypted
- ✅ No file size limits for P2P transfer
- ✅ Fallback to server if both users offline (encrypted)
- ✅ Auto-delete after download (ephemeral files)

**Simple UX:**
```
Click 📎 → Select file → Send
Recipient receives: "Encrypted file: contract.pdf (2.4 MB)"
Click "Download" → Decrypts automatically
```

**Security:** Files never stored unencrypted on server. P2P transfer means server doesn't touch file data.

---

### 7. Voice/Video Calls (Encrypted P2P)

**How It Works:**
1. Click 📞 or 📹 button
2. Establishes encrypted WebRTC connection
3. Direct peer-to-peer audio/video stream
4. Server only facilitates connection (doesn't relay data)

**Features:**
- ✅ End-to-end encrypted (SRTP)
- ✅ Peer-to-peer (low latency)
- ✅ Screen sharing
- ✅ Group calls (up to 8 people free, 50 pro)
- ✅ No call recording (by design)

**Simple UX:**
```
In chat → Click 📞 → Call starts
Encrypted indicator: 🔒 Call encrypted (P2P)
```

**Security:** WebRTC with DTLS-SRTP encryption. Server cannot intercept audio/video. All streams peer-to-peer.

---

### 8. Read Receipts & Typing Indicators

**How It Works:**
- Read receipts: ✓✓ turns blue when message read
- Typing indicator: "Alice is typing..." shows in real-time

**Privacy Option:**
- Can disable read receipts in settings
- Typing indicators can be disabled

**Simple UX:**
```
Settings → Privacy → Disable read receipts
(Your contacts won't know when you've read their messages)
```

**Security:** These features use encrypted metadata. Server sees encrypted packets, not actual content.

---

### 9. Contact Verification (Trust on First Use)

**How It Works:**
1. First time you message someone, see their key fingerprint
2. Verify fingerprint out-of-band (phone call, in person)
3. Mark contact as "Verified" ✅
4. Future messages show verification status

**Features:**
- ✅ QR code verification (scan in person)
- ✅ Fingerprint comparison
- ✅ Warning if key changes (potential MITM attack)

**Simple UX:**
```
Click contact → "Verify Contact"
→ Compare fingerprint: a3f8d9e2c1b4...
→ OR scan QR code in person
→ Mark as "Verified ✅"
```

**Security:** Prevents man-in-the-middle attacks. If someone's key changes unexpectedly, you're warned.

---

### 10. Disappearing Media (Screenshot Protection)

**How It Works:**
1. Send photo/video with disappearing option
2. Recipient can view once
3. Auto-deletes after viewing
4. Screenshot detection (iOS/Android)

**Features:**
- ✅ View-once media
- ✅ Screenshot alerts (when supported)
- ✅ Auto-delete from both devices
- ✅ No forwarding allowed

**Simple UX:**
```
Send photo → Toggle "View once" → Send
Recipient opens photo → Photo disappears
If screenshot taken: "Alice took a screenshot" (alert)
```

**Security:** Best-effort screenshot protection. Can't prevent all screen captures, but alerts you if detected.

---

## Summary: Feature Matrix

| Feature | Free Tier | Pro Tier | Business | Enterprise |
|---------|-----------|----------|----------|------------|
| **1-on-1 Messaging** | ✅ Unlimited | ✅ Unlimited | ✅ Unlimited | ✅ Unlimited |
| **Group Chats** | ✅ Up to 100 | ✅ Up to 500 | ✅ Up to 1000 | ✅ Unlimited |
| **File Sharing** | ✅ 5MB P2P | ✅ 100MB P2P | ✅ 1GB P2P | ✅ Unlimited |
| **Voice/Video Calls** | ✅ 1-on-1 | ✅ Up to 8 | ✅ Up to 50 | ✅ Unlimited |
| **Ephemeral Messages** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Dead Man's Switch** | ✅ 3 active | ✅ 10 active | ✅ 50 active | ✅ Unlimited |
| **Anonymous Inbox** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **Contact Verification** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **PGP Encryption** | ✅ 4096-bit | ✅ 4096-bit | ✅ 4096-bit | ✅ 4096-bit |
| **Anonymous IP Relay** | ✅ Always on | ✅ Always on | ✅ Always on | ✅ Always on |

---

## Key Design Principles

### 1. Security by Default
- Encryption always on (can't be disabled)
- Anonymous mode always on (can't be disabled)
- Non-extractable keys (browser enforced)

### 2. Zero-Knowledge Architecture
- Server stores only encrypted ciphertext
- Group keys encrypted per-member
- File transfers peer-to-peer (bypass server)

### 3. Simple UX
- One-click group creation
- Automatic encryption (no user config needed)
- Visual indicators (🔒 = encrypted, 🕵️ = anonymous)

### 4. No Compromises
- No backdoors (technically impossible)
- No data collection (zero-knowledge design)
- No ads (subscription model)

---

## Implementation Priority (Next Sprint)

1. ✅ **Group Chat Backend** (DynamoDB schema, Lambda handlers)
2. ✅ **Group Encryption** (Group key generation, member encryption)
3. ✅ **Group UI** (Create group, add members, chat interface)
4. ⬜ **Voice/Video Calls** (WebRTC signaling, P2P setup)
5. ⬜ **Disappearing Media** (View-once photos, screenshot detection)
6. ⬜ **Contact Verification** (QR code generation, fingerprint display)

---

**Bottom Line:** SnapIT Messenger combines Signal's security, Telegram's features, and WhatsApp's simplicity - but with true zero-knowledge architecture that even we can't break.
