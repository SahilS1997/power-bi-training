# DAY 7 - Time Intelligence Part 1

## 1️⃣ Session Overview

Today you'll master the foundations of Time Intelligence in DAX—one of the most powerful and sought-after capabilities in Power BI. You'll learn how to properly structure a Calendar table, understand date table requirements, and implement Year-to-Date (YTD), Quarter-to-Date (QTD), and Month-to-Date (MTD) calculations. These are essential for financial reporting, performance tracking, and business analytics.

In real projects, virtually every business report requires time-based calculations: "What's our revenue year-to-date?", "How does this quarter compare to last quarter?", "What's our monthly growth trend?". Time Intelligence functions make these calculations simple and accurate—but they require a properly configured date table. Understanding this foundation is critical: without it, your time calculations will fail silently or return incorrect results.

## 2️⃣ Learning Objectives

- Understand why Power BI requires a separate Calendar/Date table
- Master the requirements for a valid date table in DAX
- Learn how to create a comprehensive Calendar table with attributes
- Mark a table as a Date Table and set up relationships correctly
- Implement YTD (Year-to-Date) calculations using TOTALYTD
- Implement QTD (Quarter-to-Date) and MTD (Month-to-Date) calculations
- Understand the difference between time intelligence functions and manual calculations
- Troubleshoot common date table configuration issues
- Apply date table best practices for enterprise reporting

## 3️⃣ Key Concepts (Explained Simply)

**Why Do We Need a Calendar Table?**

**Problem:** Transaction tables (like Sales) have date columns, but those dates are random:
- Sales might occur on: Jan 5, Jan 7, Jan 15, Feb 3, Feb 20...
- Missing dates: Jan 1-4, Jan 6, Jan 8-14, Jan 16-31...
- No metadata: Which dates are weekends? What quarter? What fiscal year?

**Solution:** Create a separate Calendar table with every date, even those without transactions.

**Calendar Table Structure:**
```
Date        | Year | Quarter | Month | MonthName | DayOfWeek | IsWeekend
2024-01-01  | 2024 | Q1      | 1     | January   | Monday    | No
2024-01-02  | 2024 | Q1      | 1     | January   | Tuesday   | No
2024-01-03  | 2024 | Q1      | 1     | January   | Wednesday | No
... (every single date)
```

**Why this matters:**
1. **Time Intelligence functions require it** (TOTALYTD, SAMEPERIODLASTYEAR, etc.)
2. **Consistent time periods** even when no sales occurred
3. **Metadata for grouping** (quarters, fiscal years, weekdays)
4. **Proper chronological sorting** (January before February, not alphabetically!)

**Real-world analogy:** Think of a physical calendar on your wall. Every date exists whether or not you have appointments. The calendar shows weeks, months, and holidays. That's what your data model needs too!

**Date Table Requirements**

For DAX Time Intelligence functions to work, your Calendar table must meet these requirements:

✅ **Requirement 1: Continuous Date Range**
- Must include every single day in the range (no gaps)
- If your data spans 2022-2025, Calendar must have all dates from Jan 1, 2022 to Dec 31, 2025

❌ **Invalid:** Missing dates (skipping weekends)
✅ **Valid:** All consecutive dates

✅ **Requirement 2: Date Column (Data Type = Date)**
- Must have at least one column with Date data type
- DateTime type works but Date is preferred
- This column becomes the primary key

✅ **Requirement 3: Mark as Date Table**
- Use "Mark as Date Table" in Power BI (or CALENDAR/CALENDARAUTO functions)
- Tells DAX which table contains the date dimension
- Links the date column to the time intelligence engine

✅ **Requirement 4: One-to-Many Relationship to Fact Tables**
- Calendar[Date] → Sales[OrderDate] (one-to-many)
- Calendar side is always "one"
- Fact table side is "many"

**How DAX Time Intelligence Works**

When you write:
```DAX
Sales YTD = TOTALYTD( [Total Sales], Calendar[Date] )
```

**Behind the scenes, DAX:**
1. Identifies the current filter context's date(s)
2. Uses the Calendar table to determine year boundaries
3. Filters from January 1 of current year to current date
4. Calculates [Total Sales] with that filter
5. Returns the year-to-date total

**Without a proper Calendar table:** Time Intelligence functions will error or return incorrect results.

**Creating a Calendar Table**

**Method 1: DAX Calculated Table (Most Common)**

```DAX
Calendar = 
ADDCOLUMNS(
    CALENDAR( DATE(2020, 1, 1), DATE(2026, 12, 31) ),
    "Year", YEAR( [Date] ),
    "Quarter", "Q" & QUARTER( [Date] ),
    "QuarterNumber", QUARTER( [Date] ),
    "Month", MONTH( [Date] ),
    "MonthName", FORMAT( [Date], "MMMM" ),
    "MonthShort", FORMAT( [Date], "MMM" ),
    "YearMonth", FORMAT( [Date], "YYYY-MM" ),
    "DayOfWeek", WEEKDAY( [Date] ),
    "DayName", FORMAT( [Date], "dddd" ),
    "DayShort", FORMAT( [Date], "ddd" ),
    "IsWeekend", WEEKDAY( [Date] ) IN {1, 7}
)
```

