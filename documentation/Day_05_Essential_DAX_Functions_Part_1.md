# DAY 5 - Essential DAX Functions Part 1

## 1️⃣ Session Overview

Today you'll master the five functions that unlock advanced DAX calculations: CALCULATE, FILTER, ALL, ALLEXCEPT, and ALLSELECTED. These are the power tools that let you override default filtering behavior, create custom filter conditions, and build calculations that work exactly how you need them to—regardless of what slicers users select.

In real projects, CALCULATE is used in 60-70% of measures beyond basic aggregations. When business users ask for "sales excluding returns," "revenue vs same period last year," or "percentage of category total," you'll use these functions. Understanding filter modifiers separates beginners who can only build basic sums from professionals who deliver sophisticated analytics.

## 2️⃣ Learning Objectives

- Master CALCULATE syntax and understand how it modifies filter context
- Use FILTER to create custom row-level filter conditions
- Apply ALL to remove filters completely from tables or columns
- Implement ALLEXCEPT to remove all filters except specified columns
- Use ALLSELECTED to respect visual-level filters while ignoring slicer filters
- Build percentage-of-total calculations using filter modifiers
- Create "compare to all" scenarios while maintaining other filters
- Debug filter context issues by analyzing which filters are active

## 3️⃣ Key Concepts (Explained Simply)

**What is CALCULATE?**

CALCULATE is the most important function in DAX. It does two critical things:
1. Evaluates an expression (usually a measure)
2. Modifies the filter context before evaluation

**Basic syntax:**
```DAX
CALCULATE( 
    <expression>,
    <filter1>,
    <filter2>,
    ...
)
```

**Real-world analogy:** Imagine you're calculating average temperature for a city. CALCULATE lets you say "calculate average temperature, BUT only for summer months, AND only for days without rain." It temporarily changes the filter conditions for your calculation.

**Why CALCULATE Matters**

Without CALCULATE, measures just respond to existing filters. With CALCULATE, you can:
- Add new filters on top of existing ones
- Override existing filters with different values
- Remove filters completely to ignore slicers
- Combine multiple filter modifications in one formula

**Every time you need a calculation to work differently than the default filtering would produce, you need CALCULATE.**

**The FILTER Function**

FILTER creates a table of rows that meet a condition. It's used inside CALCULATE to apply row-level filters.

**Syntax:**
```DAX
FILTER( 
    <table>,
    <condition>
)
```

**How it works:**
1. Takes a table as input
2. Evaluates the condition row-by-row (creates row context)
3. Returns a new table containing only rows where condition is TRUE

**Example:**
```DAX
FILTER( 
    Sales,
    Sales[Revenue] > 1000
)
```
Returns a table with only sales transactions over $1,000.

**FILTER vs Simple Filter Arguments**

CALCULATE accepts two types of filters:

**Simple filters (preferred when possible):**
```DAX
CALCULATE(
    [Total Revenue],
    Products[Category] = "Electronics"
)
```

**FILTER function (when you need complex logic):**
```DAX
CALCULATE(
    [Total Revenue],
    FILTER( 
        Products,
        Products[UnitPrice] > 100 && Products[Category] = "Electronics"
    )
)
```

**Rule of thumb:** Use simple filters for single-column conditions. Use FILTER when you need AND/OR logic combining multiple columns or complex comparisons.

**The ALL Function Family**

ALL and its variants remove filters from tables or columns. This is essential for percentage-of-total calculations and "compare to all" scenarios.

**ALL( <table or column> )**

Removes all filters from the specified table or columns.

**Example 1: Remove filters from entire table**
```DAX
ALL( Sales )  -- Ignores all filters on Sales table
```

**Example 2: Remove filters from specific columns**
```DAX
ALL( Products[Category], Products[SubCategory] )  -- Ignores filters on these columns only
```

**Real-world use case:**
If a user selects "Electronics" category in a slicer, your measure normally calculates only for Electronics. Using ALL( Products[Category] ) makes your measure ignore that slicer and calculate for ALL categories.

**ALLEXCEPT( <table>, <column1>, <column2>, ... )**

