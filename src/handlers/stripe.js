const { DynamoDB, CloudWatch, SNS } = require('aws-sdk');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const dynamodb = new DynamoDB.DocumentClient();
const cloudwatch = new CloudWatch();
const sns = new SNS();

const FORUMS_TABLE = process.env.FORUMS_TABLE;
const SNS_TOPIC_ARN = 'arn:aws:sns:us-east-1:692859945539:snapit-forum-production-alerts';

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

    // Log all webhook events for analytics
    console.log(`[STRIPE WEBHOOK] Event: ${stripeEvent.type}`, {
      eventId: stripeEvent.id,
      created: stripeEvent.created,
      livemode: stripeEvent.livemode
    });

    // Handle the event
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(stripeEvent.data.object);
        break;

      case 'customer.subscription.created':
        await handleSubscriptionCreated(stripeEvent.data.object);
        break;

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

async function handleCheckoutCompleted(session) {
  console.log('[CHECKOUT COMPLETED]', {
    sessionId: session.id,
    customerId: session.customer,
    subscriptionId: session.subscription
  });

  // Track checkout completion metric
  await publishMetric('CheckoutCompleted', 1, [
    { Name: 'PaymentStatus', Value: session.payment_status }
  ]);
}

async function handleSubscriptionCreated(subscription) {
  const { customer, items, status } = subscription;

  // Get price to determine tier
  const priceId = items.data[0].price.id;
  const tier = getTierFromPriceId(priceId);
  const maxUsers = tier === 'pro' ? 10000 : tier === 'business' ? 50000 : 999999;

  console.log('[SUBSCRIPTION CREATED]', {
    subscriptionId: subscription.id,
    customerId: customer,
    tier,
    status
  });

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

    // Track conversion metrics
    const tierPricing = { pro: 99, business: 499, enterprise: 299 };
    const revenue = tierPricing[tier] || 0;

    await publishMetrics([
      {
        MetricName: 'ConversionCount',
        Value: 1,
        Unit: 'Count',
        Dimensions: [{ Name: 'Tier', Value: tier }]
      },
      {
        MetricName: 'MRR',
        Value: revenue,
        Unit: 'None',
        Dimensions: [{ Name: 'Tier', Value: tier }]
      }
    ]);

    // Send SNS notification for first subscriber
    await notifyFirstSubscriber(tier, revenue, forum);
  }
}

async function handleSubscriptionUpdate(subscription) {
  const { customer, items, status } = subscription;

  // Get price to determine tier
  const priceId = items.data[0].price.id;
  const tier = getTierFromPriceId(priceId);
  const maxUsers = tier === 'pro' ? 10000 : tier === 'business' ? 50000 : 999999;

  console.log('[SUBSCRIPTION UPDATED]', {
    subscriptionId: subscription.id,
    customerId: customer,
    tier,
    status
  });

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
  const { customer, items } = subscription;

  // Get tier before cancellation
  const priceId = items.data[0].price.id;
  const tier = getTierFromPriceId(priceId);

  console.log('[SUBSCRIPTION CANCELED]', {
    subscriptionId: subscription.id,
    customerId: customer,
    tier
  });

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

    // Track churn metric
    await publishMetric('ChurnCount', 1, [
      { Name: 'Tier', Value: tier }
    ]);

    // Decrease MRR
    const tierPricing = { pro: 99, business: 499, enterprise: 299 };
    const lostRevenue = tierPricing[tier] || 0;
    await publishMetric('MRR', -lostRevenue, [
      { Name: 'Tier', Value: tier }
    ]);
  }
}

async function handlePaymentSucceeded(invoice) {
  console.log('[PAYMENT SUCCEEDED]', {
    invoiceId: invoice.id,
    customerId: invoice.customer,
    amountPaid: invoice.amount_paid / 100,
    currency: invoice.currency
  });

  // Track revenue metric
  await publishMetric('Revenue', invoice.amount_paid / 100, [
    { Name: 'Currency', Value: invoice.currency.toUpperCase() }
  ]);
}

