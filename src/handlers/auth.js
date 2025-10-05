const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { DynamoDB, SES } = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const dynamodb = new DynamoDB.DocumentClient();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const ses = new SES({ region: 'us-east-1' });

const USERS_TABLE = process.env.USERS_TABLE;
const FORUMS_TABLE = process.env.FORUMS_TABLE;
const FORUM_MEMBERS_TABLE = process.env.FORUM_MEMBERS_TABLE;
const JWT_SECRET = process.env.JWT_SECRET;

// Initiate Google OAuth (redirect to Google)
exports.googleAuth = async (event) => {
  // Support both custom domain and API Gateway URL
  const host = event.headers?.Host || event.headers?.host;
  const protocol = event.headers?.['X-Forwarded-Proto'] || 'https';

  // Use custom domain if available, otherwise fallback to API Gateway
  let baseUrl;
  if (host && host.includes('auth.snapitsoftware.com')) {
    baseUrl = `${protocol}://auth.snapitsoftware.com`;
  } else {
    baseUrl = process.env.API_GATEWAY_URL || 'https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod';
  }

  const redirectUri = `${baseUrl}/auth/google/callback`;
  const scope = 'openid profile email';
  const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;

  return {
    statusCode: 302,
    headers: {
      Location: googleAuthUrl,
      'Access-Control-Allow-Origin': '*'
    }
  };
};

// Google OAuth Callback
exports.googleCallback = async (event) => {
  try {
    const { code, error } = event.queryStringParameters || {};

    if (error) {
      console.error('Google OAuth error:', error);
      return {
        statusCode: 302,
        headers: {
          Location: `https://forum.snapitsoftware.com/?error=${encodeURIComponent(error)}`
        }
      };
    }

    if (!code) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing authorization code' })
      };
    }

    // Exchange code for tokens
    // Support both custom domain and API Gateway URL
    const host = event.headers?.Host || event.headers?.host;
    const protocol = event.headers?.['X-Forwarded-Proto'] || 'https';

    let baseUrl;
    if (host && host.includes('auth.snapitsoftware.com')) {
      baseUrl = `${protocol}://auth.snapitsoftware.com`;
    } else {
      baseUrl = process.env.API_GATEWAY_URL || 'https://u25qbry7za.execute-api.us-east-1.amazonaws.com/prod';
    }

    const redirectUri = `${baseUrl}/auth/google/callback`;
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await tokenResponse.json();

    // Verify ID token and get user info
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const googleUser = ticket.getPayload();

    // Check if user exists
    let user = await getUserByEmail(googleUser.email);

    if (!user) {
      // Create new user
      user = {
        userId: `google_${googleUser.sub}`,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        createdAt: Date.now(),
        pgpPublicKey: null,
        emailVerified: googleUser.email_verified
      };

      await dynamodb.put({
        TableName: USERS_TABLE,
        Item: user
      }).promise();

      // Create user's free forum
      await createUserForum(user);
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect to frontend with token
    return {
      statusCode: 302,
      headers: {
        Location: `https://forum.snapitsoftware.com/?token=${token}`
      }
    };

  } catch (error) {
    console.error('Google auth error:', error);
    return {
      statusCode: 302,
      headers: {
        Location: `https://forum.snapitsoftware.com/?error=${encodeURIComponent('Authentication failed')}`
      }
    };
  }
};

