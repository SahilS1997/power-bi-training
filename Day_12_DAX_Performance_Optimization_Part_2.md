# DAY 12 - DAX Performance Optimization Part 2

## 1️⃣ Session Overview

Today you'll master the art of performance optimization—making practical decisions about when to use calculated columns vs measures, implementing aggregation tables, and applying proven optimization patterns. This session focuses on actionable best practices you can immediately apply to your reports. You'll learn the optimization decision-making framework that senior BI developers use to build blazing-fast dashboards that handle millions of rows.

In yesterday's session, you learned the theory—how DAX processes queries internally. Today is all about practice—real-world decisions, trade-offs, and techniques. You'll understand when a calculated column outperforms a measure (and when it doesn't), how aggregation tables can make dashboards 100x faster, and get a comprehensive optimization checklist for production reports. By the end, you'll have a systematic approach to performance tuning that you can apply to any Power BI project.

## 2️⃣ Learning Objectives

- Master the calculated columns vs measures decision framework
- Understand trade-offs: memory, flexibility, refresh time
- Implement aggregation tables for dramatic performance gains
- Learn when to use Import mode vs DirectQuery
- Apply common optimization patterns to real scenarios
- Use performance best practices checklist
- Recognize premature optimization and avoid it
- Build a performance-first mindset for data modeling
- Diagnose and fix common performance bottlenecks systematically

## 3️⃣ Key Concepts (Explained Simply)

### Calculated Columns vs Measures: The Fundamental Choice

This is one of the most important decisions in Power BI performance optimization.

**Calculated Columns:**
- **Evaluated:** At data refresh time (once)
- **Stored:** Physically in the data model (uses memory)
- **Context:** Row context—evaluated row-by-row during refresh
- **Speed:** Fast in queries (already calculated)
- **Flexibility:** Static—doesn't respond to filters/slicers dynamically

**Real-world analogy:** Baking a cake ahead of time and storing it in the fridge. When guests arrive, you just serve it—instant! But you can't change the recipe based on their preferences.

**Measures:**
- **Evaluated:** At query time (every time used)
- **Stored:** Not stored—calculated on demand
- **Context:** Filter context—responds to slicers/filters
- **Speed:** Slower initially but dynamic
- **Flexibility:** Responds to user interactions

**Real-world analogy:** Making a custom drink when guests order. Takes a moment, but perfectly customized to what they want right now.

---

### When to Use Calculated Columns

**✅ Use calculated columns when:**

**1. Static Business Logic**
```DAX
// Age groups never change based on filters
Sales[Customer Age Group] = 
SWITCH(
    TRUE(),
    Sales[Customer Age] < 25, "18-24",
    Sales[Customer Age] < 35, "25-34",
    Sales[Customer Age] < 50, "35-49",
    "50+"
)
```
- This doesn't need to be recalculated per query
- Same result regardless of filters
- Perfect for calculated column!

**2. Used in Slicers/Filters**
```DAX
Products[Price Tier] = 
SWITCH(
    TRUE(),
    Products[Unit Price] < 10, "Budget",
    Products[Unit Price] < 50, "Mid-Range",
    "Premium"
)
```
- Users will filter by Price Tier
- Must be a physical column to be filterable
- Calculated column is required

**3. Row-by-Row Logic Without Aggregation**
```DAX
Orders[Is Large Order] = Orders[Quantity] > 100
Orders[Shipping Days] = DATEDIFF(Orders[OrderDate], Orders[ShipDate], DAY)
```
- Simple row-level calculations
- No aggregation across rows needed
- Efficient as calculated columns

**4. Used in Relationships**
```DAX
Sales[Year-Month] = FORMAT(Sales[Date], "YYYY-MM")
```
- Creating relationship keys
- Must be physical column
- Calculated column required

---

### When to Use Measures

**✅ Use measures when:**

**1. Aggregations**
```DAX
Total Sales = SUM(Sales[Revenue])
Average Order Value = AVERAGE(Sales[OrderAmount])
```
- Aggregating across many rows
- Result depends on filter context
- Always use measures!

**2. Dynamic Calculations**
```DAX
Sales YoY Growth % = 
VAR CurrentYear = [Total Sales]
VAR LastYear = CALCULATE([Total Sales], SAMEPERIODLASTYEAR(Calendar[Date]))
RETURN DIVIDE(CurrentYear - LastYear, LastYear)
```
- Changes based on date selection
- Requires current filter context
- Must be a measure

**3. Complex Business Logic**
```DAX
Customer Lifetime Value = 
VAR DaysSinceFirst = ...
VAR PurchaseFrequency = ...
RETURN ...
```
- Multi-step calculations
- Context-dependent
- Measure is appropriate

**4. Anything That Responds to Filters**
```DAX
Filtered Revenue = 
CALCULATE(
    [Total Sales],
    Products[Category] = "Electronics"
)
```
- Changes when user applies filters
- Interactive dashboards
- Always use measures

---

### The Performance Trade-Off

**Calculated Column:**
- ➕ **Pros:** Fast queries, can be filtered/sorted, can use in relationships
- ➖ **Cons:** Increases model size, longer refresh time, not dynamic

**Measure:**
- ➕ **Pros:** No storage, dynamic, flexible, small model size
- ➖ **Cons:** Evaluated per query, can be slow if complex

**Decision matrix:**

| Factor | Calculated Column | Measure |
|--------|------------------|---------|
| Memory usage | High (stored) | None |
| Refresh time | Increases | No impact |
| Query performance | Fast (pre-calculated) | Depends on complexity |
| Flexibility | Static | Dynamic |
| Can be filtered? | Yes | No |
| Use in relationships? | Yes | No |
| Aggregations | ❌ Use measure | ✅ Perfect |

---

### Aggregation Tables: The Performance Secret Weapon

**What are aggregation tables?**

Pre-aggregated summaries of detailed data that Power BI automatically uses to speed up queries.

**Real-world analogy:** You run a store with 1 million individual sale receipts. Instead of counting receipts every time someone asks "what were sales last month?", you maintain a summary sheet: "January: $50K, February: $48K..." Much faster to read the summary!

**Example scenario:**
- **Fact table:** 50 million rows of daily sales transactions
- **Aggregation table:** 10,000 rows of monthly sales by product
- **Result:** Queries at month/product level are 1000x faster!

---

**How aggregation tables work:**

**Step 1: You create aggregated table**
```DAX
Sales_Agg_Monthly = 
SUMMARIZECOLUMNS(
    Calendar[Year],
    Calendar[Month],
    Products[ProductKey],
    Geography[CountryKey],
    "Total Revenue", SUM(Sales[Revenue]),
    "Total Quantity", SUM(Sales[Quantity]),
    "Total Cost", SUM(Sales[Cost])
)
```
**Size:** 50M rows → 10K rows (5000x smaller!)

**Step 2: Configure as aggregation table**
- Right-click table → "Manage aggregations"
- Map columns to detail table columns
- Set aggregation functions (SUM, COUNT, etc.)

**Step 3: Power BI automatically uses it**
- User creates visual at month/product level
- Power BI query optimizer checks: "Can I use aggregation table?"
- If yes: queries 10K row table instead of 50M row table
- **Result: 100x-1000x faster queries!**

**When Power BI uses aggregation tables:**
✅ Query grain matches or is coarser than aggregation table
✅ All required columns available in aggregation
✅ Aggregation functions compatible (SUM → SUM, COUNT → SUM of count column)

**When Power BI uses detail table:**
❌ Query requires finer grain (daily when agg is monthly)
❌ Columns not in aggregation (e.g., CustomerName not aggregated)
❌ Incompatible functions

---

### Aggregation Table Best Practices

**1. Aggregate at Multiple Grains**

Create multiple aggregation tables for different levels:
- **Sales_Agg_Yearly:** Year + Product Category → 100 rows
- **Sales_Agg_Monthly:** Year-Month + Product Subcategory → 5K rows  
- **Sales_Agg_Daily:** Date + Product → 500K rows
- **Sales (detail):** Date + Product + Customer + Transaction → 50M rows

Power BI automatically uses the smallest appropriate table!

**2. Common Aggregation Patterns**

**Time-based aggregation:**
```DAX
Sales_Agg_Monthly = 
SUMMARIZECOLUMNS(
    Calendar[Year],
    Calendar[Month],
    Products[ProductKey],
    "Revenue", SUM(Sales[Revenue])
)
```

**Geographic aggregation:**
```DAX
Sales_Agg_Country = 
SUMMARIZECOLUMNS(
    Geography[Country],
    Products[Category],
    "Revenue", SUM(Sales[Revenue])
)
```

**3. Which Columns to Aggregate**

✅ **Include:**
- Foreign keys (ProductKey, CustomerKey, DateKey)
- Aggregatable metrics (Revenue, Quantity, Cost)
- Common dimensions (Year, Month, Country, Category)

❌ **Exclude:**
- Transaction IDs (unique per row)
- Customer names (high cardinality)
- Descriptions, comments (text)
- Rarely filtered columns

---

## 4️⃣ Technical Details & Advanced Topics

### Import Mode vs DirectQuery vs Composite

**Import Mode:**
- **How it works:** All data loaded into memory, compressed with VertiPaq
- **Performance:** Very fast queries (milliseconds)
- **Limitations:** Dataset size limits (10GB in Pro, 100GB+ in Premium)
- **Best for:** Most scenarios, fast interactive dashboards

**DirectQuery:**
- **How it works:** Queries sent to source database in real-time
- **Performance:** Slower (depends on source DB performance)
- **Benefits:** Always current data, unlimited dataset size
- **Best for:** Real-time requirements, very large datasets

**Composite Mode:**
- **How it works:** Mix of Import and DirectQuery
- **Example:** Import dimension tables, DirectQuery fact tables
- **Best for:** Large fact tables but small dimensions

**Performance implications:**

| Mode | Query Speed | Data Freshness | Dataset Size |
|------|-------------|----------------|--------------|
| Import | 🚀🚀🚀 Fastest | Scheduled refresh | Limited |
| DirectQuery | 🐌 Slower | Real-time | Unlimited |
| Composite | 🚀 Fast | Mixed | Flexible |

**Best practice:** Use **Import mode** unless you have specific reasons (real-time data, huge datasets) to use DirectQuery.

---

### Calculated Columns: Performance Deep Dive

**Memory impact of calculated columns:**

**Example:** 10M row table with calculated column
```DAX
Sales[Profit Margin] = DIVIDE(Sales[Profit], Sales[Revenue])
```

**Memory calculation:**
- Column stores 10M values
- Typical number storage: 8 bytes per value
- Total: 10M × 8 bytes = 80MB uncompressed
- With VertiPaq compression (10x typical): ~8MB
- **Plus:** Dictionary overhead for distinct values

**Refresh time impact:**
```
10M rows × 0.0001 seconds per calculation = 1000 seconds = 17 minutes
```

**Rule of thumb:** Each calculated column adds:
- 5-20% to model size (depends on cardinality)
- 10-30% to refresh time (depends on complexity)

**When calculated columns make sense despite cost:**
- Used in multiple visuals (calculate once, use many times)
- Required for slicers/filters
- Simple calculations (price tiers, flags)
- Improves query performance significantly

---

### Measure Performance Optimization Patterns

**Pattern 1: Pre-Aggregate with Variables**

**❌ Inefficient (recalculates repeatedly):**
```DAX
Profit Analysis = 
IF(
    SUM(Sales[Revenue]) > 100000,
    SUM(Sales[Profit]) / SUM(Sales[Revenue]),
    0
)
```
`SUM(Sales[Revenue])` calculated twice!

**✅ Efficient (calculate once):**
```DAX
Profit Analysis = 
VAR Revenue = SUM(Sales[Revenue])
VAR Profit = SUM(Sales[Profit])
VAR Margin = DIVIDE(Profit, Revenue)
RETURN
IF(Revenue > 100000, Margin, 0)
```

**Performance gain:** 30-50% faster for complex expressions.

---

**Pattern 2: Push Work to Storage Engine**

**❌ Formula Engine intensive:**
```DAX
Revenue by Category = 
SUMX(
    Products,
    VAR Category = Products[Category]
    RETURN
    CALCULATE(SUM(Sales[Revenue]), Products[Category] = Category)
)
```
Iterates products, context transition per product.

**✅ Storage Engine optimized:**
```DAX
Revenue by Category = SUM(Sales[Revenue])
```
Let relationships handle it! Storage Engine does the work.

---

**Pattern 3: Avoid Nested Iterators**

**❌ Nested iterations:**
```DAX
Total = 
SUMX(
    Categories,
    SUMX(
        RELATEDTABLE(Products),
        [Product Sales]
    )
)
```
Categories × Products × [Product Sales] = potentially millions of iterations!

**✅ Single aggregation:**
```DAX
Total = [Total Sales]
```

---

**Pattern 4: Filter Early and Narrow**

**❌ Filter after large operation:**
```DAX
High Sales Products = 
VAR AllProducts = 
    ADDCOLUMNS(
        ALL(Products),  -- ALL products, even those with no sales!
        "Sales", [Total Sales]
    )
RETURN
COUNTROWS(FILTER(AllProducts, [Sales] > 10000))
```

**✅ Filter early:**
```DAX
High Sales Products = 
VAR ProductsWithSales = 
    CALCULATETABLE(
        VALUES(Products[ProductKey]),
        Sales  -- Only products that have sales
    )
VAR ProductMetrics = 
    ADDCOLUMNS(
        ProductsWithSales,
        "Sales", [Total Sales]
    )
RETURN
COUNTROWS(FILTER(ProductMetrics, [Sales] > 10000))
```

Reduces initial table size by 50-90% typically!

---

### Advanced Aggregation Strategies

**Strategy 1: Hierarchical Aggregations**

Create aggregation tables at multiple grains matching your date hierarchy:

```
Calendar hierarchy: Year → Quarter → Month → Date

Aggregation tables:
1. Sales_Agg_Year (smallest - 10 rows)
2. Sales_Agg_Quarter (100 rows)
3. Sales_Agg_Month (1,000 rows)
4. Sales_Agg_Date (100,000 rows)
5. Sales_Detail (10,000,000 rows)
```

Power BI automatically selects the right level!

---

**Strategy 2: Dimension-Specific Aggregations**

Different aggregation for different analysis patterns:

**Product-focused analysis:**
```DAX
Sales_Agg_Product_Month = 
SUMMARIZECOLUMNS(
    Products[ProductKey],
    Calendar[Year-Month],
    "Revenue", SUM(Sales[Revenue])
)
```

**Customer-focused analysis:**
```DAX
Sales_Agg_Customer_Month = 
SUMMARIZECOLUMNS(
    Customers[CustomerKey],
    Calendar[Year-Month],
    "Revenue", SUM(Sales[Revenue])
)
```

**Geography-focused analysis:**
```DAX
Sales_Agg_Geography_Month = 
SUMMARIZECOLUMNS(
    Geography[CountryKey],
    Geography[StateKey],
    Calendar[Year-Month],
    "Revenue", SUM(Sales[Revenue])
)
```

---

**Strategy 3: Aggregation of Aggregations**

For massive datasets (billions of rows):

**Level 1:** Daily detail → Monthly aggregation
**Level 2:** Monthly aggregation → Yearly aggregation

```DAX
// Monthly aggregation (from daily detail)
Sales_Agg_Month = SUMMARIZECOLUMNS(...)  // 1M rows

// Yearly aggregation (from monthly agg!)
Sales_Agg_Year = 
SUMMARIZECOLUMNS(
    'Sales_Agg_Month'[Year],
    'Sales_Agg_Month'[ProductKey],
    "Revenue", SUM('Sales_Agg_Month'[Revenue])  // Sum the pre-aggregated values!
)  // 10K rows
```

---

### Data Model Optimization

**Best practices for model structure:**

**1. Star Schema (not snowflake)**

**❌ Snowflake (slow):**
```
Sales → Products → Subcategories → Categories
```
Multiple relationship hops slow queries.

**✅ Star schema (fast):**
```
Sales → Products (includes Category, Subcategory columns)
```
Single relationship, faster queries.

---

**2. Integer Keys (not text)**

**❌ Slow:**
```DAX
Products[ProductKey] = "PROD-12345-XYZ-ABC"  // Text key
```

**✅ Fast:**
```DAX
Products[ProductKey] = 12345  // Integer key
```

**Why:** Integer columns compress better, relationships faster, less memory.

---

**3. Remove Unnecessary Columns**

**Before import:**
- Remove audit columns (CreatedBy, ModifiedDate)
- Remove unused descriptive columns
- Remove duplicate data

**Memory saved:** Easily 20-40% reduction in model size!

---

**4. Bi-Directional Relationships (Use Sparingly)**

**❌ Overuse:**
Multiple bi-directional relationships create ambiguous paths and slow queries.

**✅ Best practice:**
- Use single-direction relationships by default
- Use bi-directional only when necessary (many-to-many scenarios)
- Limit to 1-2 per model

---

**5. Datatype Optimization**

**Choose smallest appropriate datatype:**

| Data | Wrong Type | Right Type | Savings |
|------|-----------|------------|---------|
| Year (2024) | Text (4 bytes) | Int (2 bytes) | 50% |
| Price ($123.45) | Decimal (16 bytes) | Fixed decimal (8 bytes) | 50% |
| Flag (Yes/No) | Text (3 bytes) | Boolean (1 byte) | 66% |

**Impact:** On 10M row table, 50% savings per column = GB saved!

---

## 5️⃣ Real-World Examples

### Example 1: Calculated Column vs Measure Decision

**Scenario:** Need to categorize products by sales performance.

**Option A: Calculated Column**
```DAX
Products[Performance Tier] = 
VAR ProductSales = 
    CALCULATE(
        SUM(Sales[Revenue]),
        ALLEXCEPT(Sales, Products[ProductKey])
    )
RETURN
SWITCH(
    TRUE(),
    ProductSales > 100000, "Star",
    ProductSales > 50000, "High",
    ProductSales > 10000, "Medium",
    "Low"
)
```

**Analysis:**
- ➖ Evaluated at refresh time with ALL data (no date filter)
- ➖ Static—doesn't update based on user's date selection
- ➖ If user filters to "Last 6 months", tiers still based on all-time sales
- ➕ Fast in queries (pre-calculated)
- ➕ Can be used in slicers

**Option B: Measure**
```DAX
Performance Tier = 
VAR ProductSales = [Total Sales]  -- Respects current filter context
RETURN
SWITCH(
    TRUE(),
    ProductSales > 100000, "Star",
    ProductSales > 50000, "High",
    ProductSales > 10000, "Medium",
    "Low"
)
```

**Analysis:**
- ➕ Dynamic—updates based on user filters
- ➕ "Last 6 months" filter → tiers based on last 6 months
- ➕ No model size increase
- ➖ Cannot be used in slicers directly
- ➖ Evaluated per query

**✅ Recommendation:**
- **Use calculated column** if tiers should be based on all-time performance (static classification)
- **Use measure** if tiers should respond to date filters (dynamic classification)
- **Best approach:** Calculated column for slicer, measure for dynamic visuals!

---

### Example 2: Implementing Aggregation Tables

**Scenario:** 45 million row sales table causing slow dashboard (5-8 second visuals).

**Step 1: Analyze query patterns**
- Most visuals: Monthly or quarterly grain
- Common dimensions: Product Category, Region
- Rarely need transaction-level detail

**Step 2: Create aggregation table**
```DAX
Sales_Agg_Month = 
SUMMARIZECOLUMNS(
    Calendar[Year],
    Calendar[Month],
    Products[Category],
    Products[Subcategory],
    Geography[Country],
    Geography[Region],
    "Revenue", SUM(Sales[Revenue]),
    "Quantity", SUM(Sales[Quantity]),
    "Cost", SUM(Sales[Cost]),
    "Transactions", COUNTROWS(Sales)
)
```

**Result:** 45M rows → 125K rows (360x smaller!)

**Step 3: Configure aggregation**
- Hide aggregation table from report view
- Right-click → "Manage aggregations"
- Map Revenue → SUM of Sales[Revenue]
- Map Quantity → SUM of Sales[Quantity]
- Map Cost → SUM of Sales[Cost]
- Map Transactions → SUM of count

**Step 4: Test performance**

**Before aggregation:**
- Visual refresh: 5.2 seconds
- Page load: 18 seconds
- Dataset size: 2.1 GB

**After aggregation:**
- Visual refresh: 0.08 seconds (65x faster!)
- Page load: 0.4 seconds (45x faster!)
- Dataset size: 2.3 GB (10% increase)

**✅ Result:** Dramatic performance improvement with minimal model size increase!

---

### Example 3: Measure Optimization

**Scenario:** Complex customer analysis measure taking 12 seconds.

**Original (slow):**
```DAX
Customer Metrics = 
SUMX(
    Customers,
    VAR FirstOrder = 
        CALCULATE(
            MIN(Sales[OrderDate]),
            ALLEXCEPT(Sales, Customers[CustomerKey])
        )
    VAR LastOrder = 
        CALCULATE(
            MAX(Sales[OrderDate]),
            ALLEXCEPT(Sales, Customers[CustomerKey])
        )
    VAR TotalOrders = 
        CALCULATE(
            COUNTROWS(Sales),
            ALLEXCEPT(Sales, Customers[CustomerKey])
        )
    VAR TotalRevenue = 
        CALCULATE(
            SUM(Sales[Revenue]),
            ALLEXCEPT(Sales, Customers[CustomerKey])
        )
    VAR DaysSinceFirst = DATEDIFF(FirstOrder, TODAY(), DAY)
    VAR Frequency = DIVIDE(TotalOrders, DaysSinceFirst) * 365
    VAR LifetimeValue = TotalRevenue * Frequency * 3
    RETURN LifetimeValue
)
```

**Performance analysis:**
- **10,000 customers**
- **Each customer: 4 CALCULATE queries** (FirstOrder, LastOrder, TotalOrders, TotalRevenue)
- **Total: 40,000 Storage Engine queries!**
- **Duration: 12.3 seconds**

**✅ Optimized version:**
```DAX
Customer Metrics = 
VAR CustomerSummary = 
    SUMMARIZE(
        Sales,
        Customers[CustomerKey],
        "FirstOrder", MIN(Sales[OrderDate]),
        "LastOrder", MAX(Sales[OrderDate]),
        "TotalOrders", COUNTROWS(Sales),
        "TotalRevenue", SUM(Sales[Revenue])
    )
VAR EnrichedMetrics = 
    ADDCOLUMNS(
        CustomerSummary,
        "DaysSinceFirst", DATEDIFF([FirstOrder], TODAY(), DAY),
        "Frequency", DIVIDE([TotalOrders], [DaysSinceFirst]) * 365,
        "LifetimeValue", [TotalRevenue] * [Frequency] * 3
    )
RETURN
SUMX(EnrichedMetrics, [LifetimeValue])
```

**Performance improvement:**
- **1 Storage Engine query** (SUMMARIZE aggregates everything)
- **Duration: 0.3 seconds**
- **40x faster!**

**Why it's faster:**
- Single SUMMARIZE creates aggregated table in one SE query
- All metrics calculated together
- No repeated context transitions
- Formula Engine processes small aggregated table (10K rows instead of 5M)

---

### Example 4: Import vs DirectQuery Decision

**Scenario:** 500GB SQL database, need Power BI dashboard.

**Considerations:**

**Option 1: Full Import**
- ❌ Cannot import 500GB into Power BI (Premium max ~100GB compressed)
- ❌ Refresh would take hours
- ✅ Would be very fast for queries

**Option 2: DirectQuery**
- ✅ No size limit
- ✅ Always current data
- ❌ Slow queries (depends on SQL performance)
- ❌ Limited DAX functionality

**✅ Option 3: Composite Model with Aggregations (WINNER!)**
```
Import Mode:
- Dimension tables (Products, Customers, etc.) - 500MB
- Aggregation tables (monthly/yearly summaries) - 2GB
Total Import: 2.5GB ✅ Fits in Premium!

DirectQuery:
- Detail Sales table (500GB)
- Only queried for drill-through to transaction detail
```

**Result:**
- 95% of queries use imported aggregations → Fast!
- 5% of queries drill to DirectQuery detail → Acceptable
- Always current data
- Manageable model size

---

### Example 5: Data Model Restructuring

**Scenario:** Snowflake schema causing slow reports.

**Original structure (snowflake):**
```
Sales (50M rows)
   ↓
Products (10K rows)
   ↓
Subcategories (100 rows)
   ↓
Categories (10 rows)
```

**Problem:**
- 3 relationship hops for Sales → Category
- Each hop: Additional query overhead
- `RELATED(Categories[CategoryName])` in Sales context = slow

**✅ Restructured (star schema):**
```
Sales (50M rows)
   ↓
Products (10K rows)
   - ProductKey
   - ProductName
   - SubcategoryName (denormalized)
   - CategoryName (denormalized)
   - CategoryKey
```

**Changes:**
- Added Category and Subcategory columns directly to Products
- Removed separate Subcategories and Categories tables
- Single relationship: Sales → Products

**Performance impact:**
- Visual rendering: 3.2s → 0.4s (8x faster)
- Model size: Slight increase (redundant category names)
- Maintainability: Easier (fewer tables)

**Best practice:** Denormalize dimension hierarchies in Power BI for optimal performance.

---

## 6️⃣ Hands-On Practice Exercises

### Exercise 1: Calculated Column vs Measure Analysis

**Task:** Determine whether to use calculated column or measure for each scenario.

**Scenarios:**
1. Customer age bracket (18-25, 26-35, etc.)
2. Year-over-year sales growth %
3. Product profitability tier based on profit margin
4. Running total of sales
5. Month name from date column

**For each:**
- Should it be a calculated column or measure?
- Why?
- What are the trade-offs?

**Deliverable:** Decision matrix with reasoning.

---

### Exercise 2: Build Aggregation Table

**Task:** Create aggregation table for sample dataset.

**Given:** Sales table with 1M+ rows, daily grain

**Requirements:**
1. Create monthly aggregation table
2. Include: Date (month level), Product, Country
3. Aggregate: Revenue, Quantity, Cost
4. Configure as aggregation in model
5. Test visual performance before/after

**Measure success:**
- Aggregation table < 10K rows
- Visual performance improvement > 50%

---

### Exercise 3: Optimize Slow Measure

**Task:** Optimize this measure:

```DAX
Product Analysis = 
SUMX(
    Products,
    VAR ProductRevenue = 
        CALCULATE(
            SUM(Sales[Revenue]),
            ALLEXCEPT(Sales, Products[ProductKey])
        )
    VAR ProductCost = 
        CALCULATE(
            SUM(Sales[Cost]),
            ALLEXCEPT(Sales, Products[ProductKey])
        )
    VAR ProductOrders = 
        CALCULATE(
            COUNTROWS(Sales),
            ALLEXCEPT(Sales, Products[ProductKey])
        )
    VAR Score = 
        (ProductRevenue - ProductCost) / ProductOrders
    RETURN
    IF(Score > 50, Score, 0)
)
```

**Steps:**
1. Analyze current performance (SE query count, duration)
2. Identify performance issues
3. Rewrite using SUMMARIZE or other optimization
4. Measure improvement
5. Document changes

---

### Exercise 4: Model Size Optimization

**Task:** Reduce model size by 30%+.

**Given:** Power BI file with 500MB model

**Optimization checklist:**
- ☐ Remove unused columns
- ☐ Change text columns to integers where possible
- ☐ Optimize data types (e.g., decimal → fixed decimal)
- ☐ Remove redundant calculated columns
- ☐ Check for duplicate data
- ☐ Evaluate calculated column necessity

**Measure:**
- Before size: _____MB
- After size: _____MB
- Reduction: _____%

---

### Exercise 5: End-to-End Optimization

**Task:** Optimize entire report for production.

**Requirements:**
1. Run Performance Analyzer on all pages
2. Identify 3 slowest visuals (> 1 second)
3. Optimize each visual's measures
4. Implement aggregation table if needed
5. Restructure data model if necessary
6. Re-test performance
7. Document all changes

**Success criteria:**
- All visuals < 1 second
- Page load < 5 seconds
- Model size increase < 20% (if adding aggregations)

---

## 7️⃣ Common Mistakes & Troubleshooting

### ❌ Mistake 1: Using Calculated Columns for Everything

**Problem:** Creating calculated columns for metrics that should be measures.

**❌ Bad approach:**
```DAX
// Calculated column (WRONG!)
Sales[YTD Revenue] = 
CALCULATE(
    SUM(Sales[Revenue]),
    DATESYTD(Calendar[Date])
)
```

**Why it's wrong:**
- Evaluated at refresh with all data context
- YTD calculation happens once at refresh, not dynamically
- Doesn't respond to user's date filter
- Increases model size unnecessarily

**✅ Correct approach:**
```DAX
// Measure (RIGHT!)
YTD Revenue = 
CALCULATE(
    SUM(Sales[Revenue]),
    DATESYTD(Calendar[Date])
)
```

---

### ❌ Mistake 2: Over-Engineering Aggregation Tables

**Problem:** Creating too many aggregation tables with minimal benefit.

**❌ Bad approach:**
- 15 different aggregation tables
- Aggregations for rarely-used combinations
- Micro-optimizations (daily → 4-hour grain)

**✅ Correct approach:**
- 2-4 strategic aggregation tables
- Focus on most common query patterns
- Aggregate at natural business grains (daily, monthly, yearly)

**Rule:** Each aggregation table should provide > 10x performance improvement or don't create it.

---

### ❌ Mistake 3: Ignoring Relationship Direction

**Problem:** Using bi-directional relationships everywhere "just in case."

**❌ Bad approach:**
```
Products ↔ Sales ↔ Customers ↔ Geography
(All bi-directional)
```

**Why it's wrong:**
- Ambiguous filter paths
- Performance overhead
- Unpredictable filtering behavior

**✅ Correct approach:**
```
Products → Sales ← Customers
                ← Geography
(Single direction from dimension to fact)
```

**Exception:** Use bi-directional only for many-to-many scenarios (bridge tables).

---

### ❌ Mistake 4: Not Testing with Full Data

**Problem:** Optimizing with sample data, failing with production data.

**❌ Bad approach:**
- Test with 10K rows
- Performance looks great!
- Deploy to production (10M rows)
- Everything times out!

**✅ Correct approach:**
- Always test with full production dataset size
- If dataset too large for desktop, test in service
- Use Performance Analyzer with realistic data volumes
- Load test with multiple concurrent users (Premium)

---

### ❌ Mistake 5: Premature Optimization

**Problem:** Spending hours optimizing a 50ms measure.

**❌ Bad approach:**
```
// Spending 2 hours to optimize this from 50ms to 30ms
Simple Measure = SUM(Sales[Revenue])
```

**✅ Correct approach:**
**Optimization priority:**
1. **Critical:** Fix timeouts (> 30s) → Production breaking
2. **High:** Optimize slow visuals (> 2s) → User frustration
3. **Medium:** Improve sluggish visuals (500ms - 2s) → Polish
4. **Low:** Fast visuals (< 500ms) → Not worth the time

**Time allocation:**
- Spend 80% of optimization time on the slowest 20% of visuals
- Don't optimize measures that are already fast

---

### 🔧 Troubleshooting Performance Issues

**Systematic diagnosis process:**

**Step 1: Identify the problem**
- Use Performance Analyzer
- Which page/visual is slow?
- How slow? (> 1s, > 5s, timeout?)

**Step 2: Isolate the cause**
- Is it specific to certain filters?
- Does it happen with all data or specific slices?
- Is it a data model issue or DAX measure issue?

**Step 3: Analyze DAX (if measure-related)**
- Copy query to DAX Studio
- Check Storage Engine query count
- Review Server Timings
- Identify anti-patterns (iterator over large table, context transitions, nested loops)

**Step 4: Analyze data model (if model-related)**
- Check relationship complexity
- Verify cardinality (one-to-many vs many-to-many)
- Review table sizes
- Check for inefficient calculated columns

**Step 5: Apply appropriate fix**

| Symptom | Likely Cause | Solution |
|---------|-------------|----------|
| Many SE queries (> 50) | Iterator pattern | Rewrite with SUMMARIZE |
| Long SE queries (> 2s) | Large table scan | Add aggregation table |
| High Formula Engine time | Complex iterators | Simplify or pre-aggregate |
| Slow with all filters | Data model issue | Restructure relationships |
| Slow with specific filter | Bad cardinality | Check relationship direction |

**Step 6: Re-test and validate**
- Measure performance improvement
- Verify functionality unchanged
- Test with various filters
- Document changes

---

## 8️⃣ Session Summary

### Key Takeaways

✅ **Calculated Columns** - Use for static row-level logic, slicers, relationships; increases model size and refresh time

✅ **Measures** - Use for aggregations, dynamic calculations, anything that responds to filters; no storage cost

✅ **Decision Framework** - Static logic → calculated column; Dynamic/aggregated → measure; balance speed vs flexibility

✅ **Aggregation Tables** - Pre-aggregate at coarser grain; can provide 100x+ performance improvement with minimal model size increase

✅ **Import vs DirectQuery** - Import for speed (most scenarios); DirectQuery for real-time or massive datasets; Composite for best of both

✅ **Star Schema** - Denormalize dimension hierarchies; avoid snowflake schemas; minimize relationship hops

✅ **Data Types** - Use integers for keys; choose smallest appropriate type; can save 30-50% model size

✅ **Optimization Priority** - Fix timeouts first, optimize slow visuals, ignore fast measures; use 80/20 rule

✅ **Performance Tools** - Performance Analyzer + DAX Studio are essential; always measure before/after

✅ **Testing** - Always test with full production dataset size; sample data performance is misleading

### Essential Decision Matrix

**Calculated Column vs Measure:**

| Use Case | Calculated Column | Measure |
|----------|------------------|---------|
| Sum of sales | ❌ | ✅ |
| Age bracket from birthdate | ✅ | ❌ |
| YTD revenue | ❌ | ✅ |
| Price tier (Budget/Premium) | ✅ | ❌ |
| Year-over-year growth % | ❌ | ✅ |
| Is VIP customer (based on all-time) | ✅ | ❌ |
| Running total | ❌ | ✅ |
| Month name from date | ✅ | ❌ |
| Dynamic ranking | ❌ | ✅ |
| Relationship key | ✅ | ❌ |

**Storage Mode Decision:**

| Scenario | Import | DirectQuery | Composite |
|----------|--------|-------------|-----------|
| < 10GB dataset, batch refresh OK | ✅ | ❌ | ❌ |
| Need real-time data | ❌ | ✅ | ⚠️ |
| 100GB+ dataset | ❌ | ⚠️ | ✅ |
| Fast interactivity required | ✅ | ❌ | ✅ |
| Complex DAX calculations | ✅ | ⚠️ | ✅ |

### Optimization Patterns Library

```dax
// ❌ SLOW: Multiple calculations
Bad = 
IF(SUM(Sales[Revenue]) > 100000, 
   SUM(Sales[Revenue]) * 0.1, 
   0)

// ✅ FAST: Calculate once with variable
Good = 
VAR Rev = SUM(Sales[Revenue])
RETURN IF(Rev > 100000, Rev * 0.1, 0)

// ❌ SLOW: Iterator with context transitions
Bad = SUMX(Products, CALCULATE([Total Sales]))

// ✅ FAST: Let context flow naturally
Good = SUMX(Products, [Total Sales])

// ❌ SLOW: Filter large table
Bad = CALCULATE([Sales], FILTER(ALL(Sales), Sales[Amount] > 1000))

// ✅ FAST: Filter before aggregation
Good = CALCULATE([Sales], Sales[Amount] > 1000)

// ❌ SLOW: Nested iterators
Bad = SUMX(Categories, SUMX(RELATEDTABLE(Products), [Sales]))

// ✅ FAST: Single aggregation
Good = [Total Sales]
```

### Performance Optimization Checklist

**Before production release:**

**Data Model:**
- ☐ Star schema (not snowflake)
- ☐ Integer keys (not text)
- ☐ Appropriate data types
- ☐ Remove unused columns
- ☐ Single-direction relationships (except where necessary)
- ☐ No unnecessary many-to-many relationships

**DAX Measures:**
- ☐ Variables for repeated calculations
- ☐ No unnecessary iterators
- ☐ No nested iterators
- ☐ Early filtering in complex measures
- ☐ Appropriate aggregation functions

**Calculated Columns:**
- ☐ Only where necessary (slicers, relationships, static logic)
- ☐ Not used for aggregations
- ☐ Consider measure alternative if dynamic

**Aggregations:**
- ☐ Aggregation tables for large fact tables (> 10M rows)
- ☐ Common query grains covered
- ☐ Properly configured and mapped

**Testing:**
- ☐ Performance Analyzer run on all pages
- ☐ All visuals < 1 second
- ☐ Page load < 5 seconds
- ☐ Tested with full production data volume
- ☐ Tested with typical user filters

**Storage:**
- ☐ Import mode unless specific reason for DirectQuery
- ☐ Composite if large dataset with aggregations
- ☐ Dataset size within limits (10GB Pro, 100GB Premium)

### Interview-Ready Talking Points

🎯 **"Calculated columns increase model size and refresh time but improve query speed for static logic like categories and tiers"**

🎯 **"Measures are dynamic and respond to filters—use for any aggregation or context-dependent calculation"**

🎯 **"Aggregation tables can provide 100x performance improvement by pre-aggregating at coarser grains like monthly or yearly"**

🎯 **"Always use star schema in Power BI—denormalize dimension hierarchies to minimize relationship hops"**

🎯 **"Import mode is best for performance in most scenarios; use DirectQuery only for real-time requirements or massive datasets"**

🎯 **"Integer keys compress better and perform faster than text keys—always use integers for relationships"**

🎯 **"Optimize the slowest 20% of visuals first—use 80/20 rule and avoid premature optimization"**

🎯 **"Performance Analyzer and DAX Studio Server Timings are essential tools for measuring and diagnosing issues"**

### What's Next?

🎓 **Congratulations! You've completed the comprehensive DAX Performance Optimization module!**

**You've mastered:**
- Internal query processing (Storage Engine + Formula Engine)
- Calculated columns vs measures decision framework
- Aggregation tables for dramatic performance gains
- Data model optimization techniques
- Import vs DirectQuery trade-offs
- Systematic performance troubleshooting
- Production-ready optimization checklist

**🚀 Next Steps in Your Power BI Journey:**
- Apply optimization patterns to real projects
- Build aggregation tables for large datasets
- Conduct performance reviews of existing reports
- Develop performance-first modeling habits
- Explore advanced topics: incremental refresh, query folding, Premium features
- Consider Power BI certification (PL-300)

---

🎉 **Congratulations!** You now have enterprise-level performance optimization skills! You can make informed decisions about calculated columns vs measures, implement aggregation strategies that provide 100x speed improvements, and systematically diagnose and fix performance bottlenecks. You have the complete toolkit to build blazing-fast Power BI dashboards that scale to millions of rows and delight users with instant responsiveness!

**You've completed the full Power BI Training Program (Days 1-12)! You're ready for professional Power BI development! 🚀**
