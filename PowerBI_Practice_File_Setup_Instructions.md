# Power BI Practice File Setup Instructions
## Day 1 - Data Modeling Foundations

---

## Overview

This guide will help you create a complete Power BI practice file (.pbix) with the sample dataset used throughout the 12-day program. Follow these steps carefully to build a proper data model from scratch.

---

## Prerequisites

- **Power BI Desktop** installed (latest version recommended)
- **Sample CSV files** provided:
  - Sample_Data_Sales.csv
  - Sample_Data_Customers.csv
  - Sample_Data_Products.csv
  - Sample_Data_Calendar.csv

---

## Step 1: Create New Power BI File

1. Open **Power BI Desktop**
2. Click on a blank canvas (or File → New)
3. Save the file immediately as: **"PowerBI_Practice_Day01.pbix"**

---

## Step 2: Import Data

### Import Sales Table (Fact Table)

1. Click **Get Data** → **Text/CSV**
2. Navigate to and select **Sample_Data_Sales.csv**
3. Click **Open**
4. In the preview window, verify data looks correct
5. Click **Load** (not Transform Data)

### Import Customers Table (Dimension Table)

1. Click **Get Data** → **Text/CSV**
2. Select **Sample_Data_Customers.csv**
3. Click **Open**
4. Click **Load**

### Import Products Table (Dimension Table)

1. Click **Get Data** → **Text/CSV**
2. Select **Sample_Data_Products.csv**
3. Click **Open**
4. Click **Load**

### Import Calendar Table (Dimension Table)

1. Click **Get Data** → **Text/CSV**
2. Select **Sample_Data_Calendar.csv**
3. Click **Open**
4. Click **Load**

**Result:** You should now see all four tables in the Fields pane on the right.

---

## Step 3: Verify Data Import

