# DAY 3 - DAX Fundamentals

## 1️⃣ Session Overview

Today marks your entry into DAX (Data Analysis Expressions), the formula language that transforms raw data into business insights. You'll learn the fundamental distinction between measures and calculated columns, understand basic DAX syntax, and create your first aggregation formulas. These building blocks are used in every Power BI report you'll ever create.

In real projects, understanding when to use measures versus calculated columns determines whether your reports perform well or crawl to a halt. Choosing the right aggregation function affects accuracy—using SUM when you should use DISTINCTCOUNT can give executives wrong numbers. This session establishes the core patterns you'll use throughout your DAX journey.

## 2️⃣ Learning Objectives

- Distinguish between measures and calculated columns and choose the appropriate one for each scenario
- Write syntactically correct DAX formulas following best practice conventions
- Implement basic aggregation functions (SUM, AVERAGE, COUNT, DISTINCTCOUNT)
- Understand how measures respond to filter context automatically
- Apply arithmetic operators in DAX expressions correctly
- Recognize common syntax errors and know how to fix them
- Explain why measures are preferred over calculated columns for aggregations

## 3️⃣ Key Concepts (Explained Simply)

**What is DAX?**

DAX (Data Analysis Expressions) is Power BI's formula language. If you know Excel, think of DAX as Excel formulas on steroids—designed specifically for analyzing tables of data rather than individual cells. DAX formulas can reference entire columns and tables, not just cell ranges.

Unlike SQL (which retrieves data), DAX calculates results from data already loaded into your model. Unlike Excel (which works cell-by-cell), DAX works column-by-column and table-by-table.

**Measures vs Calculated Columns: The Critical Distinction**

This is the most important concept beginners must grasp. They look similar in syntax but behave completely differently:

**Calculated Columns:**
- Created in tables, just like regular columns
- Computed row-by-row during data refresh
- Results stored in memory (increases model size)
- Evaluated once when data loads
- Use when you need values available for filtering or grouping

**Measures:**
- Created separately, not tied to a specific table row
- Computed dynamically when used in a visual
- Nothing stored in memory (just the formula)
- Recalculated every time filter context changes
- Use for aggregations and calculations that respond to filters

**Real-World Analogy:**

Calculated Column: Like writing your age directly on everyone's employee badge during printing. If someone has a birthday, you must reprint their badge (recalculate during refresh).

Measure: Like having a formula that calculates age on-demand when someone asks. No storage needed, always current.

**When to Use Each:**

Use Calculated Columns when you need to:
- Group or filter by the calculated result (e.g., Age Groups: "0-18", "19-35", "36-50")
- Create a new attribute based on existing columns (e.g., FullName = FirstName & " " & LastName)
- Use the result in relationships or hierarchies

Use Measures when you need to:
- Aggregate numbers (sum, average, count)
- Calculate ratios or percentages
- Implement time intelligence (YTD, YoY growth)
- Create any calculation that should respond to slicers and filters

**Rule of Thumb:** If your calculation involves aggregation (SUM, COUNT, etc.), it should be a measure 95% of the time.

**Basic DAX Syntax Rules**

DAX has specific syntax requirements. Get these wrong, and your formula won't even save:

1. **Table and Column References:** Always use `TableName[ColumnName]` format
   - Correct: `Sales[Revenue]`
   - Wrong: `Revenue` or `Sales.Revenue`

2. **Measure References:** Just the measure name in square brackets
   - Correct: `[Total Revenue]`
   - Note: Measures don't belong to a specific table

3. **Case Sensitivity:** DAX is not case-sensitive, but consistency matters
   - `Sales[Revenue]` = `sales[revenue]` = `SALES[REVENUE]`
   - Best practice: Match your actual table/column names

4. **Whitespace:** Spaces are allowed and encouraged for readability
   - Both valid: `SUM(Sales[Revenue])` and `SUM( Sales[Revenue] )`

5. **Comments:** Use // for single-line or /* */ for multi-line
   ```DAX
   // This is a comment
   Total Revenue = SUM( Sales[Revenue] ) // End-of-line comment
   ```

**The Five Core Aggregation Functions**

These are your bread-and-butter DAX functions. You'll use them constantly:

**SUM()** - Adds all numbers in a column
- `SUM( Sales[Revenue] )` - Total revenue across all filtered rows
- Returns zero if no rows match the filter