// Create user's free forum
async function createUserForum(user) {
  const forumId = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');
  const timestamp = Date.now();

  // Create forum
  const forum = {
    forumId,
    ownerUserId: user.userId,
    name: `${user.name}'s Forum`,
    subdomain: forumId,
    customDomain: null,
    tier: 'free',
    maxUsers: 1500,
    userCount: 1,
    createdAt: timestamp,
    stripeCustomerId: null,
    stripeSubscriptionId: null
  };

  await dynamodb.put({
    TableName: FORUMS_TABLE,
    Item: forum
  }).promise();

  // Add user as forum admin
  await dynamodb.put({
    TableName: FORUM_MEMBERS_TABLE,
    Item: {
      forumIdUserId: `${forumId}#${user.userId}`,
      forumId,
      userId: user.userId,
      role: 'admin',
      joinedAt: timestamp
    }
  }).promise();

  // Create default categories
  const categories = [
    { id: 'general', name: 'General Discussion', description: 'General chat', position: 1 },
    { id: 'support', name: 'Support', description: 'Get help', position: 2 },
    { id: 'feedback', name: 'Feedback', description: 'Share your thoughts', position: 3 }
  ];

  await Promise.all(categories.map(cat =>
    dynamodb.put({
      TableName: process.env.CATEGORIES_TABLE,
      Item: {
        forumIdCategoryId: `${forumId}#${cat.id}`,
        forumId,
        categoryId: cat.id,
        name: cat.name,
        description: cat.description,
        position: cat.position,
        threadCount: 0
      }
    }).promise()
  ));

  return forum;
}

// Get user by email
async function getUserByEmail(email) {
  const result = await dynamodb.query({
    TableName: USERS_TABLE,
    IndexName: 'EmailIndex',
    KeyConditionExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email
    }
  }).promise();

  return result.Items && result.Items[0];
}

// JWT Authorizer
exports.authorizer = async (event) => {
  try {
    const token = event.authorizationToken.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);

    return {
      principalId: decoded.userId,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [{
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: event.methodArn
        }]
      },
      context: {
        userId: decoded.userId,
        email: decoded.email
      }
    };
  } catch (error) {
    throw new Error('Unauthorized');
  }
};

// Refresh Token
exports.refreshToken = async (event) => {
  try {
    const { refreshToken } = JSON.parse(event.body);

    if (!refreshToken) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing refresh token' })
      };
    }

    // Verify and generate new token
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const newToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ token: newToken })
    };

  } catch (error) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Invalid refresh token' })
    };
  }
};

// ========================================
// Email/Password Authentication Functions
// ========================================

// Password hashing utilities
const hashPassword = async (password) => {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      resolve(salt + ':' + derivedKey.toString('hex'));
    });
  });
};

const verifyPassword = async (password, hash) => {
  return new Promise((resolve, reject) => {
    const [salt, key] = hash.split(':');
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) reject(err);
      resolve(key === derivedKey.toString('hex'));
    });
  });
};

// Encryption utilities for PGP private key
const encryptPrivateKey = (privateKey, password, salt) => {
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

const decryptPrivateKey = (encryptedPrivateKey, password, salt) => {
  const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha512');
  const [ivHex, encrypted] = encryptedPrivateKey.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// Add backup email and send verification via SES
exports.addBackupEmail = async (event) => {
  try {
    const userId = event.requestContext.authorizer.userId;
    const { email } = JSON.parse(event.body);

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid email address' })
      };
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

    // Save to DynamoDB
    await dynamodb.update({
      TableName: USERS_TABLE,
      Key: { userId },
      UpdateExpression: 'SET backupEmail = :email, emailVerificationToken = :token, emailVerificationExpiry = :expiry, emailVerified = :false',
      ExpressionAttributeValues: {
        ':email': email,
        ':token': verificationToken,
        ':expiry': expiresAt,
        ':false': false
      }
    }).promise();

    // Send verification email via SES
    await ses.sendEmail({
      Source: 'noreply@snapitsoftware.com',
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: 'Verify your SnapIT Forum backup email' },
        Body: {
          Html: {
            Data: `
              <h2>Verify Your Email</h2>
              <p>Click the link below to verify your backup email:</p>
              <a href="https://forum.snapitsoftware.com/verify-email?token=${verificationToken}">
                Verify Email
              </a>
              <p>This link expires in 24 hours.</p>
              <p><strong>Important:</strong> If you forget your password, your encrypted data CANNOT be recovered.
              This email is only for account access recovery, not data recovery.</p>
            `
          }
        }
      }
    }).promise();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, message: 'Verification email sent' })
    };
  } catch (error) {
    console.error('Add backup email error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to add backup email' })
    };
  }
};

