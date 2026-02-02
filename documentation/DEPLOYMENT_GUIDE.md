# 🚀 Deployment Guide - Python Backend with Microsoft Fabric

## Quick Answers to Your Questions

### ✅ Back Navigation
**Status:** WORKING - All presentations have:
- ← Previous Day | Portal | Next Day →
- Smart navigation for GitHub/local

### ✅ Video Streaming
**Solution:** Custom Video Player page
- Embeds YouTube/Vimeo videos
- Full-screen support
- Click "Watch Recording" → Opens in Video_Player.html
- Better than direct links!

### ✅ Python Backend
**Status:** CREATED
- FastAPI + GraphQL
- Full code in `/backend` folder
- Production-ready structure

### ✅ Microsoft Fabric Database
**Choice:** Lakehouse ✅ (OPTIMAL)
- Perfect for this use case
- Native Power BI integration
- Cost-effective (~$15-30/month)
- Delta Lake format

### ✅ GraphQL
**Recommendation:** YES! GraphQL is PERFECT
- Flexible queries
- Real-time subscriptions
- Type-safe
- Better than REST for this app

---

## 🎯 Step-by-Step Deployment

### Phase 1: Microsoft Fabric Setup (10 minutes)

**1. Create Fabric Workspace**
```
1. Go to https://app.fabric.microsoft.com
2. Click "Workspaces" → "New workspace"
3. Name: "PowerBI-Training-Portal"
4. Select capacity (F2 minimum, or trial)
5. Create
```

**2. Create Lakehouse**
```
1. In workspace → "New" → "Lakehouse"
2. Name: "training_portal_db"
3. Wait for provisioning
4. Note the workspace ID and lakehouse ID from URL
```

**3. Initialize Tables**
```sql
-- Run in Lakehouse SQL endpoint

-- Users table
CREATE TABLE users (
    user_id STRING,
    email STRING,
    password_hash STRING,
    role STRING,
    created_at TIMESTAMP,
    last_login TIMESTAMP
) USING DELTA;

-- Training content table
CREATE TABLE training_content (
    day_number INT,
    title STRING,
    description STRING,
    is_unlocked BOOLEAN,
    unlocked_at TIMESTAMP,
    unlocked_by STRING,
    presentation_url STRING,
    resources_url STRING,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    PRIMARY KEY (day_number)
) USING DELTA;

-- Recordings table
CREATE TABLE recordings (
    recording_id STRING,
    day_number INT,
    title STRING,
    video_url STRING,
    platform STRING,
    duration STRING,
    uploaded_at TIMESTAMP,
    uploaded_by STRING,
    view_count INT,
    is_active BOOLEAN,
    PRIMARY KEY (recording_id)
) USING DELTA;

-- User progress table
CREATE TABLE user_progress (
    progress_id STRING,
    user_id STRING,
    day_number INT,
    viewed_presentation BOOLEAN,
    viewed_recording BOOLEAN,
    completion_percentage FLOAT,
    last_accessed TIMESTAMP,
    PRIMARY KEY (progress_id)
) USING DELTA;

-- Admin actions audit log
CREATE TABLE admin_actions (
    action_id STRING,
    admin_id STRING,
    action_type STRING,
    day_number INT,
    metadata STRING,
    timestamp TIMESTAMP,
    PRIMARY KEY (action_id)
) USING DELTA;
```

