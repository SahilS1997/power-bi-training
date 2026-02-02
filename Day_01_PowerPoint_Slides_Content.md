# DAY 1 - PowerPoint Slide Deck Content
## Data Modeling Foundations

---

### SLIDE 1: Title Slide
**Title:** Data Modeling Foundations
**Subtitle:** Building the Backbone of Power BI Solutions
**Day:** 1 of 12
**Module:** 3 - Data Modeling (Part 1)

---

### SLIDE 2: Today's Agenda
**Title:** What We'll Cover Today

- Understanding Data Models
- Fact vs Dimension Tables
- Star Schema Design Pattern
- Relationships and Filter Flow
- Common Modeling Mistakes
- Hands-on Practice

**Time:** 60 minutes

---

### SLIDE 3: Session Overview
**Title:** Why Data Modeling Matters

**Key Point:** Your data model is 70% of your Power BI solution's success

**Business Impact:**
- Poor modeling = Incorrect calculations
- Poor modeling = Performance issues
- Poor modeling = Maintenance nightmares

**Visual Suggestion:** Show a house foundation analogy - strong foundation vs cracked foundation

---

### SLIDE 4: What is a Data Model?
**Title:** Data Model = Connected Tables

**Definition:** A network of connected tables where relationships define how filters flow between them

**Analogy:** 
- Tables = Cities
- Relationships = Highways
- Filters = Traffic flowing on those highways

**Visual Suggestion:** Simple diagram with 3-4 connected boxes with arrows

---

### SLIDE 5: Learning Objectives
**Title:** By the End of This Session, You Will:

1. Understand the difference between fact and dimension tables
2. Identify proper relationship directions
3. Explain why star schema is industry standard
4. Recognize when to use different relationship types
5. Create a properly normalized data model

---

### SLIDE 6: Fact Tables
**Title:** Fact Tables - The Transaction Log

**Characteristics:**
- Contains measurable numbers (Revenue, Quantity, Cost)
- Large and grows over time
- Contains foreign keys to dimensions
- Examples: Sales, Orders, Transactions, Activities

**Visual Suggestion:** Table icon with columns showing OrderID, Date, CustomerID, ProductID, Revenue, Quantity

**Remember:** If it's something you COUNT or SUM, it belongs in a fact table

---

### SLIDE 7: Dimension Tables
**Title:** Dimension Tables - The Lookup Catalogs

**Characteristics:**
- Contains descriptive attributes (Names, Categories, Dates)
- Smaller and relatively stable
- Contains primary keys
- Examples: Customers, Products, Calendar, Geography

**Visual Suggestion:** Table icon with columns showing CustomerID, CustomerName, City, Region

**Remember:** If it's something you DESCRIBE or FILTER BY, it belongs in a dimension table

---

### SLIDE 8: Why Not One Big Flat Table?
**Title:** The Problem with Flat Tables

**Three Critical Problems:**

1. **Data Redundancy**
   - Customer "John Smith" repeated 1,000 times
   - Wastes memory

2. **Update Complexity**
   - Change John's address = Update 1,000 rows
   - Risk of inconsistency

3. **Performance Degradation**
   - Large tables slow every calculation
   - Poor compression

**Visual Suggestion:** Show a bloated table vs clean star schema side by side

---

### SLIDE 9: Star Schema Pattern
**Title:** Star Schema - The Industry Standard

**Visual:** Central fact table (Sales) surrounded by dimension tables:
- Customers (top left)
- Products (top right)
- Calendar (bottom left)
- Store Locations (bottom right)

**Why "Star"?** The diagram looks like a star with dimensions radiating from the center

**Used in:** 90% of enterprise Power BI implementations

---

### SLIDE 10: Our Practice Dataset
**Title:** Dataset We'll Use Throughout This Program

**Four Core Tables:**

1. **Sales** (Fact)
   - OrderID, OrderDate, CustomerID, ProductID
   - Quantity, Revenue, Cost

2. **Customers** (Dimension)
   - CustomerID, CustomerName, City, Region, Country

3. **Products** (Dimension)
   - ProductID, ProductName, Category, SubCategory, UnitPrice

4. **Calendar** (Dimension)
   - Date, Year, Quarter, Month, MonthName, WeekNumber

---

### SLIDE 11: Relationships Basics
**Title:** Relationships Connect Tables

**Key Concepts:**

**Primary Key:** Unique identifier in dimension table (CustomerID in Customers)

