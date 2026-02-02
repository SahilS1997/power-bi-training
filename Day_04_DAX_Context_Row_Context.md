# DAY 4 - DAX Context & Row Context

## 1️⃣ Session Overview

Today you'll unlock the most powerful concept in DAX: context. Understanding context is what separates developers who copy formulas from Stack Overflow from those who architect sophisticated calculations. You'll learn how DAX evaluates formulas differently based on filter context and row context, why some functions create row context while others don't, and how CALCULATE transforms context to produce breakthrough calculations.

In real projects, 80% of "DAX isn't working" problems stem from context confusion. Formulas that work in one visual fail in another because the context changed. Functions return wrong results because developers don't understand whether they're in filter context or row context. Mastering this concept today eliminates months of frustration later.

## 2️⃣ Learning Objectives

- Define filter context and row context and explain how they differ fundamentally
- Identify when formulas are evaluated in filter context vs row context
- Understand why iterator functions (SUMX, AVERAGEX) create row context
- Explain context transition and when it occurs automatically
- Use CALCULATE to modify filter context dynamically
- Distinguish between aggregator functions and iterator functions
- Apply CALCULATE to solve business problems that simple aggregations cannot
- Debug context-related calculation errors by analyzing the evaluation context

## 3️⃣ Key Concepts (Explained Simply)

**What is Context?**

Context is the environment in which a DAX formula evaluates. Think of it like asking "What's the temperature?" The answer depends on WHERE you're asking (New York vs Tokyo) and WHEN you're asking (summer vs winter). Similarly, DAX formulas return different results depending on their evaluation context.

There are two types of context in DAX, and they work completely differently:

**Filter Context**

Filter context is created by:
- Slicers and filters on a report page
- Row/column headers in a matrix or table visual
- Drill-down selections
- Report-level filters

**How it works:** Filter context reduces the visible rows in tables before calculation happens. If you select "2023" in a year slicer, the Calendar table filters to 2023 rows, and that filter propagates to related tables (Sales, etc.) through relationships.

**Real-world analogy:** Filter context is like dimming lights in a theater. The entire stage (all tables) gets darker (filtered) based on external controls (slicers). Everything that happens afterward occurs in that dimmed environment.

**Row Context**

Row context is created by:
- Calculated columns (evaluate row-by-row)
- Iterator functions (SUMX, AVERAGEX, FILTER, etc.)
- Certain table functions

**How it works:** Row context evaluates one row at a time, moving down the table row-by-row. In each iteration, column references return values from the current row only.

**Real-world analogy:** Row context is like reading a book line-by-line with your finger on the current line. You can only see what's on the line your finger is pointing to. You must move your finger to see other lines.

**The Critical Difference**

**Filter Context:**
- Applies to entire tables
- Multiple tables can be filtered simultaneously
- Measures naturally work in filter context
- Aggregation functions (SUM, AVERAGE) require filter context

**Row Context:**
- Applies to a single row in a single table
- Iterates one row at a time
- Calculated columns naturally work in row context
- Direct column references work, aggregation functions don't (unless wrapped)

**Why This Distinction Matters**

Consider this simple formula: `Sales[Revenue]`

**In filter context (inside a measure):**
`Total Revenue = SUM( Sales[Revenue] )`
DAX knows to sum the Revenue column across all filtered rows. Works perfectly.

**In row context (inside a calculated column):**
`Row Revenue = Sales[Revenue]`
DAX returns the Revenue value from the current row only. No aggregation needed or possible.

**The same column reference behaves completely differently based on context.**

**Aggregator Functions vs Iterator Functions**

This is a crucial distinction that determines whether row context is created.

**Aggregator Functions (No row context created):**
- `SUM( Sales[Revenue] )` - Aggregates all filtered rows at once
- `AVERAGE( Sales[Revenue] )` - Averages all filtered rows at once
- `COUNT( Sales[OrderID] )` - Counts all filtered rows at once
- `MIN( Sales[Revenue] )`, `MAX( Sales[Revenue] )` - Find min/max across all rows

