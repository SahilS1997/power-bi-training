# Power BI Training Portal - Backend Architecture

## 🏗️ Architecture Overview

### Technology Stack

**Backend Framework:** FastAPI (Python)
- High performance async framework
- Auto-generated API docs
- Built-in validation
- WebSocket support for real-time updates

**API Layer:** GraphQL (Strawberry)
- Efficient data fetching
- Type-safe schema
- Single endpoint
- Flexible queries

**Database:** Microsoft Fabric - Lakehouse
- Optimal for this use case
- Delta Lake format
- ACID transactions
- Scalable storage
- Integrated with Power BI ecosystem

**Authentication:** JWT + Azure AD
- Secure token-based auth
- Integration with Microsoft identity
- Role-based access control

---

## 📊 Why Microsoft Fabric?

### **Fabric Lakehouse is PERFECT for this use case:**

✅ **Benefits:**
1. **Native Power BI Integration** - Since it's a Power BI training portal
2. **Cost-Effective** - Pay for what you use
3. **Delta Lake Format** - ACID transactions on data lake
4. **Built-in Versioning** - Track content changes
5. **Direct SQL Access** - Query with standard SQL
6. **Unified Platform** - Storage + Compute + Analytics
7. **Scalability** - Grows with your user base

### **Fabric Workload Choice:**

**Primary: Lakehouse** ✅
```
Why Lakehouse?
- Structured data (users, content, recordings)
- Not too much data volume
- Need ACID transactions
- Simple schema
- Fast queries
- Easy Python SDK integration
```

**Alternative: Data Warehouse**
- If you need more complex queries
- Better for high-concurrency reads
- More enterprise features

**NOT Recommended:**
- ❌ Eventhouse - For real-time streaming data
- ❌ Notebook - For analytics, not app backend
- ❌ Data Factory - For ETL pipelines

---

## 🎯 GraphQL vs REST

### **Use GraphQL? YES! ✅**

**Perfect for this application because:**

1. **Flexible Client Queries**
   ```graphql
   # Client gets exactly what they need
   query GetDay($dayNumber: Int!) {
     trainingDay(day: $dayNumber) {
       title
       isUnlocked
       recording {
         url
         title
       }
     }
   }
   ```

2. **Reduced API Calls**
   - Get unlocked days + recordings in one query
   - No over-fetching
   - No under-fetching

3. **Type Safety**
   - Auto-generated TypeScript types
   - Compile-time validation
   - Better developer experience

4. **Real-time Updates**
   - GraphQL Subscriptions
   - WebSocket support
   - Instant UI updates when admin unlocks content

**When REST is Better:**
- File uploads (use REST endpoint)
- Caching is critical (REST easier)
- Simple CRUD only

**Recommendation:** Use **GraphQL + REST hybrid**
- GraphQL for data queries/mutations
- REST for video uploads and downloads

---

## 🗄️ Database Schema (Fabric Lakehouse)

### Tables Structure

```sql
-- users table
CREATE TABLE users (
    user_id STRING,
    email STRING,
    password_hash STRING,
    role STRING,  -- 'admin', 'student'
    created_at TIMESTAMP,
    last_login TIMESTAMP
) USING DELTA;

-- training_content table
CREATE TABLE training_content (
    day_number INT,
    title STRING,
    description STRING,
    is_unlocked BOOLEAN,
    unlocked_at TIMESTAMP,
    unlocked_by STRING,  -- admin user_id
    presentation_url STRING,
    resources_url STRING,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
) USING DELTA;

-- recordings table
CREATE TABLE recordings (
    recording_id STRING,
    day_number INT,
    title STRING,
    video_url STRING,
    platform STRING,  -- 'youtube', 'vimeo', etc.
    duration STRING,
    uploaded_at TIMESTAMP,
    uploaded_by STRING,  -- admin user_id
    view_count INT,
    is_active BOOLEAN
) USING DELTA;

-- user_progress table
CREATE TABLE user_progress (
    progress_id STRING,
    user_id STRING,
    day_number INT,
    viewed_presentation BOOLEAN,
    viewed_recording BOOLEAN,
    completion_percentage FLOAT,
    last_accessed TIMESTAMP
) USING DELTA;

-- admin_actions table (audit log)
CREATE TABLE admin_actions (
    action_id STRING,
    admin_id STRING,
    action_type STRING,  -- 'unlock_day', 'upload_recording', etc.
    day_number INT,
    metadata JSON,
    timestamp TIMESTAMP
) USING DELTA;
```

