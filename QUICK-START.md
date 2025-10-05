# ⚡ SnapIT Forum - Quick Start Guide

**For**: Developers and maintainers
**Last Updated**: October 5, 2025

---

## 🎯 What You Need to Know

**Production is LIVE**: https://forum.snapitsoftware.com
**Status**: ✅ Fully functional (Stripe in test mode)

---

## 📂 Project Structure

```
snapit-forum/
├── forum-app/          # ✅ PRODUCTION React frontend
├── src/handlers/       # ✅ PRODUCTION Lambda backend
├── serverless.yml      # ✅ AWS deployment config
└── deploy-production.sh # ✅ One-click deployment
```

**⚠️ IMPORTANT**: Only `forum-app/` and `src/` are in production. Ignore root HTML files.

---

## 🚀 Deploy to Production

```bash
# One command deployment
./deploy-production.sh

# Or manual:
cd forum-app && npm run build && cd ..
aws s3 sync forum-app/build/ s3://snapit-forum-static/ --delete
aws cloudfront create-invalidation --distribution-id E1X8SJIRPSICZ4 --paths "/*"
```

**Deploy backend** (only if serverless.yml changed):
```bash
npm run deploy:prod
```

---

## 🔑 Critical Info

### AWS Resources
- **S3 Bucket**: `snapit-forum-static`
- **CloudFront**: `E1X8SJIRPSICZ4`
- **API Gateway**: `https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod`
- **Region**: `us-east-1`

### Credentials (SSM Parameters)
```bash
# View all
aws ssm get-parameters-by-path --path /snapit-forum/prod --with-decryption
```

### Stripe
- **Dashboard**: https://dashboard.stripe.com/acct_1SEhK7Ikj5YQseOZ
- **Status**: ⚠️ TEST MODE (switch to live before accepting real payments)
- **Setup Guide**: See `STRIPE-LIVE-SETUP.md`

---

## 🧪 Testing

### Quick Test
1. Visit https://forum.snapitsoftware.com
2. Sign in with Google
3. Create forum
4. Send test message
5. Try upgrading to Pro (test card: 4242 4242 4242 4242)

### Full Test Plan
See `TESTING-GUIDE.md`

---

## 🐛 Troubleshooting

### Frontend not updating?
```bash
# Clear CloudFront cache
aws cloudfront create-invalidation --distribution-id E1X8SJIRPSICZ4 --paths "/*"
```

### Backend errors?
```bash
# Check Lambda logs
aws logs tail /aws/lambda/snapit-forum-api-prod-googleAuth --follow
```

### Can't authenticate?
```bash
# Verify Google OAuth config
aws ssm get-parameter --name /snapit-forum/prod/GOOGLE_CLIENT_ID
```

---

## 📚 Documentation

| File | What It Is |
|------|------------|
| `PROJECT-COMPLETE.md` | **START HERE** - Complete overview |
| `PRODUCTION-READY.md` | Technical architecture |
| `TESTING-GUIDE.md` | How to test everything |
| `STRIPE-LIVE-SETUP.md` | Switch to live payments |
| `deploy-production.sh` | Deployment automation |

---

## ✅ Pre-Launch Checklist

Before accepting real payments:
- [ ] Read `STRIPE-LIVE-SETUP.md`
- [ ] Switch Stripe to live mode
- [ ] Update `forum-app/src/config.ts` with pk_live_...
- [ ] Rebuild and redeploy frontend
- [ ] Test with real credit card (small amount)
- [ ] Monitor Stripe dashboard for 24 hours

---

## 🆘 Emergency Contacts

- **Support Email**: snapitsaas@gmail.com
- **GitHub Issues**: https://github.com/terrellflautt/PGP-Forum/issues
- **Stripe Support**: https://support.stripe.com

---

## 🎉 Quick Wins

**What's Working Right Now**:
- ✅ Users can sign up
- ✅ Users can create forums
- ✅ Users can send encrypted messages
- ✅ Forum posts work
- ✅ Stripe checkout (test mode)

**What Needs Work**:
- ⚠️ Stripe live mode
- 📋 Auto-generate PGP keys
- 📋 Real-time message updates
- 📋 File uploads

---

**Live URL**: https://forum.snapitsoftware.com
**Status**: Production Ready ✅
