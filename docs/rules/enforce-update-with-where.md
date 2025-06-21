# enforce-update-with-where

Require WHERE clause on UPDATE operations to prevent accidental full table updates.

## 📖 Rule Details

This rule ensures that all UPDATE operations include a WHERE clause. Without a WHERE clause, an UPDATE operation will modify ALL rows in the table, which can corrupt data across your entire table.

### ❌ Incorrect

```js
// Updates ALL users to admin!
await db.update(users).set({ role: 'admin' });

// Marks ALL orders as completed!
await db.update(orders).set({ 
  status: 'completed',
  completedAt: new Date()
});
```

### ✅ Correct

```js
// Update specific user
await db.update(users)
  .set({ role: 'admin' })
  .where(eq(users.id, userId));

// Update with multiple conditions
await db.update(orders)
  .set({ status: 'completed', completedAt: new Date() })
  .where(
    and(
      eq(orders.paymentStatus, 'paid'),
      eq(orders.shippingStatus, 'delivered')
    )
  );

// Bulk update with condition
await db.update(products)
  .set({ onSale: true })
  .where(gt(products.inventory, 100));
```

## 💡 Why This Rule?

Accidental full table updates can be just as devastating as deletions:

- Can corrupt business-critical data
- May trigger cascading effects through your application
- Often harder to detect than deletions
- Can break application logic that depends on data states

Common scenarios that lead to accidental updates:
- Forgetting to add WHERE during development
- Copy-pasting code without updating conditions  
- Incomplete refactoring
- Misunderstanding the API

## ⚙️ Options

This rule accepts an options object with the following property:

### `drizzleObjectName`

- **Type:** `string`  
- **Default:** `"db"`
- **Description:** The name of your Drizzle database instance

```js
// eslint.config.js
{
  rules: {
    'drizzle/enforce-update-with-where': ['error', {
      drizzleObjectName: 'database'
    }]
  }
}
```

Example with custom instance name:
```js
// Now the rule checks for 'database' instead of 'db'
await database.update(users)
  .set({ lastActive: new Date() })
  .where(eq(users.id, userId));
```

## 🔧 Example Configuration

::: code-group

```js [Flat Config]
// eslint.config.js
export default [{
  rules: {
    'drizzle/enforce-update-with-where': 'error'
  }
}];
```

```json [Legacy Config]
// .eslintrc.json
{
  "rules": {
    "drizzle/enforce-update-with-where": "error"
  }
}
```

:::

## 🚫 When to Disable

There are rare cases where updating all rows is intentional:

```js
// Annual price increase
// eslint-disable-next-line drizzle/enforce-update-with-where
await db.update(subscriptions).set({ 
  price: sql`price * 1.1` // 10% increase for all subscriptions
});

// Migration script
// eslint-disable-next-line drizzle/enforce-update-with-where  
await db.update(users).set({
  newField: 'default-value' // Backfill new field for all users
});

// Feature flag rollout
// eslint-disable-next-line drizzle/enforce-update-with-where
await db.update(accounts).set({
  betaFeatureEnabled: true // Enable for all accounts
});
```

::: warning Document Your Intent
Always add a clear comment when disabling this rule to explain why a full table update is necessary. Consider if a migration script might be more appropriate.
:::

## 🎯 Best Practices

1. **Always be specific** - Even when updating many rows, use a WHERE clause
2. **Use transactions** - Wrap risky updates in transactions
3. **Test with SELECT first** - Run a SELECT with your WHERE clause to verify affected rows
4. **Add safety checks** - Consider adding runtime checks for affected row count

```js
// Good practice: Check affected rows
const result = await db.update(users)
  .set({ status: 'inactive' })
  .where(lt(users.lastLogin, thirtyDaysAgo));

if (result.rowsAffected > 1000) {
  console.warn(`Large update: ${result.rowsAffected} users marked inactive`);
}
```

## 🔗 Related Rules

- [enforce-delete-with-where](/rules/enforce-delete-with-where) - Similar protection for DELETE operations

## 📚 Further Reading

- [Drizzle UPDATE documentation](https://orm.drizzle.team/docs/update)
- [SQL UPDATE best practices](https://www.postgresql.org/docs/current/sql-update.html)