// Verify email token
exports.verifyEmail = async (event) => {
  try {
    const { token } = event.queryStringParameters || {};

    if (!token) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Token required' })
      };
    }

    // Find user with this token
    const users = await dynamodb.scan({
      TableName: USERS_TABLE,
      FilterExpression: 'emailVerificationToken = :token AND emailVerificationExpiry > :now',
      ExpressionAttributeValues: {
        ':token': token,
        ':now': Date.now()
      }
    }).promise();

    if (users.Items.length === 0) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid or expired token' })
      };
    }

    const user = users.Items[0];

    // Mark email as verified
    await dynamodb.update({
      TableName: USERS_TABLE,
      Key: { userId: user.userId },
      UpdateExpression: 'SET emailVerified = :true REMOVE emailVerificationToken, emailVerificationExpiry',
      ExpressionAttributeValues: {
        ':true': true
      }
    }).promise();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, message: 'Email verified successfully' })
    };
  } catch (error) {
    console.error('Verify email error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to verify email' })
    };
  }
};

// Set password and encrypt PGP private key
exports.setPassword = async (event) => {
  try {
    const userId = event.requestContext.authorizer.userId;
    const { password, privateKey } = JSON.parse(event.body);

    // Validate password strength
    if (!password || password.length < 8) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Password must be at least 8 characters' })
      };
    }

    if (!privateKey) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Private PGP key required' })
      };
    }

    // Get current user to verify email is verified
    const result = await dynamodb.get({
      TableName: USERS_TABLE,
      Key: { userId }
    }).promise();

    if (!result.Item || !result.Item.emailVerified) {
      return {
        statusCode: 403,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Backup email must be verified before setting password' })
      };
    }

    // Generate salt for encryption
    const salt = crypto.randomBytes(16).toString('hex');

    // Hash password for login verification
    const passwordHash = await hashPassword(password);

    // Encrypt private PGP key with password
    const encryptedPrivateKey = encryptPrivateKey(privateKey, password, salt);

    // Store in DynamoDB
    await dynamodb.update({
      TableName: USERS_TABLE,
      Key: { userId },
      UpdateExpression: 'SET passwordHash = :hash, salt = :salt, encryptedPrivateKey = :key',
      ExpressionAttributeValues: {
        ':hash': passwordHash,
        ':salt': salt,
        ':key': encryptedPrivateKey
      }
    }).promise();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true,
        message: 'Password set successfully. Your private key is now encrypted.',
        warning: 'If you lose this password, your encrypted data will be permanently lost.'
      })
    };
  } catch (error) {
    console.error('Set password error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to set password' })
    };
  }
};

// Login with email and password
exports.emailPasswordLogin = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Email and password required' })
      };
    }

    // Find user by backup email
    const users = await dynamodb.scan({
      TableName: USERS_TABLE,
      FilterExpression: 'backupEmail = :email AND emailVerified = :true',
      ExpressionAttributeValues: {
        ':email': email,
        ':true': true
      }
    }).promise();

    if (users.Items.length === 0) {
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid email or password' })
      };
    }

    const user = users.Items[0];

    // Verify password
    if (!user.passwordHash || !(await verifyPassword(password, user.passwordHash))) {
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid email or password' })
      };
    }

    // Decrypt private PGP key
    let privateKey;
    try {
      privateKey = decryptPrivateKey(user.encryptedPrivateKey, password, user.salt);
    } catch (decryptError) {
      console.error('Decryption error:', decryptError);
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid email or password' })
      };
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data and decrypted private key (client-side only!)
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true,
        token: token,
        user: {
          userId: user.userId,
          email: user.email,
          username: user.username,
          name: user.name,
          pgpPublicKey: user.pgpPublicKey
        },
        privateKey: privateKey // Client stores this in memory only
      })
    };
  } catch (error) {
    console.error('Email/password login error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Login failed' })
    };
  }
};