**AVERAGE()** - Calculates arithmetic mean
- `AVERAGE( Sales[Revenue] )` - Average revenue per transaction
- Ignores blank cells, only averages numbers

**COUNT()** - Counts rows containing non-blank values
- `COUNT( Sales[OrderID] )` - Number of orders
- Only counts non-empty cells in the specified column

**DISTINCTCOUNT()** - Counts unique values
- `DISTINCTCOUNT( Sales[CustomerID] )` - Number of unique customers
- Essential for counting how many different items exist

**COUNTROWS()** - Counts all rows in a table
- `COUNTROWS( Sales )` - Total number of transactions
- Counts every row, even if columns have blanks

**Key Difference: COUNT vs COUNTROWS vs DISTINCTCOUNT**
- `COUNT( Sales[OrderID] )` - Counts non-blank OrderIDs
- `COUNTROWS( Sales )` - Counts all rows regardless of blank columns
- `DISTINCTCOUNT( Sales[CustomerID] )` - Counts unique customers

**Arithmetic Operators in DAX**

DAX supports standard mathematical operators:

- Addition: `+`
- Subtraction: `-`
- Multiplication: `*`
- Division: `/`

**Important:** Division by zero returns `Infinity` in DAX, not an error. Use safeguards:
```DAX
Profit Margin = 
DIVIDE( 
    SUM( Sales[Profit] ), 
    SUM( Sales[Revenue] )
)
```

The `DIVIDE()` function handles division by zero gracefully (returns blank by default).

**Why DAX Syntax Matters**

Small syntax errors cause big problems:
- Missing brackets: `SUM Sales[Revenue]` → Error
- Wrong brackets: `SUM( Sales.Revenue )` → Error
- Ambiguous references: `SUM( Revenue )` → Error if multiple tables have Revenue column

Power BI's formula bar provides IntelliSense to help, but understanding the rules prevents frustration.

## 4️⃣ Step-by-Step Explanation with Examples

Let's build DAX formulas progressively using our retail Sales dataset.

**Dataset Reminder:**
- **Sales** table: OrderID, OrderDate, CustomerID, ProductID, Quantity, Revenue, Cost
- **Customers** table: CustomerID, CustomerName, City, Country
- **Products** table: ProductID, ProductName, Category
- **Calendar** table: Date, Year, Quarter, Month

**Example 1: Creating Your First Measure (SUM)**

**Business Question:** What is the total revenue across all sales?

**Step 1:** Decide between measure and calculated column.
- This is an aggregation (summing values)
- Should respond to filters (if user selects a product category, total should update)
- **Decision: Measure**

**Step 2:** Write the DAX formula.

```DAX
Total Revenue = SUM( Sales[Revenue] )
```