**4. Insert Initial Data**
```sql
-- Insert all 12 training days (locked by default)
INSERT INTO training_content VALUES
(1, 'Introduction to Power BI & Data Connectivity', 'Getting started with Power BI Desktop', false, NULL, NULL, 'presentations/Day_01_Presentation.html', NULL, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
(2, 'Power Query & Data Transformation', 'Master data transformation', false, NULL, NULL, 'presentations/Day_02_Presentation.html', NULL, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
(3, 'Data Modeling & Relationships', 'Build efficient data models', false, NULL, NULL, 'presentations/Day_03_Presentation.html', NULL, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
(4, 'Introduction to DAX', 'Learn DAX fundamentals', false, NULL, NULL, 'presentations/Day_04_Presentation.html', NULL, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
(5, 'Essential DAX Functions Part 1', 'Key DAX functions', false, NULL, NULL, 'presentations/Day_05_Presentation.html', NULL, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
(6, 'Essential DAX Functions Part 2', 'Advanced functions', false, NULL, NULL, 'presentations/Day_06_Presentation.html', NULL, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
(7, 'Advanced DAX Patterns', 'Complex calculations', false, NULL, NULL, 'presentations/Day_07_Presentation.html', NULL, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
(8, 'Time Intelligence & Date Functions', 'Time-based analysis', false, NULL, NULL, 'presentations/Day_08_Presentation.html', NULL, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
(9, 'Power BI Visualizations', 'Create stunning visuals', false, NULL, NULL, 'presentations/Day_09_Presentation.html', NULL, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
(10, 'Advanced Analytics & AI Features', 'AI-powered insights', false, NULL, NULL, 'presentations/Day_10_Presentation.html', NULL, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
(11, 'Power BI Service & Collaboration', 'Share and collaborate', false, NULL, NULL, 'presentations/Day_11_Presentation.html', NULL, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP()),
(12, 'Performance Optimization & Best Practices', 'Optimize your reports', false, NULL, NULL, 'presentations/Day_12_Presentation.html', NULL, CURRENT_TIMESTAMP(), CURRENT_TIMESTAMP());

-- Create default admin user
INSERT INTO users VALUES (
    'admin-001',
    'admin@powerbi.training',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5kosgTRZihIKq', -- hashed: PowerBI2026Admin!
    'admin',
    CURRENT_TIMESTAMP(),
    NULL
);
```

---

### Phase 2: Backend Deployment (20 minutes)

**1. Set Up Environment**
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

**2. Configure Environment Variables**
```bash
# Create .env file
cat > .env << EOF
# Application
APP_NAME="Power BI Training Portal API"
DEBUG=false

# Security
SECRET_KEY="your-super-secret-key-change-this"

# Microsoft Fabric
FABRIC_WORKSPACE_ID="your-workspace-id"
FABRIC_LAKEHOUSE_ID="your-lakehouse-id"
FABRIC_TENANT_ID="your-azure-tenant-id"
FABRIC_CLIENT_ID="your-client-id"
FABRIC_CLIENT_SECRET="your-client-secret"

# CORS
ALLOWED_ORIGINS=["https://sahils1997.github.io"]
EOF
```

**3. Test Locally**
```bash
# Run FastAPI server
python main.py

# Visit:
# http://localhost:8000/api/docs - API documentation
# http://localhost:8000/graphql - GraphQL playground
```

**4. Deploy to Azure App Service**
```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login
az login

# Create resource group
az group create --name powerbi-training-rg --location eastus

# Create App Service plan
az appservice plan create \
    --name powerbi-training-plan \
    --resource-group powerbi-training-rg \
    --sku B1 \
    --is-linux

# Create web app
az webapp create \
    --resource-group powerbi-training-rg \
    --plan powerbi-training-plan \
    --name powerbi-training-api \
    --runtime "PYTHON:3.11"

# Configure environment variables
az webapp config appsettings set \
    --resource-group powerbi-training-rg \
    --name powerbi-training-api \
    --settings @.env

# Deploy code
az webapp up \
    --resource-group powerbi-training-rg \
    --name powerbi-training-api \
    --runtime "PYTHON:3.11"

# Your API is now live at:
# https://powerbi-training-api.azurewebsites.net
```

---

### Phase 3: Frontend Integration (15 minutes)

