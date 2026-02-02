# DAY 10 - Advanced DAX Patterns Part 2

## 1️⃣ Session Overview

Today you'll master variables (VAR), virtual tables, and table functions—the advanced patterns that separate intermediate DAX users from experts. You'll learn how VAR statements dramatically improve code clarity and performance, how to create virtual tables for complex calculations, and powerful table functions like SUMMARIZE, ADDCOLUMNS, SELECTCOLUMNS, and GROUPBY. These are the tools you need when simple measures won't cut it.

In real-world scenarios, you often need to create temporary tables for calculations, aggregate data in complex ways, or store intermediate results for reuse. Variables make complex measures readable and maintainable—imagine debugging a 200-line DAX formula without variables! Virtual tables let you reshape and analyze data on-the-fly without adding physical tables to your model. Mastering these patterns is essential for solving sophisticated business problems and writing enterprise-grade DAX.

## 2️⃣ Learning Objectives

- Master VAR keyword for storing intermediate values and improving performance
- Understand variable scope, evaluation context, and best practices
- Create virtual tables with SUMMARIZE and ADDCOLUMNS
- Transform table structures with SELECTCOLUMNS
- Use GROUPBY for flexible aggregation
- Recognize common DAX patterns and when to apply them
- Optimize complex calculations with variables and virtual tables
- Debug and troubleshoot advanced DAX formulas
- Write maintainable, enterprise-grade DAX code

## 3️⃣ Key Concepts (Explained Simply)

**What are Variables (VAR)?**

Variables in DAX let you store the result of an expression and reuse it multiple times within a measure. Think of them as labeled containers that hold values.

**Syntax:**
```DAX
Measure Name = 
VAR VariableName = <expression>
VAR AnotherVariable = <expression>
RETURN <expression using variables>
```

**Real-world analogy:** You're calculating a discount. Instead of repeatedly calculating "Price * 0.80" every time you need it, you store "Discounted Price = Price * 0.80" in a variable and refer to it by name.

**Without variables (repetitive):**
```DAX
Discount Amount = 
IF(
    SUM(Sales[Quantity]) > 100,
    SUM(Sales[Revenue]) * 0.10,
    IF(
        SUM(Sales[Quantity]) > 50,
        SUM(Sales[Revenue]) * 0.05,
        0
    )
)
```
Notice `SUM(Sales[Revenue])` and `SUM(Sales[Quantity])` are calculated multiple times—inefficient and hard to read!

**With variables (clean):**
```DAX
Discount Amount = 
VAR TotalRevenue = SUM(Sales[Revenue])
VAR TotalQuantity = SUM(Sales[Quantity])
VAR DiscountRate = 
    IF(TotalQuantity > 100, 0.10,
    IF(TotalQuantity > 50, 0.05, 0))
RETURN
TotalRevenue * DiscountRate
```
Much clearer! Each expression calculated once, stored in a variable, and reused.

---

**Why Use Variables?**

**1. Performance Optimization**

DAX recalculates expressions every time they appear. If `SUM(Sales[Revenue])` appears 5 times, it's calculated 5 times. Variables calculate once and reuse.

**2. Code Clarity**

Complex measures become readable when intermediate steps have meaningful names.

```DAX
// Hard to understand
Profit Margin = 
DIVIDE(
    SUM(Sales[Revenue]) - SUM(Sales[Cost]),
    SUM(Sales[Revenue])
)

// Clear and readable
Profit Margin = 
VAR TotalRevenue = SUM(Sales[Revenue])
VAR TotalCost = SUM(Sales[Cost])
VAR TotalProfit = TotalRevenue - TotalCost
RETURN
DIVIDE(TotalProfit, TotalRevenue)
```

**3. Easier Debugging**

When a measure returns unexpected results, variables let you inspect intermediate values.

**4. Maintainability**

Future developers (including you!) can understand and modify the code easily.

**5. Avoid Calculation Redundancy**

Essential for expensive operations like CALCULATE, FILTER, or complex expressions.

---

**Variable Scope and Evaluation**

**Key principle:** Variables are evaluated when defined, not when used.

**Example:**
```DAX
Total Sales with Context = 
VAR CurrentSales = [Total Sales]  -- Evaluated immediately
RETURN
CALCULATE(
    CurrentSales,  -- Uses stored value, not recalculated
    Geography[Region] = "West"
)
```

**Context at definition time:**
- `CurrentSales` captures [Total Sales] in current filter context
- When used later in CALCULATE, it doesn't recalculate—uses stored value

**Scope:**
- Variables exist only within the measure where they're defined
- Can't reference variables from other measures
- Variables are local to their measure/calculated column

**Evaluation timing matters:**

```DAX
Example 1 - Variable captures current context
Measure A = 
VAR StoredValue = [Total Sales]  -- Current context
RETURN
CALCULATE(StoredValue, ALL(Products))  -- StoredValue doesn't change

Example 2 - Calculation in RETURN changes context
Measure B = 
RETURN
CALCULATE([Total Sales], ALL(Products))  -- [Total Sales] recalculated in new context
```

**Rule:** If you want an expression to respect a different context, don't store it in a variable beforehand.

---

**What are Virtual Tables?**

Virtual tables are temporary tables created during measure evaluation—they don't physically exist in the model but are generated in memory during query execution.

**Why virtual tables?**
- Perform calculations requiring custom aggregations
- Reshape data on-the-fly
- Avoid creating physical tables for temporary needs
- Enable complex analytical patterns

**Common table functions:**
1. **SUMMARIZE** - Create summary tables with groupings and aggregations
2. **ADDCOLUMNS** - Add calculated columns to existing table
3. **SELECTCOLUMNS** - Select and rename columns from a table
4. **GROUPBY** - Group rows and apply aggregations
5. **SUMMARIZECOLUMNS** - Modern alternative to SUMMARIZE with better syntax

**Example: Virtual table of top products**
```DAX
Top Products Table = 
TOPN(
    10,
    ADDCOLUMNS(
        VALUES(Products[ProductName]),
        "Sales", [Total Sales],
        "Profit", [Total Profit]
    ),
    [Sales],
    DESC
)
```
This creates a temporary table with ProductName, Sales, and Profit—exists only during evaluation.

---

**SUMMARIZE Function**

**Purpose:** Creates a summary table with specified groupings and optional aggregations.

**Syntax:**
```DAX
SUMMARIZE(
    <table>,
    <groupBy_columnName>,
    [<groupBy_columnName>]...,
    [<name>, <expression>]...
)
```

**Parameters:**
1. **table** - Source table
2. **groupBy_columnName** - Columns to group by
3. **name, expression** - (Optional) Additional calculated columns

**Example: Sales by Category and Region**
```DAX
Sales by Category Region = 
SUMMARIZE(
    Sales,
    Products[Category],
    Geography[Region],
    "Total Sales", SUM(Sales[Revenue]),
    "Total Quantity", SUM(Sales[Quantity])
)
```

**Returns a table:**
```
Category        Region    Total Sales    Total Quantity
Electronics     East      $500,000       1,200
Electronics     West      $450,000       1,100
Furniture       East      $300,000       800
...
```

**Important:** SUMMARIZE can have issues with filter context. Modern practice prefers SUMMARIZECOLUMNS for new code.

---

**ADDCOLUMNS Function**

**Purpose:** Adds calculated columns to an existing table expression.

**Syntax:**
```DAX
ADDCOLUMNS(
    <table>,
    <name>, <expression>,
    [<name>], [<expression>]...
)
```

**Example: Add profit margin to product table**
```DAX
Products with Margin = 
ADDCOLUMNS(
    VALUES(Products[ProductName]),
    "Sales", [Total Sales],
    "Profit", [Total Profit],
    "Margin %", DIVIDE([Total Profit], [Total Sales])
)
```

**Key difference from SUMMARIZE:** ADDCOLUMNS doesn't group—it adds columns to existing rows.

**Practical pattern:**
```DAX
Top 10 Products with Details = 
VAR ProductsWithMetrics = 
    ADDCOLUMNS(
        VALUES(Products[ProductName]),
        "Sales", [Total Sales],
        "Profit", [Total Profit],
        "Orders", [Total Orders]
    )
VAR Top10 = 
    TOPN(10, ProductsWithMetrics, [Sales], DESC)
RETURN
Top10
```

---

**SELECTCOLUMNS Function**

**Purpose:** Creates a new table with selected columns, optionally renaming them.

**Syntax:**
```DAX
SELECTCOLUMNS(
    <table>,
    <name>, <expression>,
    [<name>], [<expression>]...
)
```

