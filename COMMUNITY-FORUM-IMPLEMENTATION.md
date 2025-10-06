# 🏗️ SnapIT Community Forum Implementation Plan

**Date**: October 6, 2025
**Objective**: Make SnapIT Community the default forum that all users join

---

## 📋 Current Architecture Analysis

### **Existing Forums** (from DynamoDB scan):
1. `snapitsaas` - T.K.'s Forum (Google user 117531686329082142246)
2. `terrell-flautt` - T.K.'s Forum (Google user 102313738183265263682)
3. `snapitsoft` - snapitsoft's Forum (Google user 116571557915822277383) **← Official one?**
4. `birthmybuild` - T.'s Forum (Google user 103119822966708534444)
5. `nickelpiedev` - nickelpie dev's Forum (Google user 118342324000759110208)

### **Default Categories** (auto-created for each forum):
- General Discussion
- Support
- Feedback

---

## 🎯 Design Decision: Community Forum Model

### **How It Works**:

1. **First-time signup** →
   - User creates account (Google OAuth or Email)
   - User sets @username
   - User **automatically joins SnapIT Community Forum**
   - User sees community content immediately

2. **Optional: Create Own Forum** →
   - Free tier: Can create **1 forum** (up to 1,500 users)
   - User clicks "Create Your Forum" button
   - Gets their own isolated forum with own members/threads
   - Can toggle between "Community" and "My Forum"

### **UI Navigation**:
```
Sidebar:
├── 🏠 SnapIT Community (everyone sees this)
│   ├── 📢 Announcements
│   ├── 💬 General Discussion
│   ├── 🛟 Support
│   ├── 💡 Feature Requests
│   ├── 📊 Polls & Surveys
│   └── 🔥 Burn (File Sharing)
│
├── ➕ Create Your Forum (if user has 0 forums)
│
└── 📁 My Forums (if user created any)
    ├── John's Gaming Community
    └── Jane's Tech Forum
```

---

## 🛠️ Implementation Steps

### **Step 1: Designate Official Community Forum**

**Option A**: Use existing `snapitsoft` forum
- Already exists with categories
- Just needs to be marked as "community forum"
- Add flag: `isOfficialCommunity: true`

**Option B**: Create new `snapit-community` forum
- Fresh start with proper naming
- Better separation from user forums
- Clean slate for production

**Recommendation**: **Option B** - Create dedicated community forum

```javascript
{
  forumId: 'snapit-community',
  name: 'SnapIT Community',
  subdomain: 'forum',
  customDomain: 'forum.snapitsoftware.com',
  ownerUserId: 'system',
  tier: 'community',
  maxUsers: 999999,
  isOfficialCommunity: true,  // ← Special flag
  userCount: 0,  // Will grow as users join
  createdAt: Date.now()
}
```

### **Step 2: Update Auth Handlers**

Modify these functions to auto-join community forum:

**A. `googleCallback` (src/handlers/auth.js)**
```javascript
// After user creation/login
const forumMember = {
  forumId: 'snapit-community',
  userId: user.userId,
  role: 'member',
  joinedAt: Date.now()
};

await dynamodb.put({
  TableName: 'snapit-forum-api-forum-members-prod',
  Item: forumMember
}).promise();

// Increment community forum user count
await dynamodb.update({
  TableName: 'snapit-forum-api-forums-prod',
  Key: { forumId: 'snapit-community' },
  UpdateExpression: 'ADD userCount :one',
  ExpressionAttributeValues: { ':one': 1 }
}).promise();
```

**B. `registerWithEmail` (src/handlers/auth.js)**
- Same logic as above after email verification

**C. `verifyEmail` (src/handlers/auth.js)**
- Already calls `createUserForum()`, update to join community instead

### **Step 3: Update `getMe` Endpoint**

Return both community forum and user's own forums:

