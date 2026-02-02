# Data Folder

This folder contains training portal data synced from Microsoft Fabric.

## Files

- **training_days.json** - All 12 training days with lock/unlock status
- **recordings.json** - Session recordings with video URLs
- **stats.json** - Dashboard statistics

## Auto-Sync

Data is automatically synced from Fabric every 5 minutes via GitHub Actions.

## For Students

Your browser reads these JSON files directly from GitHub (no authentication needed).

## For Admins

Use `python scripts/admin_fabric.py` to manage content, then GitHub Actions syncs automatically.