Removes all filters from a table EXCEPT the specified columns.

**Think of it as:** "Clear all filters from this table, but keep filters on these specific columns."

**Example:**
```DAX
ALLEXCEPT( Sales, Sales[Year], Sales[Region] )
```
This removes all filters from Sales table EXCEPT filters on Year and Region columns. Those two remain active.

**When to use:** Percentage of total within groups, comparative analysis across some dimensions but not others.

**ALLSELECTED( <table or column> )**

This is the most nuanced filter modifier. It removes filters created by the visual (row/column headers, axis values) but respects filters from slicers, page-level filters, and report-level filters.

**Real-world scenario:**
You have a matrix showing sales by Product. You want each product to show its % of total visible in the visual, BUT you want to respect any year slicer the user selected.

```DAX
Product % of Total = 
DIVIDE(
    [Total Revenue],
    CALCULATE( [Total Revenue], ALLSELECTED( Products ) )
)
```

**What happens:**
- If user selects "2023" in year slicer: Percentages are out of 2023 total only
- ALLSELECTED removes the product filter from the visual rows but keeps the year slicer active

**ALL vs ALLEXCEPT vs ALLSELECTED Comparison**

| Function | Removes Visual Filters | Removes Slicer Filters | Use Case |
|----------|------------------------|------------------------|----------|
| ALL | ✅ Yes | ✅ Yes | Grand total, ignore everything |
| ALLEXCEPT | ✅ Yes (except specified) | ✅ Yes (except specified) | Total within groups |
| ALLSELECTED | ✅ Yes | ❌ No | Visual totals respecting slicers |

**Filter Context Modification Principles**

When you use filter modifiers inside CALCULATE, understand what happens:

**1. Filters are applied left to right**
```DAX
CALCULATE(
    [Total Revenue],
    Products[Category] = "Electronics",  -- Applied first
    Products[Color] = "Black"  -- Applied second
)
```

**2. Later filters can override earlier ones**
```DAX
CALCULATE(
    [Total Revenue],
    Products[Category] = "Electronics",
    ALL( Products[Category] )  -- This removes the Electronics filter!
)
```
The ALL removes the category filter we just added. Result: All categories included.

**3. Multiple filters on same column are ANDed (intersection)**
```DAX
CALCULATE(
    [Total Revenue],
    Products[Category] = "Electronics",
    Products[Category] = "Appliances"  -- Impossible: nothing is both
)
```
This returns BLANK because no product can be in two categories simultaneously.

**4. Filters on different columns/tables are ANDed**
```DAX
CALCULATE(
    [Total Revenue],
    Products[Category] = "Electronics",
    Sales[Year] = 2023
)
```
Returns revenue for Electronics in 2023. Both filters applied.

**Common Patterns Using These Functions**

**Pattern 1: Percentage of Grand Total**
```DAX
% of Grand Total = 
DIVIDE(
    [Total Revenue],
    CALCULATE( [Total Revenue], ALL( Sales ) )
)
```

**Pattern 2: Percentage of Category Total**
```DAX
% of Category = 
DIVIDE(
    [Total Revenue],
    CALCULATE( [Total Revenue], ALLEXCEPT( Products, Products[Category] ) )
)
```

**Pattern 3: Compare to All Products in Visual**
```DAX
% of Visible Total = 
DIVIDE(
    [Total Revenue],
    CALCULATE( [Total Revenue], ALLSELECTED( Products ) )
)
```

**Pattern 4: Revenue Excluding One Category**
```DAX
Revenue Excluding Electronics = 
CALCULATE(
    [Total Revenue],
    Products[Category] <> "Electronics"
)
```

**Pattern 5: High-Value Transactions Only**
```DAX
High-Value Revenue = 
CALCULATE(
    [Total Revenue],
    FILTER( Sales, Sales[Revenue] > 1000 )
)
```

## 4️⃣ Step-by-Step Explanation with Examples

Let's build increasingly sophisticated measures using our retail dataset.

