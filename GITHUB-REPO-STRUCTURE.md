# 🗂️ SnapIT Ecosystem - GitHub Repository Structure

**Date**: October 6, 2025
**Organization**: [terrellflautt](https://github.com/terrellflautt) or create `snapitsoftware` org?

---

## 📦 **Repository List**

### **1. snapit-community-forum**
Main forum platform where everyone joins by default

**URL**: `https://github.com/terrellflautt/snapit-community-forum`
**Live**: `https://forum.snapitsoftware.com`

**Contains**:
```
/
├── forum-app/              # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
├── src/
│   └── handlers/           # Lambda functions (48 total)
│       ├── auth.js
│       ├── forums.js
│       ├── threads.js
│       ├── posts.js
│       ├── messages.js
│       ├── users.js
│       └── stripe.js
├── serverless.yml          # Infrastructure config
├── package.json
└── README.md
```

**Features**:
- Forum backend (REST API + WebSocket)
- React frontend
- Authentication (Google OAuth + Email)
- PGP encrypted messaging
- Stripe payments
- Forum/category/thread/post management

---

### **2. snapit-messenger**
Standalone PGP encrypted messenger (FREE forever)

**URL**: `https://github.com/terrellflautt/snapit-messenger`
**Live**: `https://messenger.snapitsoftware.com`

**Contains**:
```
/
├── src/
│   ├── components/
│   │   ├── ChatInterface.tsx
│   │   ├── ConversationList.tsx
│   │   ├── MessageInput.tsx
│   │   └── MessageBubble.tsx
│   ├── utils/
│   │   └── pgp.ts
│   ├── App.tsx
│   └── index.tsx
├── public/
├── package.json
└── README.md
```

**Features**:
- Standalone messenger app (no forum required)
- PGP encryption (4096-bit RSA)
- Anonymous relay (3-5 hops)
- Auto-delete messages
- Dead Man's Switch
- Works embedded OR standalone

---

### **3. snapit-polls**
Anonymous polling and surveys

**URL**: `https://github.com/terrellflautt/snapit-polls`
**Live**: `https://polls.snapitsoftware.com`

**Contains**:
```
/
├── polls-app/              # React frontend (TBD)
│   ├── src/
│   ├── public/
│   └── package.json
├── src/
│   └── handlers/           # Lambda functions (7 total)
│       ├── authorizer.js
│       ├── createPoll.js
│       ├── getPoll.js
│       ├── listPolls.js
│       ├── deletePoll.js
│       ├── vote.js
│       └── getResults.js
├── serverless.yml
├── package.json
└── README.md
```

**Features**:
- Create anonymous polls
- Real-time voting
- Results visualization
- Shareable links
- Rate limiting
- Spam protection

---

### **4. snapit-burn**
Self-destructing file sharing

**URL**: `https://github.com/terrellflautt/snapit-burn`
**Live**: `https://burn.snapitsoftware.com`

**Contains**:
```
/
├── burn-app/               # React frontend (TBD)
│   ├── src/
│   ├── public/
│   └── package.json
├── src/
│   └── handlers/           # Lambda functions (6 total)
│       ├── authorizer.js
│       ├── upload.js
│       ├── getBurn.js
│       ├── download.js
│       ├── listBurns.js
│       └── deleteBurn.js
├── serverless.yml
├── package.json
└── README.md
```

**Features**:
- Upload files (presigned S3 URLs)
- Password protection
- Auto-delete after download
- Time-based expiry
- Download tracking
- File metadata

---

### **5. snapit-marketing**
Marketing website and landing pages

**URL**: `https://github.com/terrellflautt/snapit-marketing`
**Live**: `https://snapitsoftware.com`

**Contains**:
```
/
├── src/
│   ├── pages/
│   │   ├── index.tsx       # Homepage
│   │   ├── pricing.tsx
│   │   ├── features.tsx
│   │   ├── about.tsx
│   │   └── contact.tsx
│   ├── components/
│   └── styles/
├── public/
├── package.json
└── README.md
```

**Features**:
- Marketing site
- Product pages
- Pricing tiers
- Feature comparisons
- Blog (optional)
- Documentation

---

### **6. snapit-docs**
Developer documentation and API reference

**URL**: `https://github.com/terrellflautt/snapit-docs`
**Live**: `https://docs.snapitsoftware.com`

**Contains**:
```
/
├── docs/
│   ├── getting-started.md
│   ├── api-reference.md
│   ├── authentication.md
│   ├── webhooks.md
│   └── sdks.md
├── docusaurus.config.js
└── README.md
```

**Features**:
- API documentation
- SDK guides
- Integration tutorials
- Code examples
- Postman collections

---

### **7. snapit-infrastructure** (Private)
Terraform/CloudFormation for AWS infrastructure

**URL**: `https://github.com/terrellflautt/snapit-infrastructure`
**Visibility**: **PRIVATE**

**Contains**:
```
/
├── terraform/
│   ├── modules/
│   ├── environments/
│   │   ├── dev/
│   │   ├── staging/
│   │   └── prod/
│   └── main.tf
├── cloudformation/
└── scripts/
```

**Features**:
- Infrastructure as Code
- Environment configs
- CI/CD pipelines
- Monitoring setup
- Backup policies

---

## 🏗️ **Repository Migration Plan**

### **Current State**:
```
PGP-Forum/          → Has everything mixed together
polls/              → Backend only, blocked by GitHub secrets
burn/               → Backend only (not pushed)
```

### **Target State**:
```
snapit-community-forum/     → Clean forum repo
snapit-messenger/           → Standalone messenger
snapit-polls/               → Backend + frontend
snapit-burn/                → Backend + frontend
snapit-marketing/           → Marketing site
snapit-docs/                → Documentation
snapit-infrastructure/      → Infrastructure (private)
```

---

## 🚀 **Migration Steps**

### **Step 1: Create New Repositories**

```bash
# Option A: Under your personal account
gh repo create terrellflautt/snapit-community-forum --public
gh repo create terrellflautt/snapit-messenger --public
gh repo create terrellflautt/snapit-polls --public
gh repo create terrellflautt/snapit-burn --public
gh repo create terrellflautt/snapit-marketing --public
gh repo create terrellflautt/snapit-docs --public
gh repo create terrellflautt/snapit-infrastructure --private

# Option B: Create organization first
gh org create snapitsoftware
gh repo create snapitsoftware/community-forum --public
gh repo create snapitsoftware/messenger --public
gh repo create snapitsoftware/polls --public
gh repo create snapitsoftware/burn --public
gh repo create snapitsoftware/marketing --public
gh repo create snapitsoftware/docs --public
gh repo create snapitsoftware/infrastructure --private
```

### **Step 2: Reorganize Local Files**

```bash
cd /mnt/c/Users/decry/Desktop

# Create new directory structure
mkdir snapit-repos
cd snapit-repos

# 1. Community Forum
mkdir snapit-community-forum
cp -r ../snapit-forum/forum-app snapit-community-forum/
cp -r ../snapit-forum/src snapit-community-forum/
cp ../snapit-forum/serverless.yml snapit-community-forum/
cp ../snapit-forum/package.json snapit-community-forum/
# Add clean README

# 2. Messenger (extract from forum)
mkdir snapit-messenger
# Extract messenger components
# Create standalone app

# 3. Polls
mkdir snapit-polls
cp -r ../snapit-polls/* snapit-polls/
# Add frontend

# 4. Burn
mkdir snapit-burn
cp -r ../snapit-burn/* snapit-burn/
# Add frontend

# 5. Marketing
mkdir snapit-marketing
# Create new Next.js or React site

# 6. Docs
mkdir snapit-docs
# Create Docusaurus site

# 7. Infrastructure
mkdir snapit-infrastructure
# Add Terraform configs
```

### **Step 3: Push to GitHub**

```bash
# For each repo:
cd snapit-community-forum
git init
git add .
git commit -m "Initial commit: SnapIT Community Forum

- Forum backend with 48 Lambda functions
- React frontend with PWA support
- Authentication (Google OAuth + Email)
- PGP encrypted messaging
- Stripe payments integration
- WebSocket for real-time features

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"
git branch -M main
git remote add origin https://github.com/terrellflautt/snapit-community-forum.git
git push -u origin main
```

---

## 📝 **README Templates**

### **snapit-community-forum/README.md**:
```markdown
# 🏛️ SnapIT Community Forum

Official community forum for SnapIT products - PGP messaging, anonymous relay, polls, burn, and more privacy tools.

## 🚀 Features

- **Zero-Knowledge Architecture** - Server never sees plaintext
- **PGP Encryption** - 4096-bit RSA end-to-end encryption
- **Anonymous Relay** - 3-5 hop P2P relay for IP anonymity
- **Real-time** - WebSocket for instant updates
- **Free Tier** - Up to 1,500 users per forum
- **PWA Support** - Install as native app

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + TailwindCSS
- **Backend**: AWS Lambda (Serverless Framework v3)
- **Database**: DynamoDB
- **Auth**: JWT + Google OAuth + Email/Password
- **Payments**: Stripe (Live mode)
- **CDN**: CloudFront
- **Deployment**: S3 + API Gateway + CloudFront

## 📦 Deployment

Backend:
\`\`\`bash
npm install
serverless deploy --stage prod
\`\`\`

Frontend:
\`\`\`bash
cd forum-app
npm install
npm run build
aws s3 sync build s3://snapit-forum-static
\`\`\`

## 🔗 Links

- **Live**: https://forum.snapitsoftware.com
- **Docs**: https://docs.snapitsoftware.com
- **Website**: https://snapitsoftware.com
- **Support**: support@snapitsoftware.com

## 📄 License

Proprietary - © 2025 SnapIT Software
```

### **snapit-messenger/README.md**:
```markdown
# 💬 SnapIT Messenger

Zero-knowledge PGP encrypted messenger with anonymous relay. Always free.

## 🔐 Features

- **End-to-End Encryption** - 4096-bit RSA PGP
- **Anonymous Relay** - 3-5 hop P2P relay
- **Auto-Delete** - Ephemeral messages
- **Dead Man's Switch** - Auto-send on inactivity
- **Zero-Knowledge** - Server never decrypts
- **Cross-Device** - Sync across browsers

## 🚀 Deployment

\`\`\`bash
npm install
npm run build
aws s3 sync build s3://snapit-messenger
\`\`\`

## 🔗 Links

- **Live**: https://messenger.snapitsoftware.com
- **Embedded**: Works in forum or standalone

## 📄 License

Proprietary - © 2025 SnapIT Software
```

---

## ⚙️ **CI/CD Setup**

### **GitHub Actions** (for each repo):

```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Run tests
        run: npm test

      - name: Deploy backend
        if: github.ref == 'refs/heads/main'
        run: serverless deploy --stage prod
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}

      - name: Build frontend
        run: |
          cd forum-app
          npm install
          npm run build

      - name: Deploy frontend
        if: github.ref == 'refs/heads/main'
        run: |
          aws s3 sync forum-app/build s3://snapit-forum-static --delete
          aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_ID }} --paths "/*"
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

---

## 🎯 **Next Steps**

1. **Decide**: Personal account or `snapitsoftware` organization?
2. **Create**: 7 new repositories
3. **Migrate**: Code from current repos to new structure
4. **Push**: Clean commits to GitHub
5. **Setup**: CI/CD pipelines
6. **Deploy**: From new repos

**Estimated Time**: 1-2 hours to migrate everything

**Ready when you are!** 🚀