**Foreign Key:** Reference to dimension in fact table (CustomerID in Sales)

**Relationship:** Connection between primary key and foreign key

**Visual Suggestion:** Show two tables with a line connecting CustomerID columns

---

### SLIDE 12: Cardinality
**Title:** Understanding Cardinality

**One-to-Many (1:*)** - Most Common
- One customer has many orders
- One product appears in many sales
- **Use this:** 95% of the time

**Many-to-Many (*:*)** - Complex
- Many employees work on many projects
- Requires special handling

**Visual Suggestion:** Show diagram with 1 Customer box connecting to many Sales boxes

---

### SLIDE 13: Filter Flow Direction
**Title:** How Filters Travel Through Relationships

**The Gravity Rule:**
- Filters flow from ONE side to MANY side
- Dimension → Fact (automatic)
- Fact → Dimension (does NOT happen by default)

**Example:**
- Select "Electronics" in Product slicer
- Filter flows: Products → Sales
- Result: Only Electronics sales shown

**Visual Suggestion:** Diagram with arrows showing filter direction

---

### SLIDE 14: Single Direction vs Bidirectional
**Title:** Relationship Direction Settings

**Single Direction (Default)** ✓
- Dimension filters Fact
- Better performance
- Clear filter path
- **Use:** Almost always

**Bidirectional** ⚠
- Filters flow both ways
- Can create ambiguity
- Performance cost
- **Use:** Only when absolutely necessary

**Remember:** Default to single direction unless you have a specific reason

---

### SLIDE 15: Building Our Model - Step 1
**Title:** Step 1 - Identify Your Fact Table

**Question to Ask:** Which table contains the measurable events?

**In Our Case:** Sales table
- Contains transactions
- Has numeric measures (Revenue, Quantity, Cost)
- Grows continuously
- Has foreign keys (CustomerID, ProductID, OrderDate)

---

### SLIDE 16: Building Our Model - Step 2
**Title:** Step 2 - Identify Dimension Tables

**Question to Ask:** Which tables describe the transactions?

**In Our Case:** 
- Customers (Who bought?)
- Products (What was purchased?)
- Calendar (When did it happen?)

**Pattern:** Each dimension answers a question about the fact

---

### SLIDE 17: Building Our Model - Step 3
**Title:** Step 3 - Create Relationships

**Three Relationships Needed:**

1. Sales[CustomerID] → Customers[CustomerID]
   - Many-to-One | Single Direction

2. Sales[ProductID] → Products[ProductID]
   - Many-to-One | Single Direction

3. Sales[OrderDate] → Calendar[Date]
   - Many-to-One | Single Direction

**Visual Suggestion:** Show the complete star schema with all relationships

---

### SLIDE 18: Why This Structure Works
**Title:** The Magic of Proper Modeling

**User Action:** Select "Electronics" from Product slicer

**What Happens Automatically:**
1. Filter applied to Products table (Category = "Electronics")
2. Filter propagates through relationship to Sales
3. Only matching Sales rows included
4. All measures calculate based on filtered context

**Without Proper Relationships:** You'd need complex FILTER functions in every measure

**With Proper Modeling:** Power BI handles filtering automatically

---

### SLIDE 19: Common Mistake #1
**Title:** Wrong: Relationships on Non-Unique Columns

**Bad Example:** Connecting Sales[City] to Customers[City]

**Why It Fails:** 
- Multiple customers in each city
- Power BI can't determine which customer record to use
- Creates ambiguous filter paths

**Correct Approach:** Use unique CustomerID as relationship key

**Visual Suggestion:** Show X mark on wrong relationship, checkmark on correct one

---

### SLIDE 20: Common Mistake #2
**Title:** Wrong: Bidirectional Relationships by Default

**Bad Pattern:** Setting all relationships to bidirectional

**Why It's Problematic:**
- Creates filter ambiguity
- Dramatically slows performance
- Can produce incorrect results

**When to Use Bidirectional:** Rare scenarios only
- Many-to-many relationships
- Role-playing dimensions
- Specific advanced patterns

**Rule:** Always start with single direction

---

### SLIDE 21: Common Mistake #3
**Title:** Wrong: Calculated Columns Instead of Measures

**Bad Practice:** Creating Total = Quantity * Price as calculated column in Sales table

**Why It's Inefficient:**
- Computed during data refresh
- Stored in memory
- Increases model size
- Increases refresh time

