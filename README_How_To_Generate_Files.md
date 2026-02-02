# How to Generate PowerPoint and Power BI Files

## Quick Start Guide

---

## 1. Generate PowerPoint File (.pptx)

### Step 1: Install Required Library

Open PowerShell and run:

```powershell
pip install python-pptx
```

### Step 2: Run the Generator Script

```powershell
cd "d:\Power Bi Training - 2026"
python generate_powerpoint_day01.py
```

### Result:
- **File created:** `PowerBI_Day01_Data_Modeling_Foundations.pptx`
- **Total slides:** 29 professional slides
- **Ready to use:** Open in PowerPoint, customize as needed

---

## 2. Create Power BI File (.pbix)

### Method: Manual Setup (15-20 minutes)

**Why manual?** Power BI .pbix files are binary and require Power BI Desktop to create properly.

**Steps:**

1. **Open Power BI Desktop**

2. **Import CSV Files:**
   - Click "Get Data" → "Text/CSV"
   - Import all 4 files:
     - Sample_Data_Sales.csv
     - Sample_Data_Customers.csv
     - Sample_Data_Products.csv
     - Sample_Data_Calendar.csv

3. **Create Relationships:**
   - Switch to Model View
   - Drag CustomerID from Sales to Customers
   - Drag ProductID from Sales to Products
   - Drag OrderDate from Sales to Calendar Date

4. **Mark Date Table:**
   - Select Calendar table
   - Table Tools → Mark as Date Table
   - Select "Date" column

5. **Save:**
   - File → Save As → `PowerBI_Practice_Day01.pbix`

**Detailed instructions:** See `PowerBI_Practice_File_Setup_Instructions.md`

---

## Troubleshooting

### PowerPoint Generator Issues

**Error: "python-pptx not found"**
```powershell
pip install python-pptx
```

**Error: "python not recognized"**
- Install Python from python.org
- Or use: `py -m pip install python-pptx`

### Power BI Issues

**Can't find Power BI Desktop?**
- Download from: https://powerbi.microsoft.com/desktop/

**Relationships not working?**
- Verify data types match
- Check for duplicate values in dimension tables
- See troubleshooting section in setup guide

---

## File Structure After Generation

```
Power Bi Training - 2026/
├── PowerBI_Day01_Data_Modeling_Foundations.pptx    ← Generated PPT
├── PowerBI_Practice_Day01.pbix                      ← You create this
├── Day_01_Data_Modeling_Foundations.md              ← Learning content
├── Day_01_PowerPoint_Slides_Content.md              ← Slide script
├── PowerBI_Practice_File_Setup_Instructions.md      ← Setup guide
├── Sample_Data_Sales.csv
├── Sample_Data_Customers.csv
├── Sample_Data_Products.csv
├── Sample_Data_Calendar.csv
├── generate_powerpoint_day01.py                     ← Generator script
└── README_How_To_Generate_Files.md                  ← This file
```

---

## Next Steps

1. **Review the PowerPoint** - Customize branding, colors, images
2. **Build the Power BI file** - Follow setup instructions
3. **Practice exercises** - Complete the 5 hands-on exercises in Day 1 material
4. **Prepare for Day 2** - Advanced data modeling concepts

---

## Need Help?

- **PowerPoint issues:** Check generate_powerpoint_day01.py comments
- **Power BI issues:** See PowerBI_Practice_File_Setup_Instructions.md
- **Content questions:** Review Day_01_Data_Modeling_Foundations.md

---

## Quick Commands Reference

```powershell
# Install Python library
pip install python-pptx

# Generate PowerPoint
python generate_powerpoint_day01.py

# Check Python version
python --version

# Alternative Python command (Windows)
py generate_powerpoint_day01.py
```
