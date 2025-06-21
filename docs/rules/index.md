# Rules

eslint-plugin-drizzle-postgres provides a comprehensive set of rules to help you write better, safer, and more performant PostgreSQL database code with Drizzle ORM.

## Rule Categories

### 🛡️ Safety Rules

These rules prevent destructive operations that could lead to data loss:

| Rule | Description | Fixable |
|------|-------------|---------|
| [enforce-delete-with-where](/rules/enforce-delete-with-where) | Require WHERE clause on DELETE operations | ❌ |
| [enforce-update-with-where](/rules/enforce-update-with-where) | Require WHERE clause on UPDATE operations | ❌ |

### 🏗️ Schema & Naming Conventions

Enforce consistent naming and schema patterns:

| Rule | Description | Fixable |
|------|-------------|---------|
| [enforce-snake-case-naming](/rules/enforce-snake-case-naming) | Enforce snake_case for table and column names | ❌ |
| [enforce-index-naming](/rules/enforce-index-naming) | Enforce consistent index naming pattern | ❌ |
| [require-timestamp-columns](/rules/require-timestamp-columns) | Require created_at and updated_at columns | ❌ |

### ⚡ Performance Rules

Optimize query performance and catch issues early:

| Rule | Description | Fixable |
|------|-------------|---------|
| [enforce-uuid-indexes](/rules/enforce-uuid-indexes) | Require indexes on UUID columns | ❌ |
| [prefer-uuid-primary-key](/rules/prefer-uuid-primary-key) | Suggest UUID over serial for primary keys | ❌ |
| [no-select-star](/rules/no-select-star) | Discourage SELECT * queries | ❌ |
| [limit-join-complexity](/rules/limit-join-complexity) | Limit the number of joins in queries | ❌ |

### 🔒 Security Rules (RLS)

Enforce security best practices with Row-Level Security:

| Rule | Description | Fixable |
|------|-------------|---------|
| [require-rls-enabled](/rules/require-rls-enabled) | Require RLS on sensitive tables | ❌ |
| [prevent-rls-bypass](/rules/prevent-rls-bypass) | Detect and document RLS bypasses | ❌ |

## Rule Severity Levels

Each rule can be configured with different severity levels:

- **"error"** or **2** - Reports as an error, exit code 1 when triggered
- **"warn"** or **1** - Reports as a warning, doesn't affect exit code
- **"off"** or **0** - Disables the rule

Example:
```js
{
  rules: {
    'drizzle/enforce-delete-with-where': 'error',
    'drizzle/enforce-snake-case-naming': 'warn',
    'drizzle/prefer-uuid-primary-key': 'off'
  }
}
```

## Configuring Rules

Many rules accept additional options to customize their behavior:

```js
{
  rules: {
    // Configure sensitive table patterns
    'drizzle/require-rls-enabled': ['error', {
      sensitivePatterns: ['user', 'account', 'payment'],
      sensitiveTables: ['custom_secure_table']
    }],

    // Set maximum number of joins
    'drizzle/limit-join-complexity': ['warn', {
      maxJoins: 5
    }],

    // Custom Drizzle instance name
    'drizzle/enforce-delete-with-where': ['error', {
      drizzleObjectName: 'database'
    }]
  }
}
```

## Using Rule Presets

Instead of configuring rules individually, you can use one of our presets:

::: code-group

```js [Recommended]
export default [
  ...drizzle.configs.recommended
];
```

```js [All]
export default [
  ...drizzle.configs.all
];
```

```js [Strict]
export default [
  ...drizzle.configs.strict
];
```

:::

## Disabling Rules

You can disable rules for specific files or lines:

### Disable for entire file
```js
/* eslint-disable drizzle/enforce-delete-with-where */
```

### Disable for next line
```js
// eslint-disable-next-line drizzle/enforce-delete-with-where
await db.delete(tempTable);
```

### Disable for specific line
```js
await db.delete(tempTable); // eslint-disable-line drizzle/enforce-delete-with-where
```

### Disable for a block
```js
/* eslint-disable drizzle/enforce-delete-with-where */
await db.delete(tempTable1);
await db.delete(tempTable2);
/* eslint-enable drizzle/enforce-delete-with-where */
```

::: warning
Be cautious when disabling safety rules. Always document why a rule is being disabled to help future maintainers understand the decision.
:::

## Contributing New Rules

Have an idea for a new rule? We welcome contributions! Check out our [contributing guide](https://github.com/drizzle-team/eslint-plugin-drizzle-postgres/blob/main/CONTRIBUTING.md) to learn how to add new rules to the plugin.