---

## 🔌 GraphQL Schema

```python
# backend/graphql/schema.py

import strawberry
from typing import Optional, List
from datetime import datetime

@strawberry.type
class Recording:
    recording_id: str
    title: str
    video_url: str
    platform: str
    duration: str
    uploaded_at: datetime
    view_count: int

@strawberry.type
class TrainingDay:
    day_number: int
    title: str
    description: str
    is_unlocked: bool
    unlocked_at: Optional[datetime]
    presentation_url: str
    recording: Optional[Recording]
    
@strawberry.type
class User:
    user_id: str
    email: str
    role: str
    last_login: Optional[datetime]

@strawberry.type
class UserProgress:
    day_number: int
    viewed_presentation: bool
    viewed_recording: bool
    completion_percentage: float
    last_accessed: datetime

# Queries
@strawberry.type
class Query:
    @strawberry.field
    async def training_days(self) -> List[TrainingDay]:
        """Get all training days"""
        pass
    
    @strawberry.field
    async def training_day(self, day_number: int) -> Optional[TrainingDay]:
        """Get specific day"""
        pass
    
    @strawberry.field
    async def user_progress(self, user_id: str) -> List[UserProgress]:
        """Get user's progress"""
        pass
    
    @strawberry.field
    async def unlocked_days(self) -> List[TrainingDay]:
        """Get only unlocked days"""
        pass

# Mutations
@strawberry.type
class Mutation:
    @strawberry.mutation
    async def unlock_day(self, day_number: int, admin_token: str) -> TrainingDay:
        """Admin: Unlock a training day"""
        pass
    
    @strawberry.mutation
    async def lock_day(self, day_number: int, admin_token: str) -> TrainingDay:
        """Admin: Lock a training day"""
        pass
    
    @strawberry.mutation
    async def upload_recording(
        self, 
        day_number: int,
        title: str,
        video_url: str,
        duration: str,
        admin_token: str
    ) -> Recording:
        """Admin: Upload recording"""
        pass
    
    @strawberry.mutation
    async def mark_content_viewed(
        self,
        user_id: str,
        day_number: int,
        content_type: str  # 'presentation' or 'recording'
    ) -> UserProgress:
        """Track user progress"""
        pass

# Subscriptions (Real-time updates)
@strawberry.type
class Subscription:
    @strawberry.subscription
    async def day_unlocked(self) -> TrainingDay:
        """Real-time notification when day is unlocked"""
        pass
    
    @strawberry.subscription
    async def recording_added(self) -> Recording:
        """Real-time notification when recording is added"""
        pass

schema = strawberry.Schema(query=Query, mutation=Mutation, subscription=Subscription)
```

---

## 🚀 API Endpoints Structure

### GraphQL Endpoint
```
POST /graphql
- All queries and mutations
- Single endpoint
- Type-safe operations
```

### REST Endpoints (File operations)
```
POST /api/v1/auth/login
POST /api/v1/auth/register
GET  /api/v1/auth/me

POST /api/v1/videos/upload
GET  /api/v1/videos/{video_id}
DELETE /api/v1/videos/{video_id}

GET  /api/v1/health
GET  /api/v1/docs (Auto-generated)
```

---

## 🔐 Authentication Flow

```python
# JWT Token-based authentication

1. User Login:
   POST /api/v1/auth/login
   { email, password }
   → Returns JWT token

2. Admin Operations:
   POST /graphql
   Headers: { Authorization: "Bearer <token>" }
   Query: unlockDay(dayNumber: 1)

3. Student Access:
   POST /graphql
   Headers: { Authorization: "Bearer <token>" }
   Query: trainingDays
   → Only returns unlocked content
```

---

## 📁 Project Structure

