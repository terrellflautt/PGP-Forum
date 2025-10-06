#!/usr/bin/env node
/**
 * Create FAQ Threads for Product Categories
 */

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

const THREADS_TABLE = 'snapit-forum-api-threads-prod';
const POSTS_TABLE = 'snapit-forum-api-posts-prod';
const CATEGORIES_TABLE = 'snapit-forum-api-categories-prod';
const COMMUNITY_FORUM_ID = 'snapit-community';

const faqThreads = [
  {
    categoryId: 'messenger',
    title: '💬 Messenger FAQ - Getting Started',
    content: `# 💬 SnapIT Messenger - Frequently Asked Questions

## What is SnapIT Messenger?

SnapIT Messenger is a **privacy-first messaging platform** with end-to-end PGP encryption. Your messages are secured with 4096-bit RSA encryption, and we use a zero-knowledge architecture.

## 🔒 Key Features

- **End-to-End Encryption**: 4096-bit RSA PGP encryption
- **Zero-Knowledge Architecture**: We can't read your messages
- **Anonymous Relay**: Your IP address is hidden
- **Private Keys Stay Local**: Your encryption keys never leave your device
- **FREE for All Users**: No subscriptions required

## 🚀 Getting Started

1. **Set Your Username**: Complete your profile setup
2. **Your Keys Are Generated**: Automatically created on first use
3. **Start Messaging**: Search for users by username
4. **Encrypted by Default**: All messages are automatically encrypted

## 🔐 How Secure Is It?

- **4096-bit RSA**: Military-grade encryption
- **Zero-Knowledge**: We can't decrypt your messages
- **Local Keys**: Private keys stored only in your browser
- **Anonymous**: IP relay hides your location

## 📱 Access Messenger

**Web App**: [messenger.snapitsoftware.com](https://messenger.snapitsoftware.com) (coming soon)
**Integrated**: Available in forum at [forum.snapitsoftware.com](https://forum.snapitsoftware.com)

## 💡 Common Questions

**Q: Can SnapIT read my messages?**
A: No! Zero-knowledge architecture means only you can decrypt your messages.

**Q: What happens if I lose my private key?**
A: Messages encrypted with that key cannot be recovered. Back up your keys!

**Q: Is it really free?**
A: Yes! PGP Messenger is completely free for all users.

**Q: Can I use it on mobile?**
A: Web app works on mobile browsers. Native apps coming soon!

---

**Questions?** Reply to this thread or check out the Messenger category!`
  },
  {
    categoryId: 'forum-builder',
    title: '🏗️ Forum Builder FAQ - Create Your Own Forum',
    content: `# 🏗️ Forum Builder - Frequently Asked Questions

## What is Forum Builder?

Create and manage your own **private community forums** with encryption, custom domains, and complete control.

## 🎯 Pricing Tiers

### Free Tier
- **1 Forum** included
- Up to **1,500 users**
- Custom subdomain (yourname.snapitsoftware.com)
- End-to-end encryption
- Category management

### Pro Tier ($9.99/month)
- **Unlimited forums**
- **Unlimited users** per forum
- **Custom domain** support
- Priority support
- Advanced moderation tools

## 🚀 Getting Started

1. **Create Your Forum**: Visit [forums.snapitsoftware.com](https://forums.snapitsoftware.com)
2. **Choose Your Subdomain**: Pick yourname.snapitsoftware.com
3. **Set Up Categories**: Organize your community
4. **Invite Users**: Share your forum link

## ✨ Features

- **End-to-End Encryption**: Secure private messages
- **Category Management**: Organize discussions
- **User Roles**: Admin, moderator, member
- **Thread Pinning**: Highlight important topics
- **Rich Text Editor**: Markdown support
- **User Profiles**: Avatars and bios

## 🌐 Custom Domains (Pro)

Connect your own domain:
- forum.yourdomain.com
- community.yourbrand.com
- Any subdomain you want

## 💡 Common Questions

**Q: Do I get a free forum?**
A: Yes! Every user gets 1 free forum with up to 1,500 users.

**Q: Can I upgrade later?**
A: Absolutely! Upgrade anytime for unlimited forums and users.

**Q: What happens if I hit the 1,500 user limit?**
A: You'll be prompted to upgrade to Pro ($9.99/month) for unlimited users.

**Q: Can I have multiple forums on the free tier?**
A: No, free tier includes 1 forum. Upgrade to Pro for unlimited forums.

**Q: Is my data secure?**
A: Yes! All private messages use PGP encryption.

---

**Ready to create your forum?** Visit [forums.snapitsoftware.com](https://forums.snapitsoftware.com)!`
  },
  {
    categoryId: 'polls',
    title: '📊 Polls & Surveys FAQ - Anonymous Voting',
    content: `# 📊 SnapIT Polls & Surveys - Frequently Asked Questions

## What is SnapIT Polls?

Create **anonymous polls and surveys** with privacy-focused voting. Perfect for team decisions, community feedback, or market research.

## 🎯 Key Features

- **Anonymous Voting**: No tracking, no IP logging
- **Real-Time Results**: Live vote counting
- **Shareable Links**: Easy distribution
- **Multiple Question Types**: Single choice, multiple choice, rating scales
- **Export Results**: Download CSV data
- **Time Limits**: Set voting deadlines
- **Vote Limits**: One vote per person (optional)

## 🚀 Getting Started

1. **Create a Poll**: Visit [polls.snapitsoftware.com](https://polls.snapitsoftware.com)
2. **Add Questions**: Single or multiple choice
3. **Set Options**: Anonymous voting, time limits
4. **Share Link**: Distribute to voters
5. **View Results**: Real-time analytics

## 🔒 Privacy Features

- **No IP Tracking**: We don't log voter IPs
- **No User Data**: Vote without creating an account
- **Anonymous by Default**: Privacy-first design
- **Secure**: HTTPS encrypted voting

## 💰 Pricing

**Free Tier**:
- Unlimited polls
- Up to 100 responses per poll
- Basic analytics

**Pro Tier** ($4.99/month):
- Unlimited responses
- Advanced analytics
- Export to CSV/Excel
- Custom branding
- Priority support

## 💡 Common Questions

**Q: Can I see who voted?**
A: No, anonymous polls don't track voter identity.

**Q: Can someone vote multiple times?**
A: You can enable "one vote per device" to prevent duplicates.

**Q: How long do polls stay active?**
A: Forever by default, or set a custom expiration date.

**Q: Can I edit a poll after creating it?**
A: Yes, but editing questions after votes may affect results.

---

**Create your first poll**: [polls.snapitsoftware.com](https://polls.snapitsoftware.com)`
  },
  {
    categoryId: 'burn',
    title: '🔥 Burn FAQ - Self-Destructing File Sharing',
    content: `# 🔥 SnapIT Burn - Frequently Asked Questions

## What is SnapIT Burn?

**Self-destructing file sharing** for secure, temporary file transfers. Files automatically delete after being viewed or after a time limit.

## 🎯 Key Features

- **Self-Destructing Links**: Files delete after first view
- **Time Limits**: Set expiration (1 hour to 7 days)
- **Encrypted Storage**: S3 encryption at rest
- **No Account Required**: Upload anonymously
- **Password Protection**: Optional password for links
- **View Tracking**: See when file was accessed
- **Large File Support**: Up to 100MB per file (free), 5GB (pro)

## 🚀 Getting Started

1. **Upload File**: Visit [burn.snapitsoftware.com](https://burn.snapitsoftware.com)
2. **Set Options**: One-time view or time limit
3. **Add Password** (optional): Extra security layer
4. **Share Link**: Send to recipient
5. **Auto-Delete**: File destroys after view/expiration

## 🔒 Security Features

- **Encrypted Storage**: S3 server-side encryption
- **Auto-Delete**: No permanent storage
- **Anonymous Uploads**: No login required
- **Password Protection**: Optional extra layer
- **No Metadata**: We don't log IP addresses

## 💰 Pricing

**Free Tier**:
- Up to 100MB per file
- 10 uploads per day
- 7-day max expiration

**Pro Tier** ($4.99/month):
- Up to 5GB per file
- Unlimited uploads
- 30-day max expiration
- Priority bandwidth

## 💡 Common Questions

**Q: Can I recover a deleted file?**
A: No, once deleted, files are permanently gone.

**Q: What file types are supported?**
A: All file types (documents, images, videos, archives, etc.)

**Q: Is it really secure?**
A: Yes! Encrypted storage + auto-delete + optional password.

**Q: Can someone view the file multiple times?**
A: Only if you set a time-based expiration instead of "one-time view."

**Q: What happens after the time limit?**
A: File is permanently deleted from our servers.

---

**Share files securely**: [burn.snapitsoftware.com](https://burn.snapitsoftware.com)`
  },
  {
    categoryId: 'snapit-qr',
    title: '📱 SnapIT QR FAQ - QR Code Generator',
    content: `# 📱 SnapIT QR - Frequently Asked Questions

## What is SnapIT QR?

**Generate and scan QR codes** instantly. Create QR codes for URLs, text, contact cards, WiFi credentials, and more.

## 🎯 Features

- **URL Shortener Integration**: Create QR codes for short links
- **Multiple Types**: URL, text, email, phone, WiFi, vCard
- **Custom Styling**: Colors, logos, patterns
- **High Resolution**: Print-ready PNG/SVG downloads
- **Batch Generation**: Create multiple QR codes
- **Analytics**: Track scans (Pro)

## 🚀 Getting Started

1. **Choose Type**: URL, text, WiFi, etc.
2. **Enter Data**: Paste URL or enter information
3. **Customize**: Add colors, logo, style
4. **Download**: PNG, SVG, or PDF
5. **Share**: Print or digital distribution

## 💰 Pricing

**Free**:
- Unlimited QR code generation
- Basic customization
- PNG downloads

**Pro** ($2.99/month):
- Advanced styling
- Logo embedding
- SVG/PDF export
- Scan analytics
- Batch generation

## 💡 Common Questions

**Q: Are QR codes permanent?**
A: Yes, static QR codes work forever. Dynamic QR codes (Pro) can be edited.

**Q: Can I change the URL after creating the QR code?**
A: Only with dynamic QR codes (Pro tier).

**Q: What's the scan limit?**
A: Unlimited scans for all QR codes.

**Q: Can I add my logo?**
A: Yes, Pro tier supports logo embedding.

---

**Generate QR codes**: [qr.snapitsoftware.com](https://qr.snapitsoftware.com) (coming soon)`
  },
  {
    categoryId: 'snapit-url',
    title: '🔗 SnapIT URL FAQ - Link Shortener',
    content: `# 🔗 SnapIT URL - Frequently Asked Questions

## What is SnapIT URL?

**URL shortener and link management** platform with analytics, custom domains, and QR code generation.

## 🎯 Features

- **Short Links**: snap.it/xyz format
- **Custom Slugs**: Choose your own short URL
- **Link Analytics**: Click tracking, geography, referrers
- **QR Codes**: Auto-generate for every link
- **Link Expiration**: Set time limits
- **Password Protection**: Secure your links
- **Custom Domains**: Use your own domain (Pro)

## 🚀 Getting Started

1. **Paste Long URL**: Enter your link
2. **Customize Slug** (optional): Choose custom short code
3. **Set Options**: Expiration, password, etc.
4. **Get Short Link**: Instant snap.it/xyz link
5. **Track Analytics**: View clicks and stats

## 💰 Pricing

**Free**:
- 100 links per month
- Basic analytics (7-day history)
- snap.it domain

**Pro** ($4.99/month):
- Unlimited links
- Advanced analytics (unlimited history)
- Custom domains
- API access
- Bulk link creation
- Priority support

## 💡 Common Questions

**Q: Do links expire?**
A: Only if you set an expiration date. Otherwise, they're permanent.

**Q: Can I edit a link after creating it?**
A: Yes, you can update the destination URL anytime.

**Q: Can I use my own domain?**
A: Yes, Pro tier supports custom domains like link.yourdomain.com.

**Q: Is there an API?**
A: Yes, Pro tier includes full API access.

---

**Shorten your links**: [url.snapitsoftware.com](https://url.snapitsoftware.com) (coming soon)`
  },
  {
    categoryId: 'url-status-checker',
    title: '✅ URL Status Checker FAQ - Website Monitoring',
    content: `# ✅ URL Status Checker - Frequently Asked Questions

## What is URL Status Checker?

**Monitor website uptime and status codes** with real-time alerts and historical data.

## 🎯 Features

- **Uptime Monitoring**: Check website availability 24/7
- **Status Code Tracking**: HTTP response codes
- **Response Time**: Monitor page load speed
- **Email Alerts**: Instant downtime notifications
- **SSL Certificate Monitoring**: Track expiration dates
- **Historical Data**: Uptime statistics and reports
- **Multi-Region Checks**: Test from different locations

## 🚀 Getting Started

1. **Add Website**: Enter URL to monitor
2. **Set Check Interval**: 1 min to 1 hour
3. **Configure Alerts**: Email, SMS, webhook
4. **Monitor Dashboard**: View real-time status
5. **Get Reports**: Uptime percentage and incidents

## 💰 Pricing

**Free**:
- 5 websites
- 5-minute check intervals
- Email alerts
- 30-day history

**Pro** ($9.99/month):
- 50 websites
- 1-minute intervals
- SMS + webhook alerts
- Unlimited history
- Multi-region checks
- API access

## 💡 Common Questions

**Q: What happens when my site goes down?**
A: You'll receive an instant email alert (SMS for Pro users).

**Q: Can I monitor SSL certificates?**
A: Yes, we track SSL expiration and alert you 30 days before.

**Q: How accurate is the uptime percentage?**
A: Checks run from AWS infrastructure with 99.9% reliability.

**Q: Can I check from multiple locations?**
A: Yes, Pro tier includes multi-region monitoring.

---

**Monitor your sites**: [urlstatuschecker.com](https://urlstatuschecker.com) (coming soon)`
  },
  {
    categoryId: 'pdf-tools',
    title: '📄 PDF Tools FAQ - Convert & Manipulate PDFs',
    content: `# 📄 PDF Tools - Frequently Asked Questions

## What is PDF Tools?

**Convert, merge, split, compress, and edit PDF files** with privacy-focused, serverless processing.

## 🎯 Features

- **Convert**: Word, Excel, images → PDF
- **Merge**: Combine multiple PDFs
- **Split**: Extract pages from PDF
- **Compress**: Reduce file size
- **Protect**: Add passwords
- **OCR**: Extract text from scanned PDFs (Pro)
- **Edit**: Add text, images, signatures
- **Privacy**: Files deleted after 1 hour

## 🚀 Getting Started

1. **Upload PDF**: Drag and drop file
2. **Choose Tool**: Convert, merge, split, etc.
3. **Process**: Instant serverless processing
4. **Download**: Get your processed PDF
5. **Auto-Delete**: Files removed after 1 hour

## 🔒 Privacy & Security

- **Local Processing**: Most operations run in your browser
- **Auto-Delete**: Files deleted after 1 hour
- **No Tracking**: We don't log file contents
- **Encrypted Transfer**: HTTPS only

## 💰 Pricing

**Free**:
- 10 MB file size limit
- Basic tools (merge, split, compress)
- 5 files per day

**Pro** ($6.99/month):
- 100 MB file size limit
- Advanced tools (OCR, editing)
- Unlimited files
- Batch processing

## 💡 Common Questions

**Q: Is my PDF secure?**
A: Yes, files are auto-deleted after 1 hour, and we don't log contents.

**Q: Can I edit PDFs?**
A: Yes, Pro tier includes PDF editing tools.

**Q: What's the file size limit?**
A: 10 MB (free), 100 MB (Pro).

**Q: Do you support OCR?**
A: Yes, Pro tier includes OCR for scanned documents.

---

**Process PDFs**: [pdf.snapitsoftware.com](https://pdf.snapitsoftware.com) (coming soon)`
  },
  {
    categoryId: 'snapit-agent',
    title: '🤖 SnapIT Agent FAQ - AI Automation',
    content: `# 🤖 SnapIT Agent - Frequently Asked Questions

## What is SnapIT Agent?

**AI-powered automation and assistance** for web scraping, data extraction, task automation, and intelligent workflows.

## 🎯 Features

- **Web Scraping**: Extract data from websites
- **Data Extraction**: Parse documents, PDFs, images
- **Task Automation**: Schedule recurring tasks
- **AI Chat**: GPT-4 powered assistant
- **API Integration**: Connect to any service
- **Workflow Builder**: Visual automation creator
- **Scheduled Tasks**: Run jobs on schedule

## 🚀 Getting Started

1. **Create Agent**: Define your task
2. **Configure**: Set up data sources and actions
3. **Test**: Run agent manually
4. **Schedule**: Set up automation
5. **Monitor**: View logs and results

## 💰 Pricing

**Free**:
- 100 agent runs per month
- Basic scraping
- Manual execution

**Pro** ($14.99/month):
- 10,000 agent runs per month
- Advanced AI features
- Scheduled automation
- API access
- Priority support

**Enterprise** (Custom):
- Unlimited runs
- Dedicated infrastructure
- Custom integrations

## 💡 Common Questions

**Q: What can I automate?**
A: Web scraping, data extraction, API workflows, report generation, and more.

**Q: Do I need coding skills?**
A: No! Visual workflow builder requires no code.

**Q: Can I integrate with other tools?**
A: Yes, connect to any API or webhook.

**Q: Is web scraping legal?**
A: Scraping public data is generally legal, but respect robots.txt and terms of service.

---

**Start automating**: [snapitagent.com](https://snapitagent.com) (coming soon)`
  },
  {
    categoryId: 'snapit-analytics',
    title: '📈 SnapIT Analytics FAQ - Privacy-First Analytics',
    content: `# 📈 SnapIT Analytics - Frequently Asked Questions

## What is SnapIT Analytics?

**Privacy-focused web analytics** alternative to Google Analytics. Track visitors without cookies, IP logging, or personal data.

## 🎯 Features

- **No Cookies**: Fully GDPR compliant
- **No IP Logging**: Anonymous visitor tracking
- **Real-Time Data**: Live visitor dashboard
- **Page Views**: Track traffic and engagement
- **Referrers**: See where visitors come from
- **Custom Events**: Track button clicks, conversions
- **Lightweight**: <1KB script, no performance impact
- **Privacy-First**: No personal data collection

## 🚀 Getting Started

1. **Add Tracking Code**: Copy snippet to your site
2. **View Dashboard**: Real-time analytics
3. **Set Goals**: Track conversions
4. **Get Insights**: Understand your traffic
5. **Stay Compliant**: No consent banners needed

## 🔒 Privacy Features

- **No Cookies**: Completely cookieless
- **No IP Tracking**: We don't log IP addresses
- **GDPR Compliant**: No consent required
- **Open Source**: Transparent code
- **Anonymous**: Visitor privacy protected

## 💰 Pricing

**Free**:
- 1 website
- 10,000 page views per month
- 30-day data retention

**Pro** ($9.99/month):
- 10 websites
- 500,000 page views per month
- Unlimited data retention
- Custom events
- API access

**Business** ($29.99/month):
- 50 websites
- 5 million page views per month
- Team collaboration
- White-label reports

## 💡 Common Questions

**Q: Do I need a cookie consent banner?**
A: No! We don't use cookies, so no consent banner needed (GDPR compliant).

**Q: How accurate is it without cookies?**
A: Very accurate. We use privacy-friendly techniques to track unique visitors.

**Q: Can I track conversions?**
A: Yes! Custom events and goal tracking included.

**Q: Is it better than Google Analytics?**
A: For privacy-conscious users, yes! No data sharing with third parties.

---

**Track ethically**: [snapitanalytics.com](https://snapitanalytics.com) (coming soon)`
  }
];

