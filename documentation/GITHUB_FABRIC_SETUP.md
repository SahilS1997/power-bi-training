# 🚀 GitHub Pages + Microsoft Fabric Setup Guide

## Overview

**Architecture:**
- **Frontend**: GitHub Pages (HTML/CSS/JavaScript)
- **Backend**: Microsoft Fabric Lakehouse (SQL endpoint)
- **Authentication**: Azure AD (MSAL.js)
- **Database**: Fabric Lakehouse Tables

**No third-party hosting needed!** ✅

---

## 📋 Prerequisites

1. Microsoft Fabric workspace
2. Azure AD tenant
3. GitHub repository
4. Admin access to both

---

## 🔧 Part 1: Microsoft Fabric Setup

### Step 1: Create Fabric Workspace

```powershell
# Go to Microsoft Fabric portal
https://app.fabric.microsoft.com

# Create new workspace
1. Click "Workspaces" → "New workspace"
2. Name: "PowerBI-Training"
3. Click "Create"
```

### Step 2: Create Lakehouse

```powershell
# In your workspace:
1. Click "New" → "Lakehouse"
2. Name: "TrainingData"
3. Click "Create"
```

### Step 3: Get Workspace & Lakehouse IDs

```powershell
# Workspace ID:
# URL format: https://app.fabric.microsoft.com/groups/{WORKSPACE_ID}/...
# Copy the {WORKSPACE_ID} from URL

# Lakehouse ID:
# Go to Lakehouse → Settings → Copy "Item ID"
```

### Step 4: Initialize Database Tables

```sql
-- Open Lakehouse → SQL endpoint → New SQL query

-- 1. Training Days Table
CREATE TABLE training_days (
    day_number INT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_unlocked BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMP,
    unlocked_by VARCHAR(255),
    presentation_url VARCHAR(500),
    resources_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Recordings Table
CREATE TABLE recordings (
    recording_id VARCHAR(36) PRIMARY KEY,
    day_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    video_url VARCHAR(500) NOT NULL,
    embed_url VARCHAR(500),
    platform VARCHAR(50),
    duration VARCHAR(50),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(255),
    view_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (day_number) REFERENCES training_days(day_number)
);

-- 3. Users Table
CREATE TABLE users (
    user_id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'STUDENT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);

-- 4. User Progress Table
CREATE TABLE user_progress (
    progress_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    day_number INT NOT NULL,
    viewed_presentation BOOLEAN DEFAULT FALSE,
    viewed_recording BOOLEAN DEFAULT FALSE,
    completion_percentage FLOAT DEFAULT 0,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (day_number) REFERENCES training_days(day_number)
);

-- 5. Admin Actions Log
CREATE TABLE admin_actions (
    action_id VARCHAR(36) PRIMARY KEY,
    admin_id VARCHAR(36) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    day_number INT,
    metadata TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(user_id)
);
```

### Step 5: Seed Initial Data

```sql
-- Insert 12 training days
INSERT INTO training_days (day_number, title, description, presentation_url) VALUES
(1, 'Introduction to Power BI & Data Connectivity', 'Getting started with Power BI Desktop', 'presentations/Day_01_Presentation.html'),
(2, 'Power Query & Data Transformation', 'Master data transformation', 'presentations/Day_02_Presentation.html'),
(3, 'Data Modeling & Relationships', 'Build efficient data models', 'presentations/Day_03_Presentation.html'),
(4, 'Introduction to DAX', 'Learn DAX fundamentals', 'presentations/Day_04_Presentation.html'),
(5, 'Essential DAX Functions Part 1', 'Key DAX functions', 'presentations/Day_05_Presentation.html'),
(6, 'Essential DAX Functions Part 2', 'Advanced functions', 'presentations/Day_06_Presentation.html'),
(7, 'Advanced DAX Patterns', 'Complex calculations', 'presentations/Day_07_Presentation.html'),
(8, 'Time Intelligence & Date Functions', 'Time-based analysis', 'presentations/Day_08_Presentation.html'),
(9, 'Power BI Visualizations', 'Create stunning visuals', 'presentations/Day_09_Presentation.html'),
(10, 'Advanced Analytics & AI Features', 'AI-powered insights', 'presentations/Day_10_Presentation.html'),
(11, 'Power BI Service & Collaboration', 'Share and collaborate', 'presentations/Day_11_Presentation.html'),
(12, 'Performance Optimization & Best Practices', 'Optimize your reports', 'presentations/Day_12_Presentation.html');

-- Create admin user
INSERT INTO users (user_id, email, role, created_at) VALUES
('admin-001', 'admin@powerbi.training', 'ADMIN', CURRENT_TIMESTAMP);
```

---

## 🔐 Part 2: Azure AD App Registration

### Step 1: Register Application

```powershell
# Go to Azure Portal
https://portal.azure.com

# Navigate to:
Azure Active Directory → App registrations → New registration

# Fill in:
Name: PowerBI-Training-App
Supported account types: Single tenant
Redirect URI: 
  - Type: Single-page application (SPA)
  - URI: https://sahils1997.github.io/power-bi-training/

# Click "Register"
```

### Step 2: Get Application (Client) ID

