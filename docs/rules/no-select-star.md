# no-select-star

Avoid SELECT * queries. Explicitly list columns for better performance.

## 📖 Rule Details

This rule prevents the use of `SELECT *` queries by requiring explicit column selection. When you call `.select()` without arguments in Drizzle, it generates a `SELECT *` query. This can lead to performance issues, unnecessary data transfer, and maintenance problems as your schema evolves.

### ❌ Incorrect

```js
// SELECT * - retrieves all columns
await db.select().from(users);

// Still SELECT * even with other operations
await db.select().from(posts).where(eq(posts.published, true));

// SELECT * in joins
await db
  .select()
  .from(users)
  .leftJoin(profiles, eq(users.id, profiles.userId));

// Complex queries with SELECT *
await db
  .select()
  .from(orders)
  .where(gt(orders.total, 100))
  .orderBy(desc(orders.createdAt))
  .limit(10);
```

### ✅ Correct

```js
// Explicitly select needed columns
await db.select({
  id: users.id,
  email: users.email,
  name: users.name,
}).from(users);

// Select specific columns with conditions
await db.select({
  title: posts.title,
  content: posts.content,
  publishedAt: posts.publishedAt,
}).from(posts).where(eq(posts.published, true));

// Efficient joins with specific columns
await db.select({
  userId: users.id,
  email: users.email,
  bio: profiles.bio,
  avatar: profiles.avatarUrl,
}).from(users)
  .leftJoin(profiles, eq(users.id, profiles.userId));

// Using table select helpers
await db.select({
  user: users,  // All user columns
  profile: {    // Specific profile columns
    bio: profiles.bio,
    avatar: profiles.avatarUrl,
  },
}).from(users)
  .leftJoin(profiles, eq(users.id, profiles.userId));
```

## 💡 Why This Rule?

SELECT * queries cause several problems:

**Performance Issues:**
- **Over-fetching**: Retrieves columns you don't need, wasting bandwidth
- **No Index Coverage**: Can't use covering indexes for optimization
- **Memory Usage**: Loads unnecessary data into application memory
- **Network Transfer**: Increases data transfer between database and application

**Maintenance Problems:**
- **Schema Changes**: Adding columns automatically includes them in all queries
- **Breaking Changes**: Column type changes can break existing code
- **Hidden Dependencies**: Unclear which columns the code actually uses
- **Large Columns**: Accidentally fetching TEXT/BLOB columns

**Security Concerns:**
- **Data Exposure**: May retrieve sensitive columns unintentionally
- **API Leakage**: Could expose internal columns through APIs

## ⚙️ Options

This rule has no configuration options.

## 🔧 Example Configuration

::: code-group

```js [Flat Config]
// eslint.config.js
export default [{
  rules: {
    'drizzle/no-select-star': 'error'
  }
}];
```

```json [Legacy Config]
// .eslintrc.json
{
  "rules": {
    "drizzle/no-select-star": "error"
  }
}
```

:::

## 🚫 When to Disable

There are some cases where SELECT * might be acceptable:

```js
// Data export/backup operations
async function exportTable(tableName) {
  // eslint-disable-next-line drizzle/no-select-star
  const allData = await db.select().from(users); // Need all columns for export
  return allData;
}

// Generic table operations
async function cloneRecord(table, id) {
  // eslint-disable-next-line drizzle/no-select-star
  const [record] = await db.select().from(table).where(eq(table.id, id));
  delete record.id;
  return db.insert(table).values(record);
}

// Development/debugging
async function debugUser(userId) {
  // eslint-disable-next-line drizzle/no-select-star
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  console.log('Full user record:', user);
}
```

## 📚 Best Practices

1. **Select Only What You Need**: Be explicit about required columns:
   ```js
   // Bad: Getting all columns for just the name
   const users = await db.select().from(users);
   const names = users.map(u => u.name);
   
   // Good: Get only the name column
   const names = await db.select({
     name: users.name
   }).from(users);
   ```

2. **Create Reusable Column Sets**: Define common column selections:
   ```js
   // Define column sets
   const userPublicFields = {
     id: users.id,
     name: users.name,
     avatar: users.avatarUrl,
   };
   
   const userPrivateFields = {
     ...userPublicFields,
     email: users.email,
     phone: users.phone,
   };
   
   // Use in queries
   await db.select(userPublicFields).from(users);
   ```

3. **Use Partial Selects in APIs**: Don't expose unnecessary data:
   ```js
   // API endpoint - only return needed fields
   app.get('/api/users', async (req, res) => {
     const userData = await db.select({
       id: users.id,
       name: users.name,
       role: users.role,
     }).from(users);
     res.json(userData);
   });
   ```

4. **Consider Column Changes**: Think about schema evolution:
   ```js
   // Future-proof by being explicit
   const posts = await db.select({
     id: posts.id,
     title: posts.title,
     content: posts.content,
     // New columns won't automatically appear in results
   }).from(posts);
   ```

## 🔗 Related Rules

- [limit-join-complexity](/rules/limit-join-complexity) - Limit number of joins in queries

## 📚 Further Reading

- [SQL Performance Best Practices](https://use-the-index-luke.com/sql/partial-results/fetch-first-rows-only)
- [Drizzle Select Documentation](https://orm.drizzle.team/docs/select)
- [Database Query Optimization](https://www.postgresql.org/docs/current/performance-tips.html)