```javascript
// src/handlers/users.js - getMe function
const userData = {
  user: { ...userRecord },

  // Community forum (everyone has this)
  communityForum: {
    forumId: 'snapit-community',
    name: 'SnapIT Community',
    role: 'member'  // or 'admin' for you
  },

  // User's own forums (optional)
  userForums: []  // Fetch from forums table where ownerUserId = user.userId
};
```

### **Step 4: Update Frontend**

**A. App.tsx - Handle community forum**
```typescript
const [communityForum, setCommunityForum] = useState<any>(null);
const [userForums, setUserForums] = useState<any[]>([]);

// After login
fetch(`${API_BASE_URL}/users/me`, {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(res => res.json())
.then(data => {
  setUser(data.user);
  setCommunityForum(data.communityForum);  // SnapIT Community
  setUserForums(data.userForums);  // User's own forums (empty initially)
});
```

**B. Sidebar.tsx - Show community + user forums**
```typescript
<nav>
  {/* Always show community forum */}
  <NavItem
    icon="home"
    label="SnapIT Community"
    active={currentForum === 'snapit-community'}
    onClick={() => selectForum('snapit-community')}
  />

  {/* User's own forums (if any) */}
  {userForums.length > 0 && (
    <div className="mt-4">
      <h3 className="text-xs font-semibold text-gray-500 px-3 mb-2">
        My Forums
      </h3>
      {userForums.map(forum => (
        <NavItem
          key={forum.forumId}
          icon="forum"
          label={forum.name}
          onClick={() => selectForum(forum.forumId)}
        />
      ))}
    </div>
  )}

  {/* Create forum button (if user has 0 forums) */}
  {userForums.length === 0 && (
    <button
      onClick={() => setShowCreateForumModal(true)}
      className="w-full mt-4 px-3 py-2 text-sm font-semibold text-primary-600 hover:bg-primary-50 rounded-lg"
    >
      + Create Your Forum
    </button>
  )}
</nav>
```

**C. ForumView.tsx - Load active forum**
```typescript
const [activeForum, setActiveForum] = useState('snapit-community');
const [categories, setCategories] = useState([]);
const [threads, setThreads] = useState([]);

useEffect(() => {
  // Fetch categories for active forum
  fetch(`${API_BASE_URL}/forums/${activeForum}/categories`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(res => res.json())
  .then(data => setCategories(data.categories));
}, [activeForum]);
```

### **Step 5: Create Forum Modal** (Optional Feature)

Add button to create user's own forum:

```typescript
const handleCreateForum = async (forumName: string) => {
  const response = await fetch(`${API_BASE_URL}/forums`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: forumName,
      subdomain: forumName.toLowerCase().replace(/[^a-z0-9]/g, '-')
    })
  });

  const newForum = await response.json();
  setUserForums([...userForums, newForum]);
};
```

---

## 🔧 Database Schema Updates

### **Add `isOfficialCommunity` Flag**

```javascript
// snapit-forum-api-forums-prod
{
  forumId: 'snapit-community',
  name: 'SnapIT Community',
  isOfficialCommunity: true,  // ← NEW FIELD
  subdomain: 'forum',
  customDomain: 'forum.snapitsoftware.com',
  // ... rest of fields
}
```

### **Categories for Community Forum**

```javascript
[
  {
    categoryId: 'announcements',
    forumId: 'snapit-community',
    forumIdCategoryId: 'snapit-community#announcements',
    name: 'Announcements',
    description: 'Official updates from SnapIT team',
    position: 1,
    threadCount: 0
  },
  {
    categoryId: 'general',
    forumId: 'snapit-community',
    forumIdCategoryId: 'snapit-community#general',
    name: 'General Discussion',
    description: 'Talk about anything SnapIT',
    position: 2,
    threadCount: 0
  },
  {
    categoryId: 'support',
    forumId: 'snapit-community',
    forumIdCategoryId: 'snapit-community#support',
    name: 'Support',
    description: 'Get help with SnapIT products',
    position: 3,
    threadCount: 0
  },
  {
    categoryId: 'feature-requests',
    forumId: 'snapit-community',
    forumIdCategoryId: 'snapit-community#feature-requests',
    name: 'Feature Requests',
    description: 'Suggest improvements and new features',
    position: 4,
    threadCount: 0
  },
  {
    categoryId: 'polls',
    forumId: 'snapit-community',
    forumIdCategoryId: 'snapit-community#polls',
    name: 'Polls & Surveys',
    description: 'Community polls and feedback',
    position: 5,
    threadCount: 0
  },
  {
    categoryId: 'burn',
    forumId: 'snapit-community',
    forumIdCategoryId: 'snapit-community#burn',
    name: 'Burn (File Sharing)',
    description: 'Discuss secure file sharing',
    position: 6,
    threadCount: 0
  }
]
```