```powershell
# After registration, copy:
Application (client) ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Directory (tenant) ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Step 3: Configure API Permissions

```powershell
# In your app:
API permissions → Add a permission → APIs my organization uses

# Search for: "Power BI Service"
# Add permissions:
- Workspace.Read.All
- Workspace.ReadWrite.All
- Dataset.Read.All
- Dataset.ReadWrite.All

# Also add:
Microsoft Graph → Delegated permissions → User.Read

# Click "Grant admin consent"
```

### Step 4: Add Redirect URIs

```powershell
# Authentication → Platform configurations → Add a platform

# Add both:
1. https://sahils1997.github.io/power-bi-training/
2. http://localhost:3000 (for local testing)

# Enable:
✅ Access tokens
✅ ID tokens
```

---

## 💻 Part 3: Frontend Integration

### Step 1: Add MSAL.js Library

Add to your HTML files (`Admin_Portal.html`, `PowerBI_Training_Portal.html`):

```html
<!-- Add before closing </head> tag -->
<script src="https://alcdn.msauth.net/browser/2.38.1/js/msal-browser.min.js"></script>
<script src="scripts/fabricClient.js"></script>
```

### Step 2: Configure Fabric Client

Update `fabricClient.js` with your IDs:

```javascript
const fabricClient = new FabricClient();

// Configure with your values
fabricClient.config = {
  tenantId: 'YOUR_TENANT_ID',        // From Azure AD
  clientId: 'YOUR_CLIENT_ID',        // From App Registration
  workspaceId: 'YOUR_WORKSPACE_ID',  // From Fabric
  lakehouseId: 'YOUR_LAKEHOUSE_ID',  // From Fabric
  redirectUri: 'https://sahils1997.github.io/power-bi-training/'
};
```

### Step 3: Update Admin Portal

Replace localStorage calls with Fabric API:

```javascript
// OLD (localStorage):
const state = JSON.parse(localStorage.getItem('powerbi_content_state'));

// NEW (Fabric API):
const days = await fabricClient.getAllTrainingDays();

// Unlock day:
await fabricClient.unlockDay(dayNumber, adminEmail);

// Upload recording:
await fabricClient.uploadRecording({
  dayNumber: 1,
  title: 'Day 1 Recording',
  videoUrl: 'https://youtube.com/watch?v=...',
  platform: 'YOUTUBE',
  duration: '2h 30min',
  uploadedBy: 'admin@powerbi.training'
});
```

---

## 🧪 Part 4: Testing

### Test 1: Authentication

```javascript
// Open browser console on your GitHub Pages site
const client = new FabricClient();
await client.authenticate();
// Should open Azure AD login popup
```

### Test 2: Query Data

```javascript
// Get all training days
const days = await client.getAllTrainingDays();
console.log(days);

// Get specific day
const day1 = await client.getTrainingDay(1);
console.log(day1);
```

### Test 3: Admin Operations

```javascript
// Login as admin first
await client.authenticate();

// Unlock day
await client.unlockDay(1, 'admin@powerbi.training');

// Upload recording
await client.uploadRecording({
  dayNumber: 1,
  title: 'Day 1 Live Session',
  videoUrl: 'https://youtube.com/watch?v=abc123',
  platform: 'YOUTUBE',
  duration: '2h 30min',
  uploadedBy: 'admin@powerbi.training'
});

// Get dashboard stats
const stats = await client.getDashboardStats();
console.log(stats);
```

---

## 🔄 Part 5: Deploy to GitHub

```powershell
# Stage all files
git add .

# Commit
git commit -m "Add GitHub Pages + Fabric direct integration"

# Push to GitHub
git push origin main

# Your site is live at:
# https://sahils1997.github.io/power-bi-training/
```

---

## 💰 Cost Breakdown

| Service | Cost | Notes |
|---------|------|-------|
| **GitHub Pages** | FREE | Static hosting |
| **Microsoft Fabric** | $0-50/month | Based on usage |
| **Azure AD** | FREE | Basic authentication |
| **TOTAL** | **$0-50/month** | Scales with usage |

**Fabric Pricing:**
- First 10GB: FREE
- Additional storage: ~$0.02/GB/month
- Compute: Pay per use (~$0.20/hour)

---

## 🛠️ Troubleshooting

### Issue: CORS Error

```javascript
// Add to Fabric SQL endpoint settings:
Allowed Origins: https://sahils1997.github.io
```

### Issue: Authentication Failed

```javascript
// Check:
1. Redirect URI matches exactly
2. API permissions granted
3. App registration active
```

### Issue: Query Failed

```sql
-- Check SQL endpoint is enabled:
Lakehouse → Settings → SQL endpoint → Enabled
```

---

## 📚 Next Steps

1. ✅ Set up Fabric workspace
2. ✅ Create Lakehouse and tables
3. ✅ Register Azure AD app
4. ✅ Configure frontend
5. ✅ Test authentication
6. ✅ Deploy to GitHub Pages

**Your training portal is now fully operational!** 🎉

---

## 🔗 Useful Links

- Fabric Portal: https://app.fabric.microsoft.com
- Azure Portal: https://portal.azure.com
- MSAL.js Docs: https://learn.microsoft.com/azure/active-directory/develop/msal-js-initializing-client-applications
- Fabric API Docs: https://learn.microsoft.com/fabric/
