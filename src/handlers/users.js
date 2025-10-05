const { DynamoDB, SES } = require('aws-sdk');
const crypto = require('crypto');
const dynamodb = new DynamoDB.DocumentClient();
const ses = new SES({ region: 'us-east-1' });

const USERS_TABLE = process.env.USERS_TABLE;
const MESSAGES_TABLE = process.env.MESSAGES_TABLE || 'snapit-forum-messages-prod';

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

// Get current user (authenticated)
exports.getMe = async (event) => {
  try {
    const userId = event.requestContext.authorizer.userId;

    const result = await dynamodb.get({
      TableName: USERS_TABLE,
      Key: { userId }
    }).promise();

    if (!result.Item) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    // Return full user data for authenticated user
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(result.Item)
    };
  } catch (error) {
    console.error('Get me error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to get user' })
    };
  }
};

// Get user
exports.get = async (event) => {
  try {
    const { userId } = event.pathParameters;

    const result = await dynamodb.get({
      TableName: USERS_TABLE,
      Key: { userId }
    }).promise();

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    // Don't return sensitive data
    const { userId: id, email, name, picture, pgpPublicKey, createdAt } = result.Item;

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ userId: id, email, name, picture, pgpPublicKey, createdAt })
    };
  } catch (error) {
    console.error('Get user error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to get user' })
    };
  }
};

// Update user
exports.update = async (event) => {
  try {
    const userId = event.requestContext.authorizer.userId;
    const { name, pgpPublicKey } = JSON.parse(event.body);

    const updateExpression = [];
    const expressionAttributeValues = {};

    if (name) {
      updateExpression.push('name = :name');
      expressionAttributeValues[':name'] = name;
    }

    if (pgpPublicKey) {
      updateExpression.push('pgpPublicKey = :key');
      expressionAttributeValues[':key'] = pgpPublicKey;
    }

    if (updateExpression.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No fields to update' })
      };
    }

    await dynamodb.update({
      TableName: USERS_TABLE,
      Key: { userId },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeValues: expressionAttributeValues
    }).promise();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error('Update user error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to update user' })
    };
  }
};

// Set username (first time)
exports.setUsername = async (event) => {
  try {
    const userId = event.requestContext.authorizer.userId;
    const { username } = JSON.parse(event.body);

    // Validate username
    if (!username || username.length < 3) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Username must be at least 3 characters' })
      };
    }

    const usernameRegex = /^[a-z0-9-]+$/;
    if (!usernameRegex.test(username)) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Username can only contain lowercase letters, numbers, and hyphens' })
      };
    }

    // Check if username is already taken
    const existingUser = await dynamodb.query({
      TableName: USERS_TABLE,
      IndexName: 'UsernameIndex',
      KeyConditionExpression: 'username = :username',
      ExpressionAttributeValues: {
        ':username': username
      }
    }).promise();

    if (existingUser.Items && existingUser.Items.length > 0) {
      return {
        statusCode: 409,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Username already taken' })
      };
    }

    // Update user with username
    await dynamodb.update({
      TableName: USERS_TABLE,
      Key: { userId },
      UpdateExpression: 'SET username = :username',
      ExpressionAttributeValues: {
        ':username': username
      }
    }).promise();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: true, username })
    };
  } catch (error) {
    console.error('Set username error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to set username' })
    };
  }
};

// Check username availability
exports.checkUsername = async (event) => {
  try {
    const { username } = event.queryStringParameters || {};

    if (!username) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Username required' })
      };
    }

    const result = await dynamodb.query({
      TableName: USERS_TABLE,
      IndexName: 'UsernameIndex',
      KeyConditionExpression: 'username = :username',
      ExpressionAttributeValues: {
        ':username': username
      }
    }).promise();

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        available: !result.Items || result.Items.length === 0
      })
    };
  } catch (error) {
    console.error('Check username error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to check username' })
    };
  }
};

// Get public profile by username
exports.getPublicProfile = async (event) => {
  try {
    const { username } = event.pathParameters;

    const result = await dynamodb.query({
      TableName: USERS_TABLE,
      IndexName: 'UsernameIndex',
      KeyConditionExpression: 'username = :username',
      ExpressionAttributeValues: {
        ':username': username
      }
    }).promise();

    if (!result.Items || result.Items.length === 0) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'User not found' })
      };
    }

    const user = result.Items[0];

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        profile: {
          username: user.username,
          displayName: user.name,
          bio: user.bio || '',
          publicKey: user.pgpPublicKey || '',
          createdAt: user.createdAt,
          verified: user.verified || false
        }
      })
    };
  } catch (error) {
    console.error('Get public profile error:', error);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Failed to get profile' })
    };
  }
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

    // Return user data and decrypted private key (client-side only!)
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        success: true,
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