1. Click on **Model View** (icon on left sidebar, looks like three connected boxes)
2. You should see all four tables displayed on the canvas
3. Power BI may have auto-detected some relationships (we'll verify these next)

---

## Step 4: Configure Data Types (Important)

### Sales Table

1. Click on the **Sales** table in Model View
2. In the Properties pane (right side), verify or set:
   - OrderID → Whole Number
   - OrderDate → Date
   - CustomerID → Text
   - ProductID → Text
   - Quantity → Whole Number
   - Revenue → Decimal Number (Fixed decimal number)
   - Cost → Decimal Number (Fixed decimal number)

### Customers Table

1. Click on **Customers** table
2. Verify data types:
   - CustomerID → Text
   - CustomerName → Text
   - City → Text
   - Region → Text
   - Country → Text

### Products Table

1. Click on **Products** table
2. Verify data types:
   - ProductID → Text
   - ProductName → Text
   - Category → Text
   - SubCategory → Text
   - UnitPrice → Decimal Number

### Calendar Table

1. Click on **Calendar** table
2. Verify data types:
   - Date → Date
   - Year → Whole Number
   - Quarter → Text
   - Month → Whole Number
   - MonthName → Text
   - WeekNumber → Whole Number

---

## Step 5: Create Relationships Manually

Even if Power BI auto-detected relationships, let's verify and create them properly.

### Relationship 1: Sales to Customers

1. In **Model View**, locate the **Sales** table
2. Click and drag the **CustomerID** field from Sales table
3. Drop it onto the **CustomerID** field in the Customers table
4. A relationship dialog will appear. Verify:
   - **From table:** Sales
   - **From column:** CustomerID
   - **To table:** Customers
   - **To column:** CustomerID
   - **Cardinality:** Many to one (*:1)
   - **Cross filter direction:** Single
   - **Make this relationship active:** Checked
5. Click **OK**

### Relationship 2: Sales to Products

1. Click and drag **ProductID** from Sales table
2. Drop onto **ProductID** in Products table
3. Verify settings:
   - Cardinality: Many to one (*:1)
   - Cross filter direction: Single
   - Active: Checked
4. Click **OK**

### Relationship 3: Sales to Calendar

1. Click and drag **OrderDate** from Sales table
2. Drop onto **Date** in Calendar table
3. Verify settings:
   - From: Sales[OrderDate]
   - To: Calendar[Date]
   - Cardinality: Many to one (*:1)
   - Cross filter direction: Single
   - Active: Checked
4. Click **OK**

**Result:** You should now see three lines connecting the Sales table to each dimension table.

---

## Step 6: Mark Calendar as Date Table (Critical)

1. Click on the **Calendar** table (in Model View or Data View)
2. Go to **Table Tools** in the top ribbon
3. Click **Mark as Date Table** → **Mark as Date Table**
4. A dialog appears asking which column contains unique dates
5. Select **Date** column
6. Click **OK**

**Why This Matters:** This enables time intelligence functions in DAX.

---

## Step 7: Organize the Model Layout

Arrange tables in a star schema pattern for visual clarity:

1. Place **Sales** table in the center
2. Place **Customers** table above and to the left
3. Place **Products** table above and to the right
4. Place **Calendar** table below the Sales table

**Visual Goal:** Your model should look like a star with Sales in the center.

---

## Step 8: Verify Relationships

1. Click on each relationship line (it will highlight in yellow)
2. Look at the Properties pane on the right
3. Verify for each relationship:
   - **Active:** Yes
   - **Cardinality:** Many to one (*:1)
   - **Cross filter direction:** Single
   - **Arrow direction:** From dimension table to Sales table

---

## Step 9: Create Your First Measure

Let's create a simple measure to verify everything is working.

1. Click on **Report View** (icon on left, looks like a bar chart)
2. Right-click on the **Sales** table in Fields pane
3. Select **New Measure**
4. In the formula bar, type:

```DAX
Total Revenue = SUM(Sales[Revenue])
```

5. Press **Enter**

---

## Step 10: Test the Model

### Create a Simple Table Visual

1. Click on **Table** visual (from Visualizations pane)
2. Add these fields:
   - Products[Category]
   - Products[ProductName]
   - Total Revenue (the measure you just created)
3. Verify that numbers appear and look reasonable

### Test Filtering

1. Click on **Slicer** visual
2. Add **Products[Category]** to the slicer
3. Select "Electronics"
4. Watch the table visual update automatically

**If filtering works:** Your model is correctly configured!

---

## Step 11: Save Your Work

1. **File** → **Save**
2. Confirm the file name: **PowerBI_Practice_Day01.pbix**

---

## Troubleshooting Common Issues

### Issue: Relationships Don't Auto-Create

**Solution:** Create them manually following Step 5.

### Issue: Relationship Shows Wrong Cardinality

**Solution:** 
- Check that CustomerID, ProductID in dimension tables are unique
- Verify data types match between related columns
- Delete wrong relationship and recreate

### Issue: Date Column Not Recognized

**Solution:**
- Verify OrderDate in Sales is Date data type
- Verify Date in Calendar is Date data type
- Recreate the relationship

### Issue: Total Revenue Shows Wrong Numbers

**Solution:**
- Check that Revenue column is Decimal Number data type
- Verify the SUM formula syntax is correct
- Check for any filter context issues

---

## Practice Exercises Setup

For the hands-on exercises in Day 1 material, you may want to create additional tables:

### Exercise 3: Employee Projects (Optional)

Create these tables in Excel/CSV and import:

**Employees.csv:**
```
EmployeeID,Name,Department
E001,Alice Johnson,IT
E002,Bob Smith,Marketing
E003,Carol White,IT
```

**Projects.csv:**
```
ProjectID,ProjectName,Budget
PR001,Website Redesign,50000
PR002,Mobile App,75000
```

**Assignments.csv:**
```
AssignmentID,EmployeeID,ProjectID,HoursWorked,Date
A001,E001,PR001,40,2025-01-15
A002,E002,PR001,20,2025-01-16
A003,E001,PR002,30,2025-01-17
```

Import these and practice creating relationships.

---

## Next Steps

Once your practice file is set up:

1. **Complete the five practice exercises** from Day 1 learning material
2. **Experiment with different visual types** to see how filtering works
3. **Try breaking and fixing relationships** to understand their importance
4. **Create additional simple measures** to practice

---

## File Structure Summary

Your completed practice file should have:

**Four Tables:**
- Sales (Fact - 50 rows)
- Customers (Dimension - 20 rows)
- Products (Dimension - 10 rows)
- Calendar (Dimension - 51 rows)

**Three Relationships:**
- Sales[CustomerID] → Customers[CustomerID] (Many-to-One)
- Sales[ProductID] → Products[ProductID] (Many-to-One)
- Sales[OrderDate] → Calendar[Date] (Many-to-One)

**One Measure:**
- Total Revenue = SUM(Sales[Revenue])

**Model Layout:**
- Star schema pattern with Sales in center

---

## Tips for Using This File

1. **Don't be afraid to experiment** - you can always reload the CSV files
2. **Create multiple copies** of the .pbix file for different exercises
3. **Use this same dataset** for Days 2-12 to build continuity
4. **Take notes** in a separate document about what you learn

---

## Support Resources

If you encounter issues:

1. Review the Day 1 learning material (Section 4: Step-by-Step Explanation)
2. Check the "Common Mistakes" section in Day 1 material
3. Verify each step in this guide was completed
4. Recreate from scratch if needed (good practice!)

---

**Congratulations!** You now have a professional Power BI practice environment ready for hands-on learning.
