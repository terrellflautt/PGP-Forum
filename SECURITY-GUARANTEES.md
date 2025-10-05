# SnapIT Forum Security Guarantees

## Core Principles: Zero-Knowledge, Always Anonymous, No Recovery

### 1. **PGP Encryption (MANDATORY - Always On)**

✅ **What This Means:**
- All private messages are encrypted with 4096-bit RSA keys
- Your private key NEVER leaves your browser (`.extractable = false`)
- Server only stores encrypted ciphertext - we cannot read your messages
- If you lose your passphrase, your messages are **permanently lost** - there is NO recovery

❌ **What We Don't Have:**
- No "forgot password" for message decryption
- No master key to decrypt your messages
- No backdoors or government access
- No recovery mechanism of any kind

**User Responsibility:** Write down your passphrase and store it securely. We cannot help if you lose it.

---

### 2. **Anonymous Mode (MANDATORY - Always On)**

✅ **What This Means:**
- All API requests are routed through 3-5 random peer relays (WebRTC mesh)
- Server only sees the final relay peer's IP address, not yours
- Traffic is encrypted in onion layers (like Tor)
- Every user is automatically a relay node for others

❌ **What We Don't Track:**
- Your real IP address
- Your location
- Your browsing patterns
- Connection metadata

**User Responsibility:** All users contribute bandwidth as relay nodes. This is mandatory for the network to function.

---

### 3. **Data Storage Policy**

**What We Store:**
- Encrypted message ciphertext (we can't read it)
- Public keys (necessary for encryption)
- Forum metadata (thread titles, usernames)
- Subscription/billing info (Stripe manages this)

**What We DON'T Store:**
- Private keys (stay in your browser's IndexedDB)
- Decrypted message content
- IP addresses (anonymized through relays)
- Session logs or tracking cookies

---

### 4. **Account Security Model**

🔒 **Your Passphrase = Your Data**

When you create your account:
1. Google OAuth authenticates your identity
2. You create a passphrase for PGP keys
3. Private key generated in browser (non-extractable)
4. Public key uploaded to server

**Critical Warning:** If you lose your passphrase:
- ❌ All encrypted messages are permanently lost
- ❌ We cannot recover them (this is by design)
- ✅ You can still log in with Google
- ✅ You can generate a new key pair (but old messages stay encrypted)

---

### 5. **Ephemeral Messages (Auto-Delete)**

✅ **How It Works:**
- Set expiration time when sending message (1 hour to 30 days)
- After expiration, message is shredded with 7-pass overwrite (DoD 5220.22-M)
- Even if someone hacks the server, deleted messages are unrecoverable

**Shredder Process:**
1. Overwrite with random data 7 times
2. Delete from DynamoDB
3. Mark as tombstone (prevents resurrection)

---

### 6. **Threat Model - What We Protect Against**

| Threat | Protection |
|--------|------------|
| **Server Compromise** | ✅ Messages stay encrypted (we don't have keys) |
| **Network Surveillance** | ✅ IP anonymized through relay mesh |
| **Government Subpoena** | ✅ We only have encrypted data (can't decrypt) |
| **Malicious Admin** | ✅ Non-extractable keys (admin can't export them) |
| **Lost Passphrase** | ❌ Messages are permanently lost (no recovery) |
| **Browser Compromise** | ❌ Attacker can extract keys from IndexedDB |
| **Physical Device Access** | ❌ If unlocked, keys are accessible |

---

### 7. **What We're NOT**

❌ **We are NOT:**
- A backup service (you own your keys and data)
- A password manager (we don't store your passphrase)
- Responsible for lost passphrases
- Subject to takedown requests (messages are undecryptable)

✅ **We ARE:**
- A zero-knowledge communication platform
- Trustless by design (you don't have to trust us)
- Committed to privacy and anonymity
- Transparent about our limitations

---

### 8. **Comparison to Other Platforms**

| Feature | SnapIT Forum | ProBoards | Discord | Reddit |
|---------|--------------|-----------|---------|--------|
| **E2E Encryption** | ✅ Always on | ❌ None | ❌ None | ❌ None |
| **IP Anonymization** | ✅ P2P relay | ❌ Logged | ❌ Logged | ❌ Logged |
| **Server Can Read Messages** | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| **Account Recovery** | ❌ No (by design) | ✅ Yes | ✅ Yes | ✅ Yes |
| **Data Ownership** | ✅ You own it | ❌ Platform owns | ❌ Platform owns | ❌ Platform owns |
| **Government Compliance** | ❌ Can't decrypt | ✅ Must comply | ✅ Must comply | ✅ Must comply |

---

### 9. **Legal Disclaimer**

**SnapIT Forum is a TOOL, not a SERVICE:**

- We provide cryptographic infrastructure
- We do NOT have access to decrypt user content
- We CANNOT comply with decryption orders (technically impossible)
- We WILL provide metadata if legally compelled (timestamps, public keys)
- We do NOT recommend illegal activity

**Use Responsibly:** This platform is designed for privacy-conscious communication. You are responsible for your own content and compliance with local laws.

---

### 10. **Setup Instructions (First Login)**

1. **Login with Google** → Authenticates your identity
2. **Create Passphrase** → Generates your PGP key pair
3. **Write Down Passphrase** → Store in password manager or secure location
4. **Verify Backup** → Re-enter passphrase to confirm

**Critical Steps:**
- ✅ DO: Use a strong, unique passphrase (20+ characters)
- ✅ DO: Store passphrase in a password manager (1Password, Bitwarden)
- ✅ DO: Write backup copy on paper, store in safe
- ❌ DON'T: Use simple passwords like "password123"
- ❌ DON'T: Trust anyone else with your passphrase
- ❌ DON'T: Expect recovery if you lose it

---

### 11. **Technical Architecture**

```
User Browser (Your Computer)
├── Private Key (IndexedDB, non-extractable)
├── Web Crypto API (encryption/decryption)
├── WebRTC Relay (IP anonymization)
└── Google OAuth (authentication only)

↓ Encrypted traffic through 3-5 peer relays ↓

SnapIT Server (AWS)
├── Encrypted ciphertext (can't decrypt)
├── Public keys (needed for sending)
├── Forum metadata (threads, posts)
└── Stripe subscriptions (billing)
```

**Key Point:** The arrow goes ONE WAY. Server cannot decrypt messages or see your IP.

---

### 12. **Open Source & Auditing**

- GitHub: https://github.com/terrellflautt/PGP-Forum
- All cryptographic code is open source
- Web Crypto API is browser-native (vetted by Mozilla/Google/Apple)
- Invite security audits from community

**Transparency:** We believe in "trust through verification, not authority."

---

## Questions?

**Q: What if I forget my passphrase?**
A: Your messages are permanently lost. This is by design. Generate a new key pair for future messages.

**Q: Can SnapIT read my messages?**
A: No. Technically impossible due to non-extractable private keys.

**Q: Can law enforcement force you to decrypt?**
A: We cannot decrypt what we don't have keys for. We can only provide encrypted data.

**Q: Is anonymous mode really anonymous?**
A: Yes, as long as enough peers are online. Traffic is routed through 3-5 random relays. Server only sees final relay IP.

**Q: What if the relay peers are malicious?**
A: They can only see encrypted onion layers. Each peer decrypts one layer, revealing only the next hop. No peer sees the full route or message content.

**Q: Can I turn off encryption or anonymous mode?**
A: No. Both are mandatory for all users. This is a feature, not a bug.

---

**Last Updated:** 2025-10-04
**Platform Version:** 1.0.0 (Project Chimera)
**Security Contact:** security@snapitsoftware.com