**Dataset Reminder:**
- **Sales** table: OrderID, OrderDate, CustomerID, ProductID, Quantity, Revenue, Cost
- **Products** table: ProductID, ProductName, Category, SubCategory, UnitPrice
- **Customers** table: CustomerID, CustomerName, City, Country, Region
- **Calendar** table: Date, Year, Quarter, Month, Day

**Example 1: Basic CALCULATE - Add a Filter**

**Business Question:** What is revenue for Electronics category only, regardless of what category user selects in slicer?

**Without CALCULATE:**
```DAX
Total Revenue = SUM( Sales[Revenue] )
```
This measure changes based on category slicer. If user selects "Appliances," it shows appliance revenue.

**With CALCULATE:**
```DAX
Electronics Revenue = 
CALCULATE(
    SUM( Sales[Revenue] ),
    Products[Category] = "Electronics"
)
```

**Step-by-step evaluation:**
1. User selects "Appliances" in category slicer
2. Normal filter context: Only Appliances visible
3. CALCULATE overrides: Changes filter to Electronics
4. Result: Electronics revenue shown, even though slicer shows Appliances

**Example 2: Using FILTER for Complex Conditions**

**Business Question:** What's revenue from high-value transactions (>$1000) in Electronics category?

**Formula:**
```DAX
High-Value Electronics Revenue = 
CALCULATE(
    SUM( Sales[Revenue] ),
    Products[Category] = "Electronics",
    FILTER( Sales, Sales[Revenue] > 1000 )
)
```

**What's happening:**
1. First filter: Limits to Electronics products
2. Second filter (FILTER function): Iterates through Sales table, keeps only rows where Revenue > 1000
3. SUM aggregates revenue from rows matching BOTH conditions

**Why use FILTER here:**
You can't write `Sales[Revenue] > 1000` as a simple filter because Sales[Revenue] isn't a single value—it's a column. FILTER creates row context to evaluate each row individually.

**Example 3: ALL - Complete Filter Removal**

**Business Question:** Show each product's revenue alongside the grand total revenue (all products, all categories).

**Formula:**
```DAX
Grand Total Revenue = 
CALCULATE(
    SUM( Sales[Revenue] ),
    ALL( Sales )
)
```

**Scenario:**
- You have a table visual with Products[ProductName] on rows
- Each row shows that product's revenue
- You add [Grand Total Revenue] measure
- Result: Every row shows the same number (total across ALL products)

**Why it works:**
- Without ALL: Each row would show different totals based on the product filter from the visual
- With ALL: Removes all filters from Sales table, always returns the absolute total

**Usage in percentage calculation:**
```DAX
Product % of Total = 
DIVIDE(
    [Total Revenue],
    [Grand Total Revenue]
)
```

Now you can see each product as a percentage of overall revenue.

**Example 4: ALLEXCEPT - Selective Filter Removal**

**Business Question:** Show each product's revenue as % of its category total (not grand total).

**Formula:**
```DAX
Category Total Revenue = 
CALCULATE(
    SUM( Sales[Revenue] ),
    ALLEXCEPT( Products, Products[Category] )
)
```

**Step-by-step with example:**

Visual setup:
- Rows: Products[ProductName] and Products[Category]
- Values: [Total Revenue] and [Category Total Revenue]

| Category | Product | Total Revenue | Category Total |
|----------|---------|---------------|----------------|
| Electronics | Laptop | $50,000 | $100,000 |
| Electronics | Phone | $30,000 | $100,000 |
| Electronics | Tablet | $20,000 | $100,000 |
| Appliances | Fridge | $40,000 | $80,000 |
| Appliances | Oven | $40,000 | $80,000 |

**How ALLEXCEPT works here:**
1. Each row has filters: Category = "Electronics" AND Product = "Laptop"
2. ALLEXCEPT( Products, Products[Category] ) removes product filter but keeps category filter
3. Result: Laptop row calculates total for ALL Electronics products
4. All Electronics products show $100,000 (their category total)

**Complete percentage formula:**
```DAX
% of Category Total = 
DIVIDE(
    [Total Revenue],
    CALCULATE(
        [Total Revenue],
        ALLEXCEPT( Products, Products[Category] )
    )
)
```