**What this does:**
- `CALENDAR(start, end)` creates a table with every date in range
- `ADDCOLUMNS` adds calculated columns for attributes
- `FORMAT` creates text versions for labels
- Creates a comprehensive date dimension

**Method 2: CALENDARAUTO (Automatic Range)**

```DAX
Calendar = 
ADDCOLUMNS(
    CALENDARAUTO(),
    "Year", YEAR( [Date] ),
    "Quarter", "Q" & QUARTER( [Date] ),
    "Month", MONTH( [Date] ),
    "MonthName", FORMAT( [Date], "MMMM" )
)
```

**CALENDARAUTO()** automatically determines date range:
- Scans all tables for date columns
- Finds earliest and latest dates
- Creates calendar spanning that range
- Useful when you don't know exact date range needed

**Method 3: Import from Excel/CSV**

Create a pre-built calendar file with all attributes, then import.

**Best practice:** Use DAX calculated table (Method 1) for flexibility and maintenance.

**Calendar Table Attributes**

**Essential Attributes (Must Have):**

1. **Date** (Primary key, Date data type)
2. **Year** (Integer: 2024, 2025)
3. **Quarter** (Text or Integer)
4. **Month** (Integer: 1-12)
5. **MonthName** (Text: January, February)
6. **DayOfWeek** (Integer: 1=Sunday, 7=Saturday)

**Recommended Attributes:**

7. **YearMonth** (Text: "2024-01", for sorting)
8. **IsWeekend** (Boolean: TRUE/FALSE)
9. **DayName** (Text: Monday, Tuesday)
10. **QuarterYear** (Text: "Q1 2024")
11. **MonthYear** (Text: "Jan 2024")

**Advanced Attributes (For Specific Needs):**

12. **FiscalYear** (If fiscal year ≠ calendar year)
13. **FiscalQuarter**
14. **IsHoliday** (Custom holidays)
15. **WeekNumber** (Week of year: 1-52)
16. **YearQuarter** (Text: "2024-Q1")

**Real-world example:**
```
Date       | Year | Quarter | Month | MonthName | DayOfWeek | DayName   | IsWeekend
2024-01-15 | 2024 | Q1      | 1     | January   | 2         | Monday    | FALSE
2024-01-16 | 2024 | Q1      | 1     | January   | 3         | Tuesday   | FALSE
2024-01-20 | 2024 | Q1      | 1     | January   | 7         | Saturday  | TRUE
```

**Marking a Table as Date Table**

**In Power BI Desktop:**

1. Click on the Calendar table (in Data view)
2. Go to "Table tools" ribbon
3. Click "Mark as date table"
4. Select the Date column
5. Power BI validates requirements

**In DAX (Automatic with CALENDAR/CALENDARAUTO):**

Using `CALENDAR()` or `CALENDARAUTO()` automatically marks the table as a date table.

**Verification:**
- Check for a small calendar icon next to the table name
- If missing, time intelligence functions may not work correctly

**Setting Up Relationships**

**Relationship Pattern:**
```
Calendar[Date] (1) ──→ (∞) Sales[OrderDate]
      One-to-Many relationship
```

**Configuration:**
1. **Cardinality:** One-to-Many (Calendar is "one" side)
2. **Cross-filter direction:** Single (from Calendar to Sales)
3. **Active relationship:** Yes (green checkmark)

**Multiple date roles (Order Date, Ship Date, Due Date):**

Create inactive relationships for additional dates:
```
Calendar[Date] (1) ──→ (∞) Sales[OrderDate]   [Active]
Calendar[Date] (1) ──→ (∞) Sales[ShipDate]    [Inactive]
Calendar[Date] (1) ──→ (∞) Sales[DueDate]     [Inactive]
```

Use `USERELATIONSHIP()` to activate non-active relationships:
```DAX
Shipped Sales = 
CALCULATE(
    [Total Sales],
    USERELATIONSHIP( Calendar[Date], Sales[ShipDate] )
)
```

**Year-to-Date (YTD) Calculations**

**What is YTD?**

Year-to-Date is the cumulative total from January 1 through the current date.

**Example:** On March 15, 2024:
- YTD includes: January 1 - March 15, 2024 (all data for those dates)
- Excludes: March 16 - December 31, 2024

**Business use case:** "We've made $1.5M in sales so far this year."

**TOTALYTD Function**

**Syntax:**
```DAX
TOTALYTD(
    <expression>,
    <dates>,
    [<filter>],
    [<year_end_date>]
)
```

**Parameters:**
- **expression:** The measure to calculate YTD (e.g., [Total Sales])
- **dates:** The Date column from your Calendar table
- **filter:** (Optional) Additional filter
- **year_end_date:** (Optional) If fiscal year ends on date other than Dec 31

