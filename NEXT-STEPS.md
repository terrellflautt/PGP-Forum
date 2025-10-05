# SnapIT Forums - Next Steps Tracker

**Last Updated**: 2025-10-05

## ✅ Completed
- [x] Fix OAuth authentication (DynamoDB GSI permissions) - DEPLOYED
- [x] Create ContactModal and FeedbackModal with Web3Forms
- [x] Transform UI to dark purple/hot pink color scheme
- [x] Fix form accessibility (labels, IDs, names)
- [x] Update branding (remove "React App")
- [x] Remove STRIPE-LIVE-KEYS.md from git tracking
- [x] Deploy backend IAM fix to production
- [x] **Set up SES email forwarding** - ALL @snapitsoftware.com → snapitsaas@gmail.com
  - ✅ Domain verification configured (pending DNS propagation)
  - ✅ MX records added to Route 53
  - ✅ Lambda function created (emailForwarder)
  - ✅ S3 bucket created (snapitsoftware-ses-emails)
  - ✅ SES receipt rule set active
  - ✅ Forwarding for: support@, contact@, admin@, info@, hello@

## 🔄 In Progress
- [ ] **DNS Propagation** (24-48 hours) - Then email forwarding will be active
- [ ] Test OAuth authentication on live site (forum.snapitsoftware.com)
- [ ] Comprehensive API testing and monitoring

## 📋 Pending Tasks

### 1. Email Routing (SES Setup) - ✅ **COMPLETED**
**Status**: Fully configured, waiting for DNS propagation (24-48 hours)

See **EMAIL-FORWARDING-SETUP.md** for complete documentation.

**What was done**:
1. ✅ Domain verified in SES (snapitsoftware.com)
2. ✅ MX records configured in Route 53
3. ✅ SES receipt rule set created and activated
4. ✅ Lambda function deployed (emailForwarder)
5. ✅ S3 bucket created (snapitsoftware-ses-emails)
6. ✅ IAM permissions updated

**Testing**: Will be possible after DNS propagation completes

### 2. Testing & QA
**Owner**: Testing agents to coordinate

**API Testing**:
- OAuth flow (Google sign-in/callback)
- Forum creation/retrieval
- Message sending (encrypted)
- Upvoting system
- Stripe checkout/webhooks
- WebSocket connections

**User Flow Testing**:
- Sign up → Create account → Set username
- Create forum (Shard) - verify 10 Power + 7 day requirement
- Send encrypted message
- Upload to anonymous inbox (@username)
- Purchase subscription (Stripe test mode first)

**Monitoring**:
- CloudWatch logs for all Lambda functions
- Browser DevTools console errors
- Network tab for API calls
- WebSocket connection stability

### 3. UI/UX Enhancements
**Owner**: Design/animation agents

**Navbar Implementation**:
- Invisible/glassmorphism top navbar
- Links: Dashboard, Forums, Messenger, Dead Man's Switch, Forum Builder
- Show "Sign In" if not authenticated
- Smooth hover effects and transitions
- Custom cursor design

**Animation Improvements**:
- Parallax scrolling effects
- Micro-interactions on all buttons
- Page transition animations
- Loading states with skeleton screens
- Smooth fade-in/out for modals

**Effects & Polish**:
- Enhanced shadows with pink glow
- Glassmorphism depth effects
- Animated gradient backgrounds
- Interactive hover states
- Better blob animations

### 4. SnapIT Software Website Updates
**Target**: https://snapitsoftware.com

**Blog Section** (/#blog):
- Fix article card links to point to real articles
- Ensure all cards are functional

**Products Section** (/#products):
- Add "SnapIT Forums" card with link to forum.snapitsoftware.com
- Add "Private Messenger" card
- Update descriptions and pricing

### 5. Legal Pages Review
- Verify terms.html has correct dates and content
- Verify privacy.html has correct dates and content
- Ensure pre-alpha warnings are prominent
- Add warrant canary update process

### 6. Production Deployment
- Deploy frontend to S3: `npm run deploy:frontend`
- Invalidate CloudFront cache
- Update GitHub branches (main + production/main)
- Tag release version

### 7. Documentation
- Update README with deployment instructions
- Document API endpoints
- Create user guide for whistleblowers
- Document encryption architecture

## 🐛 Known Issues
- ESLint warnings (unused imports) - non-critical
- None currently blocking

## 🧪 Testing Checklist
Use this for comprehensive testing before final deployment:

### Authentication
- [ ] Google OAuth sign-in works
- [ ] Token refresh works
- [ ] Username creation works
- [ ] Profile updates work

### Forums (Shards)
- [ ] Can view all public forums
- [ ] Can create forum with 10+ Power + 7 day account
- [ ] Cannot create forum without requirements
- [ ] Categories display correctly
- [ ] Threads display correctly
- [ ] Posts display with upvote counts

### Messaging
- [ ] Can send encrypted DM to @username
- [ ] Can send anonymous message to inbox
- [ ] Messages decrypt correctly
- [ ] Auto-delete works (60s TTL)
- [ ] Cannot read others' messages

### Upvoting
- [ ] Can upvote post
- [ ] Can downvote post
- [ ] Power calculation correct
- [ ] Cannot vote twice on same post

### Stripe Integration
- [ ] Pro checkout works ($29)
- [ ] Business checkout works ($99)
- [ ] Enterprise checkout works ($299)
- [ ] Donation flow works
- [ ] Webhook updates subscription status
- [ ] Customer portal works

### WebSocket
- [ ] Connection establishes
- [ ] Real-time message delivery
- [ ] Relay node discovery works
- [ ] Anonymous routing works

## 🔐 Security Review
- [ ] No secrets in git repository
- [ ] Environment variables secured in SSM
- [ ] CORS configured correctly
- [ ] API rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] PGP encryption working correctly

## 📊 Performance
- [ ] CloudFront CDN serving frontend
- [ ] DynamoDB read/write capacity appropriate
- [ ] Lambda cold starts acceptable
- [ ] Frontend bundle size optimized
- [ ] Images optimized

## 🚀 Launch Readiness
- [ ] All tests passing
- [ ] No critical bugs
- [ ] Documentation complete
- [ ] Legal pages reviewed
- [ ] Email routing working
- [ ] Monitoring/alerts configured
- [ ] Backup strategy in place (or documented as ephemeral)