```
backend/
├── main.py                      # FastAPI app entry
├── requirements.txt             # Dependencies
├── .env                         # Environment variables
├── config.py                    # Configuration
│
├── api/
│   ├── __init__.py
│   ├── routes/
│   │   ├── auth.py             # Authentication endpoints
│   │   ├── videos.py           # Video upload/download
│   │   └── health.py           # Health check
│   │
│   └── middleware/
│       ├── cors.py             # CORS configuration
│       └── auth.py             # JWT validation
│
├── graphql/
│   ├── __init__.py
│   ├── schema.py               # GraphQL schema
│   ├── types.py                # GraphQL types
│   ├── queries.py              # Query resolvers
│   ├── mutations.py            # Mutation resolvers
│   └── subscriptions.py        # Subscription resolvers
│
├── services/
│   ├── __init__.py
│   ├── auth_service.py         # Authentication logic
│   ├── content_service.py      # Content management
│   ├── recording_service.py    # Recording operations
│   └── user_service.py         # User management
│
├── database/
│   ├── __init__.py
│   ├── fabric_client.py        # Fabric Lakehouse connection
│   ├── models.py               # Pydantic models
│   └── queries.py              # SQL queries
│
├── utils/
│   ├── __init__.py
│   ├── security.py             # Password hashing, JWT
│   ├── validators.py           # Input validation
│   └── logger.py               # Logging setup
│
└── tests/
    ├── test_api.py
    ├── test_graphql.py
    └── test_auth.py
```

---

## 🔧 Environment Variables

```bash
# .env file

# Application
APP_NAME="Power BI Training Portal API"
APP_VERSION="1.0.0"
DEBUG=false

# Security
SECRET_KEY="your-secret-key-here"
JWT_ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Microsoft Fabric
FABRIC_WORKSPACE_ID="your-workspace-id"
FABRIC_LAKEHOUSE_ID="your-lakehouse-id"
FABRIC_TENANT_ID="your-tenant-id"
FABRIC_CLIENT_ID="your-client-id"
FABRIC_CLIENT_SECRET="your-client-secret"

# CORS
ALLOWED_ORIGINS=["https://sahils1997.github.io", "http://localhost:3000"]

# Admin Credentials
DEFAULT_ADMIN_EMAIL="admin@powerbi.training"
DEFAULT_ADMIN_PASSWORD="PowerBI2026Admin!"
```

---

## 🎬 Video Streaming Solution

### Option 1: Embed Players (Recommended)
```html
<!-- YouTube Embed -->
<iframe 
  width="100%" 
  height="500" 
  src="https://www.youtube.com/embed/VIDEO_ID"
  frameborder="0"
  allow="accelerometer; autoplay; encrypted-media"
  allowfullscreen>
</iframe>

<!-- Vimeo Embed -->
<iframe
  src="https://player.vimeo.com/video/VIDEO_ID"
  width="100%"
  height="500"
  frameborder="0"
  allow="autoplay; fullscreen"
  allowfullscreen>
</iframe>
```

### Option 2: Azure Media Services (Advanced)
```python
# For enterprise scenarios
from azure.media.services import MediaServicesClient

# Upload to Azure Media Services
# Get streaming URL
# Serve with DRM protection
```

---

## 📊 Deployment Architecture

```
┌─────────────────┐
│  GitHub Pages   │ ← Frontend (HTML/CSS/JS)
│   (Static UI)   │
└────────┬────────┘
         │ HTTPS
         ↓
┌─────────────────┐
│  Azure App      │ ← Python FastAPI Backend
│   Service       │    GraphQL API
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Microsoft       │ ← Database
│   Fabric        │    Lakehouse
│  (Lakehouse)    │    Delta Tables
└─────────────────┘
```

---

## 💰 Cost Estimate (Microsoft Fabric)

**Lakehouse Workload:**
```
Compute: ~$0.18/hour (F2 SKU)
Storage: ~$0.02/GB/month
```

**For this application:**
- Storage: < 1GB (metadata only)
- Compute: ~2-4 hours/day active
- **Monthly Cost: ~$15-30**

**Free Trial:**
- 60-day free trial available
- Perfect for testing!

---

## 🚀 Next Steps

1. **Set up Microsoft Fabric**
   - Create workspace
   - Create Lakehouse
   - Initialize tables

2. **Build Python Backend**
   - FastAPI setup
   - GraphQL schema
   - Fabric integration

3. **Deploy to Azure**
   - Azure App Service
   - Environment variables
   - CORS configuration

4. **Update Frontend**
   - Replace localStorage
   - Connect to GraphQL API
   - Add real-time subscriptions

---

Ready to implement? I can create the full Python backend code!