**Basic YTD Example:**
```DAX
Sales YTD = 
TOTALYTD(
    [Total Sales],
    Calendar[Date]
)
```

**What this does:**
1. Takes the filter context (current date selection)
2. Modifies filter to include all dates from Jan 1 of that year to current date
3. Calculates [Total Sales] with modified filter
4. Returns year-to-date total

**Example in visuals:**

| Month      | Monthly Sales | Sales YTD   |
|------------|---------------|-------------|
| January    | $100,000      | $100,000    |
| February   | $120,000      | $220,000    |
| March      | $150,000      | $370,000    |
| April      | $110,000      | $480,000    |

Notice: YTD is cumulative (keeps adding each month).

**Fiscal Year YTD**

If your fiscal year starts July 1 (not January 1):

```DAX
Sales Fiscal YTD = 
TOTALYTD(
    [Total Sales],
    Calendar[Date],
    "6/30"  -- Fiscal year ends June 30
)
```

**Quarter-to-Date (QTD) Calculations**

**What is QTD?**

Quarter-to-Date is the cumulative total from the first day of the current quarter through the current date.

**Example:** On February 15, 2024 (Q1):
- QTD includes: January 1 - February 15, 2024
- Excludes: February 16 - March 31, 2024

**Business use case:** "We've achieved 60% of our quarterly target."

**TOTALQTD Function**

**Syntax:**
```DAX
TOTALQTD(
    <expression>,
    <dates>,
    [<filter>]
)
```

**Basic QTD Example:**
```DAX
Sales QTD = 
TOTALQTD(
    [Total Sales],
    Calendar[Date]
)
```

**Example in visuals:**

| Month      | Monthly Sales | Sales QTD   |
|------------|---------------|-------------|
| January    | $100,000      | $100,000    |
| February   | $120,000      | $220,000    |
| March      | $150,000      | $370,000    |
| April      | $110,000      | $110,000    | ← Resets for Q2!

Notice: QTD resets at the start of each quarter.

**Month-to-Date (MTD) Calculations**

**What is MTD?**

Month-to-Date is the cumulative total from the first day of the current month through the current date.

**Example:** On January 15, 2024:
- MTD includes: January 1 - 15, 2024
- Excludes: January 16 - 31, 2024

**Business use case:** "We're on track to hit our monthly sales goal."

**TOTALMTD Function**

**Syntax:**
```DAX
TOTALMTD(
    <expression>,
    <dates>,
    [<filter>]
)
```

**Basic MTD Example:**
```DAX
Sales MTD = 
TOTALMTD(
    [Total Sales],
    Calendar[Date]
)
```

**Example tracking daily:**

| Date       | Daily Sales | Sales MTD   |
|------------|-------------|-------------|
| Jan 1      | $10,000     | $10,000     |
| Jan 2      | $12,000     | $22,000     |
| Jan 3      | $8,000      | $30,000     |
| Jan 4      | $15,000     | $45,000     |

**Comparing YTD, QTD, MTD**

**All three measures on one report:**

| Month      | Monthly  | MTD      | QTD      | YTD      |
|------------|----------|----------|----------|----------|
| Jan        | $100K    | $100K    | $100K    | $100K    |
| Feb        | $120K    | $120K    | $220K    | $220K    |
| Mar        | $150K    | $150K    | $370K    | $370K    |
| Apr        | $110K    | $110K    | $110K    | $480K    |
| May        | $130K    | $130K    | $240K    | $610K    |

**Notice patterns:**
- **MTD** = Current month's value (resets monthly)
- **QTD** accumulates within quarter, resets each quarter
- **YTD** accumulates all year, resets January 1

**Time Intelligence vs Manual Calculations**

**Option 1: Using Time Intelligence (Recommended)**
```DAX
Sales YTD = 
TOTALYTD(
    [Total Sales],
    Calendar[Date]
)
```

**Advantages:**
- ✅ Automatic year boundary detection
- ✅ Handles fiscal years
- ✅ Works with any date selection
- ✅ Concise and readable
- ✅ Optimized by DAX engine

**Option 2: Manual Calculation**
```DAX
Sales YTD Manual = 
CALCULATE(
    [Total Sales],
    FILTER(
        ALL( Calendar ),
        Calendar[Year] = MAX( Calendar[Year] )
        && Calendar[Date] <= MAX( Calendar[Date] )
    )
)
```

**Disadvantages:**
- ❌ More complex code
- ❌ Must manually handle year logic
- ❌ Harder to maintain
- ❌ More prone to errors

**Rule:** Always use built-in Time Intelligence functions when possible!

**Complete YTD/QTD/MTD Pattern**

**Base measure:**
```DAX
Total Sales = SUM( Sales[Revenue] )
```

