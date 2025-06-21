# enforce-snake-case-naming

Enforce snake_case naming convention for PostgreSQL tables and columns.

## 📖 Rule Details

This rule ensures that all table and column names follow the snake_case naming convention. PostgreSQL treats unquoted identifiers as lowercase, and snake_case is the standard naming convention in SQL databases. Using camelCase or PascalCase can lead to confusion and requires quoting identifiers.

### ❌ Incorrect

```js
// PascalCase table name
const UserProfiles = pgTable('UserProfiles', {
  // camelCase column names
  userId: serial('userId').primaryKey(),
  firstName: text('firstName'),
  emailAddress: varchar('emailAddress', { length: 255 }),
});

// Mixed naming conventions
const orderItems = pgTable('OrderItems', {
  id: serial('id').primaryKey(),
  orderId: integer('orderId'),
  productName: text('productName'),
});
```

### ✅ Correct

```js
// snake_case throughout
const user_profiles = pgTable('user_profiles', {
  user_id: serial('user_id').primaryKey(),
  first_name: text('first_name'),
  email_address: varchar('email_address', { length: 255 }),
  
  // Common exceptions are allowed
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

// Consistent snake_case
const order_items = pgTable('order_items', {
  id: serial('id').primaryKey(),
  order_id: integer('order_id'),
  product_name: text('product_name'),
});
```

## 💡 Why This Rule?

Using snake_case for database identifiers provides several benefits:

- **PostgreSQL Convention**: Unquoted identifiers in PostgreSQL are automatically converted to lowercase
- **Avoid Quoting**: CamelCase requires double-quoting in SQL queries: `SELECT "userId" FROM "UserProfiles"`
- **Cross-Platform**: Works consistently across different SQL databases
- **SQL Readability**: Makes raw SQL queries more readable and conventional
- **Tool Compatibility**: Many database tools expect snake_case naming

Without this rule, you might encounter:
- Confusion between `userId`, `"userId"`, and `userid` in queries
- Inconsistent naming across your database schema
- Issues when writing raw SQL or using database tools
- Problems with database migrations and schema comparisons

## ⚙️ Options

This rule has no configuration options. It automatically allows common camelCase exceptions:
- `createdAt`
- `updatedAt`

These exceptions are allowed because they're commonly used in ORMs and match JavaScript naming conventions for timestamps.

## 🔧 Example Configuration

::: code-group

```js [Flat Config]
// eslint.config.js
export default [{
  rules: {
    'drizzle/enforce-snake-case-naming': 'error'
  }
}];
```

```json [Legacy Config]
// .eslintrc.json
{
  "rules": {
    "drizzle/enforce-snake-case-naming": "error"
  }
}
```

:::

## 🚫 When to Disable

You might want to disable this rule if:

```js
// Working with existing database with different conventions
// eslint-disable-next-line drizzle/enforce-snake-case-naming
const legacyUsers = pgTable('LegacyUsers', {
  // eslint-disable-next-line drizzle/enforce-snake-case-naming
  UserID: serial('UserID').primaryKey(),
});

// Integrating with external systems that require specific naming
// eslint-disable-next-line drizzle/enforce-snake-case-naming
const externalApiData = pgTable('ExternalAPIData', {
  // Must match external system's field names
  // eslint-disable-next-line drizzle/enforce-snake-case-naming
  externalUserId: text('externalUserId'),
});
```

## 📚 Best Practices

1. **Be Consistent**: If you must use camelCase, disable the rule project-wide rather than sporadically
2. **Migration Strategy**: When migrating existing databases, consider using Drizzle's field mapping:
   ```js
   const users = pgTable('users', {
     userId: serial('user_id').primaryKey(), // JS: userId, DB: user_id
   });
   ```
3. **Team Agreement**: Ensure your team agrees on the naming convention before enforcing

## 🔗 Related Rules

- [enforce-index-naming](/rules/enforce-index-naming) - Naming conventions for indexes

## 📚 Further Reading

- [PostgreSQL Naming Conventions](https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS)
- [SQL Style Guide](https://www.sqlstyle.guide/#naming-conventions)
- [Drizzle Schema Declaration](https://orm.drizzle.team/docs/sql-schema-declaration)