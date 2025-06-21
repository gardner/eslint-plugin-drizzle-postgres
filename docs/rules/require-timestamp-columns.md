# require-timestamp-columns

Require tables to have created_at and updated_at timestamp columns.

## 📖 Rule Details

This rule ensures that database tables include `created_at` and `updated_at` timestamp columns. These columns are essential for tracking when records are created and last modified, providing crucial audit information and enabling time-based queries.

### ❌ Incorrect

```js
// Missing both timestamp columns
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').unique(),
  name: text('name'),
});

// Only has created_at
const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title'),
  created_at: timestamp('created_at').defaultNow(),
});

// Only has updated_at
const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  content: text('content'),
  updated_at: timestamp('updated_at').defaultNow(),
});
```

### ✅ Correct

```js
// Has both timestamp columns (snake_case)
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').unique(),
  name: text('name'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Has both timestamp columns (camelCase)
const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: text('title'),
  content: text('content'),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
});

// With additional timestamp tracking
const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  status: text('status'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  completed_at: timestamp('completed_at'), // Additional timestamps are fine
});
```

## 💡 Why This Rule?

Timestamp columns provide essential benefits:

- **Audit Trail**: Track when each record was created and last modified
- **Debugging**: Understand data changes and troubleshoot issues
- **Data Analysis**: Enable time-based queries and reporting
- **Compliance**: Meet regulatory requirements for data tracking
- **Replication**: Support change data capture and synchronization
- **Performance**: Optimize queries with time-based indexes

Without timestamp columns, you lose:
- Ability to debug data issues ("When did this change?")
- Historical context for records
- Options for time-based data archival
- Capability for incremental data processing

## ⚙️ Options

### `checkTables`

- **Type:** `string[]`
- **Default:** `undefined` (check all tables)
- **Description:** Only check specified tables for timestamp columns

### `ignoreTables`

- **Type:** `string[]`
- **Default:** `[]`
- **Description:** Skip checking these tables

```js
// eslint.config.js
{
  rules: {
    'drizzle/require-timestamp-columns': ['error', {
      // Only enforce for these tables
      checkTables: ['users', 'orders', 'posts'],
      
      // Or ignore specific tables
      ignoreTables: ['migrations', 'schema_versions', 'temp_import']
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
    'drizzle/require-timestamp-columns': 'error'
  }
}];

// With options
export default [{
  rules: {
    'drizzle/require-timestamp-columns': ['error', {
      ignoreTables: ['migrations', 'lookup_tables']
    }]
  }
}];
```

```json [Legacy Config]
// .eslintrc.json
{
  "rules": {
    "drizzle/require-timestamp-columns": "error"
  }
}

// With options
{
  "rules": {
    "drizzle/require-timestamp-columns": ["error", {
      "ignoreTables": ["migrations", "lookup_tables"]
    }]
  }
}
```

:::

## 🚫 When to Disable

Some tables legitimately don't need timestamps:

```js
// Static lookup tables
// eslint-disable-next-line drizzle/require-timestamp-columns
const countries = pgTable('countries', {
  code: char('code', { length: 2 }).primaryKey(),
  name: text('name').notNull(),
});

// Junction tables (many-to-many)
// eslint-disable-next-line drizzle/require-timestamp-columns
const user_roles = pgTable('user_roles', {
  user_id: integer('user_id').references(() => users.id),
  role_id: integer('role_id').references(() => roles.id),
}, (table) => ({
  pk: primaryKey(table.user_id, table.role_id),
}));

// Configuration tables
// eslint-disable-next-line drizzle/require-timestamp-columns
const app_settings = pgTable('app_settings', {
  key: text('key').primaryKey(),
  value: jsonb('value'),
});
```

## 📚 Best Practices

1. **Use Database Defaults**: Let the database handle timestamp updates:
   ```js
   created_at: timestamp('created_at').defaultNow(),
   updated_at: timestamp('updated_at').defaultNow()
     .$onUpdate(() => new Date()),
   ```

2. **Consider Time Zones**: Use `timestamptz` for timezone-aware timestamps:
   ```js
   created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
   updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow(),
   ```

3. **Add Indexes for Performance**: Index timestamps for common queries:
   ```js
   }, (table) => ({
     createdAtIdx: index('idx_users_created_at').on(table.created_at),
     recentlyUpdatedIdx: index('idx_users_recently_updated').on(table.updated_at),
   }))
   ```

4. **Use Consistent Naming**: Stick to either snake_case or camelCase:
   ```js
   // Pick one style for your project
   created_at: timestamp('created_at'), // snake_case
   createdAt: timestamp('createdAt'),   // camelCase
   ```

## 🔗 Related Rules

- [enforce-snake-case-naming](/rules/enforce-snake-case-naming) - Naming conventions for columns

## 📚 Further Reading

- [PostgreSQL Timestamp Types](https://www.postgresql.org/docs/current/datatype-datetime.html)
- [Drizzle Timestamp Columns](https://orm.drizzle.team/docs/column-types/pg#timestamp)
- [Database Audit Trails](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)