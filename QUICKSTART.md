# 🚀 Quick Start - Service Principal Authentication

## ✅ What's Been Set Up

You now have a **complete authentication system** with:
- ✅ Python admin CLI (`admin_fabric.py`)
- ✅ GitHub Actions auto-sync (every 5 minutes)
- ✅ Service Principal authentication support
- ✅ Data storage in GitHub repo (`/data` folder)
- ✅ Students read from GitHub Pages (no auth needed)

## 📋 Next Steps (In Order)

### 1️⃣ Create Service Principal (10 minutes)

```bash
# Login to Azure
az login

# Create App Registration
az ad app create --display-name "PowerBI-Training-FabricAccess"

# Save the output - you need:
# - Application (client) ID
# - Directory (tenant) ID
```

**Create client secret:**
```bash
az ad app credential reset --id YOUR_APP_ID --append

# Save the client secret value!
```

**Full guide:** [documentation/SERVICE_PRINCIPAL_SETUP.md](documentation/SERVICE_PRINCIPAL_SETUP.md)

---

### 2️⃣ Add to Fabric Workspace (2 minutes)

1. Go to https://app.fabric.microsoft.com
2. Open workspace: **MS-Fabric-Learn**
3. Click ⚙️ Settings → Access
4. Add: `PowerBI-Training-FabricAccess`
5. Role: **Contributor**

---

### 3️⃣ Configure GitHub Secrets (3 minutes)

Go to: https://github.com/SahilS1997/power-bi-training/settings/secrets/actions

Click **New repository secret** and add:

| Name | Value |
|------|-------|
| `AZURE_CLIENT_ID` | Your Application (client) ID |
| `AZURE_TENANT_ID` | Your Directory (tenant) ID |
| `AZURE_CLIENT_SECRET` | Your client secret value |

---

### 4️⃣ Configure Local Environment (1 minute)

```bash
# Copy example file
cp .env.example .env

# Edit .env with your values
notepad .env  # Windows
# OR
nano .env  # Linux/Mac
```

**Add your credentials:**
```env
AZURE_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

### 5️⃣ Install Python Dependencies (1 minute)

```bash
# Activate virtual environment (if using one)
.\.venv\Scripts\Activate.ps1  # Windows PowerShell
# OR
source .venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt
```

---

### 6️⃣ Test Authentication (1 minute)

```bash
python scripts/admin_fabric.py stats
```

**Expected output:**
```
🔐 Using Service Principal authentication
✅ Authentication successful
📊 Training Portal Statistics:
{
  "totalDays": 12,
  "unlockedDays": 0,
  "lockedDays": 12,
  "recordingsAvailable": 0
}
```

✅ **SUCCESS! If you see this, everything is working!**

---

## 🎮 Start Using It

### Unlock Day 1
```bash
python scripts/admin_fabric.py unlock 1
```

### Upload Recording
```bash
python scripts/admin_fabric.py upload 1 "Day 1 Recording" "https://youtu.be/VIDEO_ID" "2h 30min"
```

### View Status
```bash
python scripts/admin_fabric.py list
```

### Sync to GitHub (Manual)
```bash
python scripts/admin_fabric.py export
git add data/
git commit -m "Update training data"
git push
```

**Auto-sync runs every 5 minutes via GitHub Actions!**

---

## 🎓 Student Access

Students visit: https://sahils1997.github.io/power-bi-training/

- Locked days show 🔒
- Unlocked days show content
- Recordings appear automatically
- **No login required** for students

---

## 📚 Full Documentation

- **Admin Guide**: [ADMIN_GUIDE.md](ADMIN_GUIDE.md)
- **Service Principal Setup**: [documentation/SERVICE_PRINCIPAL_SETUP.md](documentation/SERVICE_PRINCIPAL_SETUP.md)
- **CLI Commands**: `python scripts/admin_fabric.py` (shows all commands)

---

## 🆘 Troubleshooting

### Authentication Errors
```bash
# Verify environment variables
cat .env  # Linux/Mac
type .env  # Windows

# Test Azure login
az login
az account show
```

### GitHub Actions Failing
1. Check secrets at: https://github.com/SahilS1997/power-bi-training/settings/secrets/actions
2. View logs at: https://github.com/SahilS1997/power-bi-training/actions
3. Ensure SP has Fabric workspace access

### Students Can't See Content
```bash
# Check data files
cat data/training_days.json

# Verify GitHub Pages
# https://sahils1997.github.io/power-bi-training/data/training_days.json

# Push changes
git push
```

---

## ✨ You're All Set!

Your system is ready. Complete the Service Principal setup, and you can start managing content with simple Python commands!

**Time estimate:** 15-20 minutes total for first-time setup.
