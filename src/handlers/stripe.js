const { DynamoDB } = require('aws-sdk');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const dynamodb = new DynamoDB.DocumentClient();
const FORUMS_TABLE = process.env.FORUMS_TABLE;

// Stripe webhook handler
exports.webhook = async (event) => {
  try {
    const sig = event.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // Verify webhook signature
    let stripeEvent;
    try {
      stripeEvent = stripe.webhooks.constructEvent(event.body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Webhook signature verification failed' })
      };
    }

    // Handle the event
    switch (stripeEvent.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(stripeEvent.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(stripeEvent.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(stripeEvent.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(stripeEvent.data.object);
        break;

      default:
        console.log(`Unhandled event type ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };

  } catch (error) {
    console.error('Stripe webhook error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook processing failed' })
    };
  }
};

async function handleSubscriptionUpdate(subscription) {
  const { customer, items, status } = subscription;

  // Get price to determine tier
  const priceId = items.data[0].price.id;
  const tier = getTierFromPriceId(priceId);
  const maxUsers = tier === 'pro' ? 10000 : tier === 'business' ? 50000 : 999999;

  // Find forum by customer ID
  const forums = await dynamodb.scan({
    TableName: FORUMS_TABLE,
    FilterExpression: 'stripeCustomerId = :cid',
    ExpressionAttributeValues: {
      ':cid': customer
    }
  }).promise();

  if (forums.Items && forums.Items.length > 0) {
    const forum = forums.Items[0];

    await dynamodb.update({
      TableName: FORUMS_TABLE,
      Key: { forumId: forum.forumId },
      UpdateExpression: 'SET tier = :tier, maxUsers = :max, stripeSubscriptionId = :sid, #status = :status',
      ExpressionAttributeNames: {
        '#status': 'status'
      },
      ExpressionAttributeValues: {
        ':tier': tier,
        ':max': maxUsers,
        ':sid': subscription.id,
        ':status': status
      }
    }).promise();
  }
}

async function handleSubscriptionCanceled(subscription) {
  const { customer } = subscription;

  const forums = await dynamodb.scan({
    TableName: FORUMS_TABLE,
    FilterExpression: 'stripeCustomerId = :cid',
    ExpressionAttributeValues: {
      ':cid': customer
    }
  }).promise();

  if (forums.Items && forums.Items.length > 0) {
    const forum = forums.Items[0];

    // Downgrade to free tier
    await dynamodb.update({
      TableName: FORUMS_TABLE,
      Key: { forumId: forum.forumId },
      UpdateExpression: 'SET tier = :tier, maxUsers = :max, stripeSubscriptionId = :null',
      ExpressionAttributeValues: {
        ':tier': 'free',
        ':max': 1500,
        ':null': null
      }
    }).promise();
  }
}

async function handlePaymentSucceeded(invoice) {
  console.log('Payment succeeded:', invoice.id);
  // Optional: Send confirmation email, update payment history
}

async function handlePaymentFailed(invoice) {
  console.log('Payment failed:', invoice.id);
  // Optional: Send payment failed notification
}

function getTierFromPriceId(priceId) {
  // Map Stripe price IDs to tiers
  const tierMap = {
    'price_pro': 'pro',
    'price_business': 'business',
    'price_enterprise': 'enterprise'
  };

  return tierMap[priceId] || 'free';
}
