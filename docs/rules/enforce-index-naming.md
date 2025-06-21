# enforce-index-naming

Enforce naming convention for indexes: idx_tablename_column(s) or idx_tablename_purpose.

## 📖 Rule Details

This rule ensures that all database indexes follow a consistent naming pattern. Index names should be descriptive and include the table name and either the column names or the purpose of the index. This makes it easier to understand what an index does and manage indexes across your database.

### ❌ Incorrect

```js
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').unique(),
  created_at: timestamp('created_at'),
}, (table) => ({
  // Generic or unclear index names
  emailIdx: index('email_idx').on(table.email),
  idx1: index('idx1').on(table.created_at),
  userIndex: index('user_index').on(table.email, table.created_at),
  
  // Missing table name prefix
  email: uniqueIndex('email').on(table.email),
  
  // Wrong prefix for unique index
  uniqueEmail: uniqueIndex('idx_unique_email').on(table.email),
}));
```

### ✅ Correct

```js
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email'),
  status: text('status'),
  created_at: timestamp('created_at'),
}, (table) => ({
  // Regular indexes with idx_ prefix
  emailIdx: index('idx_users_email').on(table.email),
  createdAtIdx: index('idx_users_created_at').on(table.created_at),
  
  // Composite index with multiple columns
  statusCreatedIdx: index('idx_users_status_created_at').on(table.status, table.created_at),
  
  // Purpose-based naming
  recentActiveIdx: index('idx_users_recent_active').on(table.status, table.created_at),
  
  // Unique indexes with uq_ prefix
  emailUnique: uniqueIndex('uq_users_email').on(table.email),
}));

const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id'),
  total: decimal('total'),
  status: text('status'),
}, (table) => ({
  // Clear, descriptive index names
  userOrdersIdx: index('idx_orders_user_id').on(table.user_id),
  pendingOrdersIdx: index('idx_orders_pending').on(table.status, table.created_at),
}));
```

## 💡 Why This Rule?

Consistent index naming provides several benefits:

- **Self-Documenting**: Index names immediately tell you which table and columns they cover
- **Easier Maintenance**: Easy to find and manage indexes when they follow a pattern
- **Avoid Collisions**: Including table name prevents naming conflicts
- **Database Tools**: Many database administration tools group indexes by naming patterns
- **Team Collaboration**: Clear naming helps team members understand index purpose

Common problems without naming conventions:
- Duplicate index names across tables
- Unclear what an index like `idx1` or `temp_idx` does
- Difficulty identifying redundant or missing indexes
- Confusion during database migrations

## ⚙️ Options

This rule has no configuration options. It enforces these patterns:

**Regular indexes**: `idx_[tablename]_[column(s)]` or `idx_[tablename]_[purpose]`
- Example: `idx_users_email` or `idx_users_recent_active`

**Unique indexes**: `uq_[tablename]_[column(s)]` or `uk_[tablename]_[column(s)]`
- Example: `uq_users_email` or `uk_users_username`

## 🔧 Example Configuration

::: code-group

```js [Flat Config]
// eslint.config.js
export default [{
  rules: {
    'drizzle/enforce-index-naming': 'error'
  }
}];
```

```json [Legacy Config]
// .eslintrc.json
{
  "rules": {
    "drizzle/enforce-index-naming": "error"
  }
}
```

:::

## 🚫 When to Disable

You might want to disable this rule if:

```js
// Working with existing database with different conventions
const legacy_table = pgTable('legacy_table', {
  id: serial('id').primaryKey(),
  code: text('code'),
}, (table) => ({
  // eslint-disable-next-line drizzle/enforce-index-naming
  LEGACY_CODE_IDX: index('LEGACY_CODE_IDX').on(table.code), // Existing index name
}));

// Database-specific naming requirements
const special_table = pgTable('special_table', {
  id: serial('id').primaryKey(),
  data: jsonb('data'),
}, (table) => ({
  // eslint-disable-next-line drizzle/enforce-index-naming
  "data_gin_idx": index('data_gin_idx').using('gin').on(table.data), // PostgreSQL GIN index
}));
```

## 📚 Best Practices

1. **Be Descriptive**: For complex indexes, use purpose-based names:
   ```js
   // Instead of: idx_orders_user_id_status_created_at
   recentUserOrdersIdx: index('idx_orders_recent_user').on(
     table.user_id, table.status, table.created_at
   )
   ```

2. **Document Complex Indexes**: Add comments for indexes with specific purposes:
   ```js
   // Index for finding active user sessions in the last 24 hours
   activeSessionsIdx: index('idx_sessions_active_recent').on(
     table.user_id, table.last_activity, table.status
   )
   ```

3. **Group Related Indexes**: Organize indexes by their purpose:
   ```js
   }, (table) => ({
     // User lookup indexes
     emailIdx: index('idx_users_email').on(table.email),
     usernameIdx: index('idx_users_username').on(table.username),
     
     // Analytics indexes
     signupDateIdx: index('idx_users_signup_date').on(table.created_at),
     activeUsersIdx: index('idx_users_active_status').on(table.status, table.last_login),
   }))
   ```

## 🔗 Related Rules

- [enforce-snake-case-naming](/rules/enforce-snake-case-naming) - Snake case naming for tables and columns
- [enforce-uuid-indexes](/rules/enforce-uuid-indexes) - Require indexes on UUID foreign keys

## 📚 Further Reading

- [PostgreSQL Indexes Documentation](https://www.postgresql.org/docs/current/indexes.html)
- [Index Naming Conventions](https://www.postgresql.org/docs/current/indexes-intro.html)
- [Drizzle Indexes](https://orm.drizzle.team/docs/indexes-constraints)