# require-rls-enabled

Require Row-Level Security (RLS) on tables containing sensitive data.

## 📖 Rule Details

This rule identifies tables that likely contain sensitive data and ensures they have Row-Level Security (RLS) enabled. RLS is a PostgreSQL feature that provides fine-grained access control at the row level, essential for multi-tenant applications and protecting sensitive data.

### ❌ Incorrect

```js
// User table without RLS - any user can read any other user's data!
const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').unique(),
  password: text('password'),
  ssn: text('ssn')
});

// Payment information exposed without RLS
const payment_methods = pgTable('payment_methods', {
  id: uuid('id').primaryKey(),
  user_id: uuid('user_id').references(() => users.id),
  card_number: text('card_number'),
  cvv: text('cvv')
});
```

### ✅ Correct

```js
// User table with RLS enabled
const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email').unique(),
  password: text('password')
});

// Enable RLS
sql`ALTER TABLE users ENABLE ROW LEVEL SECURITY`;

// Create policies
sql`
  CREATE POLICY users_select_policy ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id)
`;

sql`
  CREATE POLICY users_update_policy ON users
  FOR UPDATE TO authenticated  
  USING (auth.uid() = id)
`;
```

## 💡 Why This Rule?

Row-Level Security is critical for:

- **Multi-tenant applications** - Ensuring tenants can only access their own data
- **User privacy** - Preventing unauthorized access to personal information
- **Compliance** - Meeting GDPR, HIPAA, and other regulatory requirements
- **Defense in depth** - Adding a database-level security layer

Without RLS, a simple query like `SELECT * FROM users` could expose all user data, even if your application logic tries to filter it.

## ⚙️ Options

### `sensitiveTables`

- **Type:** `string[]`  
- **Default:** `[]`
- **Description:** Explicit list of table names that should have RLS

### `sensitivePatterns`

- **Type:** `string[]`  
- **Default:** `["user", "account", "profile", "payment", "order", "invoice", "medical", "health", "personal", "private", "auth", "session", "token"]`
- **Description:** Patterns to match against table names to identify sensitive tables

```js
// eslint.config.js
{
  rules: {
    'drizzle/require-rls-enabled': ['error', {
      sensitiveTables: ['customers', 'contracts'],
      sensitivePatterns: ['user', 'payment', 'medical', 'secret']
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
    'drizzle/require-rls-enabled': ['error', {
      sensitiveTables: ['api_keys', 'audit_logs'],
      sensitivePatterns: ['user', 'auth', 'payment']
    }]
  }
}];
```

```json [Legacy Config]
// .eslintrc.json
{
  "rules": {
    "drizzle/require-rls-enabled": ["error", {
      "sensitiveTables": ["api_keys", "audit_logs"],
      "sensitivePatterns": ["user", "auth", "payment"]
    }]
  }
}
```

:::

## 📝 Implementation Guide

Here's how to properly implement RLS for a sensitive table:

```js
// 1. Define your table
const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').unique().notNull(),
  name: text('name'),
  role: text('role').default('user')
});

// 2. Enable RLS
await db.execute(sql`ALTER TABLE users ENABLE ROW LEVEL SECURITY`);

// 3. Create policies for different operations
// Allow users to see only their own data
await db.execute(sql`
  CREATE POLICY users_select_own ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id)
`);

// Allow users to update only their own data
await db.execute(sql`
  CREATE POLICY users_update_own ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
`);

// Allow admins to see all users
await db.execute(sql`
  CREATE POLICY users_admin_select ON users
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  )
`);

// 4. Don't forget INSERT policy if needed
await db.execute(sql`
  CREATE POLICY users_insert ON users
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id)
`);
```

## 🚫 When Not to Use RLS

Some tables don't need RLS:

```js
// Public data - no RLS needed
const blog_posts = pgTable('blog_posts', {
  id: uuid('id').primaryKey(),
  title: text('title'),
  content: text('content'),
  published: boolean('published').default(false)
});

// Reference/lookup tables - typically public
const countries = pgTable('countries', {
  id: serial('id').primaryKey(),
  name: text('name'),
  code: text('code')
});

// Aggregated/anonymous data
const analytics_events = pgTable('analytics_events', {
  id: uuid('id').primaryKey(),
  event_type: text('event_type'),
  count: integer('count'),
  date: date('date')
});
```

## ⚠️ Common Pitfalls

1. **No policies after enabling RLS** - This blocks ALL access
2. **Policies too permissive** - Defeats the purpose of RLS
3. **Missing policies for operations** - Remember INSERT, UPDATE, DELETE
4. **Not testing with different user roles** - Always test your policies

## 🔗 Related Rules

- [prevent-rls-bypass](/rules/prevent-rls-bypass) - Detect when RLS is being bypassed

## 📚 Further Reading

- [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [RLS Best Practices](https://www.postgresql.org/docs/current/sql-createpolicy.html)