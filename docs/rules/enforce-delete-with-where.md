# enforce-delete-with-where

Require WHERE clause on DELETE operations to prevent accidental full table deletions.

## 📖 Rule Details

This rule ensures that all DELETE operations include a WHERE clause. Without a WHERE clause, a DELETE operation will remove ALL rows from the table, which is rarely the intended behavior and can lead to catastrophic data loss.

### ❌ Incorrect

```js
// Deletes ALL users from the database!
await db.delete(users);

// Still dangerous even with a comment
await db.delete(posts); // TODO: add where clause
```

### ✅ Correct

```js
// Delete specific user
await db.delete(users).where(eq(users.id, userId));

// Delete with complex condition
await db.delete(posts).where(
  and(
    eq(posts.authorId, userId),
    lt(posts.createdAt, thirtyDaysAgo)
  )
);

// Delete with simple condition
await db.delete(sessions).where(eq(sessions.expired, true));
```

## 💡 Why This Rule?

Accidental full table deletions are one of the most common and devastating database mistakes. They can happen due to:

- Forgetting to add a WHERE clause during development
- Accidentally commenting out or removing a WHERE clause
- Copy-pasting code without updating conditions
- Refactoring that accidentally removes conditions

This rule acts as a safety net, catching these mistakes before they reach production.

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
    'drizzle/enforce-delete-with-where': ['error', {
      drizzleObjectName: 'database'
    }]
  }
}
```

Example with custom instance name:
```js
// Now the rule checks for 'database' instead of 'db'
await database.delete(users).where(eq(users.id, 1));
```

## 🔧 Example Configuration

::: code-group

```js [Flat Config]
// eslint.config.js
export default [{
  rules: {
    'drizzle/enforce-delete-with-where': 'error'
  }
}];
```

```json [Legacy Config]
// .eslintrc.json
{
  "rules": {
    "drizzle/enforce-delete-with-where": "error"
  }
}
```

:::

## 🚫 When to Disable

There are legitimate cases where you might need to delete all rows:

```js
// Clearing temporary tables
// eslint-disable-next-line drizzle/enforce-delete-with-where
await db.delete(tempImportData); // Intentionally clearing all temporary data

// In tests
describe('cleanup', () => {
  afterEach(async () => {
    // eslint-disable-next-line drizzle/enforce-delete-with-where
    await testDb.delete(testUsers); // Clear test data
  });
});
```

::: danger Always Document Why
When disabling this rule, always add a comment explaining why a full table deletion is intentional. This helps prevent confusion and accidental data loss.
:::

## 🔗 Related Rules

- [enforce-update-with-where](/rules/enforce-update-with-where) - Similar protection for UPDATE operations

## 📚 Further Reading

- [Drizzle DELETE documentation](https://orm.drizzle.team/docs/delete)
- [SQL DELETE statement](https://www.postgresql.org/docs/current/sql-delete.html)