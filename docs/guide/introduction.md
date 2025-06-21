# What is eslint-plugin-drizzle-postgres?

eslint-plugin-drizzle-postgres is an ESLint plugin for [Drizzle ORM](https://orm.drizzle.team/) specifically focused on PostgreSQL, designed to help developers write safer, more performant, and more maintainable database code while following PostgreSQL best practices.

## The Problem

When working with any ORM, including Drizzle, there are common patterns that can lead to serious issues:

### 🚨 Data Loss Risks
```js
// This deletes ALL users from your database!
await db.delete(users);

// This updates ALL orders to completed!
await db.update(orders).set({ status: 'completed' });
```

### 🐌 Performance Issues
```js
// No index on foreign key = slow queries
const posts = pgTable('posts', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id').notNull(), // Missing index!
});

// SELECT * can transfer massive amounts of unnecessary data
const allData = await db.select().from(users);
```

### 🔓 Security Vulnerabilities
```js
// Sensitive table without Row-Level Security
const users = pgTable('users', {
  id: uuid('id').primaryKey(),
  email: text('email'),
  password: text('password'), // No RLS = any user can read any password!
});
```

## The Solution

eslint-plugin-drizzle-postgres provides automated checks during development to catch these issues before they reach production. It integrates seamlessly into your existing ESLint workflow and is tailored specifically for PostgreSQL's unique features and best practices.

## Core Principles

### 1. **Prevent Destructive Operations**
The plugin ensures that potentially destructive operations like DELETE and UPDATE always include WHERE clauses, preventing accidental full-table modifications.

### 2. **Enforce Best Practices**
From naming conventions to schema design, the plugin helps maintain consistency across your codebase and team.

### 3. **Optimize Performance**
By catching missing indexes and inefficient query patterns during development, you can address performance issues before they impact users.

### 4. **Security by Default**
The plugin helps enforce security best practices like Row-Level Security (RLS) on sensitive tables, making secure patterns the easy default.

### 5. **PostgreSQL-Specific Optimizations**
Leverage PostgreSQL-specific features like UUIDs, proper indexing strategies, and naming conventions that align with PostgreSQL standards.

## Who Should Use This?

- **Teams using Drizzle ORM** - Ensure consistent patterns across your codebase
- **PostgreSQL users** - Take advantage of PostgreSQL-specific optimizations and patterns
- **Projects handling sensitive data** - Enforce security best practices automatically
- **Performance-conscious applications** - Catch query performance issues early

## What's Included?

The plugin includes:
- **11+ ESLint rules** covering safety, performance, and security
- **3 preset configurations** (recommended, all, strict) for easy setup
- **Full TypeScript support** with proper type definitions
- **Configurable options** for each rule to match your needs
- **Detailed error messages** with actionable fixes

## Next Steps

Ready to get started? Head over to our [Getting Started guide](/guide/getting-started) to set up eslint-plugin-drizzle-postgres in your project.