**Better Approach:** Use measures that calculate dynamically based on filter context

**We'll cover this in detail:** Day 3 (DAX Fundamentals)

---

### SLIDE 22: Common Mistake #4
**Title:** Wrong: Not Marking Date Tables

**The Problem:** Creating Calendar table but forgetting to mark it as date table

**Impact:** Time intelligence functions won't work
- TOTALYTD will fail
- SAMEPERIODLASTYEAR will fail
- Date-based filtering may be incorrect

**Solution:** Always mark your date table
- Right-click table → "Mark as Date Table"
- Specify the date column

---

### SLIDE 23: Common Mistake #5
**Title:** Wrong: Mixing Fact and Dimension Data

**Bad Practice:** Adding CustomerName, City, Region directly into Sales table

**Why It Matters:**
- Creates denormalized data
- Harder to maintain
- Ambiguous filtering paths
- Wastes memory

**Correct Approach:** Keep customer data in Customers table, use relationships

---

### SLIDE 24: Hands-on Practice Overview
**Title:** Now It's Your Turn

**Five Exercises:**

1. Model Analysis - Identify fact and dimensions
2. Relationship Direction - Predict filter behavior
3. Identifying Modeling Issues - Find problems
4. Design Decision - Choose best structure
5. Cardinality Challenge - Design for many-to-many

**Time:** Practice with provided .pbix file

**Objective:** Apply concepts, not memorize syntax

---

### SLIDE 25: Interview Question
**Title:** Common Interview Question

**Question:** 
"Explain why we separate data into fact and dimension tables rather than keeping everything in one denormalized table."

**Key Points to Cover:**
- Storage efficiency (compression)
- Calculation performance
- Relationship-based filtering
- Maintainability
- Clear semantic model

**This tests:** Your understanding of WHY, not just WHAT

---

### SLIDE 26: Session Summary - Key Takeaways
**Title:** What You Must Remember

1. Data modeling is 70% of Power BI solution success
2. Fact tables = measurable transactions | Dimensions = descriptive attributes
3. Star schema is the enterprise standard pattern
4. Relationships define filter flow (dimension → fact)
5. One-to-many cardinality is most common and performant
6. Avoid bidirectional relationships unless specifically needed
7. Proper modeling simplifies DAX dramatically
8. Always mark Calendar table as date table

---

### SLIDE 27: Visual Summary
**Title:** The Complete Picture

**Visual Suggestion:** Large, clean diagram showing:
- Central Sales fact table
- Three surrounding dimension tables
- Arrows showing filter direction
- Labels indicating cardinality (1:* on each relationship)

**Caption:** "Your foundation for the next 11 days"

---

### SLIDE 28: Next Session Preview
**Title:** Coming Up - Day 2

**Topic:** Data Modeling Advanced Concepts
- Role-playing dimensions
- Bridge tables for many-to-many
- Slowly changing dimensions
- Inactive relationships
- Best practices for complex models

**Preparation:** Review today's star schema concepts

---

### SLIDE 29: Q&A
**Title:** Questions?

**Discussion Points:**
- Clarify any confusion about relationships
- Real-world modeling scenarios
- Preview practice exercises

---

### SLIDE 30: Thank You
**Title:** Day 1 Complete

**Action Items:**
- Complete 5 hands-on exercises
- Build the practice model in Power BI Desktop
- Review relationship concepts

**See you:** Day 2

---

## PRESENTER NOTES

**Slide Timing Guidance:**
- Slides 1-10: 15 minutes (Concepts)
- Slides 11-18: 20 minutes (Building the model)
- Slides 19-23: 15 minutes (Common mistakes)
- Slides 24-30: 10 minutes (Practice overview and wrap-up)

**Key Emphasis:**
- Spend extra time on Slide 18 (Why This Structure Works) - this is the "aha moment"
- Use whiteboard for Slide 13 (Filter Flow Direction) - draw it live
- Slow down on Slides 19-23 (Common Mistakes) - these prevent future problems

**Interactive Elements:**
- Slide 6: Ask audience for examples of fact tables from their work
- Slide 13: Poll: "Which direction does the filter flow?"
- Slide 24: Walk through Exercise 1 together before independent practice

**Backup Slides (If Time Permits):**
- Additional cardinality examples
- Comparison with other modeling approaches (Snowflake, Data Vault)
- Power BI specific optimization tips