**Step 3:** Understand what happens.
- Power BI looks at the current filter context (what's selected in slicers/filters)
- Filters the Sales table to matching rows
- Sums all values in the Revenue column from those rows
- Returns the result

**Step 4:** Test in a visual.
- Add to a Card visual: Shows total across all data
- Add to a Matrix with Product[Category] on rows: Shows total per category
- The same measure adapts to different contexts automatically!

**Example 2: Average Transaction Value (AVERAGE)**

**Business Question:** What's the average revenue per transaction?

```DAX
Average Order Value = AVERAGE( Sales[Revenue] )
```

**How it differs from:**
```DAX
Wrong Approach = [Total Revenue] / [Total Orders]
```

The `AVERAGE()` function computes the mean at the row level in the current filter context. If you have 100 orders averaging $50 each, it returns $50. The "wrong approach" would divide aggregated totals, which can give different results when filters are applied.

**Example 3: Counting Transactions (COUNT vs COUNTROWS)**

**Business Question:** How many sales transactions occurred?

**Option 1: COUNT a specific column**
```DAX
Order Count = COUNT( Sales[OrderID] )
```
Counts non-blank OrderID values. If OrderID is always filled, this works.

**Option 2: COUNTROWS (preferred)**
```DAX
Total Orders = COUNTROWS( Sales )
```
Counts all rows in the Sales table. More reliable because it doesn't depend on a specific column having values.

**Why COUNTROWS is better:** If your data has any blank values in the counted column, COUNT will underreport. COUNTROWS counts the row regardless.

**Example 4: Counting Unique Customers (DISTINCTCOUNT)**

**Business Question:** How many unique customers made purchases?

```DAX
Unique Customers = DISTINCTCOUNT( Sales[CustomerID] )
```

**What's happening:**
- Sales table might have 10,000 rows (transactions)
- But only 500 different CustomerIDs appear in those rows
- DISTINCTCOUNT eliminates duplicates and returns 500

**Why this matters:** If you used `COUNT( Sales[CustomerID] )`, you'd get 10,000 (number of transactions), not 500 (number of customers).

**Example 5: Basic Calculated Column (for comparison)**

**Business Scenario:** We need to categorize products by price range for filtering.

```DAX
Price Category = 
IF( 
    Products[UnitPrice] < 50, 
    "Budget",
    IF( 
        Products[UnitPrice] < 200,
        "Standard",
        "Premium"
    )
)
```

**Created in:** Products table (as a calculated column)

**Evaluation:** Runs once during refresh, evaluates row-by-row through Products table

**Result:** A new column appears in Products table with "Budget", "Standard", or "Premium" for each product

**When to use this pattern:** When you need the result available as a slicer option or for grouping in visuals.

**Example 6: Profit Calculation with Operators**

**Business Question:** Calculate total profit (Revenue minus Cost)

```DAX
Total Profit = 
SUM( Sales[Revenue] ) - SUM( Sales[Cost] )
```

**Breaking it down:**
- `SUM( Sales[Revenue] )` aggregates all revenue in current filter context
- `SUM( Sales[Cost] )` aggregates all cost in current filter context
- Subtraction operator `-` combines them
- Result is profit

**Why not create a calculated column `Sales[Profit] = Sales[Revenue] - Sales[Cost]` and then `SUM( Sales[Profit] )`?**

Both work, but the measure-only approach:
- Uses less memory (no stored column)
- Is more flexible (easy to change formula)
- Follows best practice (aggregate in measures)

**However**, if you need profit per row for other calculations, the calculated column approach is valid.

**Example 7: Profit Margin with DIVIDE**

**Business Question:** What percentage of revenue is profit?

**Risky approach:**
```DAX
Profit Margin = 
( SUM( Sales[Revenue] ) - SUM( Sales[Cost] ) ) / SUM( Sales[Revenue] )
```

**Problem:** If filtered data has zero revenue, you divide by zero → Error

**Better approach:**
```DAX
Profit Margin = 
DIVIDE(
    SUM( Sales[Revenue] ) - SUM( Sales[Cost] ),
    SUM( Sales[Revenue] )
)
```

**Why DIVIDE is better:**
- Automatically handles division by zero (returns blank instead of error)
- Optional third parameter sets alternative result: `DIVIDE( numerator, denominator, 0 )` returns 0 instead of blank

**Example 8: Combining Multiple Aggregations**

**Business Question:** What's the average profit per customer?

**Step 1:** Calculate total profit
```DAX
Total Profit = SUM( Sales[Revenue] ) - SUM( Sales[Cost] )
```

**Step 2:** Count unique customers
```DAX
Unique Customers = DISTINCTCOUNT( Sales[CustomerID] )
```

**Step 3:** Combine them
```DAX
Avg Profit per Customer = 
DIVIDE(
    [Total Profit],
    [Unique Customers]
)
```

**Note:** We're referencing other measures using `[MeasureName]` syntax. This is called measure composition and is a powerful DAX pattern.

## 5️⃣ Common Mistakes & Misconceptions

**Mistake 1: Creating calculated columns for aggregations**

**Wrong:**
Create a calculated column in Sales table:
```DAX
Total Revenue Column = SUM( Sales[Revenue] )
```

**Why it fails:** Calculated columns evaluate row-by-row. This formula would try to sum all revenue for every single row, giving each row the grand total. Nonsensical and won't work as intended.

**Correct:** Create a measure instead.

**Mistake 2: Using measures in calculated columns**

**Wrong:**
In Products table calculated column:
```DAX
Product Revenue = [Total Revenue]
```

**Why it fails:** Calculated columns can't directly reference measures. They evaluate row-by-row before measures exist in the calculation pipeline.

**Correct:** Use `SUMX()` with `RELATEDTABLE()` if you really need this (advanced pattern for Day 4).

**Mistake 3: Forgetting table name in column references**

**Wrong:**
```DAX
Total Revenue = SUM( Revenue )
```

**Why it fails:** If multiple tables have a Revenue column, DAX doesn't know which one you mean. Even if only one table has it, explicit table names are best practice.

**Correct:** Always use `Table[Column]` format.

**Mistake 4: Using COUNT when you need DISTINCTCOUNT**

**Scenario:** Counting unique customers who made purchases

**Wrong:**
```DAX
Customer Count = COUNT( Sales[CustomerID] )
```

**Why it's wrong:** This counts the number of transactions, not unique customers. If Customer 123 made 5 purchases, they're counted 5 times.

**Correct:**
```DAX
Unique Customers = DISTINCTCOUNT( Sales[CustomerID] )
```

**Mistake 5: Not handling division by zero**

**Wrong:**
```DAX
Conversion Rate = [Orders] / [Website Visits]
```

**Problem:** If a filtered date has no website visits, this returns `Infinity` or an error in visuals.

**Correct:**
```DAX
Conversion Rate = DIVIDE( [Orders], [Website Visits], 0 )
```

**Mistake 6: Storing formatted text in measures**

**Wrong:**
```DAX
Formatted Revenue = "$" & [Total Revenue]
```

**Problem:** This returns text, not a number. You can't use it in further calculations, and sorting breaks.

**Correct:** Let visuals handle formatting. Keep measures as pure numbers.

**Mistake 7: Overusing calculated columns for "just in case"**

Beginners often create dozens of calculated columns for every possible calculation, "just in case they need it later."

**Why it's problematic:** Each calculated column increases model size and refresh time. Memory is consumed even if the column is never used.

**Better approach:** Create measures on-demand. They don't consume memory until used in a visual.

## 6️⃣ Hands-on Practice (Mandatory)

**Exercise 1: Measure vs Calculated Column Decision**

For each scenario, decide whether to use a measure or calculated column. Explain why.

A. Calculate total quantity sold across all products
B. Create a full name by combining FirstName and LastName in Customers table
C. Calculate year-over-year revenue growth percentage
D. Categorize customers as "New" or "Returning" based on first purchase date
E. Calculate average discount percentage across all orders

**Exercise 2: Write Basic Aggregation Measures**

Using the Sales table with columns [Quantity], [Revenue], [Cost], [CustomerID]:

A. Write a measure for total quantity sold
B. Write a measure for average revenue per transaction
C. Write a measure for the number of unique customers
D. Write a measure for total profit (Revenue - Cost)

**Exercise 3: Fix the Syntax Errors**

Identify and fix the errors in these DAX formulas:

A. `Total Sales = SUM Sales[Revenue]`
B. `Avg Revenue = AVERAGE( [Revenue] )`
C. `Customer Count = DISTINCTCOUNT( Customers )`
D. `Profit = Revenue - Cost`
E. `Margin = [Profit] / [Revenue]`

**Exercise 4: Choosing the Right COUNT Function**

You have a Sales table with 1,000 rows. The CustomerID column has values in all rows. OrderDate has 5 blank cells.

A. What does `COUNT( Sales[CustomerID] )` return?
B. What does `COUNT( Sales[OrderDate] )` return?
C. What does `COUNTROWS( Sales )` return?
D. What does `DISTINCTCOUNT( Sales[CustomerID] )` return if there are 200 unique customers?

**Exercise 5: Complex Measure Creation**

Create a measure that calculates "Revenue per Order". Consider:
- Should you use AVERAGE or DIVIDE?
- What numerator and denominator do you need?
- How do you handle scenarios with zero orders?

Write the complete DAX formula.

**Exercise 6: Calculated Column Scenario**

Create a calculated column in the Products table called "Price Tier":
- Products under $50: "Economy"
- Products $50-$150: "Mid-Range"
- Products over $150: "Luxury"

Write the DAX formula using nested IF statements.

## 7️⃣ Interview-Oriented Question

**Question:** 
"A stakeholder asks you to add a 'Total Revenue' column to the Sales table showing the sum of all revenue. You know you could create either a calculated column or a measure. Explain which one you'd choose and why, including the technical implications of each approach."

**Expected Answer:**

I would create a measure, not a calculated column, for several technical reasons:

**Why a measure is correct:**

1. **Calculated column behavior:** A calculated column in the Sales table evaluates row-by-row during refresh. If you write `Total Revenue Column = SUM( Sales[Revenue] )`, DAX would attempt to compute this for each row. Since calculated columns don't have filter context like measures, this formula would either error or produce unexpected results. You cannot use aggregation functions meaningfully in calculated columns without iterator functions.

2. **Memory efficiency:** Measures store only the formula, not the results. They compute dynamically when referenced in a visual. A calculated column would store a value for every row, consuming memory unnecessarily. In a table with millions of rows, this difference is substantial.

3. **Flexibility to filters:** A measure automatically responds to filter context. When users slice by product category or date range, the measure recalculates showing the filtered total. A calculated column is static—computed once during refresh.

4. **Best practice alignment:** Industry best practice is "aggregations in measures, attributes in columns." Total revenue is an aggregation, so it belongs in a measure.

**If the requirement was different:** The only scenario where a calculated column makes sense is if you need a per-row calculation that doesn't aggregate, such as `Profit = Sales[Revenue] - Sales[Cost]` for each transaction. Even then, you could skip the column and use `SUM( Sales[Revenue] ) - SUM( Sales[Cost] )` directly in a measure.

**Communication with stakeholder:** I'd explain that what they see as a "column" in the visual is actually a measure, which provides the same result but with better performance and flexibility.

## 8️⃣ Session Summary

- DAX is Power BI's formula language for creating custom calculations and aggregations
- Measures calculate dynamically based on filter context; calculated columns compute once during refresh and store results
- Use measures for aggregations; use calculated columns for row-level attributes needed for filtering or grouping
- DAX syntax requires `Table[Column]` format for column references and `[MeasureName]` for measures
- The five core aggregation functions are SUM, AVERAGE, COUNT, DISTINCTCOUNT, and COUNTROWS
- SUM and AVERAGE aggregate numeric columns; COUNT counts non-blank values; DISTINCTCOUNT counts unique values
- Arithmetic operators (+, -, *, /) work in DAX; use DIVIDE() function to handle division by zero safely
- Measures automatically adapt to filter context from slicers, filters, and visual groupings
- Calculated columns increase model size and refresh time; prefer measures for performance
- Proper measure design (aggregating in measures rather than columns) is fundamental to scalable Power BI solutions

---

## 🧑‍🏫 Trainer Notes

**Emphasis Points:**
- The measure vs calculated column distinction is the most critical concept today. Spend 20 minutes on this with multiple examples.
- Show the same calculation both ways (column vs measure) and demonstrate the memory impact using Performance Analyzer.
- Emphasize that 90% of beginner mistakes stem from using calculated columns when measures are appropriate.

**Common Confusion Areas:**
- Students think measures are "harder" because they're not visible in the table. Reinforce that this is a feature, not a bug.
- The term "calculated column" implies it calculates, which confuses students about when to use it. Emphasize: "calculated once at refresh" vs "measures calculated on demand."
- DISTINCTCOUNT vs COUNT trips up everyone. Use a real example: "If John Smith ordered 10 times, COUNT counts 10, DISTINCTCOUNT counts 1."

**Whiteboard Exercise:**
Draw a Sales table with 5 rows. Show CustomerID appearing multiple times. Physically demonstrate:
- `COUNT( CustomerID )` = 5 (counts all non-blank cells)
- `DISTINCTCOUNT( CustomerID )` = 3 (counts unique values)
- `COUNTROWS( Sales )` = 5 (counts rows)

**Demonstration Flow:**
1. Create a calculated column showing issues (every row shows grand total) - FAIL
2. Delete it and create a measure instead - SUCCESS
3. Show the measure adapting to different slicers automatically
4. Check model size before and after calculated column to show memory impact

**Time Management:**
- First 15 minutes: Measure vs calculated column deep dive
- Next 20 minutes: Building measures step-by-step (SUM, COUNT, AVERAGE, etc.)
- Next 15 minutes: Common mistakes demonstration
- Final 10 minutes: Practice exercises walkthrough and Q&A

**Key Takeaway Message:**
"If your formula involves SUM, AVERAGE, COUNT, or any aggregation, it's almost certainly a measure. Calculated columns are for creating new attributes, not for calculations that should respond to filters."

**Preparation:**
Load sample data into Power BI Desktop before class. Have at least 1,000 rows so students can see performance differences between columns and measures.