**Time Intelligence measures:**
```DAX
Sales YTD = 
TOTALYTD(
    [Total Sales],
    Calendar[Date]
)

Sales QTD = 
TOTALQTD(
    [Total Sales],
    Calendar[Date]
)

Sales MTD = 
TOTALMTD(
    [Total Sales],
    Calendar[Date]
)
```

**Usage in card visuals:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━
 Sales This Month: $150,000
 Sales MTD: $150,000
 Sales QTD: $370,000
 Sales YTD: $1,500,000
━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 4️⃣ Essential DAX Formulas

**Creating a Comprehensive Calendar Table**

```DAX
Calendar = 
ADDCOLUMNS(
    CALENDAR( DATE(2020, 1, 1), DATE(2026, 12, 31) ),
    "Year", YEAR( [Date] ),
    "YearText", FORMAT( [Date], "YYYY" ),
    "Quarter", "Q" & QUARTER( [Date] ),
    "QuarterNumber", QUARTER( [Date] ),
    "QuarterYear", "Q" & QUARTER( [Date] ) & " " & YEAR( [Date] ),
    "Month", MONTH( [Date] ),
    "MonthName", FORMAT( [Date], "MMMM" ),
    "MonthShort", FORMAT( [Date], "MMM" ),
    "MonthYear", FORMAT( [Date], "MMM YYYY" ),
    "YearMonth", FORMAT( [Date], "YYYY-MM" ),
    "MonthYear_Sort", YEAR( [Date] ) * 100 + MONTH( [Date] ),
    "DayOfWeek", WEEKDAY( [Date] ),
    "DayName", FORMAT( [Date], "dddd" ),
    "DayShort", FORMAT( [Date], "ddd" ),
    "DayOfMonth", DAY( [Date] ),
    "IsWeekend", IF( WEEKDAY( [Date] ) IN {1, 7}, TRUE, FALSE ),
    "IsWeekday", IF( WEEKDAY( [Date] ) IN {2, 3, 4, 5, 6}, TRUE, FALSE ),
    "WeekOfYear", WEEKNUM( [Date] ),
    "DayOfYear", DATEDIFF( DATE( YEAR([Date]), 1, 1 ), [Date], DAY ) + 1
)
```

**With sorting columns defined**, add these sort-by relationships:
- MonthName sorted by Month
- MonthShort sorted by Month
- DayName sorted by DayOfWeek
- DayShort sorted by DayOfWeek

**Basic YTD Measure**

```DAX
Sales YTD = 
TOTALYTD(
    [Total Sales],
    Calendar[Date]
)
```

**YTD with Fiscal Year (ends June 30)**

```DAX
Sales Fiscal YTD = 
TOTALYTD(
    [Total Sales],
    Calendar[Date],
    "6/30"
)
```

**YTD with Additional Filter**

```DAX
Sales YTD Online = 
TOTALYTD(
    [Total Sales],
    Calendar[Date],
    Sales[Channel] = "Online"
)
```

**Basic QTD Measure**

```DAX
Sales QTD = 
TOTALQTD(
    [Total Sales],
    Calendar[Date]
)
```

**Basic MTD Measure**

```DAX
Sales MTD = 
TOTALMTD(
    [Total Sales],
    Calendar[Date]
)
```

**All Time Intelligence Measures Combined**

```DAX
// Base Measure
Total Sales = SUM( Sales[Revenue] )

// Month-to-Date
Sales MTD = 
TOTALMTD( [Total Sales], Calendar[Date] )

// Quarter-to-Date
Sales QTD = 
TOTALQTD( [Total Sales], Calendar[Date] )

// Year-to-Date
Sales YTD = 
TOTALYTD( [Total Sales], Calendar[Date] )

// Year-to-Date (Fiscal Year ending June 30)
Sales Fiscal YTD = 
TOTALYTD( [Total Sales], Calendar[Date], "6/30" )
```

**YTD % of Year Total**

Shows how much of the annual total has been achieved:

```DAX
YTD % of Year = 
DIVIDE(
    [Sales YTD],
    CALCULATE(
        [Total Sales],
        DATESYTD( Calendar[Date] )
    ),
    0
)
```

**Alternative approach:**

```DAX
YTD % of Year = 
DIVIDE(
    [Sales YTD],
    CALCULATE(
        [Total Sales],
        REMOVEFILTERS( Calendar[Month], Calendar[Quarter] )
    ),
    0
)
```

**Multiple Date Roles (Active vs Inactive Relationships)**

**Using Ship Date instead of Order Date:**

```DAX
Shipped Sales YTD = 
CALCULATE(
    TOTALYTD( [Total Sales], Calendar[Date] ),
    USERELATIONSHIP( Calendar[Date], Sales[ShipDate] )
)
```

**Creating Fiscal Calendar Attributes**

If fiscal year starts July 1:

```DAX
Calendar = 
ADDCOLUMNS(
    CALENDAR( DATE(2020, 1, 1), DATE(2026, 12, 31) ),
    "Year", YEAR( [Date] ),
    "Month", MONTH( [Date] ),
    
    -- Fiscal Year (starts July 1)
    "FiscalYear", 
        IF( MONTH( [Date] ) >= 7,
            YEAR( [Date] ) + 1,
            YEAR( [Date] )
        ),
    
    -- Fiscal Quarter
    "FiscalQuarter", 
        SWITCH( TRUE(),
            MONTH( [Date] ) >= 7 && MONTH( [Date] ) <= 9, "FQ1",
            MONTH( [Date] ) >= 10 && MONTH( [Date] ) <= 12, "FQ2",
            MONTH( [Date] ) >= 1 && MONTH( [Date] ) <= 3, "FQ3",
            "FQ4"
        ),
    
    -- Fiscal Month
    "FiscalMonth", 
        IF( MONTH( [Date] ) >= 7,
            MONTH( [Date] ) - 6,
            MONTH( [Date] ) + 6
        )
)
```

## 5️⃣ Hands-On Practice Exercises

**Exercise 1: Create a Calendar Table**

**Task:** Create a comprehensive Calendar table with essential attributes.

**Steps:**
1. Go to Modeling tab → New Table
2. Create the Calendar table:

```DAX
Calendar = 
ADDCOLUMNS(
    CALENDAR( DATE(2022, 1, 1), DATE(2026, 12, 31) ),
    "Year", YEAR( [Date] ),
    "Quarter", "Q" & QUARTER( [Date] ),
    "Month", MONTH( [Date] ),
    "MonthName", FORMAT( [Date], "MMMM" ),
    "DayOfWeek", WEEKDAY( [Date] ),
    "DayName", FORMAT( [Date], "dddd" )
)
```

3. **Verify:** Check Data view—should have 1,827 rows (5 years of dates)
4. **Mark as Date Table:** Table Tools → Mark as Date Table → Select [Date] column
5. **Set sort order:** MonthName sorted by Month, DayName sorted by DayOfWeek

**Exercise 2: Create Date Relationship**

**Task:** Link Calendar to your Sales table.

**Steps:**
1. Go to Model view
2. Drag Calendar[Date] → Sales[OrderDate]
3. Configure relationship:
   - Cardinality: One-to-Many (1:*)
   - Cross-filter: Single
   - Active: Yes
4. **Verify:** Line should appear connecting tables

**Exercise 3: Basic YTD Measure**

**Task:** Create a Sales YTD measure.

**Prerequisites:** Base measure exists:
```DAX
Total Sales = SUM( Sales[Revenue] )
```

**Create YTD measure:**
```DAX
Sales YTD = 
TOTALYTD(
    [Total Sales],
    Calendar[Date]
)
```

**Test:**
1. Create Table visual: Calendar[MonthName] | [Total Sales] | [Sales YTD]
2. Add Year slicer: Select 2024
3. **Expected result:** YTD should accumulate month by month

| MonthName | Total Sales | Sales YTD |
|-----------|-------------|-----------|
| January   | $100,000    | $100,000  |
| February  | $120,000    | $220,000  |
| March     | $150,000    | $370,000  |

**Exercise 4: QTD and MTD Measures**

**Task:** Create Quarter-to-Date and Month-to-Date measures.

```DAX
Sales QTD = 
TOTALQTD(
    [Total Sales],
    Calendar[Date]
)

Sales MTD = 
TOTALMTD(
    [Total Sales],
    Calendar[Date]
)
```

**Test:**
1. Create Table visual with all measures:
   - Calendar[MonthName]
   - [Total Sales]
   - [Sales MTD]
   - [Sales QTD]
   - [Sales YTD]
2. Add Year slicer: 2024
3. **Verify patterns:**
   - MTD = Total Sales (same for current month)
   - QTD resets each quarter (Jan, Apr, Jul, Oct)
   - YTD accumulates all year

**Exercise 5: Fiscal Year YTD**

**Task:** Create YTD for fiscal year ending June 30.

```DAX
Sales Fiscal YTD = 
TOTALYTD(
    [Total Sales],
    Calendar[Date],
    "6/30"
)
```

**Test:**
1. Create Table: Calendar[MonthName] | [Sales YTD] | [Sales Fiscal YTD]
2. **Compare July values:**
   - Regular YTD: Continues accumulating from January
   - Fiscal YTD: Resets in July (start of new fiscal year)

**Exercise 6: YTD vs Total Comparison**

**Task:** Show YTD as percentage of total year.

```DAX
YTD % of Year = 
DIVIDE(
    [Sales YTD],
    CALCULATE(
        [Total Sales],
        REMOVEFILTERS( Calendar[Month] )
    )
)
```

**Test:**
1. Create Card visuals showing:
   - Sales YTD
   - YTD % of Year (format as percentage)
2. Filter to specific month (e.g., June)
3. **Expected:** Should show ~50% if sales are evenly distributed

**Exercise 7: Multi-Role Date Relationships**

**Task:** Create YTD based on ShipDate instead of OrderDate.

