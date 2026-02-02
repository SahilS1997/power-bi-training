# 🚀 Next Steps - Complete Your Fabric Integration

## ✅ What's Already Done

- ✅ Data uploaded to **MS-Fabric-Learn/Learning_LH** workspace
- ✅ JavaScript client created (`scripts/fabricClient.js`)
- ✅ Files stored in OneLake:
  - `training_days.json` (3.7 KB) - All 12 days
  - `recordings.json` (2 bytes) - Ready for uploads
  - `users.json` (138 bytes) - Admin user
  - `config.json` (338 bytes) - Configuration
- ✅ Code pushed to GitHub

---

## 📋 Step 1: Add Script to HTML Files (5 minutes)

### **Update Admin_Portal.html**

Add this line in the `<head>` section (after other script tags):

```html
<!-- Add before closing </head> tag -->
<script src="https://alcdn.msauth.net/browser/2.38.1/js/msal-browser.min.js"></script>
<script src="scripts/fabricClient.js"></script>
```

### **Update PowerBI_Training_Portal.html**

Same addition:

```html
<!-- Add before closing </head> tag -->
<script src="scripts/fabricClient.js"></script>
```

---

## 📋 Step 2: Test Without Azure AD (10 minutes)

The client works in **read-only mode** without authentication!

### **Test Commands (Open Browser Console on your GitHub Pages site):**

```javascript
// Initialize client
const client = new FabricClient();

// Test 1: Load all training days
const days = await client.getAllTrainingDays();
console.log('Training Days:', days);

// Test 2: Get specific day
const day1 = await client.getTrainingDay(1);
console.log('Day 1:', day1);

// Test 3: Get dashboard stats
const stats = await client.getDashboardStats();
console.log('Stats:', stats);
```

**Expected Result:**
- Should load all 12 training days from Fabric
- If Fabric is not accessible (CORS), it uses fallback data

---

## 📋 Step 3: Configure Azure AD for Write Access (20 minutes)

Only needed if you want admin features (unlock days, upload recordings).

### **3.1 Register Azure AD Application**

```powershell
# Go to Azure Portal
https://portal.azure.com

# Navigate to:
Azure Active Directory → App registrations → New registration

# Fill in:
Name: PowerBI-Training-Portal
Supported account types: Single tenant
Redirect URI:
  - Type: Single-page application (SPA)
  - URI: https://sahils1997.github.io/power-bi-training/
  
# Also add for local testing:
  - URI: http://127.0.0.1:5500/PowerBI_Training_Portal.html

# Click "Register"
```

### **3.2 Copy IDs**

After registration, copy these values:

```
Application (client) ID: [COPY THIS]
Directory (tenant) ID: [COPY THIS]
```

### **3.3 Configure API Permissions**

```powershell
# In your app:
API permissions → Add a permission → My APIs

# Search for: "Storage" or configure custom scopes
# Or use Microsoft Graph:
- Microsoft Graph → Delegated permissions → User.Read
- Files.ReadWrite.All (if using OneDrive/SharePoint)

# Click "Grant admin consent"
```

### **3.4 Update fabricClient.js**

Edit line 4-6 in `scripts/fabricClient.js`:

```javascript
// Replace these lines:
tenantId: 'YOUR_TENANT_ID',        // Paste your tenant ID here
clientId: 'YOUR_CLIENT_ID',        // Paste your client ID here
```

---

## 📋 Step 4: Update Admin Portal to Use Fabric (30 minutes)

### **Replace localStorage with Fabric API**

In `Admin_Portal.html`, find the JavaScript section and replace:

**OLD CODE:**
```javascript
function getContentState() {
    const state = localStorage.getItem('powerbi_content_state');
    // ... rest of code
}
```

**NEW CODE:**
```javascript
// Initialize Fabric client
const fabricClient = new FabricClient();

async function getContentState() {
    try {
        const days = await fabricClient.getAllTrainingDays();
        return {
            unlockedDays: days.filter(d => d.isUnlocked).map(d => d.dayNumber),
            recordings: {}
        };
    } catch (error) {
        console.error('Failed to load state:', error);
        return { unlockedDays: [], recordings: {} };
    }
}
```

**Update unlock/lock functions:**
```javascript
async function unlockDay(dayNumber) {
    try {
        await fabricClient.unlockDay(dayNumber, 'admin@powerbi.training');
        await updateDashboard(); // Refresh
        alert(`Day ${dayNumber} unlocked successfully!`);
    } catch (error) {
        alert('Failed to unlock: ' + error.message);
    }
}

async function lockDay(dayNumber) {
    try {
        await fabricClient.lockDay(dayNumber);
        await updateDashboard(); // Refresh
        alert(`Day ${dayNumber} locked successfully!`);
    } catch (error) {
        alert('Failed to lock: ' + error.message);
    }
}
```

**Update recording upload:**
```javascript
async function handleRecordingUpload(event) {
    event.preventDefault();
    
    const dayNumber = parseInt(document.getElementById('recordingDay').value);
    const title = document.getElementById('recordingTitle').value;
    const url = document.getElementById('recordingUrl').value;
    const platform = document.getElementById('recordingPlatform').value;
    const duration = document.getElementById('recordingDuration').value;
    
    try {
        await fabricClient.uploadRecording({
            dayNumber,
            title,
            videoUrl: url,
            platform,
            duration,
            uploadedBy: 'admin@powerbi.training'
        });
        
        alert('Recording uploaded successfully!');
        closeRecordingModal();
        await updateDashboard();
    } catch (error) {
        alert('Upload failed: ' + error.message);
    }
}
```

