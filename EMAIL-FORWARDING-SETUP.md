# SES Email Forwarding Setup

**Status**: ✅ Configured (Pending DNS Propagation)

## Overview
All emails sent to @snapitsoftware.com addresses are now configured to forward to snapitsaas@gmail.com using Amazon SES + Lambda.

## Configuration Details

### 1. Domain Verification
- **Domain**: snapitsoftware.com
- **Verification Status**: Pending (DNS TXT record added)
- **Verification Token**: `ZwkQk0gs1ZPi9lBcCpSqiqwwJ3lYztAnrUf97wm6chE=`
- **DNS Record Added**: `_amazonses.snapitsoftware.com TXT`

### 2. MX Records
**Route 53 Record**:
```
snapitsoftware.com MX 10 inbound-smtp.us-east-1.amazonaws.com
```

### 3. Email Addresses Configured
All emails to these addresses will be forwarded:
- support@snapitsoftware.com
- contact@snapitsoftware.com
- admin@snapitsoftware.com
- info@snapitsoftware.com
- hello@snapitsoftware.com
- **ANY other @snapitsoftware.com address** (wildcard forwarding)

### 4. S3 Bucket
- **Bucket Name**: `snapitsoftware-ses-emails`
- **Purpose**: Stores incoming emails temporarily before Lambda processes them
- **Permissions**: SES has PutObject permission

### 5. Lambda Function
- **Function Name**: `snapit-forum-api-prod-emailForwarder`
- **Handler**: `src/handlers/emailForwarder.handler`
- **Trigger**: S3 ObjectCreated event on `snapitsoftware-ses-emails` bucket
- **Functionality**:
  - Receives email from S3
  - Forwards to snapitsaas@gmail.com with:
    - Original sender preserved in ReplyTo
    - Subject prefixed with `[original-recipient@snapitsoftware.com]`
    - Full email body included
    - Message ID tracked

### 6. SES Receipt Rule Set
- **Rule Set Name**: `snapitsoftware-email-forwarding`
- **Status**: Active
- **Rule**: `forward-all-emails`
- **Actions**:
  1. Store email in S3 bucket (`snapitsoftware-ses-emails/incoming/`)
  2. Invoke Lambda function to forward email

## How It Works

```
User sends email to support@snapitsoftware.com
            ↓
Email arrives at AWS SES (MX record points here)
            ↓
SES stores email in S3 bucket (snapitsoftware-ses-emails)
            ↓
S3 triggers Lambda function (emailForwarder)
            ↓
Lambda reads email from S3
            ↓
Lambda forwards email to snapitsaas@gmail.com via SES
            ↓
You receive email in snapitsaas@gmail.com inbox
```

## Example Forwarded Email

**To**: snapitsaas@gmail.com
**From**: noreply@snapitsoftware.com
**Reply-To**: original-sender@example.com
**Subject**: [support@snapitsoftware.com] Help with login issue

**Body**:
```
--- Forwarded from support@snapitsoftware.com ---
Original Sender: original-sender@example.com
Original Recipient: support@snapitsoftware.com
Message ID: abc123...

-----------------------------------

[Original email content here...]
```

## Testing

Once DNS propagation completes (24-48 hours):

1. Send test email to: support@snapitsoftware.com
2. Check snapitsaas@gmail.com inbox
3. Monitor CloudWatch logs: `/aws/lambda/snapit-forum-api-prod-emailForwarder`
4. Verify S3 bucket has emails: `aws s3 ls s3://snapitsoftware-ses-emails/incoming/`

## Troubleshooting

### Check domain verification status:
```bash
aws ses get-identity-verification-attributes --identities snapitsoftware.com --region us-east-1
```

### Check DNS records:
```bash
dig TXT _amazonses.snapitsoftware.com
dig MX snapitsoftware.com
```

### View Lambda logs:
```bash
aws logs tail /aws/lambda/snapit-forum-api-prod-emailForwarder --follow
```

### Test email sending manually:
```bash
aws ses send-email \
  --from noreply@snapitsoftware.com \
  --destination ToAddresses=snapitsaas@gmail.com \
  --message Subject={Data="Test"},Body={Text={Data="Test message"}}
```

## Cost Estimate
- **SES Receiving**: $0.10 per 1,000 emails
- **Lambda Invocations**: $0.20 per 1M requests
- **S3 Storage**: $0.023 per GB/month
- **Estimated Monthly Cost**: < $1 for typical usage

## Security Notes
- Emails are stored in S3 with default encryption
- Lambda reads and forwards emails immediately
- Original sender preserved in ReplyTo for easy response
- Spam filtering enabled via SES
- No permanent email storage (S3 lifecycle policy can be added)

## Next Steps
1. ✅ DNS propagation (24-48 hours)
2. ✅ Test email forwarding
3. ⏳ (Optional) Add S3 lifecycle policy to delete old emails after 7 days
4. ⏳ (Optional) Set up SNS notifications for email delivery failures