Results: Laptop shows 50% (50K of 100K), Fridge shows 50% (40K of 80K).

**Example 5: ALLSELECTED - Visual Totals with Slicer Respect**

**Business Question:** Show % of total visible in current visual, but respect any year filter user applies.

**Setup:**
- Matrix visual with Products[Category] on rows
- Year slicer above the visual
- Measure to show "% of total visible"

**Formula:**
```DAX
% of Visible Total = 
DIVIDE(
    [Total Revenue],
    CALCULATE( [Total Revenue], ALLSELECTED( Products ) )
)
```

**Behavior:**

**Scenario A: No year selected**
| Category | Revenue | % of Visible |
|----------|---------|--------------|
| Electronics | $100K | 50% |
| Appliances | $80K | 40% |
| Furniture | $20K | 10% |

Total visible: $200K (all years), percentages sum to 100%

**Scenario B: User selects 2023 in year slicer**
| Category | Revenue | % of Visible |
|----------|---------|--------------|
| Electronics | $60K | 55% |
| Appliances | $40K | 36% |
| Furniture | $10K | 9% |

Total visible: $110K (2023 only), percentages sum to 100% of 2023 total

**Why ALLSELECTED works:**
- Removes the Category filter from visual rows (so denominator = all categories)
- Keeps the Year slicer filter active (so denominator = selected year only)
- Result: % are always out of what's "selected" by slicers but include all categories

**Example 6: Combining Multiple Filter Modifiers**

**Business Question:** Show revenue for high-margin products (margin > 30%) as % of all products in the same category.

**Formula:**
```DAX
High-Margin Category % = 
VAR HighMarginRevenue = 
    CALCULATE(
        [Total Revenue],
        FILTER( Sales, DIVIDE( Sales[Revenue] - Sales[Cost], Sales[Revenue] ) > 0.3 )
    )
VAR CategoryTotal = 
    CALCULATE(
        [Total Revenue],
        ALLEXCEPT( Products, Products[Category] )
    )
RETURN
    DIVIDE( HighMarginRevenue, CategoryTotal )
```

**Breaking it down:**

**Step 1: HighMarginRevenue variable**
- FILTER creates row context in Sales table
- For each row, calculates margin: (Revenue - Cost) / Revenue
- Keeps only rows where margin > 30%
- Sums revenue from those high-margin rows

**Step 2: CategoryTotal variable**
- Removes all product filters but keeps category filter
- Calculates total revenue for entire category

**Step 3: Division**
- High-margin revenue divided by category total
- Result: % of category revenue coming from high-margin products

**Example 7: Overriding Existing Filters**

**Business Question:** Always show 2023 revenue, regardless of year slicer selection.

**Formula:**
```DAX
2023 Revenue = 
CALCULATE(
    SUM( Sales[Revenue] ),
    Calendar[Year] = 2023
)
```

**What happens:**
- User selects "2024" in year slicer
- Normal measures show 2024 data
- [2023 Revenue] measure shows 2023 data (overrides slicer)

**Use case:** Comparative columns showing "current year vs 2023 baseline" in same table.

**Example 8: Filter Removal for Rank Calculation**

**Business Question:** Rank each product by revenue within its category.

**Formula:**
```DAX
Product Rank in Category = 
RANKX(
    ALLEXCEPT( Products, Products[Category] ),
    [Total Revenue],
    ,
    DESC
)
```

**How it works:**
1. RANKX needs a table to rank over
2. ALLEXCEPT( Products, Products[Category] ) creates a table of all products in the same category
3. For product "Laptop" in "Electronics," ranks against all Electronics products
4. Ranks by [Total Revenue] in descending order (highest revenue = rank 1)

**Without ALLEXCEPT:**
If you used just Products, the filter from the visual (current product) would make the ranking table contain only one product. Every product would rank #1!

## 5️⃣ Common Mistakes & Misconceptions

**Mistake 1: Forgetting CALCULATE Wrapper**

❌ **Wrong:**
```DAX
Revenue All Products = 
SUM( Sales[Revenue] ) ALL( Products )
```

✅ **Correct:**
```DAX
Revenue All Products = 
CALCULATE(
    SUM( Sales[Revenue] ),
    ALL( Products )
)
```

**Why:** Filter modifiers (ALL, FILTER, etc.) must be used inside CALCULATE. They can't exist standalone or outside CALCULATE.

**Mistake 2: Using ALL When You Need ALLEXCEPT**

❌ **Wrong (trying to get category totals):**
```DAX
Category Total = 
CALCULATE(
    [Total Revenue],
    ALL( Products )
)
```

**Problem:** This removes ALL filters from Products, including Category. Every row shows grand total, not category total.

✅ **Correct:**
```DAX
Category Total = 
CALCULATE(
    [Total Revenue],
    ALLEXCEPT( Products, Products[Category] )
)
```

**Mistake 3: Overcomplicating with FILTER**

❌ **Unnecessary complexity:**
```DAX
Electronics Revenue = 
CALCULATE(
    [Total Revenue],
    FILTER( Products, Products[Category] = "Electronics" )
)
```

✅ **Simpler and faster:**
```DAX
Electronics Revenue = 
CALCULATE(
    [Total Revenue],
    Products[Category] = "Electronics"
)
```

**When single-column filters work, use them. FILTER adds overhead.**

**Mistake 4: Wrong Order of Filter Modifiers**

❌ **Logic error:**
```DAX
Category Revenue Excl Electronics = 
CALCULATE(
    [Total Revenue],
    ALL( Products[Category] ),  -- First: Removes category filter
    Products[Category] <> "Electronics"  -- Second: Sets category filter
)
```

**Problem:** ALL runs first, removing category filter. Then the exclusion sets it back. This works but is confusing.

✅ **Clearer approach:**
```DAX
Category Revenue Excl Electronics = 
CALCULATE(
    [Total Revenue],
    Products[Category] <> "Electronics"
)
```

**Mistake 5: Using ALLSELECTED Incorrectly**

❌ **Wrong expectation:**
```DAX
Product Total = 
CALCULATE(
    [Total Revenue],
    ALLSELECTED( Products[ProductName] )
)
```

**Problem:** ALLSELECTED on a single column of a table doesn't behave as expected. Use the table: ALLSELECTED( Products ).

**Mistake 6: Missing DIVIDE Safety**

❌ **Error-prone:**
```DAX
% of Total = 
[Total Revenue] / CALCULATE( [Total Revenue], ALL( Sales ) )
```

**Problem:** If denominator is zero or blank, returns error or infinity.

✅ **Safe:**
```DAX
% of Total = 
DIVIDE(
    [Total Revenue],
    CALCULATE( [Total Revenue], ALL( Sales ) )
)
```

**DIVIDE returns blank instead of error when denominator is zero.**

**Mistake 7: Using FILTER on Fact Tables with High Cardinality**

❌ **Performance problem:**
```DAX
High-Value Revenue = 
CALCULATE(
    [Total Revenue],
    FILTER( Sales, Sales[Revenue] > 1000 )  -- Sales has 10M rows!
)
```

**Problem:** FILTER iterates every row in Sales table. With millions of rows, this is slow.

✅ **Better (if possible):**
Create a calculated column categorizing transactions as high/low value, then filter on that.

Or if filtering on dimension table:
```DAX
High-Price Products Revenue = 
CALCULATE(
    [Total Revenue],
    FILTER( Products, Products[UnitPrice] > 100 )  -- Products has only 500 rows
)
```

**Mistake 8: Confusing ALL vs ALLSELECTED**

**Scenario:** Visual showing sales by product, year slicer set to 2023.

```DAX
Measure A = CALCULATE( [Total Revenue], ALL( Products ) )  -- Removes ALL filters
Measure B = CALCULATE( [Total Revenue], ALLSELECTED( Products ) )  -- Keeps year slicer
```

**Result:**
- Measure A: Shows revenue for all products across ALL years (ignores year slicer)
- Measure B: Shows revenue for all products in 2023 only (respects year slicer)

