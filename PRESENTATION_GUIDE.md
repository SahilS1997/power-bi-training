# 🎓 Power BI Training - Local Presentation Setup

## Quick Start for Tomorrow's Presentation

### 1. Start the Server
```powershell
python start_presentation.py
```
This will:
- ✅ Start local web server on http://localhost:8000
- ✅ Automatically open Student Portal in browser
- ✅ Serve all files locally (no GitHub needed)

### 2. Access Portals
- **Student Portal**: http://localhost:8000/PowerBI_Training_Portal.html
- **Admin Portal**: http://localhost:8000/Admin_Portal.html

### 3. Manage Content During Presentation

#### Unlock a Day
```powershell
python scripts/admin_fabric.py unlock 2
```

#### Lock a Day
```powershell
python scripts/admin_fabric.py lock 2
```

#### Upload Recording
```powershell
python scripts/admin_fabric.py upload 1 "Day 1 Recording" "https://youtu.be/xxx" "2h 30min"
```

#### View Current Status
```powershell
python scripts/admin_fabric.py list
```

#### Export Latest from Fabric
```powershell
python scripts/admin_fabric.py export
```

### 4. After Making Changes
1. Run the Python CLI command
2. Refresh the browser (F5)
3. Changes appear immediately!

### Architecture (Local + Fabric)
```
┌─────────────────┐
│  Python CLI     │ ← You manage content
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Fabric Backend │ ← Source of truth
└────────┬────────┘
         │
         ↓ (export command)
┌─────────────────┐
│  /data/ folder  │ ← Local JSON files
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Local Browser  │ ← Students/Audience see
└─────────────────┘
```

## Presentation Flow Example

1. **Start**: `python start_presentation.py`
2. **Show**: Student portal with Day 1 unlocked
3. **Demo**: `python scripts/admin_fabric.py unlock 2`
4. **Refresh**: Browser → Day 2 now unlocked
5. **Show**: Admin portal (login: admin@powerbi.training / PowerBI2026Admin!)

## Benefits for Presentation
- ✅ **No internet required** (except initial Fabric sync)
- ✅ **Fast** - Everything loads instantly from local files
- ✅ **Reliable** - No GitHub Pages deployment delays
- ✅ **Live demos** - Make changes and show results immediately
- ✅ **Fabric backend** - Still using Microsoft Fabric as source of truth

## Troubleshooting

### Port 8000 already in use?
Edit `start_presentation.py` and change `PORT = 8000` to another port like `8080`

### Can't access Fabric?
Run offline mode - data already in `/data/` folder from last sync

### Browser cache issues?
Hard refresh with `Ctrl + F5`

## Stop Presentation
Press `Ctrl + C` in the terminal running the server

---

**Ready for tomorrow! 🚀**
