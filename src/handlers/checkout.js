const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { DynamoDB } = require('aws-sdk');

const dynamodb = new DynamoDB.DocumentClient();
const FORUMS_TABLE = process.env.FORUMS_TABLE;
const USERS_TABLE = process.env.USERS_TABLE;

// Create Stripe Checkout Session
exports.createSession = async (event) => {
  try {
    const userId = event.requestContext.authorizer.userId;
    const { tier } = JSON.parse(event.body);

    if (!tier || !['pro', 'business', 'enterprise'].includes(tier)) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid tier' })
      };
    }

    // Get user and their forum
    const user = await dynamodb.get({
      TableName: USERS_TABLE,
      Key: { userId }
    }).promise();

    if (!user.Item) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    // Get user's forum
    const forums = await dynamodb.query({
      TableName: FORUMS_TABLE,
      IndexName: 'OwnerIndex',
      KeyConditionExpression: 'ownerUserId = :uid',
      ExpressionAttributeValues: {
        ':uid': userId
      }
    }).promise();

    if (!forums.Items || forums.Items.length === 0) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Forum not found' })
      };
    }

    const forum = forums.Items[0];

    // Create or get Stripe customer
    let customerId = forum.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.Item.email,
        metadata: {
          userId,
          forumId: forum.forumId
        }
      });
      customerId = customer.id;

      // Update forum with customer ID
      await dynamodb.update({
        TableName: FORUMS_TABLE,
        Key: { forumId: forum.forumId },
        UpdateExpression: 'SET stripeCustomerId = :cid',
        ExpressionAttributeValues: {
          ':cid': customerId
        }
      }).promise();
    }

    // Price IDs (you'll need to create these in Stripe dashboard)
    const priceIds = {
      pro: process.env.STRIPE_PRO_PRICE_ID || 'price_pro_monthly',
      business: process.env.STRIPE_BUSINESS_PRICE_ID || 'price_business_monthly',
      enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise_monthly'
    };

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceIds[tier],
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `https://forum.snapitsoftware.com/?upgrade=success&tier=${tier}`,
      cancel_url: 'https://forum.snapitsoftware.com/pricing.html?canceled=true',
      metadata: {
        userId,
        forumId: forum.forumId,
        tier
      }
    });

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ sessionId: session.id })
    };

  } catch (error) {
    console.error('Checkout session error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to create checkout session' })
    };
  }
};

// Create Customer Portal Session (for managing subscriptions)
exports.createPortalSession = async (event) => {
  try {
    const userId = event.requestContext.authorizer.userId;

    // Get user's forum
    const forums = await dynamodb.query({
      TableName: FORUMS_TABLE,
      IndexName: 'OwnerIndex',
      KeyConditionExpression: 'ownerUserId = :uid',
      ExpressionAttributeValues: {
        ':uid': userId
      }
    }).promise();

    if (!forums.Items || forums.Items.length === 0) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Forum not found' })
      };
    }

    const forum = forums.Items[0];

    if (!forum.stripeCustomerId) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'No active subscription' })
      };
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: forum.stripeCustomerId,
      return_url: 'https://forum.snapitsoftware.com',
    });

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ url: session.url })
    };

  } catch (error) {
    console.error('Portal session error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to create portal session' })
    };
  }
};