---

## 🎯 User Experience Flow

### **New User Signup**:
```
1. User visits forum.snapitsoftware.com
2. Clicks "Sign In" → Google OAuth or Email Registration
3. Sets @username (e.g., @johndoe)
4. ✨ Auto-joins SnapIT Community
5. Sees community content immediately:
   - Welcome thread in Announcements
   - Active discussions in General
   - Support threads
6. Can browse, post, and engage
7. (Optional) Can create their own forum later
```

### **Returning User**:
```
1. Logs in
2. Sees SnapIT Community by default
3. Sidebar shows:
   - SnapIT Community (active)
   - My Forums (if they created any)
4. Can switch between forums
```

### **Creating Own Forum**:
```
1. User clicks "+ Create Your Forum"
2. Modal opens:
   - Forum Name: "Gaming Community"
   - Subdomain: gaming-community
3. Submits
4. New forum created with default categories
5. User becomes owner/admin of that forum
6. Can invite others to join their forum
7. Still has access to SnapIT Community
```

---

## 🚀 Deployment Steps

### **1. Create Community Forum**:
```bash
cd /mnt/c/Users/decry/Desktop/snapit-forum
node scripts/create-community-forum-v2.js
```

### **2. Update Backend**:
- Modify auth handlers (googleCallback, registerWithEmail, verifyEmail)
- Update getMe endpoint to return community + user forums
- Add isOfficialCommunity flag handling

### **3. Deploy Backend**:
```bash
serverless deploy --stage prod
```

### **4. Update Frontend**:
- Modify App.tsx to handle community forum
- Update Sidebar to show community + user forums
- Update ForumView to fetch real data
- Add CreateForumModal component

### **5. Deploy Frontend**:
```bash
cd forum-app
npm run build
aws s3 sync build s3://snapit-forum-static --delete
aws cloudfront create-invalidation --distribution-id E1X8SJIRPSICZ4 --paths "/*"
```

### **6. Test**:
- Sign up as new user
- Verify auto-join to SnapIT Community
- Check categories load
- Try creating a thread
- Test creating own forum

---

## 📊 Pricing Tiers (Updated)

| Feature | Free | Pro ($29/mo) | Business ($99/mo) | Enterprise ($299/mo) |
|---------|------|--------------|-------------------|---------------------|
| SnapIT Community Access | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| Create Own Forum | ✅ 1 forum | ✅ 5 forums | ✅ 20 forums | ✅ Unlimited |
| Users per Forum | 1,500 | 10,000 | 50,000 | Unlimited |
| Custom Domain | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| API Access | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes |
| White Label | ❌ No | ❌ No | ✅ Yes | ✅ Yes |

---

## ❓ Questions to Confirm

1. **Which existing forum should be the official community?**
   - Use `snapitsoft` forum?
   - Create new `snapit-community` forum?

2. **Community forum categories?**
   - Use default (General, Support, Feedback)?
   - Add custom categories (Announcements, Polls, Burn)?

3. **When should user forums be created?**
   - On demand (user clicks "Create Forum")?
   - Not at all initially (just use community)?

4. **Forum naming**:
   - User forums: `{username}.forums.snapitsoftware.com`?
   - Or just internal IDs with no subdomains?

---

**Ready to implement**: Awaiting confirmation on which approach to use.

**Estimated Time**: 2-3 hours for full implementation + testing
