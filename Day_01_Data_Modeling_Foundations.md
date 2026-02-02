# DAY 1 - Data Modeling Foundations

## 1️⃣ Session Overview

This session introduces the backbone of every Power BI solution: the data model. You'll learn why properly structured tables and relationships determine whether your DAX calculations work correctly or fail mysteriously. We focus on the star schema design pattern used in 90% of enterprise Power BI implementations.

In real projects, poor data modeling is the number one cause of performance issues, incorrect calculations, and maintenance nightmares. Getting this foundation right saves weeks of rework later.

## 2️⃣ Learning Objectives

- Understand the difference between fact and dimension tables and why this distinction matters
- Identify proper relationship directions and their impact on filtering behavior
- Explain why star schema is preferred over flat tables for analytical models
- Recognize when to use single direction vs bidirectional relationships
- Create a properly normalized data model that supports scalable DAX development

## 3️⃣ Key Concepts (Explained Simply)

**What is a Data Model?**

Think of a data model as a network of connected tables where relationships define how filters flow between them. It's like a highway system: relationships are the roads, and filter context is the traffic that flows in specific directions.

**Fact Tables vs Dimension Tables**

Fact tables contain the numbers you want to analyze (sales amount, quantity, profit). They're typically large and grow over time. Think of them as transaction logs.

Dimension tables contain descriptive attributes (product names, customer details, dates). They're smaller and relatively stable. Think of them as lookup catalogs.

This separation is not arbitrary. It mirrors how businesses operate: transactions happen continuously (facts), but the products and customers (dimensions) change less frequently.

**Why Not Just One Big Flat Table?**

A single table with all data seems simpler at first, but it creates three critical problems:

1. Data redundancy: Customer "John Smith" appears thousands of times instead of once
2. Update complexity: Changing John's address requires updating thousands of rows
3. Performance degradation: Large flat tables slow down every calculation

Star schema eliminates these issues by storing each piece of information once and connecting tables through relationships.

**Relationships and Filter Flow**

Relationships have direction. When you filter a dimension table, that filter automatically flows to the related fact table. This is called "downstream filtering." By default, filters DON'T flow backward from facts to dimensions.

Think of it like gravity: water flows downhill naturally (dimension to fact), but doesn't flow uphill unless you install a pump (bidirectional relationship, which has performance costs).

**Cardinality**

Cardinality describes how many rows on each side of a relationship can match:

- One-to-Many (1:*): Most common. One customer has many orders.
- Many-to-One (*:1): Same as above, just viewed from the other direction.
- Many-to-Many (*:*): Complex scenario requiring careful handling.

## 4️⃣ Step-by-Step Explanation with Examples

We'll use a consistent dataset throughout this program: a retail sales scenario with four core tables.

**Our Sample Dataset Structure:**

**Sales** (Fact Table)
- OrderID (unique per row)
- OrderDate
- CustomerID (foreign key)
- ProductID (foreign key)
- Quantity
- Revenue
- Cost

**Customers** (Dimension Table)
- CustomerID (primary key)
- CustomerName
- City
- Region
- Country

**Products** (Dimension Table)
- ProductID (primary key)
- ProductName
- Category
- SubCategory
- UnitPrice

**Calendar** (Dimension Table)
- Date (primary key)
- Year
- Quarter
- Month
- MonthName
- WeekNumber

**Building the Model Step-by-Step:**

Step 1: Identify your fact table.
The Sales table contains measurable events (transactions), so it's our fact table.

Step 2: Identify dimension tables.
Customers, Products, and Calendar describe attributes of those transactions.

Step 3: Create relationships based on foreign keys.

Sales[CustomerID] → Customers[CustomerID]
- Direction: Customers filters Sales
- Cardinality: Many-to-One (many sales per customer)

Sales[ProductID] → Products[ProductID]
- Direction: Products filters Sales
- Cardinality: Many-to-One (many sales per product)

Sales[OrderDate] → Calendar[Date]
- Direction: Calendar filters Sales
- Cardinality: Many-to-One (many sales per date)

Step 4: Verify the star schema pattern.
All dimension tables connect to the central fact table. No dimension-to-dimension relationships exist.

**Why This Structure Works:**

When a user selects "Electronics" from the Product slicer, the filter flows:
1. Filter applied to Products table: Category = "Electronics"
2. Filter propagates through relationship to Sales table
3. Only Sales rows with ProductID matching Electronics products are included
4. All measures now calculate based on this filtered context

Without proper relationships, you'd need complex FILTER functions in every measure. With proper modeling, Power BI handles filtering automatically.

## 5️⃣ Common Mistakes & Misconceptions

**Mistake 1: Creating relationships on non-unique columns**

Wrong: Connecting Sales[City] to Customers[City]
Why it fails: Multiple customers exist in each city. Power BI can't determine which customer record to use for filtering.

Correct approach: Use the unique CustomerID as the relationship key.

**Mistake 2: Bidirectional relationships by default**

Beginners often set all relationships to bidirectional thinking it provides more flexibility.

Why it's problematic: Bidirectional relationships can create filter ambiguity and dramatically slow performance. They should be used only when absolutely necessary (rare scenarios like many-to-many or role-playing dimensions).

