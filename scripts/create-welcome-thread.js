#!/usr/bin/env node
/**
 * Create Welcome Thread in SnapIT Community
 */

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dynamodb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

const THREADS_TABLE = 'snapit-forum-api-threads-prod';
const POSTS_TABLE = 'snapit-forum-api-posts-prod';
const CATEGORIES_TABLE = 'snapit-forum-api-categories-prod';

const COMMUNITY_FORUM_ID = 'snapit-community';
const ANNOUNCEMENTS_CATEGORY = 'announcements';

async function createWelcomeThread() {
  console.log('🎉 Creating Welcome Thread in SnapIT Community...\n');

  const threadId = uuidv4();
  const postId = uuidv4();
  const timestamp = Date.now();

  // Create thread
  const thread = {
    forumIdThreadId: `${COMMUNITY_FORUM_ID}#${threadId}`,
    forumIdCategoryId: `${COMMUNITY_FORUM_ID}#${ANNOUNCEMENTS_CATEGORY}`,
    forumId: COMMUNITY_FORUM_ID,
    threadId,
    categoryId: ANNOUNCEMENTS_CATEGORY,
    authorId: 'system',
    title: '🎉 Welcome to SnapIT Community!',
    isPinned: true,
    isLocked: false,
    createdAt: timestamp,
    lastPostAt: timestamp,
    postCount: 1,
    viewCount: 0
  };

  try {
    await dynamodb.put({
      TableName: THREADS_TABLE,
      Item: thread
    }).promise();
    console.log('✅ Welcome thread created:', thread.title);
  } catch (error) {
    console.error('❌ Failed to create thread:', error);
    throw error;
  }

  // Create first post
  const post = {
    threadIdPostId: `${threadId}#${postId}`,
    forumIdThreadId: `${COMMUNITY_FORUM_ID}#${threadId}`,
    threadId,
    postId,
    authorId: 'system',
    content: `# Welcome to SnapIT Community! 🚀

Thank you for joining the official SnapIT Community forum!

## 🎯 What is SnapIT?

SnapIT is a suite of privacy-focused tools designed to keep your data secure and your communications private:

- **💬 Forums** - Create your own community with end-to-end encryption
- **🔐 PGP Messenger** - Zero-knowledge encrypted messaging with anonymous relay
- **📊 Polls** - Anonymous voting and surveys
- **🔥 Burn** - Self-destructing file sharing

## 🌟 Getting Started

1. **Set your username** - Complete your profile setup
2. **Explore categories** - Check out General Discussion, Support, and Feature Requests
3. **Join the conversation** - Share your thoughts and ideas
4. **Create your own forum** - Free tier includes 1 forum with up to 1,500 users

## 🔒 Privacy First

All your messages are encrypted using 4096-bit RSA PGP encryption. We use zero-knowledge architecture, which means:
- We can't read your messages
- Your private key never leaves your device
- Anonymous relay hides your IP address

## 💡 Need Help?

- **Support Category**: Get help with any SnapIT product
- **Feature Requests**: Suggest improvements and new features
- **Documentation**: Coming soon!

## 🤝 Community Guidelines

Be respectful, stay on topic, and help make this a welcoming community for everyone.

---

**Happy to have you here!** 🎊

*The SnapIT Team*`,
    createdAt: timestamp,
    upvotes: 0,
    downvotes: 0
  };

  try {
    await dynamodb.put({
      TableName: POSTS_TABLE,
      Item: post
    }).promise();
    console.log('✅ Welcome post created');
  } catch (error) {
    console.error('❌ Failed to create post:', error);
    throw error;
  }

  // Update category thread count
  try {
    await dynamodb.update({
      TableName: CATEGORIES_TABLE,
      Key: {
        forumIdCategoryId: `${COMMUNITY_FORUM_ID}#${ANNOUNCEMENTS_CATEGORY}`
      },
      UpdateExpression: 'ADD threadCount :inc',
      ExpressionAttributeValues: {
        ':inc': 1
      }
    }).promise();
    console.log('✅ Category updated');
  } catch (error) {
    console.error('⚠️  Failed to update category count:', error);
    // Non-fatal, continue
  }

  console.log('\n✨ Welcome thread created successfully!\n');
  console.log('Thread ID:', threadId);
  console.log('Post ID:', postId);
  console.log('View at: https://forum.snapitsoftware.com');
}

createWelcomeThread()
  .then(() => {
    console.log('✅ Setup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });
