---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "eslint-plugin-drizzle-postgres"
  text: "ESLint Plugin for Drizzle ORM with PostgreSQL"
  tagline: Enforce PostgreSQL best practices and prevent common pitfalls when using Drizzle ORM
  image:
    src: /drizzle-hero.svg
    alt: Drizzle ESLint Plugin
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View Rules
      link: /rules/
    - theme: alt
      text: GitHub
      link: https://github.com/gardner/eslint-plugin-drizzle-postgres

features:
  - icon: 🛡️
    title: Prevent Data Loss
    details: Enforce WHERE clauses on DELETE and UPDATE operations to prevent accidental full table modifications
  - icon: 🏗️
    title: Schema Best Practices
    details: Ensure consistent naming conventions, required timestamps, and proper index configuration
  - icon: ⚡
    title: Performance Optimization
    details: Catch missing indexes, discourage SELECT *, and limit query complexity before it becomes a problem
  - icon: 🔒
    title: Security First
    details: Enforce Row-Level Security (RLS) on sensitive tables and prevent accidental security bypasses
  - icon: 🎯
    title: PostgreSQL Focused
    details: Specialized rules for PostgreSQL best practices including UUID usage and proper data types
  - icon: 🔧
    title: Fully Configurable
    details: Choose from preset configurations or customize individual rules to match your team's standards
---

## Quick Start

```bash
npm install --save-dev eslint-plugin-drizzle-postgres
```

Add to your ESLint config:

```js
// eslint.config.js
import drizzle from 'eslint-plugin-drizzle-postgres';

export default [
  ...drizzle.configs.recommended
];
```

## Why Use This Plugin?

When working with Drizzle ORM and PostgreSQL, certain patterns can lead to data loss, performance issues, or security vulnerabilities. This plugin helps you catch these issues during development:

::: danger Common Mistake
```js
// ❌ Deletes ALL users!
await db.delete(users);
```
:::

::: tip With eslint-plugin-drizzle-postgres
```js
// ✅ ESLint error: Delete operations must have a WHERE clause
await db.delete(users).where(eq(users.id, userId));
```
:::

## Features at a Glance

### 🛡️ Safety Rules
- **enforce-delete-with-where** - Prevent accidental full table deletions
- **enforce-update-with-where** - Prevent accidental full table updates

### 🏗️ Schema Conventions
- **enforce-snake-case-naming** - Enforce PostgreSQL naming conventions
- **enforce-index-naming** - Consistent index naming patterns
- **require-timestamp-columns** - Ensure audit trail with created_at/updated_at

### ⚡ Performance
- **enforce-uuid-indexes** - Require indexes on UUID columns
- **prefer-uuid-primary-key** - Recommend UUIDs over serial IDs
- **no-select-star** - Discourage SELECT * queries
- **limit-join-complexity** - Prevent overly complex queries

### 🔒 Security (RLS)
- **require-rls-enabled** - Enforce RLS on sensitive tables
- **prevent-rls-bypass** - Catch and document RLS bypasses

## Preset Configurations

### Recommended
Basic safety rules to prevent common mistakes:
```js
export default [
  ...drizzle.configs.recommended
];
```

### All
Comprehensive ruleset with sensible defaults:
```js
export default [
  ...drizzle.configs.all
];
```

### Strict
Enforce all best practices with error severity:
```js
export default [
  ...drizzle.configs.strict
];
```

## Community

- [GitHub Repository](https://github.com/gardner/eslint-plugin-drizzle-postgres)
- [Discord Community](https://discord.gg/drizzle-orm)
- [Drizzle ORM Documentation](https://orm.drizzle.team)