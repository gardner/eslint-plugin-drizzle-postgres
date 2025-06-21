# limit-join-complexity

Limit the number of joins in a single query for better performance.

## 📖 Rule Details

This rule limits the number of JOIN operations in a single query. Complex queries with many joins can lead to performance problems, difficult debugging, and maintenance issues. The rule encourages breaking complex queries into simpler ones or using database views for frequently accessed join patterns.

### ❌ Incorrect

```js
// Too many joins (default limit is 3)
const result = await db
  .select()
  .from(orders)
  .leftJoin(users, eq(orders.userId, users.id))
  .leftJoin(products, eq(orders.productId, products.id))
  .leftJoin(categories, eq(products.categoryId, categories.id))
  .leftJoin(suppliers, eq(products.supplierId, suppliers.id)); // 4 joins!

// Complex reporting query with excessive joins
const report = await db
  .select()
  .from(sales)
  .innerJoin(customers, eq(sales.customerId, customers.id))
  .innerJoin(stores, eq(sales.storeId, stores.id))
  .innerJoin(regions, eq(stores.regionId, regions.id))
  .innerJoin(employees, eq(sales.employeeId, employees.id))
  .leftJoin(promotions, eq(sales.promotionId, promotions.id)); // 5 joins!
```

### ✅ Correct

```js
// Within the limit (3 joins)
const orderDetails = await db
  .select({
    orderId: orders.id,
    userName: users.name,
    productName: products.name,
    categoryName: categories.name,
  })
  .from(orders)
  .leftJoin(users, eq(orders.userId, users.id))
  .leftJoin(products, eq(orders.productId, products.id))
  .leftJoin(categories, eq(products.categoryId, categories.id));

// Split into multiple queries
// First query: Get order with user
const orderWithUser = await db
  .select()
  .from(orders)
  .leftJoin(users, eq(orders.userId, users.id))
  .where(eq(orders.id, orderId));

// Second query: Get product details
const productDetails = await db
  .select()
  .from(products)
  .leftJoin(categories, eq(products.categoryId, categories.id))
  .leftJoin(suppliers, eq(products.supplierId, suppliers.id))
  .where(eq(products.id, orderWithUser[0].productId));

// Or use a database view
const orderDetailsView = pgView('order_details_view', {
  orderId: integer('order_id'),
  userName: text('user_name'),
  productName: text('product_name'),
  categoryName: text('category_name'),
  supplierName: text('supplier_name'),
});

// Then query the view
const details = await db.select().from(orderDetailsView);
```

## 💡 Why This Rule?

Limiting join complexity provides several benefits:

**Performance:**
- **Query Planning**: Each join increases query planning time exponentially
- **Memory Usage**: Multiple joins require more memory for intermediate results
- **Index Usage**: Complex joins may prevent optimal index usage
- **Execution Time**: Join performance degrades rapidly with more tables

**Maintainability:**
- **Debugging**: Simpler queries are easier to understand and debug
- **Testing**: Fewer joins mean easier query testing
- **Optimization**: Easier to optimize queries with fewer joins
- **Code Review**: Simpler queries are easier to review

**Alternatives to Many Joins:**
- Create database views for common join patterns
- Use multiple simpler queries
- Denormalize data where appropriate
- Use materialized views for reporting

## ⚙️ Options

### `maxJoins`

- **Type:** `number`
- **Default:** `3`
- **Description:** Maximum number of joins allowed in a single query

```js
// eslint.config.js
{
  rules: {
    'drizzle/limit-join-complexity': ['error', {
      maxJoins: 4 // Allow up to 4 joins
    }]
  }
}
```

## 🔧 Example Configuration

::: code-group

```js [Flat Config]
// eslint.config.js
export default [{
  rules: {
    'drizzle/limit-join-complexity': 'error' // Default: max 3 joins
  }
}];

// With custom limit
export default [{
  rules: {
    'drizzle/limit-join-complexity': ['error', {
      maxJoins: 5
    }]
  }
}];
```

```json [Legacy Config]
// .eslintrc.json
{
  "rules": {
    "drizzle/limit-join-complexity": "error"
  }
}

// With custom limit
{
  "rules": {
    "drizzle/limit-join-complexity": ["error", {
      "maxJoins": 5
    }]
  }
}
```

:::

## 🚫 When to Disable

Some scenarios require complex joins:

```js
// Complex reporting queries
async function generateAnnualReport() {
  // eslint-disable-next-line drizzle/limit-join-complexity
  return await db
    .select()
    .from(transactions)
    .innerJoin(accounts, eq(transactions.accountId, accounts.id))
    .innerJoin(customers, eq(accounts.customerId, customers.id))
    .innerJoin(branches, eq(transactions.branchId, branches.id))
    .innerJoin(regions, eq(branches.regionId, regions.id))
    .innerJoin(transactionTypes, eq(transactions.typeId, transactionTypes.id));
}

// Data warehouse ETL operations
async function buildDimensionalModel() {
  // eslint-disable-next-line drizzle/limit-join-complexity
  return await db
    .select()
    .from(factSales)
    .innerJoin(dimCustomer, eq(factSales.customerId, dimCustomer.id))
    .innerJoin(dimProduct, eq(factSales.productId, dimProduct.id))
    .innerJoin(dimTime, eq(factSales.timeId, dimTime.id))
    .innerJoin(dimStore, eq(factSales.storeId, dimStore.id))
    .innerJoin(dimPromotion, eq(factSales.promotionId, dimPromotion.id));
}
```

## 📚 Best Practices

1. **Use Views for Complex Joins**: Create database views for frequently used join patterns:
   ```sql
   CREATE VIEW user_profile_complete AS
   SELECT u.*, p.*, a.*, s.*
   FROM users u
   LEFT JOIN profiles p ON u.id = p.user_id
   LEFT JOIN addresses a ON u.id = a.user_id
   LEFT JOIN settings s ON u.id = s.user_id;
   ```

2. **Split Into Multiple Queries**: Sometimes multiple simple queries are better:
   ```js
   // Instead of one complex query
   const user = await db.select().from(users).where(eq(users.id, userId));
   const profile = await db.select().from(profiles).where(eq(profiles.userId, userId));
   const posts = await db.select().from(posts).where(eq(posts.userId, userId));
   
   // Combine in application
   const userData = { ...user[0], profile: profile[0], posts };
   ```

3. **Consider Denormalization**: For read-heavy workloads:
   ```js
   // Denormalized table with computed data
   const userSummaries = pgTable('user_summaries', {
     userId: integer('user_id').primaryKey(),
     userName: text('user_name'),
     postCount: integer('post_count'),
     lastPostDate: timestamp('last_post_date'),
     // Updated by triggers or scheduled jobs
   });
   ```

4. **Use Subqueries**: Sometimes subqueries are clearer than joins:
   ```js
   const activeUsers = await db
     .select()
     .from(users)
     .where(
       exists(
         db.select().from(posts)
           .where(eq(posts.userId, users.id))
           .where(gt(posts.createdAt, lastWeek))
       )
     );
   ```

## 🔗 Related Rules

- [no-select-star](/rules/no-select-star) - Avoid SELECT * queries

## 📚 Further Reading

- [PostgreSQL JOIN Performance](https://www.postgresql.org/docs/current/performance-tips.html)
- [Query Optimization Techniques](https://use-the-index-luke.com/sql/join)
- [Database Normalization vs Denormalization](https://www.postgresql.org/docs/current/ddl-constraints.html)