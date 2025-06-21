# enforce-uuid-indexes

Require indexes on UUID columns for better query performance.

## 📖 Rule Details

This rule ensures that UUID columns used in queries have indexes. UUIDs are 128-bit values that, unlike sequential integers, are randomly distributed. Without proper indexing, queries filtering by UUID columns can result in expensive full table scans.

### ❌ Incorrect

```js
const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull(), // No index!
  teamId: uuid('team_id'), // No index!
  createdBy: uuid('created_by').notNull() // No index!
});

const posts = pgTable('posts', {
  id: uuid('id').primaryKey(),
  authorId: uuid('author_id').notNull(), // Missing index on foreign key!
  categoryId: uuid('category_id') // Missing index!
});
```

### ✅ Correct

```js
// Option 1: Column-level indexes
const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  organizationId: uuid('organization_id').notNull(),
  teamId: uuid('team_id'),
  createdBy: uuid('created_by').notNull()
}, (table) => ({
  organizationIdx: index('users_organization_id_idx').on(table.organizationId),
  teamIdx: index('users_team_id_idx').on(table.teamId),
  createdByIdx: index('users_created_by_idx').on(table.createdBy)
}));

// Option 2: Inline indexes (Drizzle v0.32.0+)
const posts = pgTable('posts', {
  id: uuid('id').primaryKey(),
  authorId: uuid('author_id')
    .notNull()
    .references(() => users.id)
    .$index('posts_author_id_idx'),
  categoryId: uuid('category_id')
    .$index('posts_category_id_idx')
});

// Option 3: Composite indexes for common query patterns
const activities = pgTable('activities', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  projectId: uuid('project_id').notNull(),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
  // Composite index for queries filtering by both user and project
  userProjectIdx: index('activities_user_project_idx')
    .on(table.userId, table.projectId)
}));
```

## 💡 Why This Rule?

UUID indexing is critical for performance because:

1. **Random distribution** - UUIDs don't have natural ordering, making unindexed searches O(n)
2. **Foreign key lookups** - JOINs on unindexed UUID columns are extremely slow
3. **Common in modern apps** - Most modern applications use UUIDs for distributed systems
4. **Hidden performance killer** - Works fine with small data, fails at scale

### Performance Impact Example

```sql
-- Without index: Full table scan (slow)
EXPLAIN SELECT * FROM posts WHERE author_id = '123e4567-e89b-12d3-a456-426614174000';
-- Seq Scan on posts (cost=0.00..10,234.00 rows=1 width=64)

-- With index: Index scan (fast)  
EXPLAIN SELECT * FROM posts WHERE author_id = '123e4567-e89b-12d3-a456-426614174000';
-- Index Scan using posts_author_id_idx on posts (cost=0.28..8.29 rows=1 width=64)
```

## ⚙️ Options

This rule accepts an options object with the following property:

### `ignorePrimaryKeys`

- **Type:** `boolean`  
- **Default:** `true`
- **Description:** Whether to ignore UUID columns that are primary keys (they're automatically indexed)

```js
// eslint.config.js
{
  rules: {
    'drizzle/enforce-uuid-indexes': ['error', {
      ignorePrimaryKeys: false // Also check primary key columns
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
    'drizzle/enforce-uuid-indexes': 'error'
  }
}];
```

```json [Legacy Config]
// .eslintrc.json
{
  "rules": {
    "drizzle/enforce-uuid-indexes": "error"
  }
}
```

:::

## 📝 Best Practices

### 1. Index Foreign Keys

Always index UUID columns that reference other tables:

```js
const orders = pgTable('orders', {
  id: uuid('id').primaryKey(),
  customerId: uuid('customer_id')
    .notNull()
    .references(() => customers.id)
    .$index(), // Always index foreign keys!
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id)
    .$index()
});
```

### 2. Use Composite Indexes for Common Queries

```js
const userActivities = pgTable('user_activities', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').notNull(),
  activityType: text('activity_type').notNull(),
  createdAt: timestamp('created_at').defaultNow()
}, (table) => ({
  // Composite index for common query pattern
  userTypeIdx: index('user_activities_user_type_idx')
    .on(table.userId, table.activityType),
  // Separate index for time-based queries
  userTimeIdx: index('user_activities_user_time_idx')
    .on(table.userId, table.createdAt)
}));
```

### 3. Consider Partial Indexes

For nullable UUID columns or conditional queries:

```js
const documents = pgTable('documents', {
  id: uuid('id').primaryKey(),
  ownerId: uuid('owner_id').notNull(),
  deletedBy: uuid('deleted_by'), // Nullable
  deletedAt: timestamp('deleted_at')
}, (table) => ({
  ownerIdx: index('documents_owner_idx').on(table.ownerId),
  // Partial index only for deleted documents
  deletedByIdx: index('documents_deleted_by_idx')
    .on(table.deletedBy)
    .where(sql`deleted_at IS NOT NULL`)
}));
```

## 🚫 When Not to Index

Some UUID columns don't need indexes:

```js
// Columns rarely used in WHERE clauses
const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey(),
  performedBy: uuid('performed_by'), // Only for display, not filtering
  metadata: jsonb('metadata')
});

// Columns in small, static tables
const configSettings = pgTable('config_settings', {
  id: uuid('id').primaryKey(),
  lastModifiedBy: uuid('last_modified_by') // Table has < 100 rows
});
```

## ⚠️ Common Pitfalls

1. **Over-indexing** - Don't index every UUID column, only those used in queries
2. **Missing composite indexes** - Single column indexes may not help with multi-column queries
3. **Wrong column order** - In composite indexes, column order matters
4. **Ignoring EXPLAIN** - Always verify your indexes are being used

## 🔗 Related Rules

- [prefer-uuid-primary-key](/rules/prefer-uuid-primary-key) - Recommend UUIDs for primary keys
- [enforce-index-naming](/rules/enforce-index-naming) - Ensure consistent index naming

## 📚 Further Reading

- [PostgreSQL Index Documentation](https://www.postgresql.org/docs/current/indexes.html)
- [UUID Performance in PostgreSQL](https://www.postgresql.org/docs/current/datatype-uuid.html)
- [Drizzle Indexes Guide](https://orm.drizzle.team/docs/indexes-constraints#indexes)