async function handlePaymentFailed(invoice) {
  console.log('[PAYMENT FAILED]', {
    invoiceId: invoice.id,
    customerId: invoice.customer,
    amountDue: invoice.amount_due / 100,
    attemptCount: invoice.attempt_count
  });

  // Track payment failure metric
  await publishMetric('PaymentFailed', 1, [
    { Name: 'AttemptCount', Value: invoice.attempt_count.toString() }
  ]);

  // Send alert for payment failures
  if (invoice.attempt_count >= 2) {
    await sns.publish({
      TopicArn: SNS_TOPIC_ARN,
      Subject: 'Payment Failure Alert - SnapIT Forums',
      Message: `Payment failed for customer ${invoice.customer}\n\nInvoice: ${invoice.id}\nAttempts: ${invoice.attempt_count}\nAmount: $${invoice.amount_due / 100}\n\nAction required: Contact customer to update payment method.`
    }).promise();
  }
}

function getTierFromPriceId(priceId) {
  // Map actual Stripe LIVE price IDs to tiers
  const tierMap = {
    'price_1SEyIKIkj5YQseOZedJrBtTC': 'pro',
    'price_1SEyIVIkj5YQseOZzYzU8zUm': 'business',
    'price_1SEyIXIkj5YQseOZCs85Q48g': 'enterprise'
  };

  return tierMap[priceId] || 'free';
}

// Helper function to publish single CloudWatch metric
async function publishMetric(metricName, value, dimensions = []) {
  try {
    await cloudwatch.putMetricData({
      Namespace: 'SnapIT/Revenue',
      MetricData: [{
        MetricName: metricName,
        Value: value,
        Unit: 'Count',
        Timestamp: new Date(),
        Dimensions: dimensions
      }]
    }).promise();
    console.log(`[METRIC] ${metricName}: ${value}`, dimensions);
  } catch (error) {
    console.error(`Failed to publish metric ${metricName}:`, error);
  }
}

// Helper function to publish multiple CloudWatch metrics
async function publishMetrics(metrics) {
  try {
    await cloudwatch.putMetricData({
      Namespace: 'SnapIT/Revenue',
      MetricData: metrics.map(m => ({
        ...m,
        Timestamp: new Date()
      }))
    }).promise();
    console.log(`[METRICS] Published ${metrics.length} metrics`);
  } catch (error) {
    console.error('Failed to publish metrics:', error);
  }
}

// Helper function to notify about first subscriber
async function notifyFirstSubscriber(tier, revenue, forum) {
  try {
    // Check if this is the first paying customer
    const allForums = await dynamodb.scan({
      TableName: FORUMS_TABLE,
      FilterExpression: 'tier <> :free',
      ExpressionAttributeValues: {
        ':free': 'free'
      }
    }).promise();

    if (allForums.Items && allForums.Items.length === 1) {
      // This is the first paying customer!
      await sns.publish({
        TopicArn: SNS_TOPIC_ARN,
        Subject: 'First Paying Customer - SnapIT Forums',
        Message: `Congratulations! Your first paying customer just subscribed!\n\nTier: ${tier.toUpperCase()}\nRevenue: $${revenue}/month\nForum ID: ${forum.forumId}\nForum Name: ${forum.name}\n\nMRR: $${revenue}\nNext goal: $1,000 MRR\n\nDashboard: https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=SnapIT-Revenue-Analytics`
      }).promise();
      console.log('[ALERT] First paying customer notification sent!');
    }

    // Check for MRR milestones
    const totalMRR = allForums.Items.reduce((sum, f) => {
      const tierRevenue = { pro: 99, business: 499, enterprise: 299 };
      return sum + (tierRevenue[f.tier] || 0);
    }, 0);

    // Milestone notifications
    if (totalMRR >= 100 && totalMRR - revenue < 100) {
      await sns.publish({
        TopicArn: SNS_TOPIC_ARN,
        Subject: 'MRR Milestone: $100 - SnapIT Forums',
        Message: `You've reached $100 MRR!\n\nCurrent MRR: $${totalMRR}\nActive Subscribers: ${allForums.Items.length}\n\nNext goal: $1,000 MRR`
      }).promise();
    }

    if (totalMRR >= 1000 && totalMRR - revenue < 1000) {
      await sns.publish({
        TopicArn: SNS_TOPIC_ARN,
        Subject: 'MRR GOAL ACHIEVED: $1,000 - SnapIT Forums',
        Message: `Congratulations! You've achieved your $1,000 MRR goal!\n\nCurrent MRR: $${totalMRR}\nActive Subscribers: ${allForums.Items.length}\n\nTime to celebrate and set new goals!`
      }).promise();
    }
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
}