These functions operate on the entire filtered set of rows simultaneously. They don't iterate.

**Iterator Functions (Create row context):**
- `SUMX( Sales, Sales[Quantity] * Sales[Price] )` - Iterates row-by-row, evaluates expression, then sums
- `AVERAGEX( Sales, Sales[Revenue] - Sales[Cost] )` - Iterates, calculates per row, then averages
- `FILTER( Sales, Sales[Revenue] > 1000 )` - Iterates to test each row against condition
- `COUNTX()`, `MINX()`, `MAXX()` - X suffix indicates iterator

**Why iterators exist:** Aggregators can only aggregate a single column. What if you need to aggregate a calculation? That's when you need iterators.

**Example:**
You can't write: `SUM( Sales[Quantity] * Sales[UnitPrice] )`
Because `SUM()` expects a column, not an expression.

Instead, you write: `SUMX( Sales, Sales[Quantity] * Sales[UnitPrice] )`
This iterates row-by-row, calculates Quantity * UnitPrice for each row, then sums the results.

**Context Transition**

Here's where it gets advanced: What happens when you reference a measure inside an iterator function?

```DAX
SUMX( Products, [Total Revenue] )
```

**The problem:** `SUMX()` creates row context (iterating through Products). But `[Total Revenue]` is a measure that expects filter context, not row context. How does DAX resolve this?

**Context Transition:** DAX automatically converts row context into filter context when a measure is referenced inside row context. 

**How it works:** For each row in the Products table iteration, DAX:
1. Takes the current row's column values (ProductID, ProductName, etc.)
2. Converts them into filters (ProductID = current value)
3. Applies those filters as filter context
4. Evaluates the measure in that filter context
5. Returns the result for that row

**Real-world analogy:** Imagine you're reading a contact list (row context). You get to John Smith's row. Then you need to look up John's order history (measure). Context transition is like converting "current row = John Smith" into a filter "WHERE CustomerName = John Smith" so the measure can run properly.

**Why it matters:** Context transition is automatic for measures but doesn't happen for column references. This explains many puzzling behaviors beginners encounter.

**CALCULATE: The Context Modifier**

`CALCULATE()` is the most powerful function in DAX. It does one thing: modify filter context before evaluating an expression.

**Basic Syntax:**
```DAX
CALCULATE( 
    <expression to evaluate>,
    <filter1>,
    <filter2>,
    ...
)
```

**What it does:**
1. Starts with the current filter context
2. Applies additional filters (or removes existing ones)
3. Evaluates the expression in the modified filter context
4. Returns the result

**Simple Example:**
```DAX
Electronics Revenue = 
CALCULATE(
    SUM( Sales[Revenue] ),
    Products[Category] = "Electronics"
)
```

**How it works:**
- Takes current filter context (whatever slicers/filters are active)
- Adds filter: Only products in Electronics category
- Calculates SUM( Sales[Revenue] ) in that modified context

**Why you need it:** Without CALCULATE, you can't create measures that apply specific filters regardless of what users select in slicers.

**CALCULATE's Special Power:**

CALCULATE doesn't just add filters—it can override them. If a user has selected "Furniture" category, and your formula says `CALCULATE( ..., Products[Category] = "Electronics" )`, the Electronics filter **replaces** the Furniture filter for that calculation.

This replacement behavior is what enables comparative measures like "% of Total" and "Market Share."

**Context in Different DAX Constructs**

Let's clarify where each context type appears:

| Construct | Context Type | Why |
|-----------|--------------|-----|
| Measure | Filter Context | Responds to external filters from visuals |
| Calculated Column | Row Context | Evaluates row-by-row during refresh |
| SUMX, AVERAGEX, FILTER | Creates Row Context | Needs to iterate rows |
| SUM, AVERAGE, COUNT | Requires Filter Context | Aggregates filtered set |
| CALCULATE | Works in Filter Context | Modifies filter context |
| Row context + Measure | Context Transition | Converts row → filter context |