---

## 📋 Step 5: Update Main Portal (20 minutes)

### **Update PowerBI_Training_Portal.html**

Find the content loading section and replace:

**OLD CODE:**
```javascript
function loadContentState() {
    const state = localStorage.getItem('powerbi_content_state');
    // ...
}
```

**NEW CODE:**
```javascript
const fabricClient = new FabricClient();

async function loadContentState() {
    try {
        const days = await fabricClient.getAllTrainingDays();
        
        // Apply locks to UI
        days.forEach(day => {
            const card = document.querySelector(`[data-day="${day.dayNumber}"]`);
            if (!card) return;
            
            if (!day.isUnlocked) {
                card.classList.add('locked');
                // Add overlay if needed
            } else {
                card.classList.remove('locked');
            }
            
            // Add recording badge if available
            if (day.recording) {
                addRecordingBadge(card, day.recording);
            }
        });
    } catch (error) {
        console.error('Failed to load content state:', error);
        // Fallback: show all content
    }
}

function addRecordingBadge(card, recording) {
    const badge = document.createElement('div');
    badge.className = 'recording-badge';
    badge.innerHTML = `
        <span>📹 Recording Available</span>
        <button onclick="playRecording('${recording.embedUrl}', '${recording.title}')">
            Watch Now
        </button>
    `;
    card.appendChild(badge);
}

function playRecording(embedUrl, title) {
    window.open(
        `Video_Player.html?url=${encodeURIComponent(embedUrl)}&title=${encodeURIComponent(title)}`,
        '_blank'
    );
}

// Load on page ready
document.addEventListener('DOMContentLoaded', loadContentState);
```

---

## 📋 Step 6: Test Everything (15 minutes)

### **6.1 Test Read Access**

Open your GitHub Pages site in browser:
```
https://sahils1997.github.io/power-bi-training/
```

Open browser console (F12) and run:
```javascript
const client = new FabricClient();
await client.getAllTrainingDays();
```

**Expected:** Should see all 12 days loaded from Fabric

### **6.2 Test Admin Portal**

Open Admin Portal:
```
https://sahils1997.github.io/power-bi-training/Admin_Portal.html
```

- Login with: `admin@powerbi.training` / `PowerBI2026Admin!`
- Check dashboard stats
- Try unlocking Day 1

### **6.3 Test Recording Upload**

In Admin Portal:
1. Click "Upload Recording"
2. Enter:
   - Day: 1
   - Title: "Day 1 Live Session"
   - URL: `https://youtube.com/watch?v=dQw4w9WgXcQ`
   - Platform: YOUTUBE
   - Duration: "2h 30min"
3. Submit

**Expected:** Recording saved to Fabric, visible in main portal

---

## 🛠️ Troubleshooting

### **Issue: CORS Error**

**Solution:** Make OneLake files publicly readable:
1. Go to Fabric workspace
2. Open Lakehouse → Files → TrainingData
3. Right-click → Properties → Set public read access

### **Issue: Authentication Failed**

**Solutions:**
- Check redirect URI matches exactly (including trailing slash)
- Verify API permissions granted
- Clear browser cache and try again

### **Issue: Can't Write to OneLake**

**Solutions:**
- Ensure Azure AD authentication is configured
- Check you have write permissions on the Lakehouse
- Use the correct workspace/lakehouse IDs

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────────┐
│          GitHub Pages (Frontend)                │
│  - PowerBI_Training_Portal.html                 │
│  - Admin_Portal.html                            │
│  - Video_Player.html                            │
│  - scripts/fabricClient.js                      │
└──────────────────┬──────────────────────────────┘
                   │
                   │ HTTPS REST API
                   │
┌──────────────────▼──────────────────────────────┐
│       Microsoft Fabric OneLake                  │
│                                                 │
│  Workspace: MS-Fabric-Learn                    │
│  Lakehouse: Learning_LH                        │
│                                                 │
│  Files/TrainingData/                           │
│    ├─ training_days.json   (12 days)          │
│    ├─ recordings.json      (videos)           │
│    ├─ users.json          (admin)             │
│    └─ config.json         (settings)          │
└─────────────────────────────────────────────────┘
```

---

## 💰 Cost Estimate

| Service | Usage | Cost |
|---------|-------|------|
| **GitHub Pages** | Unlimited | **FREE** |
| **Fabric Storage** | ~4 KB | **FREE** (within free tier) |
| **Fabric Compute** | Read-only queries | **~$0/month** |
| **Azure AD** | Basic auth | **FREE** |
| **TOTAL** | | **$0/month** ✅ |

---

## 🎯 Summary

**What You Need To Do:**

1. ✅ **5 min** - Add script tags to HTML files
2. ✅ **10 min** - Test read-only access
3. ⏸️ **20 min** - Configure Azure AD (optional, for write access)
4. ⏸️ **50 min** - Update HTML to use Fabric instead of localStorage
5. ✅ **15 min** - Test everything

**Total Time:** ~1.5 hours for full integration

**Or:** Skip Azure AD and use read-only mode for now! The portal will work with static data from Fabric.

---

## 🚀 Quick Start (Minimum Viable)

**Just want to see it work?**

1. Add script tags to HTML files
2. Push to GitHub
3. Open your site
4. Data loads from Fabric automatically!

No Azure AD needed for read-only viewing. 👍

---

Want me to make these code changes for you automatically?