**Mistake 3: Treating calculated columns as measures**

Beginners create calculated columns for everything (Total = Quantity * Price) in the Sales table.

Why it's inefficient: Calculated columns are computed during data refresh and stored in memory. They increase model size and refresh time.

Better approach: Use measures that calculate dynamically based on current filter context.

**Mistake 4: Not marking date tables**

Creating a Calendar table but forgetting to mark it as a date table prevents time intelligence functions from working.

Solution: Always mark your date table using "Mark as Date Table" and specify the date column.

**Mistake 5: Mixing fact and dimension data**

Adding customer names directly into the Sales table instead of using relationships.

Why it matters: This creates denormalized data that's harder to maintain and creates ambiguous filtering paths.

## 6️⃣ Hands-on Practice (Mandatory)

**Exercise 1: Model Analysis**

Given this scenario: A company tracks employee project assignments. They have:
- Employees table (EmployeeID, Name, Department)
- Projects table (ProjectID, ProjectName, Budget)
- Assignments table (AssignmentID, EmployeeID, ProjectID, HoursWorked, Date)

Question: Identify which table is the fact table and which are dimensions. Draw the relationship structure.

**Exercise 2: Relationship Direction**

Using the Sales model described earlier:
- If you filter the Products table to show only "Laptops," will the Sales table be filtered? (Yes/No and why)
- If you filter the Sales table to show only orders above $1000, will the Products table be filtered? (Yes/No and why)

**Exercise 3: Identifying Modeling Issues**

A model has these relationships:
- Sales → Customers (one-to-many)
- Sales → Products (one-to-many)
- Customers → Geography (many-to-many, bidirectional)
- Products → Categories (one-to-many)

Identify at least two potential problems with this structure.

**Exercise 4: Design Decision**

You have a Sales table with StoreID. Should you:
A) Add StoreID, StoreName, StoreCity all in the Sales table
B) Create a separate Stores table and relate it to Sales

Explain your reasoning considering performance and maintainability.

**Exercise 5: Cardinality Challenge**

A company wants to track which employees worked on which projects. An employee can work on multiple projects, and a project can have multiple employees.

Design the table structure and identify the cardinality of relationships needed.

## 7️⃣ Interview-Oriented Question

**Question:** 
"Explain why we separate data into fact and dimension tables rather than keeping everything in one denormalized table. What are the specific technical advantages in a Power BI context?"

**Expected Answer:**

Separating fact and dimension tables in Power BI provides several technical advantages:

1. Storage efficiency: Dimension attributes are stored once instead of repeating for every transaction, reducing memory consumption in Power BI's in-memory columnar database.

2. Calculation performance: Measures aggregate fact table numeric columns. When dimensions are separated, the engine can efficiently compress dimension tables and use them for filtering without scanning redundant data.

3. Relationship-based filtering: Star schema enables automatic filter propagation. When a user selects a product category, Power BI's engine filters the dimension first (small table), then propagates to facts through the relationship key, which is highly optimized.

4. Maintainability: Changing a product name or customer address requires updating one row in the dimension table rather than thousands of rows in a flat structure.

5. Clear semantic model: Business users understand the model structure more intuitively. Products are separate from sales events, matching their mental model.

This design is fundamental to Analysis Services (Power BI's underlying engine), which is optimized specifically for star schema patterns.

## 8️⃣ Session Summary

- Data modeling is the foundation that determines whether DAX calculations will be simple or complex
- Fact tables contain measurable transactions while dimension tables contain descriptive attributes
- Star schema with dimension tables surrounding a central fact table is the standard enterprise pattern
- Relationships define filter flow direction, typically flowing from dimensions to facts
- One-to-many cardinality is most common and most performant in Power BI
- Bidirectional relationships should be avoided unless specifically required
- Proper modeling reduces model size, improves performance, and simplifies DAX
- Always mark your Calendar table as a date table to enable time intelligence functions
- Calculated columns increase model size; prefer measures for calculations whenever possible

---

## 🧑‍🏫 Trainer Notes

**Emphasis Points:**
- Spend significant time on the "why" of star schema. Students need to internalize that this isn't arbitrary but solves real technical problems.
- Use a whiteboard to draw the star schema visually. Draw arrows showing filter flow direction.
- Emphasize that relationships are the foundation for automatic filtering in DAX measures.

**Common Confusion Areas:**
- Students often confuse "many-to-one" and "one-to-many" - they're the same relationship viewed from different table perspectives. Use consistent terminology.
- The concept of filter flow direction is abstract. Use a physical analogy: "Imagine dimension tables as control panels that send instructions to the fact table."

**Whiteboard Exercise:**
Draw a simple two-table model: Products (5 rows) and Sales (20 rows). Physically show how filtering Products to 2 rows filters Sales to corresponding rows. Then show the reverse doesn't happen automatically.

**Time Management:**
- First 15 minutes: Concepts and why star schema matters
- Next 20 minutes: Step-by-step model building with examples
- Next 15 minutes: Common mistakes discussion
- Final 10 minutes: Q&A and preview of Day 2

**Key Takeaway Message:**
"Your data model is 70% of your Power BI solution's success. Get this right, and DAX becomes logical. Get this wrong, and every calculation will be a struggle."