## 4️⃣ Step-by-Step Explanation with Examples

We'll use progressively complex examples to demonstrate context behavior.

**Example 1: Filter Context in Action**

**Scenario:** Show total revenue that responds to slicers.

```DAX
Total Revenue = SUM( Sales[Revenue] )
```

**Context Analysis:**
- This measure operates in filter context
- When placed in a Card visual: Aggregates all Sales rows (no filters)
- When user selects "Electronics" in Product Category slicer: Products table filters to Electronics, filter propagates through relationship to Sales, `SUM()` aggregates only matching Sales rows
- When added to a Matrix with Year on rows: Each row creates different filter context (Year = 2023, Year = 2024, etc.), measure evaluates separately for each

**Key Point:** Same formula, different results based on filter context. This is DAX's power.

**Example 2: Row Context in Calculated Column**

**Scenario:** Calculate profit for each transaction in Sales table.

```DAX
Profit = Sales[Revenue] - Sales[Cost]
```

**Context Analysis:**
- Created as calculated column in Sales table
- Evaluated in row context during refresh
- For row 1: `Sales[Revenue]` returns Revenue from row 1, `Sales[Cost]` returns Cost from row 1
- For row 2: Values from row 2
- And so on for every row

**Why not make this a measure?** You could: `Total Profit = SUM( Sales[Revenue] ) - SUM( Sales[Cost] )`. Both approaches work. Calculated column is justified if you need profit per row for other purposes (like filtering on profit ranges).

**Example 3: Why Aggregators Don't Work in Row Context**

**Scenario:** Try to sum revenue inside a calculated column (WRONG).

```DAX
// In Sales table calculated column - DOESN'T WORK AS INTENDED
Total Revenue Column = SUM( Sales[Revenue] )
```

**What happens:**
- Calculated columns evaluate in row context
- `SUM()` requires filter context
- DAX errors or produces unexpected results

**Correct approach:** Use a measure instead.

**Example 4: Iterator Function Creates Row Context**

**Scenario:** Calculate total revenue where each row's revenue is Quantity * UnitPrice (assume Sales table has these separate).

**Cannot do this:**
```DAX
Total Revenue = SUM( Sales[Quantity] * Sales[UnitPrice] )
```
`SUM()` doesn't accept expressions, only columns.

**Must use iterator:**
```DAX
Total Revenue = 
SUMX( 
    Sales, 
    Sales[Quantity] * Sales[UnitPrice] 
)
```

**How SUMX works:**
1. Creates row context by iterating Sales table
2. For each row:
   - Evaluates `Sales[Quantity] * Sales[UnitPrice]` using values from current row
   - Stores the result
3. After all rows: Sums all stored results

**Example 5: Context Transition with Measures**