async function createFAQThreads() {
  console.log('📚 Creating FAQ Threads for Product Categories...\n');

  for (const faq of faqThreads) {
    const threadId = uuidv4();
    const postId = uuidv4();
    const timestamp = Date.now();

    // Create thread
    const thread = {
      forumIdThreadId: `${COMMUNITY_FORUM_ID}#${threadId}`,
      forumIdCategoryId: `${COMMUNITY_FORUM_ID}#${faq.categoryId}`,
      forumId: COMMUNITY_FORUM_ID,
      threadId,
      categoryId: faq.categoryId,
      authorId: 'system',
      title: faq.title,
      isPinned: true,
      isLocked: false,
      createdAt: timestamp,
      lastPostAt: timestamp,
      postCount: 1,
      viewCount: 0
    };

    try {
      await dynamodb.put({
        TableName: THREADS_TABLE,
        Item: thread,
        ConditionExpression: 'attribute_not_exists(forumIdThreadId)'
      }).promise();
      console.log(`✅ Created thread: ${faq.title}`);
    } catch (error) {
      if (error.code === 'ConditionalCheckFailedException') {
        console.log(`ℹ️  Thread already exists: ${faq.title}`);
        continue;
      } else {
        console.error(`❌ Failed to create thread ${faq.title}:`, error.message);
        continue;
      }
    }

    // Create first post
    const post = {
      threadIdPostId: `${threadId}#${postId}`,
      forumIdThreadId: `${COMMUNITY_FORUM_ID}#${threadId}`,
      threadId,
      postId,
      authorId: 'system',
      content: faq.content,
      createdAt: timestamp,
      upvotes: 0,
      downvotes: 0
    };

    try {
      await dynamodb.put({
        TableName: POSTS_TABLE,
        Item: post
      }).promise();
      console.log(`   ✓ Added FAQ content\n`);
    } catch (error) {
      console.error(`   ❌ Failed to create post:`, error.message);
    }

    // Update category thread count
    try {
      await dynamodb.update({
        TableName: CATEGORIES_TABLE,
        Key: {
          forumIdCategoryId: `${COMMUNITY_FORUM_ID}#${faq.categoryId}`
        },
        UpdateExpression: 'ADD threadCount :inc',
        ExpressionAttributeValues: {
          ':inc': 1
        }
      }).promise();
    } catch (error) {
      console.error(`   ⚠️  Failed to update category count:`, error.message);
    }
  }

  console.log(`\n✨ FAQ thread setup complete! Created ${faqThreads.length} pinned FAQ threads.\n`);
}

createFAQThreads()
  .then(() => {
    console.log('✅ Setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