**Prerequisites:** Sales table has both OrderDate and ShipDate columns.

**Steps:**
1. Create inactive relationship: Calendar[Date] → Sales[ShipDate]
2. Create measure:

```DAX
Shipped Sales YTD = 
CALCULATE(
    TOTALYTD( [Total Sales], Calendar[Date] ),
    USERELATIONSHIP( Calendar[Date], Sales[ShipDate] )
)
```

**Test:**
1. Compare [Sales YTD] (orders) vs [Shipped Sales YTD]
2. **Difference:** Shipped values should lag order values (shipping delay)

## 6️⃣ Common Mistakes & Troubleshooting

**Mistake 1: Time Intelligence Functions Return Blank**

**Symptom:**
```DAX
Sales YTD = TOTALYTD( [Total Sales], Calendar[Date] )
```
Returns blank instead of values.

**Causes & Fixes:**

❌ **Calendar table not marked as Date Table**
- **Fix:** Right-click Calendar → Mark as Date Table → Select Date column

❌ **No relationship between Calendar and fact table**
- **Fix:** Create relationship: Calendar[Date] → Sales[OrderDate]

❌ **Calendar table has gaps (missing dates)**
- **Fix:** Use CALENDAR() function to ensure all dates exist

❌ **Date column wrong data type (Text instead of Date)**
- **Fix:** Ensure Calendar[Date] is Date or DateTime data type

**Verification checklist:**
1. ✅ Calendar table has small calendar icon
2. ✅ Relationship exists and is active
3. ✅ Date column is Date data type
4. ✅ All dates are consecutive (no gaps)

**Mistake 2: Using DateTime Instead of Date**

**Symptom:** Time Intelligence functions work inconsistently.

**Problem:**
```DAX
Calendar = CALENDARAUTO()  -- Creates Date type ✅
vs
Sales[OrderDate] = DateTime  -- Has time component ❌
```

**Fix options:**

**Option 1: Convert DateTime to Date in Calendar relationship**
- Relationship automatically handles Date to DateTime conversion
- Preferred approach (no data changes needed)

**Option 2: Create Date-only column in Sales**
```DAX
Sales[OrderDateOnly] = DATEVALUE( Sales[OrderDate] )
```
Then relate: Calendar[Date] → Sales[OrderDateOnly]

**Best practice:** Let relationships handle DateTime to Date conversion automatically. Only create separate columns if needed for multiple time-of-day analyses.

**Mistake 3: Wrong Fiscal Year End Date Format**

**Symptom:** Fiscal YTD doesn't reset at correct month.

❌ **Wrong formats:**
```DAX
Sales Fiscal YTD = TOTALYTD( [Total Sales], Calendar[Date], "June 30" )  -- ❌
Sales Fiscal YTD = TOTALYTD( [Total Sales], Calendar[Date], "06-30" )   -- ❌
Sales Fiscal YTD = TOTALYTD( [Total Sales], Calendar[Date], 6/30 )      -- ❌
```

✅ **Correct format:**
```DAX
Sales Fiscal YTD = TOTALYTD( [Total Sales], Calendar[Date], "6/30" )  -- ✅
```

**Format rule:** Always use "M/D" or "M/DD" format in quotes.

**Mistake 4: Relationship Direction Error**

**Symptom:** Time Intelligence returns incorrect totals.

❌ **Wrong direction:**
```
Sales[OrderDate] (1) ──→ (∞) Calendar[Date]
```
This is backwards!

✅ **Correct direction:**
```
Calendar[Date] (1) ──→ (∞) Sales[OrderDate]
```

**Rule:** Calendar table is ALWAYS the "one" side. Fact table is ALWAYS the "many" side.

**Fix:** Delete wrong relationship, create correct one.

**Mistake 5: Forgetting to Remove Date Filters**

**Symptom:** Year total doesn't show full year, only filtered period.

**Problem measure:**
```DAX
Total Year Sales = [Total Sales]  -- Respects existing date filters
```

**If you filter to Q1 only:** Shows Q1 total, not full year.

**Fixed measure:**
```DAX
Total Year Sales = 
CALCULATE(
    [Total Sales],
    REMOVEFILTERS( Calendar[Month], Calendar[Quarter] )
)
```

**Now:** Shows full year total even when filtered to specific quarter/month.

**Mistake 6: Calendar Range Too Narrow**

**Symptom:** Recent or future dates don't work with Time Intelligence.

**Problem:** Calendar only has 2020-2023, but data now includes 2024.

**Consequence:**
- 2024 dates have no matching Calendar dates
- Time Intelligence functions fail for 2024

**Fix:** Update Calendar date range:
```DAX
Calendar = 
CALENDAR( 
    DATE(2020, 1, 1), 
    DATE(2026, 12, 31)  -- Extend to cover all current and future dates
)
```

**Best practice:** Create Calendar spanning past 5 years to future 2-3 years.