**Example: Extract and rename columns**
```DAX
Customer Summary = 
SELECTCOLUMNS(
    Customers,
    "Customer ID", Customers[CustomerKey],
    "Customer Name", Customers[FirstName] & " " & Customers[LastName],
    "City", Customers[City],
    "Total Purchases", [Total Orders]
)
```

**Use cases:**
- Simplify table structures
- Rename columns for clarity
- Extract subset of columns
- Combine with other table functions

**Difference from ADDCOLUMNS:**
- **SELECTCOLUMNS:** Creates new table with ONLY specified columns
- **ADDCOLUMNS:** Keeps original columns AND adds new ones

---

**GROUPBY Function**

**Purpose:** Groups rows and applies aggregations, offering more control than SUMMARIZE.

**Syntax:**
```DAX
GROUPBY(
    <table>,
    [<groupBy_columnName>]...,
    [<name>, <expression>]...
)
```

**Key difference:** Expressions in GROUPBY must use iterator functions (SUMX, COUNTX, etc.).

**Example:**
```DAX
Sales by Category = 
GROUPBY(
    Sales,
    Products[Category],
    "Total Revenue", SUMX(CURRENTGROUP(), Sales[Revenue]),
    "Avg Order Value", AVERAGEX(CURRENTGROUP(), Sales[Revenue])
)
```

**CURRENTGROUP()** - Refers to the current group of rows being evaluated.

**When to use GROUPBY:**
- Need aggregations over grouped rows
- Require complex aggregation logic
- Want explicit control over aggregation functions

---

**Common DAX Patterns**

**Pattern 1: Previous Period Comparison**

```DAX
Sales vs Last Month = 
VAR CurrentSales = [Total Sales]
VAR LastMonthSales = CALCULATE([Total Sales], DATEADD(Calendar[Date], -1, MONTH))
VAR Variance = CurrentSales - LastMonthSales
VAR VariancePercent = DIVIDE(Variance, LastMonthSales)
RETURN
IF(
    NOT ISBLANK(LastMonthSales),
    VariancePercent,
    BLANK()
)
```

**When to use:** Time-based comparisons with multiple calculations.

---

**Pattern 2: Conditional Aggregation**

```DAX
Sales High Value Customers = 
VAR HighValueCustomers = 
    CALCULATETABLE(
        VALUES(Customers[CustomerKey]),
        [Total Revenue] > 10000
    )
RETURN
CALCULATE(
    [Total Sales],
    HighValueCustomers
)
```

**When to use:** Calculate metrics for a filtered subset identified by criteria.

---

**Pattern 3: Running Total with Variables**

```DAX
Running Total Sales = 
VAR CurrentDate = MAX(Calendar[Date])
RETURN
CALCULATE(
    [Total Sales],
    FILTER(
        ALL(Calendar[Date]),
        Calendar[Date] <= CurrentDate
    )
)
```

**When to use:** Cumulative calculations where current context determines cutoff.

---

**Pattern 4: Top N Contributors**

```DAX
Top 5 Customers Revenue = 
VAR Top5Customers = 
    TOPN(
        5,
        ALL(Customers[CustomerName]),
        [Total Revenue],
        DESC
    )
RETURN
CALCULATE(
    [Total Revenue],
    Top5Customers
)

Top 5 % of Total = 
DIVIDE([Top 5 Customers Revenue], [Total Revenue])
```

**When to use:** Concentration analysis, identifying key contributors.

---

**Pattern 5: Multi-Step Calculation with Virtual Table**

```DAX
Avg Sales per Product per Region = 
VAR SummaryTable = 
    SUMMARIZE(
        Sales,
        Products[ProductName],
        Geography[Region],
        "Regional Sales", [Total Sales]
    )
VAR AvgSales = 
    AVERAGEX(
        SummaryTable,
        [Regional Sales]
    )
RETURN
AvgSales
```

**When to use:** Need to aggregate at one level, then calculate across aggregated values.

---

**Pattern 6: Conditional Ranking**

```DAX
Rank If Qualifies = 
VAR MeetsThreshold = [Total Sales] >= 50000
VAR Rank = 
    IF(
        MeetsThreshold,
        RANKX(
            FILTER(
                ALL(Products[ProductName]),
                [Total Sales] >= 50000
            ),
            [Total Sales],
            ,
            DESC
        ),
        BLANK()
    )
RETURN
Rank
```

**When to use:** Rank only items meeting specific criteria.

---

**Pattern 7: Dynamic Aggregation Based on Parameter**

```DAX
Dynamic Metric = 
VAR SelectedMetric = SELECTEDVALUE(MetricParameter[Metric], "Sales")
VAR Result = 
    SWITCH(
        SelectedMetric,
        "Sales", [Total Sales],
        "Profit", [Total Profit],
        "Orders", [Total Orders],
        "Customers", [Customer Count],
        BLANK()
    )
RETURN
Result
```

**When to use:** Let users choose which metric to analyze via slicer.

---

**Pattern 8: Same Period Last Year with Multiple Metrics**

```DAX
YoY Comparison Card = 
VAR CurrentSales = [Total Sales]
VAR LastYearSales = CALCULATE([Total Sales], SAMEPERIODLASTYEAR(Calendar[Date]))
VAR Variance = CurrentSales - LastYearSales
VAR Growth = DIVIDE(Variance, LastYearSales)
RETURN
"Current: " & FORMAT(CurrentSales, "$#,##0") & 
" | Last Year: " & FORMAT(LastYearSales, "$#,##0") & 
" | Growth: " & FORMAT(Growth, "0.0%")
```

**When to use:** Create compact text displays combining multiple metrics.

---

**Pattern 9: Proportional Allocation**

```DAX
Product % of Category Sales = 
VAR ProductSales = [Total Sales]
VAR CategorySales = 
    CALCULATE(
        [Total Sales],
        ALLEXCEPT(Products, Products[Category])
    )
RETURN
DIVIDE(ProductSales, CategorySales)
```

**When to use:** Show each item's contribution to its group total.

---

**Pattern 10: Complex Filter with Multiple Conditions**

```DAX
Qualified Customers Revenue = 
VAR QualifiedCustomers = 
    CALCULATETABLE(
        VALUES(Customers[CustomerKey]),
        [Total Orders] >= 5,
        [Total Revenue] > 5000,
        [Days Since Last Purchase] <= 90
    )
RETURN
CALCULATE(
    [Total Revenue],
    QualifiedCustomers
)
```

**When to use:** Multi-criteria segmentation requiring multiple measure evaluations.

---

**When to Use Variables vs Direct Expressions**

**Use variables when:**
✅ Expression is used multiple times in the measure
✅ Expression is computationally expensive (CALCULATE, complex aggregations)
✅ Code clarity would improve with named intermediate steps
✅ Debugging complex measures
✅ Building multi-step calculations

