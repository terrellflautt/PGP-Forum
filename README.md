# SnapIT Forum

Ultra-fast, multi-tenant forum platform with PGP encrypted messaging.

## Features

- **Instant Forum Creation**: Sign up and get your own forum instantly
- **Multi-Tenant**: Each user gets their own subdomain forum
- **PGP Encrypted Messaging**: Client-side encrypted private messages
- **Google OAuth**: Secure authentication
- **Serverless**: AWS Lambda + DynamoDB for infinite scale
- **Pricing Tiers**:
  - **Free**: Up to 1,500 users (auto-granted on signup)
  - **Pro**: Up to 10,000 users - $29/month
  - **Business**: Up to 50,000 users - $99/month
  - **Enterprise**: Unlimited users - $299/month

## Architecture

### Frontend
- Static HTML/CSS/vanilla JavaScript
- OpenPGP.js for client-side encryption
- Hosted on S3 + CloudFront

### Backend
- AWS Lambda (Node.js 18.x)
- API Gateway
- DynamoDB (7 tables)
- Stripe for payments
- Google OAuth for authentication

### Database Schema

1. **forums** - Forum instances
2. **users** - All users + PGP public keys
3. **forum-members** - User membership
4. **categories** - Forum categories
5. **threads** - Forum threads
6. **posts** - Thread posts
7. **messages** - PGP encrypted DMs

## Deployment

### Prerequisites

```bash
npm install
```

### Environment Variables

Create `.env`:

```bash
GOOGLE_CLIENT_ID=your_google_client_id
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Deploy Backend

```bash
npm run deploy:prod
```

This will:
1. Create DynamoDB tables
2. Deploy Lambda functions
3. Set up API Gateway
4. Return API endpoint URL

### Deploy Frontend

```bash
# Build and deploy to S3
aws s3 sync . s3://snapit-forum-static --exclude "node_modules/*" --exclude "src/*" --exclude ".*"

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id E1X8SJIRPSICZ4 --paths "/*"
```

## PGP Encryption

### How it Works

1. User signs up and generates PGP key pair
2. Private key encrypted with passphrase, stored in localStorage
3. Public key stored in DynamoDB
4. To send message:
   - Fetch recipient's public key
   - Encrypt message client-side
   - Send encrypted ciphertext to API
5. To read message:
   - Fetch encrypted message
   - Decrypt client-side with private key
   - Server never sees plaintext

### Usage

```javascript
const pgp = new ForumPGP();

// Generate keys
await pgp.generateKeyPair('John Doe', 'john@example.com', 'passphrase123');

// Encrypt message
const encrypted = await pgp.encryptMessage(
  'Hello, this is a secret message',
  recipientPublicKey
);

// Decrypt message
const decrypted = await pgp.decryptMessage(
  encryptedMessage,
  senderPublicKey
);
```

## API Endpoints

### Auth
- `GET /auth/google/callback` - Google OAuth callback
- `POST /auth/refresh` - Refresh JWT token

### Forums
- `GET /forums` - List all forums
- `POST /forums` - Create forum
- `GET /forums/{forumId}` - Get forum details

### Categories
- `GET /forums/{forumId}/categories` - List categories
- `POST /forums/{forumId}/categories` - Create category (admin)

### Threads
- `GET /forums/{forumId}/categories/{categoryId}/threads` - List threads
- `POST /forums/{forumId}/categories/{categoryId}/threads` - Create thread
- `GET /forums/{forumId}/threads/{threadId}` - Get thread

### Posts
- `GET /forums/{forumId}/threads/{threadId}/posts` - List posts
- `POST /forums/{forumId}/threads/{threadId}/posts` - Create post

### Messages
- `GET /messages?otherUserId={userId}` - Get conversation
- `POST /messages` - Send encrypted message

### Users
- `GET /users/{userId}` - Get user profile
- `PUT /users/me` - Update own profile

### Webhooks
- `POST /webhooks/stripe` - Stripe payment webhook

## Stripe Integration

### Price IDs

Set in Stripe dashboard:
- `price_pro` - Pro tier ($29/month)
- `price_business` - Business tier ($99/month)
- `price_enterprise` - Enterprise tier ($299/month)

### Webhook Events

- `customer.subscription.created` - Upgrade forum
- `customer.subscription.updated` - Update tier
- `customer.subscription.deleted` - Downgrade to free
- `invoice.payment_succeeded` - Payment confirmed
- `invoice.payment_failed` - Payment failed

## Multi-Tenant System

When a user signs up:
1. Account created in `users` table
2. Free forum auto-created in `forums` table
3. Subdomain assigned: `{username}.forum.snapitsoftware.com`
4. User becomes forum admin
5. Default categories created

## Security

- All private messages encrypted client-side with PGP
- JWT tokens for API authentication
- Google OAuth for secure login
- No plaintext passwords stored
- CORS enabled for forum domains
- Rate limiting on API Gateway
- DynamoDB encryption at rest

## Performance

- Static frontend (instant load)
- DynamoDB single-digit ms latency
- Lambda cold start <500ms
- CloudFront CDN global distribution
- Pay-per-request pricing (scales to zero)

## Monitoring

CloudWatch metrics:
- Lambda invocation count
- API Gateway latency
- DynamoDB read/write capacity
- Error rates

## Support

For issues or questions:
- GitHub: https://github.com/snapitsoftware/forum
- Email: support@snapitsoftware.com
- Forum: https://forum.snapitsoftware.com

## License

Proprietary - SnapIT Software © 2025