**Mistake 7: Confusing MTD with Current Month Total**

**Misunderstanding:** "MTD is just the current month's sales."

**Reality:**
- **MTD (Month-to-Date):** Jan 1 to today (cumulative within month)
- **Current Month Total:** All of January (entire month)

**Example on January 15:**
- **MTD:** January 1-15 only
- **Month Total:** January 1-31 (including future dates!)

**Correct measures:**
```DAX
Sales MTD = TOTALMTD( [Total Sales], Calendar[Date] )  -- Jan 1-15
Sales Current Month = [Total Sales]  -- Full month when month selected
```

**Use MTD when:** Tracking progress within current month.
**Use Month Total when:** Comparing complete months.

## 7️⃣ Interview-Oriented Question

**Question:**

"Your finance department reports that your Power BI dashboard shows incorrect Year-to-Date revenue figures. They compared it to their Excel report and found a $50,000 discrepancy. Your YTD measure is:

```DAX
Revenue YTD = TOTALYTD( SUM(Sales[Revenue]), Sales[OrderDate] )
```

The report has been working fine for two years, but suddenly started showing wrong values this month. What are the possible causes, and how would you troubleshoot this?"

**Follow-up:** "The CFO also wants to switch to fiscal year reporting (year ends June 30). How would you modify your measures to support both calendar year and fiscal year YTD calculations?"

---

### Ideal Answer:

**Part 1: Troubleshooting YTD Discrepancy**

**"I would investigate these potential causes in order:"**

**1. Date Table Verification**

The measure references `Sales[OrderDate]` directly instead of using a proper Calendar table. This is a red flag.

**Issue:** `TOTALYTD` requires a date column from a table marked as a Date Table. Using fact table date columns can cause incorrect results.

**Correct approach:**
```DAX
Revenue YTD = TOTALYTD( SUM(Sales[Revenue]), Calendar[Date] )
```

**2. Calendar Date Range**

If it "suddenly stopped working this month," the Calendar table might not include current month dates.

**Check:** 
- Does Calendar table extend through today's date?
- Common issue: Calendar was created for 2020-2023, but we're now in 2024.

**Fix:** Extend Calendar date range or use CALENDARAUTO().

**3. Relationship Issues**

**Verify:**
- Calendar[Date] is related to Sales[OrderDate]
- Relationship is one-to-many (Calendar on "one" side)
- Relationship is active
- Cross-filter direction is correct

**4. Data Quality Issues**

**Check if Sales table has:**
- Invalid dates (future dates, nulls)
- OrderDate as DateTime type with time components causing issues
- Recent data import problems

**Testing approach:**
1. Create simple measure: `Total Revenue = SUM(Sales[Revenue])`
2. Compare to Excel using same filter
3. If totals match, issue is with YTD logic
4. If totals don't match, data import/quality issue

**Part 2: Supporting Fiscal Year**

**"I would create separate measures for clarity:"**

**Calendar Year YTD (current measure):**
```DAX
Revenue YTD (CY) = 
TOTALYTD(
    SUM( Sales[Revenue] ),
    Calendar[Date]
)
```

**Fiscal Year YTD (year ends June 30):**
```DAX
Revenue YTD (FY) = 
TOTALYTD(
    SUM( Sales[Revenue] ),
    Calendar[Date],
    "6/30"  -- Fiscal year ends June 30
)
```

**Enhanced Calendar table with fiscal attributes:**
```DAX
Calendar = 
ADDCOLUMNS(
    CALENDAR( DATE(2020, 1, 1), DATE(2026, 12, 31) ),
    "Year", YEAR( [Date] ),
    "Month", MONTH( [Date] ),
    "FiscalYear", IF( MONTH( [Date] ) >= 7, YEAR( [Date] ) + 1, YEAR( [Date] ) ),
    "FiscalQuarter", 
        SWITCH( TRUE(),
            MONTH([Date]) >= 7 && MONTH([Date]) <= 9, "FQ1",
            MONTH([Date]) >= 10 && MONTH([Date]) <= 12, "FQ2",
            MONTH([Date]) >= 1 && MONTH([Date]) <= 3, "FQ3",
            "FQ4"
        )
)
```

**Slicer for user selection:**
```DAX
Revenue YTD Dynamic = 
VAR SelectedYearType = SELECTEDVALUE( YearType[Type], "Calendar" )
RETURN
    IF(
        SelectedYearType = "Fiscal",
        [Revenue YTD (FY)],
        [Revenue YTD (CY)]
    )
```

**Key points in answer:**
- ✅ Identified root cause (wrong date reference)
- ✅ Systematic troubleshooting approach
- ✅ Explained why it "suddenly broke" (date range issue)
- ✅ Provided both calendar and fiscal solutions
- ✅ Enhanced Calendar table for fiscal reporting
- ✅ Mentioned testing and validation steps