**Use direct expressions when:**
✅ Expression used only once
✅ Very simple expressions (SUM, COUNT)
✅ Context must change for the expression (don't store beforehand)

**Example: When NOT to use variable**
```DAX
// ❌ Don't do this - variable defeats the purpose
Total Sales All Regions = 
VAR StoredSales = [Total Sales]  -- Captures current region's sales
RETURN
CALCULATE(StoredSales, ALL(Geography[Region]))  -- Doesn't give all regions!

// ✅ Correct - Let CALCULATE modify context
Total Sales All Regions = 
CALCULATE([Total Sales], ALL(Geography[Region]))
```

---

**Virtual Table Performance Considerations**

**Virtual tables are powerful but can be expensive:**

**Good practices:**
✅ Limit table size—filter early in the expression
✅ Use VALUES/ALL instead of full table scans when possible
✅ Store virtual table in variable if reused multiple times
✅ Avoid nested iterations over large virtual tables

**Example optimization:**
```DAX
// ❌ Inefficient - Creates large virtual table
Avg Sales by Product = 
AVERAGEX(
    SUMMARIZE(Sales, Products[ProductName], "Sales", [Total Sales]),
    [Sales]
)

// ✅ Better - Use VALUES instead
Avg Sales by Product = 
AVERAGEX(
    VALUES(Products[ProductName]),
    [Total Sales]
)
```

**Rule:** Start with smallest table possible, then add what you need.

---

**Debugging Complex Measures**

**Technique 1: Break into separate measures**

Instead of one 50-line measure, create separate measures for each step. Once working, combine.

**Technique 2: Use variables to inspect intermediate values**

```DAX
Debug Measure = 
VAR Step1 = [Total Sales]
VAR Step2 = [Total Cost]
VAR Step3 = Step1 - Step2
VAR Step4 = DIVIDE(Step3, Step1)
RETURN
Step4  -- Change this to Step1, Step2, etc. to inspect each step
```

**Technique 3: Use CONCATENATEX to display table contents**

```DAX
Display Virtual Table = 
VAR MyTable = 
    TOPN(5, VALUES(Products[ProductName]), [Total Sales])
RETURN
CONCATENATEX(MyTable, Products[ProductName], ", ")
```
Shows contents of virtual table as text for verification.

**Technique 4: Check for BLANK() or error values**

```DAX
Safe Division = 
VAR Numerator = [Total Profit]
VAR Denominator = [Total Sales]
RETURN
IF(
    ISBLANK(Denominator) || Denominator = 0,
    BLANK(),
    DIVIDE(Numerator, Denominator)
)
```

---

## 4️⃣ Essential DAX Formulas

### Basic Variable Patterns

**Simple Variable Storage**
```DAX
Profit with Variables = 
VAR TotalRevenue = SUM(Sales[Revenue])
VAR TotalCost = SUM(Sales[Cost])
VAR TotalProfit = TotalRevenue - TotalCost
RETURN
TotalProfit
```
**Use:** Store intermediate calculations for clarity.

---

**Variable for Performance**
```DAX
Profit Margin Optimized = 
VAR TotalRevenue = SUM(Sales[Revenue])
VAR TotalCost = SUM(Sales[Cost])
VAR TotalProfit = TotalRevenue - TotalCost
RETURN
DIVIDE(TotalProfit, TotalRevenue)
```
**Use:** Calculate expensive expressions once, reuse multiple times.

---

**Conditional Logic with Variables**
```DAX
Sales Tier = 
VAR TotalSales = [Total Sales]
RETURN
SWITCH(
    TRUE(),
    TotalSales >= 100000, "Platinum",
    TotalSales >= 50000, "Gold",
    TotalSales >= 25000, "Silver",
    "Bronze"
)
```
**Use:** Clean conditional logic with readable variable names.

---

### Context-Aware Variables

**Capture Current Context**
```DAX
Sales vs Average = 
VAR CurrentSales = [Total Sales]
VAR OverallAvg = CALCULATE([Total Sales], ALL(Products))
VAR Difference = CurrentSales - OverallAvg
RETURN
Difference
```
**Use:** Compare current item to overall average.

---

**Time Intelligence with Variables**
```DAX
YoY Growth = 
VAR CurrentSales = [Total Sales]
VAR LastYearSales = CALCULATE([Total Sales], SAMEPERIODLASTYEAR(Calendar[Date]))
VAR GrowthAmount = CurrentSales - LastYearSales
VAR GrowthPercent = DIVIDE(GrowthAmount, LastYearSales)
RETURN
GrowthPercent
```
**Use:** Multi-step time comparison calculations.

---

**Previous Period Comparison**
```DAX
MoM Change = 
VAR CurrentMonth = [Total Sales]
VAR PreviousMonth = CALCULATE([Total Sales], DATEADD(Calendar[Date], -1, MONTH))
VAR Change = CurrentMonth - PreviousMonth
VAR ChangePercent = DIVIDE(Change, PreviousMonth)
RETURN
IF(NOT ISBLANK(PreviousMonth), ChangePercent, BLANK())
```
**Use:** Month-over-month or any period comparison.

---

### Virtual Table Creation

**SUMMARIZE Example**
```DAX
Sales Summary Table = 
SUMMARIZE(
    Sales,
    Products[Category],
    Geography[Region],
    "Total Sales", SUM(Sales[Revenue]),
    "Total Quantity", SUM(Sales[Quantity]),
    "Avg Price", DIVIDE(SUM(Sales[Revenue]), SUM(Sales[Quantity]))
)
```
**Use:** Create summary table with groupings and aggregations.

---

**ADDCOLUMNS Example**
```DAX
Products with Metrics = 
ADDCOLUMNS(
    VALUES(Products[ProductName]),
    "Sales", [Total Sales],
    "Profit", [Total Profit],
    "Margin", DIVIDE([Total Profit], [Total Sales]),
    "Rank", RANKX(ALL(Products[ProductName]), [Total Sales],, DESC)
)
```
**Use:** Add calculated columns to existing table.

---

**SELECTCOLUMNS Example**
```DAX
Customer List Clean = 
SELECTCOLUMNS(
    Customers,
    "ID", Customers[CustomerKey],
    "Full Name", Customers[FirstName] & " " & Customers[LastName],
    "Location", Customers[City] & ", " & Customers[State],
    "Revenue", [Total Revenue]
)
```
**Use:** Create clean table with renamed/calculated columns.

---

**GROUPBY Example**
```DAX
Category Sales Grouped = 
GROUPBY(
    Sales,
    Products[Category],
    "Total Revenue", SUMX(CURRENTGROUP(), Sales[Revenue]),
    "Avg Transaction", AVERAGEX(CURRENTGROUP(), Sales[Revenue]),
    "Order Count", COUNTX(CURRENTGROUP(), Sales[OrderKey])
)
```
**Use:** Group with custom aggregations using iterators.

---

### Complex Pattern Combinations

**Top N with Virtual Table**
```DAX
Top 10 Products Revenue = 
VAR ProductTable = 
    ADDCOLUMNS(
        VALUES(Products[ProductName]),
        "Revenue", [Total Revenue]
    )
VAR Top10 = 
    TOPN(10, ProductTable, [Revenue], DESC)
VAR Top10Revenue = 
    SUMX(Top10, [Revenue])
RETURN
Top10Revenue
```
**Use:** Calculate metric for top N items using virtual table.

---

**Running Total with Variables**
```DAX
Running Total Sales = 
VAR CurrentDate = MAX(Calendar[Date])
VAR RunningTotal = 
    CALCULATE(
        [Total Sales],
        FILTER(ALL(Calendar[Date]), Calendar[Date] <= CurrentDate)
    )
RETURN
RunningTotal
```
**Use:** Cumulative calculations up to current point.

---

**Dynamic Grouping**
```DAX
Sales by Selected Dimension = 
VAR SelectedDimension = SELECTEDVALUE(DimensionParameter[Dimension], "Category")
VAR Result = 
    SWITCH(
        SelectedDimension,
        "Category", 
            SUMMARIZE(Sales, Products[Category], "Sales", [Total Sales]),
        "Region", 
            SUMMARIZE(Sales, Geography[Region], "Sales", [Total Sales]),
        "Year", 
            SUMMARIZE(Sales, Calendar[Year], "Sales", [Total Sales]),
        BLANK()
    )
RETURN
Result
```
**Use:** Let users choose grouping dimension dynamically.

---

**Multi-Condition Filtering**
```DAX
VIP Customers Revenue = 
VAR VIPCustomers = 
    CALCULATETABLE(
        VALUES(Customers[CustomerKey]),
        [Total Orders] >= 10,
        [Total Revenue] >= 25000,
        [Days Since Last Purchase] <= 60
    )
VAR VIPRevenue = 
    CALCULATE([Total Revenue], VIPCustomers)
RETURN
VIPRevenue
```
**Use:** Complex segmentation with multiple criteria.

---

### Text and Display Formulas

**Formatted Comparison Display**
```DAX
Sales Comparison Text = 
VAR Current = [Total Sales]
VAR Previous = CALCULATE([Total Sales], DATEADD(Calendar[Date], -1, MONTH))
VAR Change = Current - Previous
VAR ChangePercent = DIVIDE(Change, Previous)
RETURN
"Current: " & FORMAT(Current, "$#,##0") & 
" | Previous: " & FORMAT(Previous, "$#,##0") & 
" | Change: " & FORMAT(ChangePercent, "+0.0%;-0.0%")
```
**Use:** Single text string with multiple formatted metrics.

---

**Rank Position with Context**
```DAX
Rank Display = 
VAR Rank = [Product Rank]
VAR TotalProducts = COUNTROWS(ALL(Products[ProductName]))
VAR Percentile = DIVIDE(TotalProducts - Rank + 1, TotalProducts)
RETURN
"Rank " & Rank & " of " & TotalProducts & " (" & FORMAT(Percentile, "0%") & " percentile)"
```
**Use:** Rich contextual ranking information in one string.

---

**Conditional Badge**
```DAX
Performance Badge = 
VAR Sales = [Total Sales]
VAR AvgSales = CALCULATE([Total Sales], ALL(Products[ProductName]))
VAR Ratio = DIVIDE(Sales, AvgSales)
RETURN
SWITCH(
    TRUE(),
    Ratio >= 2, "⭐⭐⭐ Top Performer",
    Ratio >= 1.5, "⭐⭐ Above Average",
    Ratio >= 0.75, "⭐ Average",
    "⚠️ Below Average"
)
```
**Use:** Visual badges based on performance tiers.

---

### Advanced Aggregation Patterns

**Weighted Average**
```DAX
Weighted Avg Price = 
VAR SummaryTable = 
    ADDCOLUMNS(
        VALUES(Products[ProductKey]),
        "Quantity", SUM(Sales[Quantity]),
        "Revenue", SUM(Sales[Revenue])
    )
VAR TotalQuantity = SUMX(SummaryTable, [Quantity])
VAR WeightedSum = SUMX(SummaryTable, [Quantity] * DIVIDE([Revenue], [Quantity]))
RETURN
DIVIDE(WeightedSum, TotalQuantity)
```
**Use:** Calculate weighted average considering quantities.

---

**Distinct Count with Conditions**
```DAX
Active Customers This Quarter = 
VAR CurrentQuarter = QUARTER(TODAY())
VAR CurrentYear = YEAR(TODAY())
VAR ActiveCustomers = 
    CALCULATETABLE(
        VALUES(Customers[CustomerKey]),
        FILTER(
            ALL(Calendar),
            QUARTER(Calendar[Date]) = CurrentQuarter &&
            YEAR(Calendar[Date]) = CurrentYear
        )
    )
RETURN
COUNTROWS(ActiveCustomers)
```
**Use:** Count distinct items meeting time-based criteria.

---

**Pareto Analysis (80/20 Rule)**
```DAX
Is Top 20% Product = 
VAR CurrentSales = [Total Sales]
VAR ProductTable = 
    ADDCOLUMNS(
        ALL(Products[ProductName]),
        "Sales", [Total Sales]
    )
VAR RankedProducts = 
    ADDCOLUMNS(
        ProductTable,
        "Rank", RANKX(ProductTable, [Sales],, DESC, Dense)
    )
VAR TotalProducts = COUNTROWS(ProductTable)
VAR Top20Threshold = TotalProducts * 0.2
VAR CurrentRank = 
    RANKX(
        ALL(Products[ProductName]),
        [Total Sales],
        CurrentSales,
        DESC,
        Dense
    )
RETURN
CurrentRank <= Top20Threshold
```
**Use:** Identify top 20% contributors.

---

**Customer Lifetime Value Segments**
```DAX
CLV Segment = 
VAR CustomerCLV = [Customer Lifetime Value]
VAR CLVTable = 
    ADDCOLUMNS(
        ALL(Customers[CustomerKey]),
        "CLV", [Customer Lifetime Value]
    )
VAR P80 = PERCENTILEX.INC(CLVTable, [CLV], 0.80)
VAR P50 = PERCENTILEX.INC(CLVTable, [CLV], 0.50)
VAR P20 = PERCENTILEX.INC(CLVTable, [CLV], 0.20)
RETURN
SWITCH(
    TRUE(),
    CustomerCLV >= P80, "High Value",
    CustomerCLV >= P50, "Medium Value",
    CustomerCLV >= P20, "Low Value",
    "Very Low Value"
)
```
**Use:** Segment customers by percentile brackets.

---

### Performance Optimization Patterns

**Optimized Calculation with Variables**
```DAX
Complex Metric Optimized = 
VAR TotalSales = [Total Sales]
VAR TotalCost = [Total Cost]
VAR TotalProfit = TotalSales - TotalCost
VAR Margin = DIVIDE(TotalProfit, TotalSales)
VAR BenchmarkMargin = 0.25
RETURN
IF(
    Margin >= BenchmarkMargin,
    TotalProfit * 1.1,  -- Bonus multiplier
    TotalProfit
)
```
**Use:** Calculate once, use multiple times for efficiency.

---

**Early Filtering**
```DAX
Sales High Performers Only = 
VAR HighPerformers = 
    CALCULATETABLE(
        VALUES(Products[ProductKey]),
        [Total Sales] >= 50000  -- Filter early
    )
VAR Result = 
    CALCULATE(
        [Complex Calculation],  -- Works on smaller subset
        HighPerformers
    )
RETURN
Result
```
**Use:** Filter before expensive operations.

---

**Reusable Virtual Table**
```DAX
Multi-Step Analysis = 
VAR EnrichedTable = 
    ADDCOLUMNS(
        VALUES(Products[ProductName]),
        "Sales", [Total Sales],
        "Profit", [Total Profit],
        "Orders", [Total Orders]
    )
VAR AvgSales = AVERAGEX(EnrichedTable, [Sales])
VAR AvgProfit = AVERAGEX(EnrichedTable, [Profit])
VAR AvgOrders = AVERAGEX(EnrichedTable, [Orders])
RETURN
CONCATENATE(
    "Avg Sales: " & FORMAT(AvgSales, "$#,##0") & " | ",
    "Avg Profit: " & FORMAT(AvgProfit, "$#,##0")
)
```
**Use:** Create virtual table once, use for multiple calculations.

---

## 5️⃣ Hands-On Practice Exercises

### Exercise 1: Basic Variables for Clarity
**Objective:** Refactor a complex measure using variables.

**Given messy measure:**
```DAX
Messy Profit Margin = 
DIVIDE(
    SUM(Sales[Revenue]) - SUM(Sales[Cost]),
    SUM(Sales[Revenue])
)
```

**Your task:**
1. Rewrite using variables for Revenue, Cost, and Profit
2. Make the formula self-documenting
3. Verify results match original

**Expected solution:**
```DAX
Clean Profit Margin = 
VAR TotalRevenue = SUM(Sales[Revenue])
VAR TotalCost = SUM(Sales[Cost])
VAR TotalProfit = TotalRevenue - TotalCost
RETURN
DIVIDE(TotalProfit, TotalRevenue)
```

**Validation:** Compare results—should be identical.

---

### Exercise 2: Performance Optimization with Variables
**Objective:** Optimize a measure that calculates the same expression multiple times.

**Given inefficient measure:**
```DAX
Sales Category = 
IF(
    [Total Sales] >= 100000, "High",
    IF([Total Sales] >= 50000, "Medium", "Low")
) & " (" & FORMAT([Total Sales], "$#,##0") & ")"
```

**Your task:**
1. Calculate [Total Sales] once using VAR
2. Reuse in all IF conditions and FORMAT
3. Test performance improvement (if possible)

**Expected outcome:** Cleaner code, same results, potentially faster execution.

---

### Exercise 3: YoY Comparison with Multiple Variables
**Objective:** Create comprehensive year-over-year comparison using variables.

**Your task:**
1. Create measure with variables for:
   - Current year sales
   - Last year sales
   - Variance (difference)
   - Growth percentage
2. Return formatted text: "2024: $X | 2023: $Y | Growth: Z%"

**Starter code:**
```DAX
YoY Comparison = 
VAR CurrentSales = [Total Sales]
VAR LastYearSales = CALCULATE([Total Sales], SAMEPERIODLASTYEAR(Calendar[Date]))
VAR Variance = -- YOUR CODE
VAR Growth = -- YOUR CODE
RETURN
-- YOUR CODE (formatted text)
```

**Expected output:** "2024: $520K | 2023: $450K | Growth: 15.6%"

---

### Exercise 4: Create Virtual Table with ADDCOLUMNS
**Objective:** Build a virtual table with product metrics.

**Your task:**
1. Use ADDCOLUMNS to create table with:
   - ProductName
   - Total Sales
   - Total Profit
   - Profit Margin %
2. Use in CONCATENATEX to display top 5 products

**Starter code:**
```DAX
Top 5 Products Display = 
VAR ProductTable = 
    ADDCOLUMNS(
        VALUES(Products[ProductName]),
        -- YOUR CODE
    )
VAR Top5 = TOPN(5, ProductTable, -- YOUR CODE)
RETURN
CONCATENATEX(Top5, -- YOUR CODE, ", ")
```

**Expected outcome:** "Laptop (32%), Phone (28%), Tablet (18%), Monitor (15%), Keyboard (7%)"

---

### Exercise 5: SUMMARIZE for Grouped Analysis
**Objective:** Create a summary table and calculate averages across groups.

**Your task:**
1. Use SUMMARIZE to create table with:
   - Category
   - Region
   - Total Sales for each combination
2. Calculate average sales per category-region combination
3. Display the result

**Starter code:**
```DAX
Avg Sales per Category-Region = 
VAR SummaryTable = 
    SUMMARIZE(
        Sales,
        -- YOUR CODE
    )
VAR AvgSales = AVERAGEX(SummaryTable, -- YOUR CODE)
RETURN
AvgSales
```

**Expected outcome:** Average sales value across all category-region combinations.

---

### Exercise 6: Conditional Filtering with Virtual Table
**Objective:** Calculate revenue from high-value customers only.

**Your task:**
1. Use CALCULATETABLE to create table of customers where:
   - Total Orders >= 5
   - Total Revenue >= $10,000
2. Calculate total revenue from these customers
3. Calculate percentage of total revenue

**Starter code:**
```DAX
High Value Customer Revenue = 
VAR HighValueCustomers = 
    CALCULATETABLE(
        VALUES(Customers[CustomerKey]),
        -- YOUR CODE (conditions)
    )
RETURN
CALCULATE([Total Revenue], HighValueCustomers)

High Value % of Total = 
DIVIDE([High Value Customer Revenue], [Total Revenue])
```

**Validation:** Should see lower total than overall revenue, representing subset.

---

### Exercise 7: Running Total with Variables
**Objective:** Create a running total measure using proper variable capture.

**Your task:**
1. Capture the current date in context
2. Calculate total sales for all dates up to and including current date
3. Test in table visual with dates to verify cumulative behavior

**Starter code:**
```DAX
Running Total Sales = 
VAR CurrentDate = -- YOUR CODE
RETURN
CALCULATE(
    [Total Sales],
    FILTER(
        ALL(Calendar[Date]),
        -- YOUR CODE (filter condition)
    )
)
```

**Validation:** Each row should show cumulative total up to that date.

---

### Exercise 8: Top N Contributors Percentage
**Objective:** Find percentage contribution of top N customers.

**Your task:**
1. Create parameter table for N (values: 5, 10, 20, 50)
2. Calculate total revenue from top N customers
3. Calculate as percentage of all revenue
4. Make N dynamic based on parameter selection

**Starter code:**
```DAX
Top N Customers Revenue = 
VAR N = SELECTEDVALUE('Top N Parameter'[Value], 10)
VAR TopNCustomers = 
    TOPN(
        N,
        -- YOUR CODE
    )
RETURN
CALCULATE([Total Revenue], TopNCustomers)
```

**Test:** Change N in slicer, verify percentage updates.

---

### Exercise 9: Multi-Step Calculation Pattern
**Objective:** Calculate average profit margin per product, then find products above average.

**Your task:**
1. Create virtual table with product-level margins
2. Calculate overall average margin
3. Count how many products exceed average
4. Display count and overall average

**Starter code:**
```DAX
Products Above Avg Margin = 
VAR ProductMargins = 
    ADDCOLUMNS(
        VALUES(Products[ProductName]),
        "Margin", -- YOUR CODE
    )
VAR AvgMargin = AVERAGEX(ProductMargins, [Margin])
VAR AboveAvgCount = 
    COUNTROWS(
        FILTER(ProductMargins, -- YOUR CODE)
    )
RETURN
AboveAvgCount & " products above " & FORMAT(AvgMargin, "0.0%") & " avg margin"
```

**Expected outcome:** "23 products above 32.5% avg margin"

---

### Exercise 10: Complex Segmentation
**Objective:** Create customer segments based on multiple criteria using variables.

**Your task:**
1. Calculate customer metrics: Total Revenue, Total Orders, Days Since Last Purchase
2. Create segment logic:
   - VIP: Revenue > $50K AND Orders >= 10 AND Last Purchase < 30 days
   - Loyal: Revenue > $25K AND Orders >= 5
   - Active: Last Purchase < 90 days
   - At Risk: Last Purchase > 90 days
   - Lost: Last Purchase > 180 days
3. Return segment name

**Starter code:**
```DAX
Customer Segment = 
VAR Revenue = [Total Revenue]
VAR Orders = [Total Orders]
VAR DaysSinceLastPurchase = [Days Since Last Purchase]
RETURN
SWITCH(
    TRUE(),
    -- YOUR CODE (conditions for each segment)
)
```

**Test:** Apply to customer table, verify sensible segmentation.

---

### Bonus Challenge: Pareto Analysis
**Objective:** Identify which products contribute to 80% of revenue.

**Your task:**
1. Create virtual table with products and sales
2. Add rank and running total percentage
3. Flag products in top 80% cumulative
4. Count how many products = 80% of revenue

**This is complex—requires:**
- ADDCOLUMNS to build enriched table
- RANKX for ordering
- Running total calculation
- Conditional logic

**Guidance:**
```DAX
Top 80% Product Count = 
VAR ProductTable = 
    ADDCOLUMNS(
        ALL(Products[ProductName]),
        "Sales", [Total Sales]
    )
VAR RankedTable = 
    ADDCOLUMNS(
        ProductTable,
        "Rank", RANKX(ProductTable, [Sales],, DESC)
    )
VAR TotalSales = SUMX(ProductTable, [Sales])
-- Add running total logic
-- Count products where running % <= 0.80
```

**Expected insight:** "47 products (12% of catalog) generate 80% of revenue"

---

## 6️⃣ Common Mistakes & Troubleshooting

### Mistake 1: Using Variables When Context Needs to Change

**Symptom:** Variable doesn't reflect expected filter context changes.

**Problem:**
```DAX
// ❌ Wrong - Captures current context
Total All Regions = 
VAR CurrentSales = [Total Sales]  -- Stores sales in current region
RETURN
CALCULATE(CurrentSales, ALL(Geography[Region]))  -- Doesn't recalculate!
```

**Why it fails:** Variable captures [Total Sales] in current context (e.g., West region). When CALCULATE changes context to ALL regions, the variable still holds West's value.

**Solution:**
```DAX
// ✅ Correct - Don't store if context needs to change
Total All Regions = 
CALCULATE([Total Sales], ALL(Geography[Region]))
```

**Rule:** If an expression should evaluate in a different context, don't store it in a variable beforehand.

---

### Mistake 2: Forgetting RETURN Statement

**Symptom:** Syntax error or measure doesn't work.

**Problem:**
```DAX
// ❌ Missing RETURN
Sales Analysis = 
VAR TotalSales = [Total Sales]
VAR TotalCost = [Total Cost]
TotalSales - TotalCost  -- ❌ No RETURN!
```

**Solution:**
```DAX
// ✅ Always end with RETURN
Sales Analysis = 
VAR TotalSales = [Total Sales]
VAR TotalCost = [Total Cost]
RETURN
TotalSales - TotalCost
```

**Rule:** VAR statements MUST be followed by RETURN expression.

---

### Mistake 3: Incorrect Table Function Syntax

**Symptom:** Error or unexpected results from SUMMARIZE/ADDCOLUMNS.

**Problem:**
```DAX
// ❌ Wrong parameter order
Product Summary = 
ADDCOLUMNS(
    "Sales", [Total Sales],  -- ❌ Name before table
    VALUES(Products[ProductName])
)
```

**Solution:**
```DAX
// ✅ Correct - Table first, then name-expression pairs
Product Summary = 
ADDCOLUMNS(
    VALUES(Products[ProductName]),  -- Table first
    "Sales", [Total Sales]           -- Then name/expression pairs
)
```

**Rule:** Always: `ADDCOLUMNS(<table>, "Name", <expression>, ...)`

---

### Mistake 4: Using SUMMARIZE with Complex Calculations

**Symptom:** Incorrect aggregation results or unexpected filter behavior.

**Problem:**
```DAX
// ❌ SUMMARIZE can have issues with complex expressions
Sales Summary = 
SUMMARIZE(
    Sales,
    Products[Category],
    "Total Sales", [Total Sales],  -- Complex measure might not work as expected
    "Avg Sales", [Avg Sales]
)
```

**Why problematic:** SUMMARIZE evaluates expressions in different row context, can produce unexpected results with complex measures.

**Solution: Use ADDCOLUMNS + VALUES**
```DAX
// ✅ More predictable behavior
Sales Summary = 
ADDCOLUMNS(
    VALUES(Products[Category]),
    "Total Sales", [Total Sales],
    "Avg Sales", [Avg Sales]
)
```

**Modern best practice:** For new code, prefer SUMMARIZECOLUMNS or ADDCOLUMNS/SELECTCOLUMNS over SUMMARIZE.

---

### Mistake 5: Not Handling BLANK() in Virtual Tables

**Symptom:** Unexpected results when some rows have blank values.

**Problem:**
```DAX
// ❌ Doesn't handle products with no sales
Product Rank = 
RANKX(
    ADDCOLUMNS(
        ALL(Products[ProductName]),
        "Sales", [Total Sales]
    ),
    [Sales]
)
```

**Solution:**
```DAX
// ✅ Filter out blanks
Product Rank = 
VAR ProductTable = 
    FILTER(
        ADDCOLUMNS(
            ALL(Products[ProductName]),
            "Sales", [Total Sales]
        ),
        [Sales] > 0  -- Exclude products with no sales
    )
RETURN
RANKX(ProductTable, [Sales],, DESC)
```

---

### Mistake 6: Creating Unnecessarily Large Virtual Tables

**Symptom:** Slow performance, long query times.

**Problem:**
```DAX
// ❌ Creates virtual table with millions of rows
Avg Transaction by Product = 
VAR LargeTable = 
    ADDCOLUMNS(
        Sales,  -- Millions of transaction rows!
        "Product", RELATED(Products[ProductName])
    )
RETURN
AVERAGEX(LargeTable, Sales[Revenue])
```

**Solution:**
```DAX
// ✅ Work at product level, not transaction level
Avg Transaction by Product = 
AVERAGEX(
    VALUES(Products[ProductName]),
    [Avg Transaction Value]  -- Let measure do the aggregation
)
```

**Rule:** Start with the smallest grain necessary, aggregate up, not down.

---

### Mistake 7: Reusing Variable Names Incorrectly

**Symptom:** Confusion about which variable holds what, or syntax errors.

**Problem:**
```DAX
// ❌ Confusing variable names
Measure = 
VAR X = [Total Sales]
VAR X = [Total Cost]  -- ❌ Can't redeclare same name
RETURN X
```

**Solution:**
```DAX
// ✅ Unique, descriptive names
Measure = 
VAR TotalSales = [Total Sales]
VAR TotalCost = [Total Cost]
VAR TotalProfit = TotalSales - TotalCost
RETURN TotalProfit
```

**Best practice:** Use descriptive variable names that indicate what they hold.

---

### Mistake 8: Wrong Iterator Function in GROUPBY

**Symptom:** Error or unexpected results in GROUPBY.

**Problem:**
```DAX
// ❌ Using SUM instead of SUMX in GROUPBY
Category Sales = 
GROUPBY(
    Sales,
    Products[Category],
    "Total Sales", SUM(Sales[Revenue])  -- ❌ Should be SUMX
)
```

**Why it fails:** GROUPBY requires iterator functions (SUMX, COUNTX, etc.), not simple aggregations.

**Solution:**
```DAX
// ✅ Use SUMX with CURRENTGROUP()
Category Sales = 
GROUPBY(
    Sales,
    Products[Category],
    "Total Sales", SUMX(CURRENTGROUP(), Sales[Revenue])
)
```

---

### Mistake 9: Not Testing Edge Cases

**Symptom:** Measure works in most cases but fails in specific scenarios.

**Common edge cases:**
- Division by zero
- No data for time period (first year has no "last year")
- BLANK() values
- Filtering to empty set

**Problem example:**
```DAX
// ❌ Doesn't handle missing data
YoY Growth = 
VAR Current = [Total Sales]
VAR LastYear = CALCULATE([Total Sales], SAMEPERIODLASTYEAR(Calendar[Date]))
RETURN
(Current - LastYear) / LastYear  -- Fails if LastYear is blank
```

**Solution:**
```DAX
// ✅ Handles blanks gracefully
YoY Growth = 
VAR Current = [Total Sales]
VAR LastYear = CALCULATE([Total Sales], SAMEPERIODLASTYEAR(Calendar[Date]))
RETURN
IF(
    NOT ISBLANK(LastYear) && LastYear <> 0,
    DIVIDE(Current - LastYear, LastYear),
    BLANK()
)
```

---

### Mistake 10: Over-Complicating with Variables

**Symptom:** Code is harder to read despite using variables.

**Problem:**
```DAX
// ❌ Too many variables for simple measure
Simple Sum = 
VAR Table1 = Sales
VAR Column1 = Sales[Revenue]
VAR Aggregation = SUM(Column1)
RETURN Aggregation
```

**Solution:**
```DAX
// ✅ Use variables only when they add value
Simple Sum = SUM(Sales[Revenue])
```

**Guideline:** Use variables for:
- Repeated expressions
- Complex calculations needing names
- Performance optimization
- Improving readability

Don't use variables for simple, one-off expressions.

---

## 7️⃣ Interview-Oriented Questions

### Question 1: Explain VAR in DAX
**Interviewer:** "What are variables in DAX and why would you use them?"

**Strong Answer:**
"Variables in DAX, declared with the VAR keyword, are placeholders that store the result of an expression for reuse within a measure. They offer several key benefits:

**1. Performance:** Variables calculate their expression once and reuse the stored value, avoiding redundant calculations. For example:
```DAX
Profit Margin = 
VAR Revenue = SUM(Sales[Revenue])  -- Calculated once
VAR Cost = SUM(Sales[Cost])        -- Calculated once
VAR Profit = Revenue - Cost
RETURN DIVIDE(Profit, Revenue)
```
Without variables, Revenue would be calculated twice—once in subtraction, once in DIVIDE.

**2. Readability:** Variables make complex measures self-documenting by naming intermediate steps. Compare:
```DAX
// Hard to understand
DIVIDE(SUM(Sales[Revenue]) - SUM(Sales[Cost]), SUM(Sales[Revenue]))

// Clear and readable
VAR Revenue = SUM(Sales[Revenue])
VAR Cost = SUM(Sales[Cost])
RETURN DIVIDE(Revenue - Cost, Revenue)
```

**3. Debugging:** You can inspect intermediate values by temporarily returning different variables to isolate issues.

**Important caveat:** Variables capture their value in the context where they're defined. If you need an expression to evaluate in a different context (like after CALCULATE), don't store it in a variable first—let CALCULATE modify the context naturally.

Variables are essential for enterprise-grade DAX—they make code maintainable, performant, and understandable."

**Why this is strong:**
- Explains multiple benefits
- Provides code examples
- Mentions important caveat
- Shows practical application

---

### Question 2: Variable Context Capture
**Interviewer:** "What does 'variables capture context' mean? Give an example where this causes problems."

**Strong Answer:**
"Variables evaluate their expression immediately when defined, capturing the current filter context at that moment. The stored value doesn't change even if later operations modify the context.

**Example of the problem:**
```DAX
// ❌ This doesn't work as intended
Sales All Regions = 
VAR CurrentSales = [Total Sales]  -- Captures sales in current region (e.g., 'West')
RETURN
CALCULATE(CurrentSales, ALL(Geography[Region]))  -- Context changes but variable doesn't!
```

If you're viewing West region, CurrentSales stores West's sales. Even though CALCULATE changes context to ALL regions, the variable still holds West's value, not the total across all regions.

**Correct approach:**
```DAX
// ✅ Let CALCULATE evaluate in new context
Sales All Regions = 
CALCULATE([Total Sales], ALL(Geography[Region]))
```

**When variables ARE useful for context:**
```DAX
// ✅ Correct usage - Comparing contexts
Sales vs Overall = 
VAR CurrentSales = [Total Sales]  -- Capture current context
VAR OverallSales = CALCULATE([Total Sales], ALL(Products))  -- Different context
VAR Difference = CurrentSales - OverallSales
RETURN Difference
```

Here we explicitly WANT both values—current and overall—so storing in variables is appropriate.

**Rule of thumb:** If you need an expression to evaluate in multiple contexts, evaluate it multiple times with context modifiers. If you need to compare different contexts, store each context's result in separate variables."

**Why this is strong:**
- Clear explanation of concept
- Shows problematic example
- Provides correct alternative
- Demonstrates appropriate usage

---

### Question 3: SUMMARIZE vs ADDCOLUMNS
**Interviewer:** "What's the difference between SUMMARIZE and ADDCOLUMNS? When would you use each?"

**Strong Answer:**
"Both create virtual tables, but they work differently:

**SUMMARIZE:**
- Groups rows by specified columns
- Optionally adds aggregations
- Primarily used for grouping/summarizing

```DAX
SUMMARIZE(
    Sales,
    Products[Category],
    Geography[Region],
    "Total Sales", SUM(Sales[Revenue])
)
```
Returns one row per unique Category-Region combination with aggregated sales.

**ADDCOLUMNS:**
- Takes existing table and adds calculated columns
- Doesn't group—works row-by-row
- More flexible for row-level calculations

```DAX
ADDCOLUMNS(
    VALUES(Products[ProductName]),
    "Sales", [Total Sales],
    "Rank", RANKX(ALL(Products[ProductName]), [Total Sales])
)
```
Returns one row per product with additional calculated columns.

**When to use SUMMARIZE:**
- Need to group data by multiple dimensions
- Creating summaries at different grain than source table
- Example: Group transactions by Category and Region

**When to use ADDCOLUMNS:**
- Starting with dimension table, adding measures
- Need row-by-row calculations, not grouping
- Example: Add metrics to existing product list

**Important note:** Modern best practice prefers SUMMARIZECOLUMNS or ADDCOLUMNS over SUMMARIZE for new development, as SUMMARIZE can have unexpected filter context behavior with complex measures.

**Practical pattern I use:**
```DAX
// Start with VALUES (unique items), add measures with ADDCOLUMNS
VAR ProductTable = 
    ADDCOLUMNS(
        VALUES(Products[ProductName]),
        "Sales", [Total Sales],
        "Profit", [Total Profit]
    )
```
This is clearer and more predictable than SUMMARIZE for most scenarios."

**Why this is strong:**
- Clear differentiation
- Code examples for each
- Explains use cases
- Mentions modern best practices

---

### Question 4: Virtual Table Performance
**Interviewer:** "How would you optimize a measure that creates a large virtual table?"

**Strong Answer:**
"Several strategies for optimizing virtual table performance:

**1. Filter early to reduce table size**
```DAX
// ❌ Inefficient - Large table
VAR AllProducts = 
    ADDCOLUMNS(
        ALL(Products),
        "Sales", [Total Sales]
    )

// ✅ Better - Filter first
VAR ActiveProducts = 
    ADDCOLUMNS(
        FILTER(ALL(Products), [Total Sales] > 0),
        "Sales", [Total Sales]
    )
```

**2. Start with smallest grain necessary**
```DAX
// ❌ Don't start with transaction table
VAR BadTable = ADDCOLUMNS(Sales, ...)  -- Millions of rows

// ✅ Start with dimension
VAR GoodTable = ADDCOLUMNS(VALUES(Products[ProductName]), ...)  -- Hundreds of rows
```

**3. Store and reuse virtual tables**
```DAX
// ✅ Calculate once, use multiple times
VAR ProductMetrics = 
    ADDCOLUMNS(
        VALUES(Products[ProductName]),
        "Sales", [Total Sales],
        "Profit", [Total Profit]
    )
VAR AvgSales = AVERAGEX(ProductMetrics, [Sales])
VAR AvgProfit = AVERAGEX(ProductMetrics, [Profit])
```

**4. Use appropriate aggregation level**
```DAX
// ❌ Over-aggregating
VAR Table = SUMMARIZE(Sales, Products[Product], Geography[Region], ...)

// ✅ Aggregate at needed level only
VAR Table = ADDCOLUMNS(VALUES(Products[Product]), ...)
```

**5. Consider pre-calculating static dimensions**
If the virtual table content doesn't change often (like product categories), consider creating a physical calculated table in the model instead.

**Diagnostic approach:**
1. Use Performance Analyzer to identify slow measures
2. Check size of virtual tables being created
3. Filter earlier in the expression chain
4. Simplify aggregations if possible

**Real example:** Had a report creating a virtual table of all transactions with customer details—millions of rows. Optimized by starting with unique customers instead, reducing from 2M rows to 10K. Performance improved 200x."

**Why this is strong:**
- Multiple concrete strategies
- Before/after code examples
- Diagnostic approach
- Real-world example with impact

---

### Question 5: GROUPBY vs SUMMARIZE
**Interviewer:** "When would you use GROUPBY instead of SUMMARIZE?"

**Strong Answer:**
"GROUPBY and SUMMARIZE both create grouped tables, but GROUPBY offers more explicit control over aggregations:

**Key difference:**
GROUPBY requires iterator functions (SUMX, COUNTX) and uses CURRENTGROUP() to reference the current group's rows.

**SUMMARIZE example:**
```DAX
SUMMARIZE(
    Sales,
    Products[Category],
    "Total Sales", SUM(Sales[Revenue])
)
```

**Equivalent GROUPBY:**
```DAX
GROUPBY(
    Sales,
    Products[Category],
    "Total Sales", SUMX(CURRENTGROUP(), Sales[Revenue])
)
```

**When to use GROUPBY:**

**1. Complex aggregations requiring iterators**
```DAX
GROUPBY(
    Sales,
    Products[Category],
    "WeightedAvg", 
        SUMX(CURRENTGROUP(), Sales[Quantity] * Sales[Price]) /
        SUMX(CURRENTGROUP(), Sales[Quantity])
)
```

**2. Multiple related aggregations over same group**
```DAX
GROUPBY(
    Sales,
    Products[Category],
    "Total Revenue", SUMX(CURRENTGROUP(), Sales[Revenue]),
    "Avg Transaction", AVERAGEX(CURRENTGROUP(), Sales[Revenue]),
    "Max Transaction", MAXX(CURRENTGROUP(), Sales[Revenue])
)
```

**3. When you need explicit row-level iteration**
CURRENTGROUP() gives explicit access to current group's rows for custom logic.

**When SUMMARIZE is fine:**
- Simple aggregations (SUM, COUNT, etc.)
- No complex calculated aggregations
- Working with measures rather than columns

**Modern recommendation:**
For new development, consider **SUMMARIZECOLUMNS** which combines best aspects of both with cleaner syntax:

```DAX
SUMMARIZECOLUMNS(
    Products[Category],
    "Total Sales", SUM(Sales[Revenue])
)
```

In practice, I use GROUPBY when I need the explicit control of CURRENTGROUP() and iterator functions for complex aggregations. For simple grouping, ADDCOLUMNS + VALUES is often clearer."

**Why this is strong:**
- Explains key difference
- Shows equivalent examples
- Provides use cases
- Mentions modern alternative
- Shares practical preference

---

### Question 6: Debugging Complex DAX
**Interviewer:** "How do you debug a complex DAX measure that's returning unexpected results?"

**Strong Answer:**
"I use a systematic approach to debug complex DAX:

**1. Break into components with variables**
```DAX
// Original problematic measure
Complex Measure = 
VAR Step1 = [Some Calculation]
VAR Step2 = [Another Calculation]
VAR Step3 = Step1 + Step2
VAR Step4 = DIVIDE(Step3, [Denominator])
RETURN Step4  -- Change this to Step1, Step2, etc. to inspect
```

By returning different variables, I can inspect intermediate values and identify where things go wrong.

**2. Create separate test measures**
Instead of debugging one 100-line measure, break into:
```DAX
// Test each component separately
Test Step 1 = [Some Calculation]
Test Step 2 = [Another Calculation]
Test Final = [Test Step 1] + [Test Step 2]
```
Once working, combine back into one measure.

**3. Verify filter context**
```DAX
// Check what filters are active
Debug Filters = 
VAR ProductCount = COUNTROWS(VALUES(Products[ProductName]))
VAR RegionCount = COUNTROWS(VALUES(Geography[Region]))
RETURN
"Products: " & ProductCount & " | Regions: " & RegionCount
```

**4. Use CONCATENATEX for virtual table inspection**
```DAX
// See what's in a virtual table
Display Table = 
VAR MyTable = TOPN(5, VALUES(Products[ProductName]), [Total Sales])
RETURN
CONCATENATEX(MyTable, Products[ProductName], ", ")
```

**5. Check for BLANK() handling**
```DAX
// Verify not hitting edge cases
Safe Measure = 
VAR Value = [Complex Calculation]
RETURN
IF(
    ISBLANK(Value),
    "BLANK DETECTED",  -- Helps identify issue
    FORMAT(Value, "#,##0")
)
```

**6. Test edge cases:**
- Empty filter context (select 'Select all')
- Single item selected
- No data scenarios (first year, no 'last year')
- Extreme values

**7. Use Performance Analyzer**
Helps identify if performance is the issue vs logic errors.

**Real example:** Had a YoY growth measure showing 500% growth incorrectly. By returning intermediate variables, discovered last year's sales was capturing wrong year due to inactive relationship. Added USERELATIONSHIP to fix.

**Key principle:** Never try to debug entire complex measure at once—isolate and verify each component."

**Why this is strong:**
- Systematic methodology
- Multiple concrete techniques
- Code examples for each
- Real-world example
- Actionable advice

---

### Question 7: Variables vs Calculated Columns
**Interviewer:** "When would you use variables in measures vs. calculated columns in tables?"

**Strong Answer:**
"Variables and calculated columns both store computed values, but they serve different purposes and have different performance characteristics:

**Variables (in measures):**
- **Evaluation:** Calculated at query time
- **Scope:** Within single measure
- **Performance:** Minimal storage impact, recalculated as needed
- **Use case:** Temporary calculations, dynamic values based on context

**Calculated Columns:**
- **Evaluation:** Calculated at refresh time, stored in model
- **Scope:** Available throughout entire model
- **Performance:** Consumes memory, but fast to query
- **Use case:** Static values, filtering/grouping dimensions

**When to use variables:**
```DAX
// Dynamic calculation depending on context
Profit Margin = 
VAR Revenue = SUM(Sales[Revenue])
VAR Cost = SUM(Sales[Cost])
RETURN DIVIDE(Revenue - Cost, Revenue)
```
Result changes based on visual filters—must be calculated dynamically.

**When to use calculated column:**
```DAX
// Static value per product
Products[Price Tier] = 
SWITCH(
    TRUE(),
    Products[Price] >= 1000, "Premium",
    Products[Price] >= 500, "Mid-range",
    "Budget"
)
```
Same value for each product regardless of context—can be stored.

**Decision factors:**

**Use calculated columns when:**
✅ Value is static (doesn't change with filters)
✅ Need to slice/filter/group by the value
✅ Value needed across multiple measures
✅ Grain is dimension table (small row count)

**Use variables when:**
✅ Value depends on filter context
✅ Temporary intermediate calculation
✅ Avoiding redundant measure calculations
✅ Only needed within one measure

**Memory consideration:**
Calculated columns in fact tables consume significant memory (column × row count). For 10M row fact table, a new column adds 10M values. Variables add no storage cost.

**Example mistake to avoid:**
```DAX
// ❌ Don't add calculated column to fact table
Sales[Profit] = Sales[Revenue] - Sales[Cost]  -- 10M new values stored!

// ✅ Better as measure with variable
Total Profit = 
VAR Revenue = SUM(Sales[Revenue])
VAR Cost = SUM(Sales[Cost])
RETURN Revenue - Cost
```

**Rule of thumb:** Prefer measures with variables unless you specifically need a stored column for slicing/filtering."

**Why this is strong:**
- Clear comparison
- Explains when to use each
- Performance implications
- Practical examples
- Common mistake to avoid

---

## 8️⃣ Session Summary

### Key Takeaways

✅ **Variables (VAR)** - Store intermediate results for performance and readability; evaluate at definition time

✅ **Context Capture** - Variables capture current filter context; don't store values that need to evaluate in different contexts

✅ **Virtual Tables** - Temporary in-memory tables created during query execution for complex calculations

✅ **SUMMARIZE** - Groups and aggregates; modern practice prefers SUMMARIZECOLUMNS or ADDCOLUMNS

✅ **ADDCOLUMNS** - Adds calculated columns to existing table without grouping

✅ **SELECTCOLUMNS** - Creates new table with selected/renamed columns only

✅ **GROUPBY** - Explicit grouping with iterator aggregations using CURRENTGROUP()

✅ **Common Patterns** - Top N analysis, running totals, conditional filtering, multi-step calculations

✅ **Performance** - Filter early, start with smallest grain, reuse virtual tables, avoid large fact table iterations

### Essential Pattern Library

```dax
// Basic variable pattern
Measure with Variables = 
VAR Value1 = [Calculation 1]
VAR Value2 = [Calculation 2]
VAR Result = Value1 + Value2
RETURN Result

// Context comparison
Current vs Overall = 
VAR CurrentValue = [Total Sales]
VAR OverallValue = CALCULATE([Total Sales], ALL(Products))
RETURN CurrentValue - OverallValue

// Virtual table with metrics
Products with Metrics = 
ADDCOLUMNS(
    VALUES(Products[ProductName]),
    "Sales", [Total Sales],
    "Profit", [Total Profit],
    "Margin", DIVIDE([Total Profit], [Total Sales])
)

// Top N analysis
Top 10 Analysis = 
VAR Top10Table = 
    TOPN(10, [Products with Metrics], [Sales], DESC)
VAR Top10Sales = SUMX(Top10Table, [Sales])
RETURN Top10Sales

// Conditional filtering
High Value Customers = 
VAR QualifiedCustomers = 
    CALCULATETABLE(
        VALUES(Customers[CustomerKey]),
        [Total Orders] >= 5,
        [Total Revenue] > 10000
    )
RETURN
CALCULATE([Total Revenue], QualifiedCustomers)

// Running total
Running Total = 
VAR CurrentDate = MAX(Calendar[Date])
RETURN
CALCULATE(
    [Total Sales],
    FILTER(ALL(Calendar[Date]), Calendar[Date] <= CurrentDate)
)

// Multi-step aggregation
Avg Margin Across Products = 
VAR ProductMargins = 
    ADDCOLUMNS(
        VALUES(Products[ProductName]),
        "Margin", DIVIDE([Total Profit], [Total Sales])
    )
RETURN
AVERAGEX(ProductMargins, [Margin])

// Dynamic grouping
Sales by Selected Dimension = 
VAR Dimension = SELECTEDVALUE(Parameter[Dimension])
RETURN
SWITCH(
    Dimension,
    "Category", CALCULATE([Total Sales], ALLEXCEPT(Sales, Products[Category])),
    "Region", CALCULATE([Total Sales], ALLEXCEPT(Sales, Geography[Region])),
    [Total Sales]
)
```

### Interview-Ready Talking Points

🎯 **"Variables calculate once and reuse the stored value, improving both performance and code clarity"**

🎯 **"Variables capture context at definition time—if context needs to change, don't store the expression in a variable"**

🎯 **"Virtual tables enable complex patterns that would be impossible with simple aggregations"**

🎯 **"ADDCOLUMNS adds columns to existing rows; SUMMARIZE groups rows; SELECTCOLUMNS creates new table with specific columns"**

🎯 **"Start virtual tables at the smallest grain necessary, filter early, and reuse tables in variables"**

🎯 **"GROUPBY with CURRENTGROUP() gives explicit control over group-level aggregations"**

🎯 **"Break complex measures into separate test measures or use variables to inspect intermediate values when debugging"**

🎯 **"Modern best practice prefers SUMMARIZECOLUMNS or ADDCOLUMNS over SUMMARIZE for better filter context handling"**

### Debugging Checklist

When a complex measure returns unexpected results:

☑️ Return intermediate variables one at a time to isolate the issue
☑️ Verify filter context with COUNTROWS(VALUES(...))
☑️ Check for BLANK() values in calculations
☑️ Test edge cases (empty selection, single item, no data scenarios)
☑️ Use CONCATENATEX to inspect virtual table contents
☑️ Break into separate measures for each component
☑️ Verify context capture timing for variables

### Performance Optimization Checklist

☑️ Calculate expensive expressions once in variables, reuse multiple times
☑️ Filter virtual tables as early as possible
☑️ Start with dimension tables (VALUES), not fact tables
☑️ Limit virtual table size—don't include unnecessary columns
☑️ Store and reuse virtual tables rather than recreating
☑️ Use Performance Analyzer to identify bottlenecks
☑️ Consider calculated columns for static dimension attributes

### What's Next?

🎓 **You've completed the Core DAX Training Series (Days 3-10)!**

**You've mastered:**
- DAX fundamentals and calculation contexts
- Essential functions (CALCULATE, FILTER, ALL family)
- Time intelligence (YTD, YoY, moving averages)
- Advanced patterns (ranking, variables, virtual tables)

**Next steps in your Power BI journey:**
- **Apply these patterns** to real business problems
- **Build complex dashboards** combining multiple techniques
- **Optimize performance** using best practices learned
- **Study advanced topics** like query optimization, data modeling at scale
- **Explore specific domains** like financial analytics, sales analytics, operational reporting

---

🎉 **Congratulations!** You've completed comprehensive training in advanced DAX patterns. You can now write enterprise-grade DAX code using variables for clarity and performance, create sophisticated virtual tables for complex analysis, and recognize and apply common patterns to solve real business problems. You have the skills to build professional-quality Power BI solutions that executives and analysts trust for decision-making!
