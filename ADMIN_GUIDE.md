# Power BI Training Portal - Admin Guide

## 🎯 System Architecture

```
┌─────────────────────┐
│   Admin (You)       │
│   Python CLI        │
└──────────┬──────────┘
           │
           ↓ (writes)
┌─────────────────────┐
│ Microsoft Fabric    │
│ Learning_LH         │
│ (Source of Truth)   │
└──────────┬──────────┘
           │
           ↓ (GitHub Actions - auto sync every 5min)
┌─────────────────────┐
│ GitHub Repo         │
│ /data/*.json        │
└──────────┬──────────┘
           │
           ↓ (reads - no auth)
┌─────────────────────┐
│ Students' Browsers  │
│ GitHub Pages        │
└─────────────────────┘
```

## 📋 Prerequisites

1. **Azure Access**:
   - Azure subscription with Fabric workspace
   - Permissions to create App Registrations

2. **Local Setup**:
   ```bash
   # Install Python dependencies
   pip install -r requirements.txt
   
   # Install Azure CLI (for manual auth)
   # Windows: https://aka.ms/installazurecliwindows
   # Mac: brew install azure-cli
   ```

3. **GitHub Access**:
   - Admin access to repository
   - Ability to add secrets

---

## 🚀 Quick Start (First Time Setup)

### Step 1: Create Service Principal

Follow the detailed guide: [SERVICE_PRINCIPAL_SETUP.md](documentation/SERVICE_PRINCIPAL_SETUP.md)

**Quick version:**
```bash
# Login to Azure
az login

# Create app registration
az ad app create --display-name "PowerBI-Training-FabricAccess"

# Create client secret
az ad app credential reset --id YOUR_APP_ID --append

# Note down: CLIENT_ID, TENANT_ID, CLIENT_SECRET
```

### Step 2: Configure Fabric Access

1. Add Service Principal to workspace **MS-Fabric-Learn** (Contributor role)
2. Grant permissions to lakehouse **Learning_LH**

### Step 3: Configure GitHub Secrets

Go to: https://github.com/SahilS1997/power-bi-training/settings/secrets/actions

Add three secrets:
- `AZURE_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_CLIENT_SECRET`

### Step 4: Configure Local Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your values
AZURE_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 5: Test Connection

```bash
python scripts/admin_fabric.py stats
```

You should see:
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

---

## 🎮 Daily Usage

### Unlock a Day

```bash
# Unlock Day 1
python scripts/admin_fabric.py unlock 1

# Output:
# ✅ Day 1 unlocked successfully
```

### Unlock All Days

```bash
python scripts/admin_fabric.py unlock-all
```

### Upload a Recording

```bash
python scripts/admin_fabric.py upload 1 "Day 1 - Introduction" "https://youtu.be/VIDEO_ID" "2h 30min"
```

### Remove a Recording

```bash
python scripts/admin_fabric.py remove 1
```

### Lock a Day (Undo unlock)

```bash
python scripts/admin_fabric.py lock 1
```

### View Current Status

```bash
# List all days
python scripts/admin_fabric.py list

# Show statistics
python scripts/admin_fabric.py stats
```

### Manual Sync to GitHub

```bash
# Export data to data/ folder
python scripts/admin_fabric.py export

# Commit and push
git add data/
git commit -m "Update training data"
git push
```

---

## 🔄 Automatic Sync

GitHub Actions automatically syncs Fabric → GitHub every **5 minutes**.

**View sync status:**
- Go to: https://github.com/SahilS1997/power-bi-training/actions
- Click on "Sync Fabric to GitHub" workflow
- See latest runs and logs

**Manual trigger:**
- Go to Actions → "Sync Fabric to GitHub"
- Click "Run workflow" → "Run workflow"

---

## 🎓 Student Experience

1. Student visits: https://sahils1997.github.io/power-bi-training/
2. Browser fetches `data/training_days.json` and `data/recordings.json`
3. Locked days show 🔒 overlay
4. Unlocked days show content and recordings
5. **No authentication required** (public GitHub Pages)

---

## 🐛 Troubleshooting

### "Authentication failed"
```bash
# Check environment variables
echo $AZURE_CLIENT_ID
echo $AZURE_TENANT_ID

# Verify Azure CLI login
az login
az account show

# Test Service Principal
az login --service-principal -u $AZURE_CLIENT_ID -p $AZURE_CLIENT_SECRET --tenant $AZURE_TENANT_ID
```

### "Failed to save: 401 Unauthorized"
- Service Principal needs Contributor role in workspace
- Check API permissions in Azure AD app

### "Failed to save: 403 Forbidden"
- Verify lakehouse permissions
- Ensure SP has Read and Write access

