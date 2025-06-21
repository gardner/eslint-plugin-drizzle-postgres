# prefer-uuid-primary-key

Suggest using UUID for primary keys instead of serial/integer.

## 📖 Rule Details

This rule suggests using UUIDs as primary keys instead of auto-incrementing integers. UUIDs provide better scalability for distributed systems, prevent enumeration attacks, and enable client-side ID generation. The rule provides automatic fix suggestions to convert serial/integer primary keys to UUIDs.

### ❌ Incorrect

```js
// Using serial (auto-incrementing integer)
const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').unique(),
});

// Using integer with primary key
const posts = pgTable('posts', {
  id: integer('id').primaryKey(),
  title: text('title'),
});

// Named serial columns
const products = pgTable('products', {
  product_id: serial('product_id').primaryKey(),
  name: text('name'),
});
```

### ✅ Correct

```js
// Using UUID with default random generation
const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique(),
});

// Using text-based UUID (for databases without native UUID type)
const posts = pgTable('posts', {
  id: text('id').$defaultFn(() => crypto.randomUUID()).primaryKey(),
  title: text('title'),
});

// Custom named UUID columns
const products = pgTable('products', {
  product_id: uuid('product_id').defaultRandom().primaryKey(),
  name: text('name'),
});

// Non-primary key integers are fine
const inventory = pgTable('inventory', {
  id: uuid('id').defaultRandom().primaryKey(),
  quantity: integer('quantity').notNull(), // OK - not a primary key
});
```

## 💡 Why This Rule?

UUIDs offer significant advantages over serial integers:

**Security Benefits:**
- **No Enumeration**: Can't guess IDs to access other users' data
- **No Information Leakage**: Serial IDs reveal order and count of records
- **URL Safety**: Safe to expose in URLs without revealing business metrics

**Scalability Benefits:**
- **Distributed Generation**: Generate IDs on any server without coordination
- **No Sequence Conflicts**: Avoid issues with database replication
- **Merge Friendly**: Combine data from multiple databases without ID conflicts
- **Client-Side Generation**: Create IDs before sending to the server

**Development Benefits:**
- **Predictable IDs**: Know the ID before inserting the record
- **Testing**: Use fixed UUIDs in tests without sequence conflicts
- **Import/Export**: Move data between environments without ID collisions

## ⚙️ Options

This rule has no configuration options. It automatically suggests fixes for serial and integer primary keys.

## 🔧 Example Configuration

::: code-group

```js [Flat Config]
// eslint.config.js
export default [{
  rules: {
    'drizzle/prefer-uuid-primary-key': 'warn' // Suggestion, not error
  }
}];
```

```json [Legacy Config]
// .eslintrc.json
{
  "rules": {
    "drizzle/prefer-uuid-primary-key": "warn"
  }
}
```

:::

## 🚫 When to Disable

There are valid reasons to use integer primary keys:

```js
// High-performance scenarios requiring smaller indexes
// eslint-disable-next-line drizzle/prefer-uuid-primary-key
const events = pgTable('events', {
  id: serial('id').primaryKey(), // Billions of rows, index size matters
  timestamp: timestamp('timestamp'),
  data: jsonb('data'),
});

// Legacy system integration
// eslint-disable-next-line drizzle/prefer-uuid-primary-key
const legacy_orders = pgTable('legacy_orders', {
  order_id: integer('order_id').primaryKey(), // Must match legacy system
  customer_id: integer('customer_id'),
});

// Specific business requirements
// eslint-disable-next-line drizzle/prefer-uuid-primary-key
const invoice_numbers = pgTable('invoice_numbers', {
  number: serial('number').primaryKey(), // Sequential invoice numbers required
  year: integer('year'),
});
```

## 📚 Best Practices

1. **Use Database-Native UUID Type**: When available, use the native UUID type:
   ```js
   // PostgreSQL
   id: uuid('id').defaultRandom().primaryKey(),
   
   // MySQL (storing as binary)
   id: binary('id', { length: 16 }).primaryKey(),
   
   // SQLite (as text)
   id: text('id').$defaultFn(() => crypto.randomUUID()).primaryKey(),
   ```

2. **Consider UUID v7**: For time-ordered UUIDs (better index performance):
   ```js
   import { uuidv7 } from 'uuidv7';
   
   id: uuid('id').$defaultFn(() => uuidv7()).primaryKey(),
   ```

3. **Index Foreign Keys**: UUID foreign keys should always be indexed:
   ```js
   const posts = pgTable('posts', {
     id: uuid('id').defaultRandom().primaryKey(),
     user_id: uuid('user_id').references(() => users.id),
   }, (table) => ({
     userIdIdx: index('idx_posts_user_id').on(table.user_id),
   }));
   ```

4. **Migration Strategy**: When migrating existing tables:
   ```js
   // Add UUID column first
   id_new: uuid('id_new').defaultRandom(),
   // Migrate data
   // Switch primary key
   // Remove old column
   ```

## 🤔 Common Concerns

**"UUIDs are too long for URLs"**
- Use URL-safe base64 encoding or shorter representations
- Consider slugs for user-facing URLs

**"UUIDs hurt database performance"**
- Use UUID v7 for better locality
- The security benefits often outweigh minor performance differences
- Modern databases handle UUIDs efficiently

**"UUIDs are hard to debug"**
- Use memorable prefixes: `user_550e8400-e29b-41d4-a716-446655440000`
- Log queries and IDs for debugging
- Tools can help visualize UUID relationships

## 🔗 Related Rules

- [enforce-uuid-indexes](/rules/enforce-uuid-indexes) - Ensure UUID foreign keys are indexed

## 📚 Further Reading

- [UUID vs Serial Primary Keys](https://www.postgresql.org/docs/current/datatype-uuid.html)
- [UUID v7 Specification](https://www.ietf.org/rfc/rfc4122.txt)
- [Drizzle UUID Column Type](https://orm.drizzle.team/docs/column-types/pg#uuid)