**Scenario:** Calculate average revenue per product (each product's total revenue, then average across products).

```DAX
Avg Revenue per Product = 
AVERAGEX( 
    Products,
    [Total Revenue]
)
```

**Where:** `[Total Revenue] = SUM( Sales[Revenue] )`

**Step-by-step evaluation:**

1. `AVERAGEX()` creates row context, iterates through Products table
2. For Product 1 (ProductID = 101):
   - Row context active (current row = Product 101)
   - `[Total Revenue]` is referenced (a measure)
   - **Context transition occurs:** DAX converts row context into filter context: `Products[ProductID] = 101`
   - Evaluates `SUM( Sales[Revenue] )` with filter `ProductID = 101`
   - Filter propagates through relationship to Sales table
   - Returns total revenue for Product 101
3. Repeat for Product 2, Product 3, etc.
4. After all products: Average the results

**Without context transition:** If `[Total Revenue]` was evaluated in row context directly, it wouldn't have the necessary filter context to know which product's sales to sum. Context transition makes this "just work."

**Example 6: CALCULATE Modifying Filter Context**

**Scenario:** Show revenue for Electronics category regardless of what user selects.

```DAX
Electronics Revenue = 
CALCULATE(
    SUM( Sales[Revenue] ),
    Products[Category] = "Electronics"
)
```

**Evaluation Steps:**

**Setup:** User has selected "Furniture" in Category slicer

1. Start with current filter context: `Products[Category] = "Furniture"`
2. CALCULATE adds/overrides filter: `Products[Category] = "Electronics"`
3. Because both filters are on the same column, Electronics **replaces** Furniture
4. Evaluate `SUM( Sales[Revenue] )` with `Category = "Electronics"`
5. Return result

**Result:** The measure shows Electronics revenue even though Furniture is selected. This enables "comparison to other categories" scenarios.

**Example 7: CALCULATE for "All Time" Totals**

**Scenario:** Show total revenue across all dates, even when user filters to specific months.

```DAX
All Time Revenue = 
CALCULATE(
    SUM( Sales[Revenue] ),
    ALL( Calendar )
)
```

**How it works:**
- `ALL( Calendar )` removes all filters from Calendar table
- Even if user selects "January 2023," this measure shows total across all dates
- Useful for "% of total" calculations

**Example 8: Percent of Total with CALCULATE**

**Scenario:** Calculate each category's revenue as a percentage of total revenue.

```DAX
Revenue % of Total = 
DIVIDE(
    SUM( Sales[Revenue] ),
    CALCULATE(
        SUM( Sales[Revenue] ),
        ALL( Products[Category] )
    )
)
```

**How it works:**

**Scenario:** In a Matrix with Product[Category] on rows

Row "Electronics":
- Numerator: `SUM( Sales[Revenue] )` with filter context `Category = "Electronics"` (from row context) → Returns $50,000
- Denominator: `CALCULATE( SUM(...), ALL( Products[Category] ))` removes Category filter → Returns $200,000 (total all categories)
- Result: $50,000 / $200,000 = 25%

Row "Furniture":
- Numerator: `SUM( Sales[Revenue] )` with `Category = "Furniture"` → $30,000
- Denominator: Same $200,000 (all categories)
- Result: $30,000 / $200,000 = 15%

**Key insight:** The denominator is identical for all rows because `ALL()` removes the category filter, while the numerator respects the row's filter context.

**Example 9: Combining Iterators and CALCULATE**

**Scenario:** Calculate total revenue for products priced above $100.

```DAX
High Price Revenue = 
CALCULATE(
    SUM( Sales[Revenue] ),
    FILTER(
        Products,
        Products[UnitPrice] > 100
    )
)
```

**How it works:**

1. `FILTER()` is an iterator—creates row context
2. Iterates through Products table row-by-row
3. For each row: Tests `Products[UnitPrice] > 100`
4. Keeps rows where condition is TRUE
5. Result is a filtered Products table
6. `CALCULATE()` applies this filtered table as filter context
7. Evaluates `SUM( Sales[Revenue] )` with only high-priced products included via relationships

**This is advanced:** Combining filter context (CALCULATE) with row context (FILTER) to create dynamic filters based on conditions that can't be expressed as simple equality filters.

## 5️⃣ Common Mistakes & Misconceptions

**Mistake 1: Using aggregators in calculated columns**

**Wrong:**
```DAX
// In Products table calculated column
Product Total Revenue = SUM( Sales[Revenue] )
```

**Why it fails:** Calculated columns run in row context. `SUM()` requires filter context. This produces errors or nonsensical results.

**Correct approach:** If you need per-product revenue, use a measure with context transition or an iterator.

**Mistake 2: Using iterators when aggregators suffice**

**Inefficient:**
```DAX
Total Revenue = SUMX( Sales, Sales[Revenue] )
```

**Why it's bad:** `SUMX()` iterates row-by-row. `SUM()` is optimized for columnar operations and is much faster.

**Better:**
```DAX
Total Revenue = SUM( Sales[Revenue] )
```

**Rule:** Only use iterators when you need to calculate an expression per row. If you're just aggregating a column, use aggregators.

**Mistake 3: Forgetting CALCULATE when trying to modify filters**

**Wrong:**
```DAX
Last Year Sales = 
SUM( Sales[Revenue] ) 
WHERE Calendar[Year] = Calendar[Year] - 1  // Not DAX syntax!
```

**Why it fails:** DAX doesn't have SQL-style WHERE clauses. You must use CALCULATE to modify filter context.

**Correct:**
```DAX
Last Year Sales = 
CALCULATE(
    SUM( Sales[Revenue] ),
    SAMEPERIODLASTYEAR( Calendar[Date] )
)
```

**Mistake 4: Expecting column references to aggregate automatically in measures**

**Wrong:**
```DAX
Total Revenue = Sales[Revenue]
```

**Why it fails:** In a measure (filter context), `Sales[Revenue]` doesn't automatically sum. It's ambiguous what DAX should do with a column reference without aggregation.

**Correct:**
```DAX
Total Revenue = SUM( Sales[Revenue] )
```

**Mistake 5: Misunderstanding CALCULATE's filter replacement**

**Scenario:** User selects "2023" in Year slicer. You write:

```DAX
Test Measure = 
CALCULATE(
    SUM( Sales[Revenue] ),
    Calendar[Year] = 2024
)
```

**Expected:** Show revenue for both 2023 and 2024
**Actual:** Shows revenue only for 2024

**Why:** CALCULATE replaces filters on the same column. The 2024 filter overwrites the 2023 filter.

**If you want BOTH years:**
```DAX
Both Years = 
CALCULATE(
    SUM( Sales[Revenue] ),
    Calendar[Year] IN { 2023, 2024 }
)
```

**Mistake 6: Not recognizing context transition**

**Puzzle:**
```DAX
Test = 
SUMX( 
    Products,
    COUNTROWS( Sales )
)
```

**Expectation:** Count total Sales rows, multiplied by number of Products
**Reality:** Sum of Sales count per product

**Why:** `COUNTROWS( Sales )` inside the iterator triggers context transition. For each Product row, it filters Sales to that product and counts. This is powerful but confusing if you don't expect it.

**Mistake 7: Using CALCULATE unnecessarily**

**Inefficient:**
```DAX
Total Revenue = 
CALCULATE(
    SUM( Sales[Revenue] )
)
```

**Why it's pointless:** If you're not modifying filter context, CALCULATE does nothing except slow performance slightly.

**Better:**
```DAX
Total Revenue = SUM( Sales[Revenue] )
```

## 6️⃣ Hands-on Practice (Mandatory)

**Exercise 1: Context Identification**

For each scenario, identify whether the formula operates in Filter Context, Row Context, or both:

A. Measure: `Total Profit = SUM( Sales[Profit] )`
B. Calculated Column in Sales: `Order Total = Sales[Quantity] * Sales[UnitPrice]`
C. Measure: `Total Profit = SUMX( Sales, Sales[Revenue] - Sales[Cost] )`
D. Calculated Column in Products: `Category Label = Products[Category]`
E. Measure with iterator: `Avg Profit = AVERAGEX( Sales, Sales[Revenue] - Sales[Cost] )`

**Exercise 2: Aggregator vs Iterator**

For each requirement, choose whether to use an aggregator (SUM, AVERAGE) or iterator (SUMX, AVERAGEX):

A. Total revenue across all sales
B. Total revenue where each sale's revenue = Quantity * Price (separate columns)
C. Average order value
D. Average profit per order where profit = Revenue - Cost (separate columns)
E. Count of customers who purchased more than 5 items (requires filtering)

**Exercise 3: Write CALCULATE Formulas**

Write DAX formulas for these scenarios:

A. Show revenue for "Electronics" category only, regardless of slicer selection
B. Show revenue for all dates combined, even when user filters to specific months
C. Show revenue for the year 2023 only
D. Show revenue for products where UnitPrice > 100

**Exercise 4: Context Transition Analysis**

Analyze this formula and explain what happens at each step:

```DAX
Avg Revenue per Customer = 
AVERAGEX(
    Customers,
    [Total Revenue]
)
```

Where `[Total Revenue] = SUM( Sales[Revenue] )`

Questions:
A. What context does AVERAGEX create?
B. What happens when `[Total Revenue]` is evaluated inside AVERAGEX?
C. What filter is applied to Sales for each customer iteration?
D. What does the final result represent?

**Exercise 5: Fix the Context Errors**

Identify and fix the errors in these formulas:

A. Calculated Column in Sales: `Total Sales = SUM( Sales[Revenue] )`
B. Measure: `Product Count = Products[ProductID]`
C. Measure: `Last Year Sales = SUM( Sales[Revenue] ) WHERE Year = 2023`
D. Calculated Column: `Avg Revenue = AVERAGE( Sales[Revenue] )`

**Exercise 6: Percent of Total**

Write a measure that calculates each product's revenue as a percentage of total revenue across all products. The denominator should always show the grand total, even when filtering to specific products.

**Exercise 7: Complex Iterator**

Write a measure that:
- Iterates through the Products table
- For each product, calculates profit (Revenue - Cost) from Sales table
- Sums the profits

Consider: Do you need context transition? Which functions do you need?

## 7️⃣ Interview-Oriented Question

**Question:** 
"Explain the difference between filter context and row context in DAX. Give a practical example where misunderstanding this difference would cause a formula to fail or return incorrect results."

**Expected Answer:**

Filter context and row context are the two evaluation environments in DAX, and they fundamentally determine how formulas behave.

**Filter Context:**
Filter context is created by external filters (slicers, report filters, visual row/column headers) and applies to entire tables. When a measure is evaluated, DAX looks at all active filters, reduces tables to matching rows, and then performs calculations. Aggregation functions like SUM, AVERAGE, and COUNT require filter context because they operate on a set of filtered rows.

For example, if a user selects "Electronics" in a Product Category slicer, the Products table filters to Electronics rows, that filter propagates through relationships to the Sales table, and any measure referencing Sales operates on that filtered subset.

**Row Context:**
Row context is created when DAX evaluates formulas row-by-row, such as in calculated columns or iterator functions (SUMX, FILTER). In row context, column references return values from the current row only. There's no inherent aggregation—you're looking at one row at a time.

For example, a calculated column in Sales: `Profit = Sales[Revenue] - Sales[Cost]` evaluates row-by-row, returning Revenue and Cost from the current row.

**Critical Difference:**
In filter context, `Sales[Revenue]` represents a column across all filtered rows (requiring aggregation). In row context, `Sales[Revenue]` represents the single value in the current row.

**Practical Example of Failure:**

Suppose a developer wants to show total revenue per product in a visual. They create this measure:

```DAX
Product Revenue = 
SUMX(
    Products,
    Sales[Revenue]  // WRONG
)
```

**Why it fails:**
- `SUMX()` creates row context by iterating Products
- Inside that row context, `Sales[Revenue]` is ambiguous—which Sales row's Revenue?
- DAX may error or return unexpected results

**Correct version:**

```DAX
Product Revenue = 
SUMX(
    Products,
    [Total Revenue]  // Correct - triggers context transition
)
```

Where `[Total Revenue] = SUM( Sales[Revenue] )`

When `[Total Revenue]` (a measure) is referenced inside row context, DAX automatically performs context transition: it converts the current Product row into filter context (filtering to that ProductID), then evaluates the measure properly.

**Alternative explanation for context transition:**
Without context transition, measures wouldn't work inside iterators. This automatic conversion is what makes DAX formulas intuitive once you understand the rule: measures expect filter context, and DAX creates it automatically when needed.

Understanding this prevents the most common category of DAX errors beginners encounter.

## 8️⃣ Session Summary

- Context determines how DAX evaluates formulas and is the most important concept in the language
- Filter context is created by slicers, filters, and visual elements; it reduces visible rows in tables before calculations
- Row context is created by calculated columns and iterator functions; it evaluates formulas one row at a time
- Measures operate in filter context; calculated columns operate in row context
- Aggregator functions (SUM, AVERAGE, COUNT) require filter context and operate on filtered sets
- Iterator functions (SUMX, AVERAGEX, FILTER) create row context and evaluate expressions per row
- Context transition automatically converts row context to filter context when measures are referenced inside iterators
- CALCULATE is the primary function for modifying filter context, enabling dynamic filtering in measures
- CALCULATE can add filters, remove filters, or replace existing filters on the same column
- Most DAX bugs stem from context confusion—understanding when formulas run in which context is essential
- Use aggregators (SUM) when possible for performance; use iterators (SUMX) only when evaluating per-row expressions
- Combining CALCULATE with iterators (FILTER) enables sophisticated conditional filtering

---

## 🧑‍🏫 Trainer Notes

**Emphasis Points:**
- Context is the hardest DAX concept for beginners. Plan to spend 30 minutes on filter context vs row context with multiple demonstrations.
- The SUMX vs SUM distinction is crucial. Show both versions with Performance Analyzer to demonstrate that SUMX is slower when unnecessary.
- Context transition is mind-bending. Use a whiteboard to draw the evaluation steps visually: "We're in row context (Products), we reference a measure (Total Revenue), DAX creates filter context from the current row values, evaluates the measure, returns result."
- CALCULATE is simultaneously the most powerful and most confusing function. Emphasize: "CALCULATE modifies filter context. That's all it does. But that's everything."

**Common Confusion Areas:**
- Students confuse "row context" with "row-level security" or "row headers in a visual"—clarify it's an evaluation concept, not a visual or security feature
- The term "context transition" sounds academic. Use simpler language: "DAX automatically converts the current row into a filter when you reference a measure inside an iterator"
- Why SUM works in measures but not in calculated columns is counterintuitive. Emphasize the context each construct creates
- CALCULATE's filter replacement behavior surprises everyone. Demonstrate with Year filters: selecting 2023, then using CALCULATE with 2024, shows only 2024

**Whiteboard Exercise:**
Draw two scenarios side-by-side:

**Scenario 1:** Measure with SUM
- Draw filter context (a filtered Sales table)
- Show SUM aggregating all visible rows at once
- Show result

**Scenario 2:** SUMX iterator
- Draw row context (pointer on one row)
- Show expression evaluating for that row
- Move pointer to next row, evaluate again
- Show final summation

**Demonstration Flow:**
1. Create a measure: `Total Revenue = SUM( Sales[Revenue] )` - show it working in a visual
2. Add slicers - show the measure responding to filters (filter context)
3. Create a calculated column: `Profit = Sales[Revenue] - Sales[Cost]` - show row-by-row evaluation
4. Try (and fail) to use SUM in a calculated column - show the error
5. Create SUMX measure - compare performance to SUM
6. Create CALCULATE measure with specific filter - show it ignoring slicers
7. Create % of Total measure using CALCULATE with ALL()

**Time Management:**
- First 20 minutes: Filter context vs row context explanation and demonstrations
- Next 15 minutes: Aggregators vs iterators with SUMX examples
- Next 15 minutes: CALCULATE and filter modification
- Final 10 minutes: Context transition and Q&A

**Key Takeaway Message:**
"Every DAX formula evaluates in one of two contexts: filter context or row context. Measures use filter context, calculated columns use row context, and iterators create row context. When you understand which context you're in, DAX makes sense. When you don't, every formula is a mystery."

**Preparation:**
Have a Power BI file with the same Sales model ready. Preload enough data (1,000+ rows) so performance differences between SUM and SUMX are visible in Performance Analyzer. Have visuals with slicers ready to demonstrate filter context propagation.

**Follow-up for Next Session:**
Tomorrow (Day 5) will build on context knowledge with time intelligence. Emphasize: "Understanding context today makes time intelligence formulas tomorrow feel intuitive rather than magical."