### GitHub Actions failing
1. Check secrets are set correctly
2. View workflow logs in Actions tab
3. Verify SP has not expired

### Students can't see unlocked content
1. Check data files committed to GitHub:
   ```bash
   git pull
   cat data/training_days.json
   ```
2. Verify GitHub Pages is enabled
3. Clear browser cache (Ctrl+Shift+R)
4. Check browser console for errors

---

## 📁 File Structure

```
/
├── data/                          # Public data (synced from Fabric)
│   ├── training_days.json        # Day status
│   ├── recordings.json           # Video recordings
│   └── stats.json                # Statistics
│
├── scripts/
│   ├── admin_fabric.py           # Admin CLI tool ⭐
│   └── fabricClient.js           # (Legacy - not used)
│
├── documentation/
│   └── SERVICE_PRINCIPAL_SETUP.md # Detailed auth setup
│
├── .github/workflows/
│   └── sync-fabric.yml           # Auto-sync workflow
│
├── .env                          # Local secrets (git-ignored)
├── .env.example                  # Template
└── requirements.txt              # Python dependencies
```

---

## 🔐 Security Best Practices

✅ **DO:**
- Store secrets in `.env` locally (git-ignored)
- Use GitHub Secrets for Actions
- Rotate client secrets every 6 months
- Use minimum required permissions

❌ **DON'T:**
- Commit `.env` to Git
- Share secrets via email/chat
- Use same SP across environments
- Give Admin role if Contributor suffices

---

## 📊 Monitoring

### View Sync History
```bash
git log --oneline --grep="Auto-sync" -10
```

### Check Last Update
```bash
cat data/stats.json | grep lastUpdated
```

### View Fabric Data Directly
1. Go to: https://app.fabric.microsoft.com
2. Open workspace: MS-Fabric-Learn
3. Open lakehouse: Learning_LH
4. Browse: Files → TrainingData

---

## 🆘 Support Commands

```bash
# Test authentication
python scripts/admin_fabric.py stats

# Export data for debugging
python scripts/admin_fabric.py export
cat data/training_days.json

# Check Git status
git status
git log --oneline -5

# View GitHub Actions logs
# Go to: https://github.com/SahilS1997/power-bi-training/actions
```

---

## 📝 Workflow Examples

### Scenario 1: Start of Training Day
```bash
# Morning: Unlock today's content
python scripts/admin_fabric.py unlock 1

# Wait 5 minutes for auto-sync
# OR manually sync:
python scripts/admin_fabric.py export
git add data/
git commit -m "Unlock Day 1"
git push

# Students can now access Day 1
```

### Scenario 2: After Recording Session
```bash
# Upload session recording
python scripts/admin_fabric.py upload 1 \
  "Day 1 - Power BI Introduction" \
  "https://youtu.be/YOUR_VIDEO_ID" \
  "2h 15min"

# Auto-sync will push to GitHub in 5 minutes
# Students will see "📹 Recording Available"
```

### Scenario 3: Fix Mistake
```bash
# Lock the day again
python scripts/admin_fabric.py lock 5

# Or remove recording
python scripts/admin_fabric.py remove 5

# Changes sync automatically
```

---

## 🎉 Success Checklist

- [ ] Service Principal created
- [ ] Fabric workspace access granted
- [ ] GitHub secrets configured
- [ ] Local `.env` file created
- [ ] `python scripts/admin_fabric.py stats` works
- [ ] GitHub Actions workflow runs successfully
- [ ] Students can see content on GitHub Pages
- [ ] Unlock/lock commands work
- [ ] Recording upload works
- [ ] Auto-sync runs every 5 minutes

---

## 📚 Additional Resources

- [Azure AD App Registration](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [Microsoft Fabric APIs](https://learn.microsoft.com/en-us/fabric/data-engineering/lakehouse-api)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Python Click CLI Framework](https://click.palletsprojects.com/)

---

## 💡 Tips & Tricks

1. **Bulk Operations**: Create a script for multiple commands
   ```bash
   for day in {1..12}; do
     python scripts/admin_fabric.py unlock $day
   done
   ```

2. **Scheduled Unlocks**: Use cron or Task Scheduler
   ```bash
   # Every day at 9 AM
   0 9 * * * cd /path/to/repo && python scripts/admin_fabric.py unlock $(date +%d)
   ```

3. **Backup Data**: Export before major changes
   ```bash
   python scripts/admin_fabric.py export
   cp -r data/ backup-$(date +%Y%m%d)/
   ```

---

**Need help?** Check [troubleshooting section](#-troubleshooting) or create an issue on GitHub.