**Use ALLSELECTED when you want to respect slicers but ignore visual filters.**

**Misconception 1: "CALCULATE Always Adds Filters"**

**Truth:** CALCULATE can add, remove, or modify filters. It's a filter context manipulator, not just a filter adder.

```DAX
CALCULATE( [Total Revenue], ALL( Products ) )  -- Removes filters
CALCULATE( [Total Revenue], Products[Category] = "Electronics" )  -- Adds/replaces filter
```

**Misconception 2: "ALL() Clears All Filters in the Model"**

**Truth:** ALL only clears filters from the specified table or columns. Other tables remain filtered.

```DAX
CALCULATE(
    [Total Revenue],
    ALL( Products )  -- Clears Products filters only
)
```

If you have a year slicer (filters Calendar table), that filter still applies. Products filter is cleared, Calendar filter remains.

**Misconception 3: "FILTER Is Always Needed for Row-Level Filtering"**

**Truth:** Simple conditions can use simpler syntax.

```DAX
-- Both work, first is simpler
CALCULATE( [Revenue], Sales[Quantity] > 10 )
CALCULATE( [Revenue], FILTER( Sales, Sales[Quantity] > 10 ) )
```

Use FILTER when you need:
- Complex AND/OR logic
- Calculated conditions (e.g., comparing columns: Sales[Revenue] > Sales[Cost] * 1.5)

## 6️⃣ Hands-on Practice (Mandatory)

Open your Power BI practice file with Sales, Products, Customers, and Calendar tables.

### Exercise 1: Basic CALCULATE Filter Override

**Task:** Create a measure that always shows Electronics revenue, even if user selects different category.

**Steps:**
1. Create new measure: `Electronics Only Revenue`
2. Formula: `CALCULATE( SUM( Sales[Revenue] ), Products[Category] = "Electronics" )`
3. Test: Add Products[Category] slicer, select "Appliances"
4. Add both [Total Revenue] and [Electronics Only Revenue] to cards
5. Verify: Total Revenue changes with slicer, Electronics Only Revenue doesn't

**Expected:** Electronics Only Revenue always shows same number regardless of category slicer.

### Exercise 2: Percentage of Grand Total Using ALL

**Task:** Show each category's revenue as % of total company revenue.

**Steps:**
1. Create measure: `Grand Total Revenue = CALCULATE( [Total Revenue], ALL( Sales ) )`
2. Create measure: `% of Grand Total = DIVIDE( [Total Revenue], [Grand Total Revenue] )`
3. Create table visual: Products[Category] on rows
4. Add [Total Revenue] and [% of Grand Total] as values
5. Verify: Percentages sum to ~100%

**Expected Result:**
```
Category        Revenue      % of Grand Total
Electronics     $100,000     50%
Appliances      $60,000      30%
Furniture       $40,000      20%
```

### Exercise 3: Category Totals Using ALLEXCEPT

**Task:** In a product list, show each product's revenue and its category total.

**Steps:**
1. Create measure: `Category Total = CALCULATE( [Total Revenue], ALLEXCEPT( Products, Products[Category] ) )`
2. Create table visual with Products[Category], Products[ProductName]
3. Add [Total Revenue] and [Category Total] as values
4. Verify: All products in same category show same Category Total

**Expected Pattern:**
```
Category        Product     Revenue    Category Total
Electronics     Laptop      $50,000    $100,000
Electronics     Phone       $30,000    $100,000
Appliances      Fridge      $60,000    $120,000
Appliances      Microwave   $60,000    $120,000
```

### Exercise 4: ALLSELECTED with Slicer Respect

**Task:** Create % of visible total that respects year slicer but shows all categories.

**Steps:**
1. Create measure: `Visible Total = CALCULATE( [Total Revenue], ALLSELECTED( Products ) )`
2. Create measure: `% of Visible = DIVIDE( [Total Revenue], [Visible Total] )`
3. Create matrix: Products[Category] on rows, [% of Visible] as value
4. Add Calendar[Year] slicer
5. Test: Select different years, watch percentages recalculate

