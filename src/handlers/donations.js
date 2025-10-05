const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const jwt = require('jsonwebtoken');

/**
 * Create a Stripe Checkout session for one-time or recurring donations
 */
exports.createDonationSession = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'OPTIONS,POST',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Verify JWT token
    const authHeader = event.headers.Authorization || event.headers.authorization;
    if (!authHeader) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'No authorization token provided' }),
      };
    }

    const token = authHeader.replace('Bearer ', '');
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Invalid token' }),
      };
    }

    const userId = decoded.userId;
    const body = JSON.parse(event.body);
    const { amount, type } = body; // amount in cents, type: 'one-time' or 'recurring'

    if (!amount || amount < 100) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Minimum donation is $1' }),
      };
    }

    if (!['one-time', 'recurring'].includes(type)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid donation type' }),
      };
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: type === 'one-time' ? 'payment' : 'subscription',
      customer_email: decoded.email,
      client_reference_id: userId,
      metadata: {
        userId,
        donationType: type,
      },
      line_items: [
        type === 'one-time'
          ? {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: 'SnapIT Forum Donation',
                  description: 'Support privacy tools and free speech',
                  images: ['https://forum.snapitsoftware.com/logo512.png'],
                },
                unit_amount: amount,
              },
              quantity: 1,
            }
          : {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: 'Monthly SnapIT Forum Donation',
                  description: 'Recurring monthly support for privacy tools',
                  images: ['https://forum.snapitsoftware.com/logo512.png'],
                },
                unit_amount: amount,
                recurring: {
                  interval: 'month',
                },
              },
              quantity: 1,
            },
      ],
      success_url: `https://forum.snapitsoftware.com/?donation=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://forum.snapitsoftware.com/?donation=cancelled`,
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        sessionId: session.id,
        sessionUrl: session.url,
      }),
    };
  } catch (error) {
    console.error('Error creating donation session:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to create donation session',
        details: error.message,
      }),
    };
  }
};
