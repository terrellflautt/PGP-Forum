# CloudFront 403 Error Fix - Google OAuth

## Problem

When trying to sign in to forum.snapitsoftware.com, you get:
```
403 ERROR - Bad request. We can't connect to the server for this app or website at this time.
```

## Root Cause

The React app at `forum.snapitsoftware.com` is trying to call the Google OAuth callback at:
```
https://forum.snapitsoftware.com/auth/google/callback
```

But CloudFront is serving the React static site, NOT the API Gateway backend. CloudFront doesn't know how to route `/auth/*` requests to the Lambda API.

## Solution Options

### Option 1: Use API Subdomain (RECOMMENDED)

Create a separate subdomain for the API and update the React app to call it.

**DNS Setup (IONOS):**
Add this CNAME record:
```
Hostname: api.forum.snapitsoftware.com
Type: CNAME
Value: u25qbry7za.execute-api.us-east-1.amazonaws.com
```

**Update React Config:**
In `/forum-app/src/config.ts`, change:
```typescript
// OLD:
export const API_BASE_URL = 'https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod';

// NEW:
export const API_BASE_URL = 'https://api.forum.snapitsoftware.com/prod';
```

**Google OAuth Redirect URI:**
Add this to Google Cloud Console:
```
https://api.forum.snapitsoftware.com/prod/auth/google/callback
```

### Option 2: CloudFront Behavior Rules (Complex)

Configure CloudFront to route `/auth/*` and `/api/*` to the API Gateway origin.

**Steps:**
1. Go to CloudFront distribution for forum.snapitsoftware.com
2. Create a new Origin:
   - Origin Domain: `u25qbry7za.execute-api.us-east-1.amazonaws.com`
   - Origin Path: `/prod`
   - Protocol: HTTPS only

3. Create new Behaviors:
   - Path Pattern: `/auth/*`
     - Origin: API Gateway origin (created above)
     - Viewer Protocol Policy: Redirect HTTP to HTTPS
     - Allowed HTTP Methods: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
     - Cache Policy: CachingDisabled

   - Path Pattern: `/api/*`
     - Same settings as `/auth/*`

4. Leave default behavior (`/*`) pointing to S3 origin

**This is more complex and requires CloudFront configuration expertise.**

### Option 3: Use Existing API Gateway URL (Temporary)

Skip custom domain for API and just use the AWS URL directly.

**React Config:**
```typescript
export const API_BASE_URL = 'https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod';
```

**Google OAuth Redirect URI:**
```
https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/auth/google/callback
```

**Downside:** Users will see the ugly AWS URL during OAuth flow.

---

## Recommended Fix (Fastest)

**Use Option 1: API Subdomain**

### Step 1: Add CNAME in IONOS
```
Hostname: api.forum
Type: CNAME
Value: u25qbry7za.execute-api.us-east-1.amazonaws.com
TTL: 3600
```

### Step 2: Update Google OAuth Redirect URI

Go to: https://console.cloud.google.com/apis/credentials

Find your OAuth 2.0 Client ID: `242648112266-iglul54tuis9mhucsp1pmpqg0a48l8i0.apps.googleusercontent.com`

Add Authorized redirect URIs:
```
https://api.forum.snapitsoftware.com/prod/auth/google/callback
https://forum.snapitsoftware.com
```

### Step 3: Update React App Config

Edit `/forum-app/src/config.ts`:
```typescript
export const API_BASE_URL = 'https://api.forum.snapitsoftware.com/prod';
```

### Step 4: Rebuild React App
```bash
cd /mnt/c/Users/decry/Desktop/snapit-forum/forum-app
npm run build
```

### Step 5: Deploy to S3
```bash
aws s3 sync build/ s3://forum.snapitsoftware.com --delete
```

### Step 6: Invalidate CloudFront Cache
```bash
aws cloudfront create-invalidation \
  --distribution-id <FORUM_DISTRIBUTION_ID> \
  --paths "/*"
```

---

## Alternative: Keep It Simple

If you don't want to set up `api.forum.snapitsoftware.com`, just use the AWS API Gateway URL directly:

1. Don't add any DNS records
2. Keep `API_BASE_URL = 'https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod'`
3. Add this redirect URI to Google OAuth:
   ```
   https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod/auth/google/callback
   ```
4. Rebuild and redeploy React app

**This will work immediately** but the OAuth flow will show the AWS URL.

---

## Testing After Fix

1. Go to `https://forum.snapitsoftware.com`
2. Click "Sign In with Google"
3. Should redirect to Google OAuth consent screen
4. After consent, should redirect back to forum (logged in)

If you still see 403, check:
- DNS propagation (use `nslookup api.forum.snapitsoftware.com`)
- Google OAuth redirect URI is exactly correct
- CloudFront cache is invalidated

---

**Quick Answer:** Add `api.forum.snapitsoftware.com` CNAME pointing to `u25qbry7za.execute-api.us-east-1.amazonaws.com` in IONOS, then update React config and rebuild.