// Request password reset
exports.requestPasswordReset = async (event) => {
  try {
    const { email } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Email required' })
      };
    }

    // Find user by backup email
    const users = await dynamodb.scan({
      TableName: USERS_TABLE,
      FilterExpression: 'backupEmail = :email AND emailVerified = :true',
      ExpressionAttributeValues: {
        ':email': email,
        ':true': true
      }
    }).promise();

    if (users.Items.length === 0) {
      // Don't reveal if email exists (security)
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: true, message: 'If that email exists, a reset link has been sent' })
      };
    }

    const user = users.Items[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + (1 * 60 * 60 * 1000); // 1 hour

    await dynamodb.update({
      TableName: USERS_TABLE,
      Key: { userId: user.userId },
      UpdateExpression: 'SET passwordResetToken = :token, passwordResetExpiry = :expiry',
      ExpressionAttributeValues: {
        ':token': resetToken,
        ':expiry': expiresAt
      }
    }).promise();

    // Send reset email via SES
    await ses.sendEmail({
      Source: 'noreply@snapitsoftware.com',
      Destination: { ToAddresses: [email] },
      Message: {
        Subject: { Data: 'Reset your SnapIT Forum password' },
        Body: {
          Html: {
            Data: `
              <h2>Reset Your Password</h2>
              <p>Click the link below to reset your password:</p>
              <a href="https://forum.snapitsoftware.com/reset-password?token=${resetToken}">
                Reset Password
              </a>
              <p>This link expires in 1 hour.</p>
              <p><strong>⚠️ CRITICAL WARNING:</strong></p>
              <p>Resetting your password will <strong>PERMANENTLY DELETE</strong> all your encrypted messages.</p>
              <p>We use zero-knowledge encryption. Without your old password, your data CANNOT be recovered.</p>
              <p>You will be able to access your account, but all previous encrypted messages will be lost.</p>
              <p>If you did not request this, ignore this email.</p>
            `
          }
        }
      }
    }).promise();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, message: 'If that email exists, a reset link has been sent' })
    };
  } catch (error) {
    console.error('Request password reset error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to process password reset request' })
    };
  }
};

// Reset password (destroys encrypted data)
exports.resetPassword = async (event) => {
  try {
    const { token, newPassword } = JSON.parse(event.body);

    if (!token || !newPassword) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Token and new password required' })
      };
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Password must be at least 8 characters' })
      };
    }

    // Find user with valid reset token
    const users = await dynamodb.scan({
      TableName: USERS_TABLE,
      FilterExpression: 'passwordResetToken = :token AND passwordResetExpiry > :now',
      ExpressionAttributeValues: {
        ':token': token,
        ':now': Date.now()
      }
    }).promise();

    if (users.Items.length === 0) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Invalid or expired token' })
      };
    }

    const user = users.Items[0];

    // Generate new salt and hash password
    const newSalt = crypto.randomBytes(16).toString('hex');
    const newPasswordHash = await hashPassword(newPassword);

    // CRITICAL: Delete old encrypted private key and PGP keys
    // User must generate NEW PGP key pair
    await dynamodb.update({
      TableName: USERS_TABLE,
      Key: { userId: user.userId },
      UpdateExpression: 'SET passwordHash = :hash, salt = :salt REMOVE encryptedPrivateKey, passwordResetToken, passwordResetExpiry, pgpPublicKey',
      ExpressionAttributeValues: {
        ':hash': newPasswordHash,
        ':salt': newSalt
      }
    }).promise();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true,
        message: 'Password reset successfully',
        warning: 'All encrypted data has been permanently deleted. You must generate a new PGP key pair.'
      })
    };
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to reset password' })
    };
  }
};