**Expected Behavior:**
- No year selected: Percentages out of all-time total
- 2023 selected: Percentages out of 2023 total only
- Percentages always sum to 100% regardless of year selection

### Exercise 5: Complex FILTER Condition

**Task:** Calculate revenue from high-value orders (>$1000) with quantity >5.

**Steps:**
1. Create measure:
```DAX
High-Value Multi-Item Revenue = 
CALCULATE(
    [Total Revenue],
    FILTER( 
        Sales,
        Sales[Revenue] > 1000 && Sales[Quantity] > 5
    )
)
```
2. Add to card visual
3. Compare with [Total Revenue]
4. Verify: Shows subset of total (only orders meeting both conditions)

### Exercise 6: Multiple Filter Overrides

**Task:** Show 2023 Electronics revenue regardless of slicers.

**Steps:**
1. Create measure:
```DAX
2023 Electronics Revenue = 
CALCULATE(
    [Total Revenue],
    Calendar[Year] = 2023,
    Products[Category] = "Electronics"
)
```
2. Add Year and Category slicers
3. Add measure to card
4. Test: Change slicers, measure never changes

**Expected:** Measure always shows same value (2023 Electronics) no matter what slicers show.

### Exercise 7: Rank Within Category

**Task:** Rank each product within its category by revenue.

**Steps:**
1. Create measure:
```DAX
Rank in Category = 
RANKX(
    ALLEXCEPT( Products, Products[Category] ),
    [Total Revenue],
    ,
    DESC
)
```
2. Create table: Products[Category], Products[ProductName], [Total Revenue], [Rank in Category]
3. Verify: Each category's ranks start at 1 (highest revenue product)

**Expected Pattern:**
```
Category        Product     Revenue    Rank
Electronics     Laptop      $50,000    1
Electronics     Phone       $30,000    2
Appliances      Fridge      $60,000    1
Appliances      Oven        $40,000    2
```

### Exercise 8: Filter Removal Comparison

**Task:** Create three measures showing different filter removal approaches.

**Steps:**
1. Measure 1: `Total All = CALCULATE( [Total Revenue], ALL( Products ) )`
2. Measure 2: `Total Category = CALCULATE( [Total Revenue], ALLEXCEPT( Products, Products[Category] ) )`
3. Measure 3: `Total Selected = CALCULATE( [Total Revenue], ALLSELECTED( Products ) )`
4. Create table with Products[Category], Products[ProductName], and all three measures
5. Add Category slicer
6. Test with different selections, observe differences

**Learning Goal:** Understand how ALL vs ALLEXCEPT vs ALLSELECTED produce different results in same visual.

## 7️⃣ Interview-Oriented Question

**Question:** "You have a sales report where users can filter by product category using a slicer. The business wants to add a column showing 'Revenue from Other Categories' (all categories EXCEPT the one in the current row). How would you build this measure?"

**Follow-up:** "What if they also want to respect any year filter the user applies?"

---

**Ideal Answer:**

"I would use CALCULATE with a FILTER function to exclude the current row's category while keeping all other filters active.

**Formula:**
```DAX
Other Categories Revenue = 
CALCULATE(
    [Total Revenue],
    FILTER(
        ALL( Products[Category] ),
        Products[Category] <> MAX( Products[Category] )
    )
)
```

**Explanation:**
1. ALL( Products[Category] ) removes the existing category filter from the visual row
2. FILTER reapplies a filter that excludes the current category
3. MAX( Products[Category] ) gets the category value from the current row context
4. The result is revenue from all categories except the current one

**For the follow-up:** The formula above already respects year filters because I only removed filters from the Category column, not the entire model. If there's a year slicer active, it remains active. If they want to explicitly ensure this:

```DAX
Other Categories Revenue (Year Aware) = 
CALCULATE(
    [Total Revenue],
    FILTER(
        ALLSELECTED( Products[Category] ),
        Products[Category] <> MAX( Products[Category] )
    )
)
```

Using ALLSELECTED ensures slicer filters are respected while removing only the category filter from the visual.

