# Service Principal Setup for Fabric + GitHub Integration

## Overview
This guide sets up Azure AD Service Principal authentication for automated Fabric access from GitHub Actions and local Python scripts.

## Prerequisites
- Azure subscription with Fabric workspace access
- Admin access to Azure AD
- GitHub repository admin access

---

## Step 1: Create Azure AD App Registration

### 1.1 Create the App
```bash
# Login to Azure
az login

# Create App Registration
az ad app create --display-name "PowerBI-Training-FabricAccess"
```

**Or via Azure Portal:**
1. Go to https://portal.azure.com
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Name: `PowerBI-Training-FabricAccess`
5. Supported account types: **Accounts in this organizational directory only**
6. Redirect URI: Leave blank
7. Click **Register**

### 1.2 Note Your IDs
After creation, copy these values:
- **Application (client) ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **Directory (tenant) ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

---

## Step 2: Create Client Secret

### Via Portal:
1. In your app registration, go to **Certificates & secrets**
2. Click **New client secret**
3. Description: `FabricAccess-2026`
4. Expires: **24 months**
5. Click **Add**
6. **IMPORTANT:** Copy the **Value** immediately (won't be shown again!)

### Via CLI:
```bash
az ad app credential reset --id <YOUR_APP_ID> --append
```

**Save these securely:**
```
CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## Step 3: Grant API Permissions

### 3.1 Add Power BI API Permissions
1. In app registration, go to **API permissions**
2. Click **Add a permission**
3. Select **Power BI Service**
4. Select **Delegated permissions**:
   - ✅ `Workspace.ReadWrite.All`
   - ✅ `Dataset.ReadWrite.All`
   - ✅ `Item.ReadWrite.All`
5. Click **Add permissions**
6. Click **Grant admin consent** (requires admin)

### 3.2 Via CLI:
```bash
# Get Power BI Service principal ID
az ad sp list --display-name "Power BI Service" --query [0].appId -o tsv

# Add permissions (use the app ID from above)
az ad app permission add --id <YOUR_APP_ID> \
  --api 00000009-0000-0000-c000-000000000000 \
  --api-permissions 7504609f-c495-4c2d-a6d3-b78c61ea1518=Scope

# Grant admin consent
az ad app permission admin-consent --id <YOUR_APP_ID>
```

---

## Step 4: Grant Fabric Workspace Access

### 4.1 Add Service Principal to Workspace
1. Go to **Fabric Portal**: https://app.fabric.microsoft.com
2. Navigate to your workspace: **MS-Fabric-Learn**
3. Click workspace **Settings** (⚙️)
4. Go to **Access** tab
5. Click **Add people or groups**
6. Search for: `PowerBI-Training-FabricAccess`
7. Select role: **Admin** or **Contributor**
8. Click **Add**

### 4.2 Grant Lakehouse Permissions
1. Open your lakehouse: **Learning_LH**
2. Click **...** (More options) → **Manage permissions**
3. Add service principal with **Read and Write** access

---

## Step 5: Configure GitHub Secrets

### 5.1 Add Secrets to GitHub Repo
1. Go to your repo: https://github.com/SahilS1997/power-bi-training
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these three secrets:

| Secret Name | Value |
|------------|-------|
| `AZURE_CLIENT_ID` | Your Application (client) ID |
| `AZURE_TENANT_ID` | Your Directory (tenant) ID |
| `AZURE_CLIENT_SECRET` | Your client secret value |

---

## Step 6: Test Authentication

### 6.1 Test Locally with Python
```python
from azure.identity import ClientSecretCredential
import os

# Set environment variables
os.environ['AZURE_CLIENT_ID'] = 'your-client-id'
os.environ['AZURE_TENANT_ID'] = 'your-tenant-id'
os.environ['AZURE_CLIENT_SECRET'] = 'your-client-secret'

# Create credential
credential = ClientSecretCredential(
    tenant_id=os.environ['AZURE_TENANT_ID'],
    client_id=os.environ['AZURE_CLIENT_ID'],
    client_secret=os.environ['AZURE_CLIENT_SECRET']
)

# Get token
token = credential.get_token("https://analysis.windows.net/powerbi/api/.default")
print(f"✅ Authentication successful! Token expires: {token.expires_on}")
```

### 6.2 Test Fabric API Access
```python
import requests

# Get token (from above)
access_token = token.token

# Test API call
url = "https://api.fabric.microsoft.com/v1/workspaces/aa2e4642-108a-4ce5-a99f-9ad4c87856bc"
headers = {"Authorization": f"Bearer {access_token}"}

response = requests.get(url, headers=headers)
if response.status_code == 200:
    print("✅ Fabric API access successful!")
    print(response.json())
else:
    print(f"❌ Failed: {response.status_code} - {response.text}")
```

---

## Step 7: Environment Variables for Local Development

Create `.env` file (add to .gitignore!):
```bash
# Azure Service Principal
AZURE_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_TENANT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
AZURE_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Fabric Configuration
FABRIC_WORKSPACE_ID=aa2e4642-108a-4ce5-a99f-9ad4c87856bc
FABRIC_LAKEHOUSE_ID=9a01978a-106f-42bd-b114-913e4f7c29c2
```

---

## Troubleshooting

### "Insufficient privileges" error
- Ensure admin consent was granted for API permissions
- Verify service principal has workspace access

### "Unauthorized" (401)
- Check client secret hasn't expired
- Verify CLIENT_ID, TENANT_ID, CLIENT_SECRET are correct
- Ensure scope is correct: `https://analysis.windows.net/powerbi/api/.default`

### "Forbidden" (403)
- Service principal needs Contributor/Admin role in workspace
- Check lakehouse permissions

---

## Security Best Practices

✅ **DO:**
- Store secrets in GitHub Secrets / Azure Key Vault
- Use environment variables for local development
- Rotate client secrets every 6-12 months
- Use separate service principals for dev/prod
- Add `.env` to `.gitignore`

❌ **DON'T:**
- Commit secrets to Git
- Share client secrets via email/chat
- Use same credentials across multiple apps
- Give more permissions than needed

---

## Next Steps

Once setup is complete:
1. ✅ Test authentication with Python script
2. ✅ Run admin operations (unlock days, upload recordings)
3. ✅ Verify GitHub Actions can sync data
4. ✅ Check students can access content via GitHub Pages

---

## Resources

- [Azure AD App Registration Docs](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)
- [Power BI REST API Docs](https://learn.microsoft.com/en-us/rest/api/power-bi/)
- [Microsoft Fabric APIs](https://learn.microsoft.com/en-us/fabric/data-engineering/lakehouse-api)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