**Red Flags in Bad Answers:**
- "TOTALYTD is buggy" (blaming the function)
- Not recognizing the Sales[OrderDate] issue
- Suggesting to rewrite TOTALYTD manually
- Not considering date range/relationship issues
- No systematic troubleshooting approach

## 8️⃣ Session Summary

Today you mastered the foundations of Time Intelligence in DAX—essential for business reporting and financial analysis.

### Key Takeaways

**Calendar Table is Essential**
- Separate date dimension table with every date (no gaps)
- Contains metadata: Year, Quarter, Month, DayOfWeek, etc.
- Required for DAX Time Intelligence functions to work
- Must be marked as Date Table and related to fact tables

**Date Table Requirements**
1. ✅ Continuous date range (no missing dates)
2. ✅ Date data type column
3. ✅ Marked as Date Table
4. ✅ One-to-many relationship to fact tables (Calendar is "one" side)

**Creating Calendar Tables**
```DAX
Calendar = 
ADDCOLUMNS(
    CALENDAR( DATE(2020,1,1), DATE(2026,12,31) ),
    "Year", YEAR([Date]),
    "Quarter", "Q" & QUARTER([Date]),
    "Month", MONTH([Date]),
    "MonthName", FORMAT([Date], "MMMM"),
    "DayOfWeek", WEEKDAY([Date])
)
```

**YTD, QTD, MTD Functions**

**Year-to-Date (YTD):**
```DAX
Sales YTD = TOTALYTD( [Total Sales], Calendar[Date] )
```
Accumulates from January 1 to current date.

**Quarter-to-Date (QTD):**
```DAX
Sales QTD = TOTALQTD( [Total Sales], Calendar[Date] )
```
Accumulates from quarter start to current date, resets each quarter.

**Month-to-Date (MTD):**
```DAX
Sales MTD = TOTALMTD( [Total Sales], Calendar[Date] )
```
Accumulates from month start to current date, resets each month.

**Fiscal Year Support**
```DAX
Sales Fiscal YTD = TOTALYTD( [Total Sales], Calendar[Date], "6/30" )
```
Use year_end_date parameter for fiscal years ending on dates other than Dec 31.

### Common Patterns

**Complete Time Intelligence Suite:**
```DAX
// Base measure
Total Sales = SUM( Sales[Revenue] )

// Time calculations
Sales MTD = TOTALMTD( [Total Sales], Calendar[Date] )
Sales QTD = TOTALQTD( [Total Sales], Calendar[Date] )
Sales YTD = TOTALYTD( [Total Sales], Calendar[Date] )
Sales Fiscal YTD = TOTALYTD( [Total Sales], Calendar[Date], "6/30" )
```

**Multiple Date Roles:**
```DAX
// Using Ship Date instead of Order Date
Shipped Sales YTD = 
CALCULATE(
    TOTALYTD( [Total Sales], Calendar[Date] ),
    USERELATIONSHIP( Calendar[Date], Sales[ShipDate] )
)
```

### Date Table Best Practices

1. **Date range:** Cover historical data + 2-3 future years
2. **Attributes:** Include Year, Quarter, Month, MonthName, DayOfWeek minimum
3. **Sorting:** Set sort-by columns (MonthName sorted by Month number)
4. **Fiscal support:** Add fiscal year attributes if needed
5. **Naming:** Clear, consistent naming (Calendar or DateTable)
6. **Relationships:** Always Calendar to Fact table (one-to-many)
7. **Mark as Date Table:** Never skip this step

### Troubleshooting Checklist

When Time Intelligence doesn't work:
- ✅ Is table marked as Date Table? (look for calendar icon)
- ✅ Is relationship active and correct direction?
- ✅ Does Calendar include all dates in fact table?
- ✅ Is Date column Date or DateTime data type?
- ✅ Are there any gaps in Calendar dates?

### What's Next?

**Day 8** will cover Time Intelligence Part 2:
- Year-over-Year (YoY) comparisons
- Growth % calculations
- SAMEPERIODLASTYEAR and DATEADD functions
- Moving averages and rolling calculations
- Period-to-period comparisons

You'll build on today's foundation to create dynamic comparative analytics!

### Self-Check Questions

Before moving forward, ensure you can answer:
1. Why do we need a separate Calendar table?
2. What are the four requirements for a valid date table?
3. How do you create a Calendar table using DAX?
4. What's the difference between TOTALYTD, TOTALQTD, and TOTALMTD?
5. How do you implement fiscal year YTD calculations?
6. What's the correct relationship direction for Calendar tables?
7. How do you troubleshoot when Time Intelligence returns blank?

If you can answer these confidently and complete the practice exercises, you're ready for advanced Time Intelligence!

---

**🎉 Congratulations!**

You've mastered the foundations of Time Intelligence:
- ✅ Calendar table creation and configuration
- ✅ Date table requirements and best practices
- ✅ YTD, QTD, and MTD calculations
- ✅ Fiscal year support
- ✅ Troubleshooting date-related issues

These skills are essential for financial reporting and business analytics in Power BI!