**Testing approach:**
1. Create matrix with Category on rows
2. Add [Total Revenue] and [Other Categories Revenue]
3. Verify: For Electronics row, Other Categories shows Appliances + Furniture total
4. Add year slicer, select 2023
5. Verify: Both measures now show 2023 values only"

---

**Why This Answer Impresses:**

1. **Directly addresses the requirement:** Measure excludes current category
2. **Explains the logic:** Step-by-step breakdown of formula components
3. **Shows understanding of filter context:** Knows that only removing category filter preserves other filters
4. **Demonstrates ALLSELECTED knowledge:** Uses it appropriately for slicer respect
5. **Includes testing methodology:** Describes how to verify the solution works
6. **Handles edge cases:** Considers what happens with slicers active

**Red Flags in Bad Answers:**

- Using ALL( Products ) which would clear ALL filters including year
- Not explaining WHY each function is needed
- Forgetting CALCULATE wrapper
- Using hard-coded category names instead of MAX( Products[Category] )
- Not considering how to respect other filters

## 8️⃣ Session Summary

Today you mastered the five essential filter-modifying functions that unlock advanced DAX calculations.

### Key Takeaways

**CALCULATE Is Your Power Tool**
- Evaluates an expression while modifying filter context
- Can add filters, remove filters, or override filters
- Required wrapper for filter modifier functions
- Used in majority of advanced measures

**FILTER Creates Custom Row-Level Conditions**
- Iterates through a table row-by-row
- Returns rows meeting specified conditions
- Use for complex AND/OR logic or calculated conditions
- Avoid on large fact tables when simpler filters work

**ALL Removes Filters Completely**
- ALL( table ) removes all filters from entire table
- ALL( column ) removes filters from specific columns
- Essential for grand total calculations
- Use when you need "ignore all filters" behavior

**ALLEXCEPT Removes Filters Selectively**
- Clears all filters from table EXCEPT specified columns
- Perfect for "total within group" calculations
- Use for category totals, regional totals, etc.
- Simpler than using ALL with multiple re-filters

**ALLSELECTED Respects Slicers**
- Removes filters from visual (row/column headers)
- Keeps filters from slicers and page/report filters
- Essential for "% of visible total" calculations
- Most contextually aware filter modifier

### Practical Patterns You Can Use Immediately

**Pattern 1: Percentage of Total**
```DAX
% of Total = DIVIDE( [Measure], CALCULATE( [Measure], ALL( Table ) ) )
```

**Pattern 2: Percentage Within Group**
```DAX
% of Group = DIVIDE( [Measure], CALCULATE( [Measure], ALLEXCEPT( Table, Table[GroupColumn] ) ) )
```

**Pattern 3: Compare Current to All**
```DAX
Difference from Average = [Measure] - CALCULATE( [Measure], ALL( Table ) )
```

**Pattern 4: Filter Override**
```DAX
Specific Value = CALCULATE( [Measure], DimensionTable[Column] = "Value" )
```

**Pattern 5: Complex Row Filter**
```DAX
Conditional Measure = CALCULATE( [Measure], FILTER( Table, Table[Column1] > Table[Column2] * 1.2 ) )
```

### What's Next?

Tomorrow (Day 6) you'll learn iterator functions (SUMX, AVERAGEX) that create row context for row-by-row calculations. You'll understand when to use iterators versus aggregators and learn the performance implications. These functions work hand-in-hand with today's filter modifiers to create sophisticated business calculations.

### Self-Check Questions

Before moving to Day 6, ensure you can answer:
1. What are the two things CALCULATE does?
2. When should you use FILTER instead of a simple filter argument?
3. What's the difference between ALL, ALLEXCEPT, and ALLSELECTED?
4. How do you create a percentage-of-total measure?
5. Why doesn't this work: `SUM( Sales[Revenue] ) ALL( Products )`?
6. In what order does CALCULATE process multiple filter arguments?
7. When would ALLSELECTED give different results than ALL?

If you can answer these confidently, you're ready for iterators tomorrow!
