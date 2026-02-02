# DAY 8 - Time Intelligence Part 2

## 1️⃣ Session Overview

Today you'll master advanced Time Intelligence techniques—calculating Year-over-Year (YoY) comparisons, growth percentages, moving averages, and period-to-period analytics. You'll learn powerful functions like SAMEPERIODLASTYEAR, DATEADD, PARALLELPERIOD, and techniques for creating rolling calculations. These are the most requested analytics in business reporting: "How do we compare to last year?", "What's our growth rate?", "What's the 3-month trend?"

In real projects, comparative analysis is everywhere: comparing this month vs last month, this year vs last year, analyzing trends over rolling periods. Executives want to see growth rates, finance needs year-over-year variance analysis, and operations tracks moving averages for trend detection. Mastering these patterns makes you invaluable to any data team.

## 2️⃣ Learning Objectives

- Master Year-over-Year (YoY) comparison calculations
- Calculate growth percentages and variance analysis
- Understand SAMEPERIODLASTYEAR, DATEADD, and PARALLELPERIOD functions
- Implement moving averages and rolling calculations
- Create dynamic period comparisons (vs Previous Month, Quarter, Year)
- Build trend analysis measures for business intelligence
- Handle edge cases (first year data, partial periods)
- Optimize time comparison calculations for performance
- Apply best practices for comparative analytics in reports

## 3️⃣ Key Concepts (Explained Simply)

**What is Period Comparison?**

Period comparison means evaluating a metric for one time period relative to another time period.

**Common business questions:**
- "How do our Q3 2024 sales compare to Q3 2023?" (Year-over-Year)
- "What's our revenue growth vs last month?" (Month-over-Month)
- "Is customer satisfaction improving over time?" (Trend analysis)
- "What's our average sales over the last 3 months?" (Moving average)

**Why comparisons matter:**
- Raw numbers lack context ($1M revenue—is that good?)
- Comparisons provide context ($1M vs $800K last year = 25% growth! That's great!)
- Trends reveal patterns that single points hide
- Growth rates are more meaningful than absolute values

**Real-world analogy:** If your friend says "I ran 5 miles today," you might say "okay." But if they say "I ran 5 miles today, and last month I could only run 2 miles," now you understand progress!

**Year-over-Year (YoY) Analysis**

**Definition:** Year-over-Year compares a metric in the current period to the same period one year earlier.

**Examples:**
- January 2024 sales vs January 2023 sales
- Q3 2024 revenue vs Q3 2023 revenue
- Week 15 of 2024 vs Week 15 of 2023

**Why YoY specifically?**
1. **Eliminates seasonality:** Comparing January to January accounts for seasonal patterns
2. **Standard business practice:** Most companies report YoY growth
3. **Fair comparison:** Same calendar period, same number of days

**Business value:** 
- "We grew 15% YoY" is instantly understood by executives
- Investors and analysts expect YoY metrics
- Reveals true growth independent of seasonal fluctuations

**The Challenge of Time Comparisons**

**Naive approach (doesn't work):**
```DAX
Last Year Sales = [Total Sales] - 365  -- ❌ Can't just subtract days!
```

**Why it's hard:**
- Must identify equivalent historical period
- Handle leap years (365 vs 366 days)
- Respect fiscal vs calendar years
- Work with any date granularity (day, month, quarter, year)
- Deal with missing data (no sales last year)

**DAX Time Intelligence solution:** Functions that automatically shift date filters to corresponding historical periods.

**Core Time Intelligence Functions for Comparisons**

**SAMEPERIODLASTYEAR**

**Purpose:** Shifts dates back exactly one year.

**Syntax:**
```DAX
SAMEPERIODLASTYEAR( <dates> )
```

**Example:**
```DAX
Sales Last Year = 
CALCULATE(
    [Total Sales],
    SAMEPERIODLASTYEAR( Calendar[Date] )
)
```

**What it does:**
- Takes current date filter context
- Shifts all dates back by exactly one year
- Calculates measure with shifted dates

**Example:** If filtered to March 2024, SAMEPERIODLASTYEAR shifts to March 2023.

**DATEADD**

**Purpose:** Shifts dates by any specified interval.

**Syntax:**
```DAX
DATEADD(
    <dates>,
    <number_of_intervals>,
    <interval>
)
```

**Intervals:** YEAR, QUARTER, MONTH, DAY

**Examples:**
```DAX
// One month ago
Sales Last Month = 
CALCULATE(
    [Total Sales],
    DATEADD( Calendar[Date], -1, MONTH )
)

// One quarter ago
Sales Last Quarter = 
CALCULATE(
    [Total Sales],
    DATEADD( Calendar[Date], -1, QUARTER )
)

// One year ago (same as SAMEPERIODLASTYEAR)
Sales Last Year = 
CALCULATE(
    [Total Sales],
    DATEADD( Calendar[Date], -1, YEAR )
)
```

**Positive numbers:** Shift forward
**Negative numbers:** Shift backward

**PARALLELPERIOD**

**Purpose:** Returns parallel period in previous/next interval.

**Syntax:**
```DAX
PARALLELPERIOD(
    <dates>,
    <number_of_intervals>,
    <interval>
)
```

**Difference from DATEADD:**
- DATEADD shifts by exact intervals
- PARALLELPERIOD returns complete parallel periods

**Example difference:**

**Current context:** January 15 - January 20, 2024

**Using DATEADD (shifts dates exactly):**
```DAX
DATEADD( Calendar[Date], -1, MONTH )  
-- Returns: December 15 - December 20, 2023
```

**Using PARALLELPERIOD (returns full month):**
```DAX
PARALLELPERIOD( Calendar[Date], -1, MONTH )  
-- Returns: December 1 - December 31, 2023 (entire month!)
```

**When to use each:**
- **DATEADD:** When you want exact date-for-date comparison
- **PARALLELPERIOD:** When you want full period comparison

**Common pattern - Previous Month Total:**
```DAX
Sales Previous Month = 
CALCULATE(
    [Total Sales],
    PARALLELPERIOD( Calendar[Date], -1, MONTH )
)
```

**Growth and Variance Calculations**

**Absolute Variance**

Shows the difference in raw numbers.

```DAX
Sales Variance = [Total Sales] - [Sales Last Year]
```

**Example:** 
- 2024: $1,200,000
- 2023: $1,000,000
- Variance: $200,000 (increased by $200K)

**Percentage Growth**

Shows relative change as a percentage.

```DAX
Sales YoY Growth % = 
DIVIDE(
    [Total Sales] - [Sales Last Year],
    [Sales Last Year]
)
```

**Example:**
- 2024: $1,200,000
- 2023: $1,000,000
- Growth: ($1,200,000 - $1,000,000) / $1,000,000 = 0.20 = 20%

**Format as percentage:** 20% (not 0.20)

**Growth Percentage Formula Explained:**

$$\text{Growth %} = \frac{\text{Current} - \text{Previous}}{\text{Previous}} \times 100$$

**Interpretation:**
- **Positive %:** Growth (20% = grew by 20%)
- **Negative %:** Decline (-10% = declined by 10%)
- **0%:** No change
- **100%:** Doubled
- **-100%:** Dropped to zero

**Complete YoY Pattern:**
```DAX
// Base measures
Total Sales = SUM( Sales[Revenue] )

Sales Last Year = 
CALCULATE(
    [Total Sales],
    SAMEPERIODLASTYEAR( Calendar[Date] )
)

// Variance
Sales YoY Variance = [Total Sales] - [Sales Last Year]

// Growth %
Sales YoY Growth % = 
DIVIDE(
    [Sales YoY Variance],
    [Sales Last Year]
)
```

**Moving Averages and Rolling Calculations**

**What is a Moving Average?**

A moving average calculates the average of a metric over a sliding window of time.

**Example: 3-Month Moving Average**

| Month     | Sales    | 3-Month Moving Avg |
|-----------|----------|-------------------|
| January   | $100,000 | N/A               |
| February  | $120,000 | N/A               |
| March     | $140,000 | $120,000          | ← Avg(Jan, Feb, Mar)
| April     | $110,000 | $123,333          | ← Avg(Feb, Mar, Apr)
| May       | $130,000 | $126,667          | ← Avg(Mar, Apr, May)

**Notice:** The window "moves" each month, always including the most recent 3 months.

**Why Moving Averages?**
1. **Smooth out volatility:** See the trend without daily/monthly noise
2. **Trend detection:** Rising MA = upward trend, falling MA = downward trend
3. **Forecasting:** Helps predict future values based on recent history
4. **Anomaly detection:** Large deviations from MA indicate unusual events

**Business use cases:**
- Average daily sales over last 7 days (weekly trend)
- Average monthly revenue over last 12 months (annual trend)
- Customer satisfaction rolling 30-day average

**Creating Moving Averages in DAX**

**Pattern: Use DATESINPERIOD**

```DAX
Sales 3-Month MA = 
CALCULATE(
    AVERAGE( Sales[Revenue] ),
    DATESINPERIOD(
        Calendar[Date],
        MAX( Calendar[Date] ),
        -3,
        MONTH
    )
)
```

**How it works:**
1. `MAX(Calendar[Date])` gets the latest date in current context
2. `DATESINPERIOD` creates a date range: last 3 months from that date
3. `AVERAGE(Sales[Revenue])` calculates average over those dates

**Alternative pattern: Using AVERAGEX with date range**

```DAX
Sales 3-Month MA = 
VAR CurrentDate = MAX( Calendar[Date] )
VAR Last3Months = 
    DATESINPERIOD(
        Calendar[Date],
        CurrentDate,
        -3,
        MONTH
    )
RETURN
    CALCULATE(
        [Total Sales],
        Last3Months
    ) / 3
```

**Rolling Totals**

Similar to moving averages, but sums instead of averages.

**Rolling 12-Month Total (Trailing 12 Months):**
```DAX
Sales Rolling 12M = 
CALCULATE(
    [Total Sales],
    DATESINPERIOD(
        Calendar[Date],
        MAX( Calendar[Date] ),
        -12,
        MONTH
    )
)
```

**Use cases:**
- Last 12 months sales (TTM - Trailing Twelve Months)
- Last 90 days revenue
- Last 7 days active users

**Dynamic Period Comparisons**

**Previous Period (Generic)**

Works for any date granularity (day, month, quarter, year):

```DAX
Sales Previous Period = 
CALCULATE(
    [Total Sales],
    DATEADD( Calendar[Date], -1, MONTH )
)
```

Change `MONTH` to `QUARTER` or `YEAR` as needed.

**Previous Month Total (Complete Month)**

```DAX
Sales Previous Month = 
CALCULATE(
    [Total Sales],
    PARALLELPERIOD( Calendar[Date], -1, MONTH )
)
```

**Previous Quarter Total:**
```DAX
Sales Previous Quarter = 
CALCULATE(
    [Total Sales],
    PARALLELPERIOD( Calendar[Date], -1, QUARTER )
)
```

**Month-over-Month (MoM) Growth:**
```DAX
Sales MoM Growth % = 
VAR CurrentMonth = [Total Sales]
VAR LastMonth = [Sales Previous Month]
RETURN
    DIVIDE(
        CurrentMonth - LastMonth,
        LastMonth
    )
```

**Quarter-over-Quarter (QoQ) Growth:**
```DAX
Sales QoQ Growth % = 
VAR CurrentQuarter = [Total Sales]
VAR LastQuarter = [Sales Previous Quarter]
RETURN
    DIVIDE(
        CurrentQuarter - LastQuarter,
        LastQuarter
    )
```

**Handling Edge Cases**

**Problem 1: No Data for Previous Period**

**Scenario:** Your data starts in 2023, but you calculate YoY in 2023 (no 2022 data).

**Result:** `[Sales Last Year]` returns BLANK.

**Issue:** Division by blank causes errors in growth calculations.

**Solution: Use DIVIDE with default value:**
```DAX
Sales YoY Growth % = 
DIVIDE(
    [Total Sales] - [Sales Last Year],
    [Sales Last Year],
    BLANK()  -- Return blank instead of error
)
```

Or provide context:
```DAX
Sales YoY Growth % = 
IF(
    ISBLANK( [Sales Last Year] ),
    BLANK(),  -- Or show "N/A" in reports
    DIVIDE(
        [Total Sales] - [Sales Last Year],
        [Sales Last Year]
    )
)
```

**Problem 2: Partial Periods**

**Scenario:** Comparing Q1 2024 (complete) to Q1 2025 (only January data so far).

**Issue:** Unfair comparison (90 days vs 31 days).

**Solution 1: Only compare complete periods**
```DAX
Sales YoY Growth % = 
VAR IsCompletePeriod = 
    -- Logic to check if period is complete
    MONTH( MAX( Calendar[Date] ) ) = 3  -- Q1 ends in March
RETURN
    IF(
        IsCompletePeriod,
        DIVIDE( [Sales YoY Variance], [Sales Last Year] ),
        BLANK()
    )
```

**Solution 2: Normalize by days**
```DAX
Sales Per Day = DIVIDE( [Total Sales], COUNTROWS( Calendar ) )
Sales Per Day LY = 
CALCULATE(
    [Sales Per Day],
    SAMEPERIODLASTYEAR( Calendar[Date] )
)
```

**Problem 3: First Period Has No Prior Period**

**Example:** January 2023 is your first month of data. You can't calculate Previous Month or YoY.

**Solution: Conditional display**
```DAX
Sales vs Previous = 
IF(
    ISBLANK( [Sales Previous Period] ),
    "N/A - First Period",
    [Sales YoY Growth %]
)
```

Or simply allow BLANK values and explain in documentation.

## 4️⃣ Essential DAX Formulas

**Basic Year-over-Year Measures**

```DAX
// Base measure
Total Sales = SUM( Sales[Revenue] )

// Last year's sales (same period)
Sales Last Year = 
CALCULATE(
    [Total Sales],
    SAMEPERIODLASTYEAR( Calendar[Date] )
)

// Absolute variance
Sales YoY Variance = 
[Total Sales] - [Sales Last Year]

// Percentage growth
Sales YoY Growth % = 
DIVIDE(
    [Sales YoY Variance],
    [Sales Last Year]
)
```

**Month-over-Month Comparison**

```DAX
// Last month (exact date shift)
Sales Last Month = 
CALCULATE(
    [Total Sales],
    DATEADD( Calendar[Date], -1, MONTH )
)

// Previous month total (full month)
Sales Previous Month Total = 
CALCULATE(
    [Total Sales],
    PARALLELPERIOD( Calendar[Date], -1, MONTH )
)

// Month-over-Month growth
Sales MoM Growth % = 
DIVIDE(
    [Total Sales] - [Sales Last Month],
    [Sales Last Month]
)
```

**Quarter-over-Quarter Comparison**

```DAX
// Last quarter
Sales Last Quarter = 
CALCULATE(
    [Total Sales],
    DATEADD( Calendar[Date], -1, QUARTER )
)

// Previous quarter total
Sales Previous Quarter Total = 
CALCULATE(
    [Total Sales],
    PARALLELPERIOD( Calendar[Date], -1, QUARTER )
)

// Quarter-over-Quarter growth
Sales QoQ Growth % = 
DIVIDE(
    [Total Sales] - [Sales Last Quarter],
    [Sales Last Quarter]
)
```

**3-Month Moving Average**

```DAX
Sales 3-Month MA = 
CALCULATE(
    [Total Sales],
    DATESINPERIOD(
        Calendar[Date],
        MAX( Calendar[Date] ),
        -3,
        MONTH
    )
) / 3
```

Or using AVERAGEX:
```DAX
Sales 3-Month MA = 
AVERAGEX(
    DATESINPERIOD(
        Calendar[Date],
        MAX( Calendar[Date] ),
        -3,
        MONTH
    ),
    [Total Sales]
)
```

**12-Month Rolling Total (TTM)**

```DAX
Sales TTM = 
CALCULATE(
    [Total Sales],
    DATESINPERIOD(
        Calendar[Date],
        LASTDATE( Calendar[Date] ),
        -12,
        MONTH
    )
)
```

**7-Day Rolling Average**

```DAX
Sales 7-Day MA = 
CALCULATE(
    [Total Sales],
    DATESINPERIOD(
        Calendar[Date],
        MAX( Calendar[Date] ),
        -7,
        DAY
    )
) / 7
```

**30-Day Rolling Average**

```DAX
Sales 30-Day MA = 
CALCULATE(
    [Total Sales],
    DATESINPERIOD(
        Calendar[Date],
        MAX( Calendar[Date] ),
        -30,
        DAY
    )
) / 30
```

**Complete YoY Analysis Suite**

```DAX
// Current period
Total Sales = SUM( Sales[Revenue] )

// Prior periods
Sales Last Year = 
CALCULATE( [Total Sales], SAMEPERIODLASTYEAR( Calendar[Date] ) )

Sales Last Quarter = 
CALCULATE( [Total Sales], DATEADD( Calendar[Date], -1, QUARTER ) )

Sales Last Month = 
CALCULATE( [Total Sales], DATEADD( Calendar[Date], -1, MONTH ) )

// Variances
YoY Variance = [Total Sales] - [Sales Last Year]
QoQ Variance = [Total Sales] - [Sales Last Quarter]
MoM Variance = [Total Sales] - [Sales Last Month]

// Growth percentages
YoY Growth % = DIVIDE( [YoY Variance], [Sales Last Year] )
QoQ Growth % = DIVIDE( [QoQ Variance], [Sales Last Quarter] )
MoM Growth % = DIVIDE( [MoM Variance], [Sales Last Month] )
```

**Dynamic Period Selection**

Allow users to select comparison period:

```DAX
Sales vs Previous Period = 
VAR SelectedPeriod = SELECTEDVALUE( PeriodTable[Period], "YoY" )
VAR Result = 
    SWITCH(
        SelectedPeriod,
        "YoY", [Sales Last Year],
        "QoQ", [Sales Last Quarter],
        "MoM", [Sales Last Month],
        [Sales Last Year]  -- Default
    )
RETURN
    Result
```

**Growth % with dynamic period:**
```DAX
Growth % Dynamic = 
DIVIDE(
    [Total Sales] - [Sales vs Previous Period],
    [Sales vs Previous Period]
)
```

**Conditional Formatting Helpers**

**Traffic light logic for growth:**
```DAX
Growth Status = 
SWITCH(
    TRUE(),
    [YoY Growth %] >= 0.10, "🟢 Strong Growth (>10%)",
    [YoY Growth %] >= 0, "🟡 Moderate Growth",
    [YoY Growth %] >= -0.05, "🟠 Slight Decline",
    "🔴 Significant Decline (<-5%)"
)
```

**Color indicator:**
```DAX
Growth Color = 
SWITCH(
    TRUE(),
    [YoY Growth %] > 0, "Green",
    [YoY Growth %] < 0, "Red",
    "Gray"
)
```

**YoY with Previous Year Context**

Show both values side-by-side:

```DAX
Sales Comparison Text = 
VAR CurrentValue = [Total Sales]
VAR PriorValue = [Sales Last Year]
VAR Growth = [YoY Growth %]
RETURN
    CurrentValue & " vs " & PriorValue & 
    " (" & FORMAT( Growth, "0.0%" ) & ")"
```

**Example output:** "$1,200,000 vs $1,000,000 (20.0%)"

**Advanced: Same Week Last Year**

For retailers who need week-by-week comparison:

```DAX
Sales Same Week Last Year = 
CALCULATE(
    [Total Sales],
    DATEADD( Calendar[Date], -52, WEEK )
)
```

Or using week number:
```DAX
Sales Same Week Last Year = 
VAR CurrentWeek = MAX( Calendar[WeekOfYear] )
VAR LastYear = MAX( Calendar[Year] ) - 1
RETURN
    CALCULATE(
        [Total Sales],
        Calendar[WeekOfYear] = CurrentWeek,
        Calendar[Year] = LastYear
    )
```

## 5️⃣ Hands-On Practice Exercises

**Exercise 1: Basic YoY Measures**

**Task:** Create Year-over-Year comparison measures.

**Prerequisites:** 
- Calendar table properly configured
- Base measure: `Total Sales = SUM(Sales[Revenue])`

**Create measures:**
```DAX
Sales Last Year = 
CALCULATE(
    [Total Sales],
    SAMEPERIODLASTYEAR( Calendar[Date] )
)

Sales YoY Variance = 
[Total Sales] - [Sales Last Year]

Sales YoY Growth % = 
DIVIDE(
    [Sales YoY Variance],
    [Sales Last Year]
)
```

**Test:**
1. Create Table visual: Calendar[Year] | Calendar[MonthName] | [Total Sales] | [Sales Last Year] | [Sales YoY Growth %]
2. **Verify:** 
   - Jan 2024 compared to Jan 2023
   - Growth % calculates correctly
   - Format Growth % as percentage

**Expected result:**

| Year | Month    | Total Sales | Sales Last Year | YoY Growth % |
|------|----------|-------------|-----------------|--------------|
| 2024 | January  | $120,000    | $100,000        | 20.0%        |
| 2024 | February | $140,000    | $110,000        | 27.3%        |

**Exercise 2: Month-over-Month Growth**

**Task:** Create MoM comparison using DATEADD.

```DAX
Sales Last Month = 
CALCULATE(
    [Total Sales],
    DATEADD( Calendar[Date], -1, MONTH )
)

Sales MoM Growth % = 
DIVIDE(
    [Total Sales] - [Sales Last Month],
    [Sales Last Month]
)
```

**Test:**
1. Create Table: Calendar[MonthYear] | [Total Sales] | [Sales Last Month] | [Sales MoM Growth %]
2. Sort by MonthYear
3. **Verify:** Each month compared to immediately previous month

**Exercise 3: Quarter-over-Quarter Comparison**

**Task:** Implement QoQ analysis with PARALLELPERIOD.

```DAX
Sales Previous Quarter = 
CALCULATE(
    [Total Sales],
    PARALLELPERIOD( Calendar[Date], -1, QUARTER )
)

Sales QoQ Growth % = 
DIVIDE(
    [Total Sales] - [Sales Previous Quarter],
    [Sales Previous Quarter]
)
```

**Test:**
1. Create Table: Calendar[Year] | Calendar[Quarter] | [Total Sales] | [Sales Previous Quarter] | [Sales QoQ Growth %]
2. **Verify:** Q2 compared to Q1, Q3 compared to Q2, etc.

**Exercise 4: 3-Month Moving Average**

**Task:** Create a 3-month moving average measure.

```DAX
Sales 3-Month MA = 
CALCULATE(
    [Total Sales],
    DATESINPERIOD(
        Calendar[Date],
        MAX( Calendar[Date] ),
        -3,
        MONTH
    )
) / 3
```

**Test:**
1. Create Line chart: X-axis = Calendar[MonthYear], Y-axis = [Total Sales] and [Sales 3-Month MA]
2. **Verify:** Moving average line is smoother than actual sales
3. **Notice:** First 2 months may show N/A or lower values (insufficient history)

**Exercise 5: 12-Month Rolling Total**

**Task:** Calculate Trailing Twelve Months (TTM) revenue.

```DAX
Sales TTM = 
CALCULATE(
    [Total Sales],
    DATESINPERIOD(
        Calendar[Date],
        LASTDATE( Calendar[Date] ),
        -12,
        MONTH
    )
)
```

**Test:**
1. Create Card visual showing [Sales TTM]
2. Add date slicer, change dates
3. **Verify:** Always shows sum of last 12 months from selected date

**Exercise 6: Complete YoY Dashboard**

**Task:** Build a comprehensive comparison table.

**Measures needed:** (All created in previous exercises)

**Create table visual with:**
- Calendar[Year]
- Calendar[MonthName]
- [Total Sales]
- [Sales Last Year]
- [Sales YoY Variance]
- [Sales YoY Growth %]

**Add conditional formatting:**
1. YoY Growth % column:
   - Green if > 0
   - Red if < 0
   - Data bars for visual comparison

2. YoY Variance column:
   - Color scale based on value

**Exercise 7: Growth Status Indicator**

**Task:** Create a text indicator for growth performance.

```DAX
Growth Status = 
SWITCH(
    TRUE(),
    [Sales YoY Growth %] >= 0.15, "🟢 Excellent (>15%)",
    [Sales YoY Growth %] >= 0.05, "🟡 Good (5-15%)",
    [Sales YoY Growth %] >= 0, "🟠 Modest (<5%)",
    [Sales YoY Growth %] >= -0.05, "🔴 Slight Decline",
    "⚫ Significant Decline"
)
```

**Test:**
1. Add [Growth Status] to card visual
2. Filter to different months
3. **Verify:** Status changes based on growth %

**Exercise 8: Dynamic Period Comparison**

**Task:** Allow users to select comparison period (YoY, QoQ, MoM).

**Steps:**
1. Create a new table (Enter Data):
```
Period
YoY
QoQ
MoM
```

2. Create measure:
```DAX
Sales Previous Period = 
VAR SelectedPeriod = SELECTEDVALUE( Period[Period], "YoY" )
RETURN
    SWITCH(
        SelectedPeriod,
        "YoY", [Sales Last Year],
        "QoQ", [Sales Previous Quarter],
        "MoM", [Sales Last Month],
        [Sales Last Year]
    )

Growth % = 
DIVIDE(
    [Total Sales] - [Sales Previous Period],
    [Sales Previous Period]
)
```

3. **Test:** Add slicer for Period[Period], change selection, verify measures update

## 6️⃣ Common Mistakes & Troubleshooting

**Mistake 1: Using Wrong Comparison Function**

**Symptom:** Comparisons don't match expected periods.

**Problem: DATEADD vs PARALLELPERIOD confusion**

❌ **Wrong for "Last Month Total":**
```DAX
Sales Last Month = 
CALCULATE(
    [Total Sales],
    DATEADD( Calendar[Date], -1, MONTH )
)
```

**Why wrong:** If viewing Jan 15-20, DATEADD shifts to Dec 15-20 (not full December).

✅ **Correct for "Last Month Total":**
```DAX
Sales Last Month = 
CALCULATE(
    [Total Sales],
    PARALLELPERIOD( Calendar[Date], -1, MONTH )
)
```

**Fix:** Returns full December (Dec 1-31).

**Rule:**
- Use **DATEADD** for exact date-for-date shifts
- Use **PARALLELPERIOD** for complete prior period

**Mistake 2: Division by Zero in Growth Calculations**

**Symptom:**
```DAX
YoY Growth % = ([Total Sales] - [Sales Last Year]) / [Sales Last Year]
```
Returns infinity or error when Sales Last Year = 0.

**Problem:** Some periods have zero sales (new product, store closed, etc.).

✅ **Always use DIVIDE:**
```DAX
YoY Growth % = 
DIVIDE(
    [Total Sales] - [Sales Last Year],
    [Sales Last Year]
)
```

**DIVIDE automatically:**
- Returns BLANK if denominator is zero
- Prevents error messages
- Can specify alternative return value: `DIVIDE(..., ..., 0)`

**Mistake 3: Forgetting to Handle Missing Prior Period Data**

**Symptom:** Blank values for YoY in first year of data.

**Problem:** No 2022 data exists to compare 2023 against.

**Bad user experience:** Report shows blank without explanation.

**Better approach: Provide context**
```DAX
Sales YoY Growth % = 
VAR PriorPeriod = [Sales Last Year]
RETURN
    IF(
        ISBLANK( PriorPeriod ),
        BLANK(),  -- Or return "N/A" via text measure
        DIVIDE( [Total Sales] - PriorPeriod, PriorPeriod )
    )
```

**For text display:**
```DAX
Growth Text = 
IF(
    ISBLANK( [Sales Last Year] ),
    "N/A (No Prior Data)",
    FORMAT( [Sales YoY Growth %], "0.0%" )
)
```

**Mistake 4: Comparing Incomplete Periods**

**Symptom:** "We're down 70% QoQ!" But it's only the first month of quarter.

**Problem:** Comparing complete Q4 (Oct-Dec) to incomplete Q1 (only Jan so far).

**Solution 1: Only show comparison for complete periods**
```DAX
QoQ Growth % = 
VAR IsCompleteQuarter = 
    MONTH( MAX( Calendar[Date] ) ) IN {3, 6, 9, 12}  -- End of quarter months
RETURN
    IF(
        IsCompleteQuarter,
        DIVIDE( [Total Sales] - [Sales Last Quarter], [Sales Last Quarter] ),
        BLANK()
    )
```

**Solution 2: Normalize by days**
```DAX
Sales Per Day = DIVIDE( [Total Sales], DISTINCTCOUNT( Calendar[Date] ) )

Sales Per Day LY = 
CALCULATE(
    [Sales Per Day],
    SAMEPERIODLASTYEAR( Calendar[Date] )
)

YoY Growth % (Normalized) = 
DIVIDE(
    [Sales Per Day] - [Sales Per Day LY],
    [Sales Per Day LY]
)
```

**Mistake 5: Not Considering Seasonality**

**Problem:** Month-over-Month comparisons misleading due to seasonal patterns.

**Example:** 
- December sales: $500K (holiday season)
- January sales: $300K (post-holiday drop)
- MoM: -40% 😱

**But this might be normal seasonal pattern!**

**Better comparison: Year-over-Year**
- January 2024: $300K
- January 2023: $250K
- YoY: +20% 😊 (actually growing!)

**Lesson:** Always provide YoY alongside MoM/QoQ for context.

**Mistake 6: Moving Average Edge Effects**

**Symptom:** First N periods show incorrect or blank moving averages.

**Problem:** 3-month MA in January only has 1 month of data.

**Options:**

**Option 1: Show blank until sufficient history**
```DAX
Sales 3-Month MA = 
VAR MonthsAvailable = COUNTROWS( DATESINPERIOD( ... ) )
RETURN
    IF(
        MonthsAvailable >= 3,
        [Sales 3-Month MA],
        BLANK()
    )
```

**Option 2: Calculate with available data**
```DAX
Sales 3-Month MA = 
VAR DateRange = DATESINPERIOD( Calendar[Date], MAX(Calendar[Date]), -3, MONTH )
VAR MonthCount = COUNTROWS( VALUES( Calendar[Month] ) )
RETURN
    CALCULATE( [Total Sales], DateRange ) / MonthCount
```

**Document which approach you're using** to avoid confusion.

**Mistake 7: Inconsistent Date Granularity**

**Symptom:** Moving average jumps erratically.

**Problem:** Using wrong date column or missing dates in Calendar.

**Fix checklist:**
1. ✅ Calendar has continuous dates (no gaps)
2. ✅ Relationship is active
3. ✅ Using Calendar[Date], not Sales[OrderDate] in DATESINPERIOD
4. ✅ Calendar marked as Date Table

**Verification:**
```DAX
Date Count = COUNTROWS( Calendar )
```
Should equal expected number of days in range.

## 7️⃣ Interview-Oriented Question

**Question:**

"Your executive dashboard shows a YoY revenue growth of 25% for Q1 2024 compared to Q1 2023, which the CFO is excited about. However, the VP of Sales notices that Month-over-Month growth shows -15% for March. The VP is concerned and asks you to explain what's happening. How would you analyze this situation and what additional measures would you create to provide clarity?"

**Follow-up:** "The CFO also wants to see a 12-month rolling average to smooth out seasonal variations. How would you implement this, and what would be the benefit compared to looking at individual monthly values?"

---

### Ideal Answer:

**Part 1: Analyzing the YoY vs MoM Discrepancy**

**"This situation highlights why we need multiple comparison types. Let me explain:"**

**YoY Growth (+25%):**
```DAX
Q1 2024: $1,250,000
Q1 2023: $1,000,000
YoY Growth: 25%
```
✅ **Indicates:** Overall growth trajectory is strong vs last year.

**MoM Growth for March (-15%):**
```DAX
March 2024: $400,000
February 2024: $470,000
MoM Growth: -15%
```
⚠️ **Indicates:** Drop from previous month.

**Possible explanations:**

**1. Seasonality**
- February might naturally be higher (e.g., Valentine's Day for retail)
- March drop could be normal seasonal pattern
- **Verification:** Check March 2023 vs Feb 2023

**Additional measure to create:**
```DAX
MoM Growth Same Period LY = 
VAR CurrentMoM = [Sales MoM Growth %]
VAR LastYearMoM = 
    CALCULATE(
        [Sales MoM Growth %],
        SAMEPERIODLASTYEAR( Calendar[Date] )
    )
RETURN
    CurrentMoM
```

Compare:
- March 2024 MoM: -15%
- March 2023 MoM: -18%

**Conclusion:** If 2023 also dropped in March, this is seasonal, not concerning.

**2. Different number of selling days**
- February 2024 might have had extra weekend or promotional days
- March might have fewer

**Verification measure:**
```DAX
Sales Per Day = 
DIVIDE(
    [Total Sales],
    DISTINCTCOUNT( Calendar[Date] )
)
```

Compare February vs March on per-day basis.

**3. One-time events**
- February had major promotion
- March didn't repeat it

**Recommendation: Create comprehensive view**

**Measures to add:**
```DAX
// 1. Sequential month comparison
Sales Each Month = [Total Sales]
Sales Last Month = CALCULATE( [Total Sales], DATEADD(Calendar[Date], -1, MONTH) )
Sales Same Month LY = CALCULATE( [Total Sales], SAMEPERIODLASTYEAR(Calendar[Date]) )

// 2. Multiple growth metrics
MoM Growth % = DIVIDE( [Sales Each Month] - [Sales Last Month], [Sales Last Month] )
YoY Growth % = DIVIDE( [Sales Each Month] - [Sales Same Month LY], [Sales Same Month LY] )

// 3. Normalized metrics
Sales Per Day = DIVIDE( [Total Sales], DISTINCTCOUNT(Calendar[Date]) )
Sales Per Day YoY = CALCULATE( [Sales Per Day], SAMEPERIODLASTYEAR(Calendar[Date]) )
```

**Visual to create:**

| Month    | 2024 Sales | 2023 Sales | YoY Growth % | MoM Growth % |
|----------|------------|------------|--------------|--------------|
| January  | $400,000   | $320,000   | 25.0%        | N/A          |
| February | $470,000   | $360,000   | 30.6%        | 17.5%        |
| March    | $380,000   | $320,000   | 18.8%        | -19.1%       |

**Insight:** March 2024 ($380K) is still up 18.8% vs March 2023 ($320K). The MoM drop is concerning in isolation, but YoY shows continued growth. Likely seasonal pattern.

**Part 2: 12-Month Rolling Average**

**"A rolling average smooths short-term fluctuations to reveal underlying trends."**

**Implementation:**
```DAX
Sales 12-Month MA = 
CALCULATE(
    [Total Sales],
    DATESINPERIOD(
        Calendar[Date],
        LASTDATE( Calendar[Date] ),
        -12,
        MONTH
    )
) / 12
```

Or using AVERAGEX:
```DAX
Sales 12-Month MA = 
AVERAGEX(
    DATESINPERIOD(
        Calendar[Date],
        LASTDATE( Calendar[Date] ),
        -12,
        MONTH
    ),
    [Total Sales]
)
```

**Benefits:**

**1. Smooths seasonality**
- Individual months fluctuate (holidays, promotions)
- 12-month average removes seasonal noise
- Reveals true trend direction

**2. Better for trend analysis**
- Is the business growing or declining overall?
- One bad month doesn't skew perception
- Board presentations benefit from stability

**3. Forecasting**
- Smoothed trends better predict future
- Removes outlier influence

**Visual comparison:**

| Month       | Monthly Sales | 12-Month MA | Trend    |
|-------------|---------------|-------------|----------|
| Jan 2024    | $400,000      | $385,000    | ↑ Up     |
| Feb 2024    | $470,000      | $390,000    | ↑ Up     |
| Mar 2024    | $380,000      | $392,000    | ↑ Up     |

**Insight:** Despite March's monthly drop, the 12-month MA continues increasing, confirming overall growth trajectory.

**Complete executive dashboard:**

```DAX
// Current period
Total Sales = SUM( Sales[Revenue] )

// YoY comparison
Sales YoY = CALCULATE( [Total Sales], SAMEPERIODLASTYEAR(Calendar[Date]) )
YoY Growth % = DIVIDE( [Total Sales] - [Sales YoY], [Sales YoY] )

// MoM comparison
Sales MoM = CALCULATE( [Total Sales], DATEADD(Calendar[Date], -1, MONTH) )
MoM Growth % = DIVIDE( [Total Sales] - [Sales MoM], [Sales MoM] )

// Trend analysis
Sales 12-Month MA = [calculation above]
Sales 3-Month MA = [calculation using -3, MONTH]
```

**Key points in answer:**
- ✅ Identified why YoY and MoM can differ (seasonality)
- ✅ Proposed verification measures to investigate
- ✅ Created normalized metrics (per-day)
- ✅ Explained rolling average implementation
- ✅ Articulated business value of each metric
- ✅ Recommended comprehensive view combining all perspectives

**Red Flags in Bad Answers:**
- "One metric is wrong" (dismissing either YoY or MoM)
- Not considering seasonality
- Not proposing additional investigative measures
- Implementing moving average incorrectly
- Not explaining business value to stakeholders

## 8️⃣ Session Summary

Today you mastered advanced Time Intelligence—comparative analytics, growth calculations, and trend analysis essential for business intelligence.

### Key Takeaways

**Year-over-Year (YoY) Analysis**
- Compares current period to same period last year
- Eliminates seasonality effects
- Standard business reporting metric
- Use SAMEPERIODLASTYEAR or DATEADD with -1 YEAR

```DAX
Sales Last Year = CALCULATE( [Total Sales], SAMEPERIODLASTYEAR( Calendar[Date] ) )
YoY Growth % = DIVIDE( [Total Sales] - [Sales Last Year], [Sales Last Year] )
```

**Period-to-Period Comparisons**

**DATEADD** - Exact date shifts:
```DAX
DATEADD( Calendar[Date], -1, MONTH )  -- Shifts dates exactly
```

**PARALLELPERIOD** - Complete period shifts:
```DAX
PARALLELPERIOD( Calendar[Date], -1, MONTH )  -- Returns full previous month
```

**Use DATEADD when:** You want exact date-for-date comparison
**Use PARALLELPERIOD when:** You want complete prior period total

**Growth Calculations**

**Absolute Variance:**
```DAX
Variance = [Current] - [Previous]
```

**Percentage Growth:**
```DAX
Growth % = DIVIDE( [Current] - [Previous], [Previous] )
```

**Always use DIVIDE** to handle zero denominators gracefully.

**Moving Averages**

Smooth short-term fluctuations to reveal trends:

```DAX
// 3-Month Moving Average
Sales 3-Month MA = 
CALCULATE(
    [Total Sales],
    DATESINPERIOD( Calendar[Date], MAX(Calendar[Date]), -3, MONTH )
) / 3

// 12-Month Rolling Total (TTM)
Sales TTM = 
CALCULATE(
    [Total Sales],
    DATESINPERIOD( Calendar[Date], LASTDATE(Calendar[Date]), -12, MONTH )
)
```

**Benefits:**
- Removes noise and volatility
- Reveals underlying trends
- Better for forecasting
- Smooths seasonal patterns

**Dynamic Comparisons**

Allow users to choose comparison period:

```DAX
Sales Previous Period = 
VAR Selected = SELECTEDVALUE( Period[Type], "YoY" )
RETURN
    SWITCH(
        Selected,
        "YoY", [Sales Last Year],
        "QoQ", [Sales Last Quarter],
        "MoM", [Sales Last Month],
        [Sales Last Year]
    )
```

### Common Patterns

**Complete Comparison Suite:**
```DAX
// Base measure
Total Sales = SUM( Sales[Revenue] )

// Prior periods
Sales Last Year = CALCULATE( [Total Sales], SAMEPERIODLASTYEAR( Calendar[Date] ) )
Sales Last Quarter = CALCULATE( [Total Sales], DATEADD( Calendar[Date], -1, QUARTER ) )
Sales Last Month = CALCULATE( [Total Sales], DATEADD( Calendar[Date], -1, MONTH ) )

// Variances
YoY Variance = [Total Sales] - [Sales Last Year]
QoQ Variance = [Total Sales] - [Sales Last Quarter]
MoM Variance = [Total Sales] - [Sales Last Month]

// Growth %
YoY Growth % = DIVIDE( [YoY Variance], [Sales Last Year] )
QoQ Growth % = DIVIDE( [QoQ Variance], [Sales Last Quarter] )
MoM Growth % = DIVIDE( [MoM Variance], [Sales Last Month] )

// Trends
Sales 3-Month MA = CALCULATE( [Total Sales], DATESINPERIOD(..., -3, MONTH) ) / 3
Sales 12-Month MA = CALCULATE( [Total Sales], DATESINPERIOD(..., -12, MONTH) ) / 12
```

### Edge Cases to Handle

1. **No prior period data** → Use DIVIDE to return BLANK
2. **Partial periods** → Normalize by days or only show complete periods
3. **Moving average at start** → Require minimum history or calculate with available data
4. **Seasonality** → Always show YoY alongside MoM/QoQ
5. **Zero values** → Use DIVIDE instead of division operator

### Best Practices

1. **Provide multiple comparison types** (YoY, QoQ, MoM)
2. **Include moving averages** for trend context
3. **Use conditional formatting** (green for growth, red for decline)
4. **Document edge case handling** (first periods, missing data)
5. **Test with actual data ranges** (verify comparisons make sense)
6. **Consider seasonality** in interpretations
7. **Normalize when needed** (sales per day for fairness)

### What's Next?

**Day 9** will cover advanced DAX topics:
- CALCULATE filters and complex filter contexts
- Advanced table functions
- Performance optimization techniques
- Real-world complex scenarios

You've now mastered both foundational Time Intelligence (Day 7) and advanced comparative analytics (Day 8)—essential skills for any Power BI professional!

### Self-Check Questions

Before moving forward, ensure you can answer:
1. What's the difference between DATEADD and PARALLELPERIOD?
2. How do you calculate Year-over-Year growth percentage?
3. When would you use SAMEPERIODLASTYEAR vs DATEADD?
4. How do you create a 12-month moving average?
5. Why should you use DIVIDE instead of the division operator?
6. How do you handle situations where prior period data doesn't exist?
7. What's the difference between comparing incomplete vs complete periods?
8. Why provide both YoY and MoM metrics?

If you can answer these confidently and complete the practice exercises, you've mastered Time Intelligence!

---

**🎉 Congratulations!**

You've completed comprehensive Time Intelligence training:
- ✅ Calendar table foundations (Day 7)
- ✅ YTD, QTD, MTD calculations (Day 7)
- ✅ Year-over-Year comparisons (Day 8)
- ✅ Growth and variance analysis (Day 8)
- ✅ Moving averages and trends (Day 8)

**You can now build sophisticated time-based analytics that executives and analysts rely on for decision-making!**