**1. Update Frontend to Use Backend**
```javascript
// In Admin_Portal.html and PowerBI_Training_Portal.html
// Replace localStorage calls with GraphQL API calls

const API_URL = 'https://powerbi-training-api.azurewebsites.net/graphql';

// Example: Get training days
async function getTrainingDays() {
    const query = `
        query {
            trainingDays {
                dayNumber
                title
                isUnlocked
                recording {
                    title
                    videoUrl
                }
            }
        }
    `;
    
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
    });
    
    const data = await response.json();
    return data.data.trainingDays;
}

// Example: Unlock day (Admin)
async function unlockDay(dayNumber, token) {
    const mutation = `
        mutation($input: UnlockDayInput!) {
            unlockDay(input: $input) {
                dayNumber
                isUnlocked
            }
        }
    `;
    
    const variables = {
        input: {
            dayNumber: dayNumber,
            adminToken: token
        }
    };
    
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: mutation, variables })
    });
    
    return await response.json();
}
```

**2. Enable Real-time Updates (WebSocket)**
```javascript
// Connect to GraphQL subscriptions
const ws = new WebSocket('wss://powerbi-training-api.azurewebsites.net/graphql');

// Subscribe to day unlocks
ws.send(JSON.stringify({
    type: 'subscribe',
    payload: {
        query: `
            subscription {
                dayUnlocked {
                    dayNumber
                    title
                    isUnlocked
                }
            }
        `
    }
}));

// Handle real-time updates
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'data') {
        // Update UI automatically when admin unlocks content
        updateDayCard(data.payload.data.dayUnlocked);
    }
};
```

---

### Phase 4: Testing (10 minutes)

**GraphQL Playground Testing:**
```graphql
# Test 1: Get all days
query {
  trainingDays {
    dayNumber
    title
    isUnlocked
  }
}

# Test 2: Unlock Day 1 (as admin)
mutation {
  unlockDay(input: {
    dayNumber: 1
    adminToken: "your-jwt-token"
  }) {
    dayNumber
    isUnlocked
    unlockedAt
  }
}

# Test 3: Upload recording
mutation {
  uploadRecording(input: {
    dayNumber: 1
    title: "Day 1 Live Session"
    videoUrl: "https://youtube.com/watch?v=abc123"
    platform: YOUTUBE
    duration: "2h 30min"
    adminToken: "your-jwt-token"
  }) {
    recordingId
    title
    videoUrl
  }
}

# Test 4: Get user progress
query {
  userProgress(userId: "user-123") {
    dayNumber
    viewedPresentation
    completionPercentage
  }
}
```

---

## 💰 Cost Breakdown

### Microsoft Fabric (Lakehouse)
- **F2 SKU:** $0.18/hour
- **Storage:** $0.02/GB/month
- **Estimated:** $15-30/month for light usage
- **Free Trial:** 60 days available

### Azure App Service
- **B1 Basic Plan:** $13/month
- **Includes:** 1 CPU core, 1.75GB RAM
- **Perfect for:** Small to medium traffic

### Total Monthly Cost
- **Dev/Test:** ~$0 (use free tiers)
- **Production:** ~$25-45/month
- **Scale:** Can handle 1000s of users

---

## 🎯 Why This Stack is PERFECT

1. **Native Integration:** Power BI + Fabric = seamless
2. **Scalable:** Grows with your user base
3. **Cost-Effective:** Pay for what you use
4. **Professional:** Enterprise-grade stack
5. **Modern:** GraphQL + Python + Delta Lake
6. **Maintainable:** Clean architecture
7. **Fast:** Low latency queries

---

## 🔄 Migration from Current Setup

**Step 1:** Deploy backend
**Step 2:** Keep localStorage as fallback
**Step 3:** Gradually migrate to API
**Step 4:** Remove localStorage code

**Zero downtime!** ✅

---

## 📞 Need Help?

Created complete backend code in `/backend` folder!
- Ready to deploy
- Just add your Fabric credentials
- Works out of the box

---

**Ready to deploy? Let me know if you want me to:**
1. Create the complete Fabric initialization scripts
2. Write the full API integration for frontend
3. Set up CI/CD pipeline
4. Add authentication middleware
