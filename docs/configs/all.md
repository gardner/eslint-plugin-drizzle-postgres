# All Configuration

The "all" configuration provides a comprehensive set of rules with sensible defaults, balancing strict enforcement with practical flexibility.

## Philosophy

The "all" preset follows these principles:

- **Comprehensive coverage** - Includes all available rules
- **Graduated severity** - Errors for critical issues, warnings for best practices
- **Production-ready defaults** - Configured for real-world applications
- **Flexibility** - Warnings allow teams to adopt gradually

## What's Included

```js
{
  rules: {
    // Safety (Errors)
    'drizzle/enforce-delete-with-where': 'error',
    'drizzle/enforce-update-with-where': 'error',

    // Schema & Performance (Errors)
    'drizzle/enforce-uuid-indexes': 'error',
    'drizzle/enforce-snake-case-naming': 'error',
    'drizzle/enforce-index-naming': 'error',

    // Best Practices (Warnings)
    'drizzle/require-timestamp-columns': 'warn',
    'drizzle/prefer-uuid-primary-key': 'warn',
    'drizzle/no-select-star': 'warn',
    'drizzle/limit-join-complexity': ['warn', { maxJoins: 3 }],

    // Security (Warnings)
    'drizzle/require-rls-enabled': ['warn', {
      sensitivePatterns: ['user', 'account', 'payment', 'auth', 'session']
    }],
    'drizzle/prevent-rls-bypass': 'warn'
  }
}
```

## Rule Categories

### 🛡️ Safety Rules (Errors)

Critical rules that prevent data loss:

- **enforce-delete-with-where** - Prevent accidental full table deletions
- **enforce-update-with-where** - Prevent accidental full table updates

### 🏗️ Schema Rules (Errors)

Enforce consistent database design:

- **enforce-uuid-indexes** - Require indexes on UUID foreign keys
- **enforce-snake-case-naming** - PostgreSQL naming conventions
- **enforce-index-naming** - Consistent index naming pattern

### ⚡ Performance Rules (Warnings)

Optimize query performance:

- **prefer-uuid-primary-key** - Recommend UUIDs over serial IDs
- **no-select-star** - Discourage SELECT * queries
- **limit-join-complexity** - Prevent overly complex queries (max 3 joins)

### 📊 Maintenance Rules (Warnings)

Improve long-term maintainability:

- **require-timestamp-columns** - Ensure audit trails with created_at/updated_at

### 🔒 Security Rules (Warnings)

Enforce security best practices:

- **require-rls-enabled** - RLS on sensitive tables (user, account, payment patterns)
- **prevent-rls-bypass** - Detect and document RLS bypasses

## Usage

### Flat Config (ESLint 9+)

```js
// eslint.config.js
import drizzle from 'eslint-plugin-drizzle-postgres';

export default [
  ...drizzle.configs.all
];
```

### With Custom Database Instance

```js
// eslint.config.js
import drizzle from 'eslint-plugin-drizzle-postgres';

export default [
  ...drizzle.configs.all,
  {
    rules: {
      // Override for custom instance name
      'drizzle/enforce-delete-with-where': ['error', {
        drizzleObjectName: 'database'
      }],
      'drizzle/enforce-update-with-where': ['error', {
        drizzleObjectName: 'database'
      }]
    }
  }
];
```

## When to Use

The "all" configuration is ideal for:

### ✅ New Projects
- Start with best practices from day one
- Warnings allow flexibility during development
- Easy to upgrade warnings to errors later

### ✅ Medium to Large Teams
- Comprehensive coverage prevents issues
- Consistent patterns across codebase
- Security rules catch vulnerabilities

### ✅ Production Applications
- Balanced approach to enforcement
- Performance rules prevent scaling issues
- Security rules for sensitive data

## Customization Examples

### Stricter Security

```js
export default [
  ...drizzle.configs.all,
  {
    rules: {
      // Upgrade security rules to errors
      'drizzle/require-rls-enabled': ['error', {
        sensitivePatterns: ['user', 'account', 'payment', 'auth', 'session'],
        sensitiveTables: ['api_keys', 'audit_logs']
      }],
      'drizzle/prevent-rls-bypass': 'error'
    }
  }
];
```

### Relaxed Performance Rules

```js
export default [
  ...drizzle.configs.all,
  {
    rules: {
      // Allow more complex queries
      'drizzle/limit-join-complexity': ['warn', { maxJoins: 5 }],
      // Disable SELECT * rule for prototyping
      'drizzle/no-select-star': 'off'
    }
  }
];
```

### Gradual Schema Migration

```js
export default [
  ...drizzle.configs.all,
  {
    rules: {
      // Downgrade to warnings during migration
      'drizzle/enforce-snake-case-naming': 'warn',
      'drizzle/require-timestamp-columns': ['warn', {
        ignoreTables: ['legacy_users', 'old_orders']
      }]
    }
  }
];
```

## Migration Strategy

### From Recommended

```js
// Step 1: See what would fail
// Run ESLint with --max-warnings 0 to treat warnings as errors

// Step 2: Fix critical issues
// Focus on errors first, then address warnings

// Step 3: Switch configuration
export default [
  // Replace recommended with all
  ...drizzle.configs.all
];

// Step 4: Customize as needed
export default [
  ...drizzle.configs.all,
  {
    rules: {
      // Temporarily downgrade rules causing many issues
      'drizzle/require-timestamp-columns': 'off',
      // Re-enable when ready
    }
  }
];
```

### To Strict

When ready for maximum enforcement:

```js
// Option 1: Gradually upgrade warnings
export default [
  ...drizzle.configs.all,
  {
    rules: {
      // Upgrade warnings to errors one by one
      'drizzle/require-timestamp-columns': 'error',
      'drizzle/prefer-uuid-primary-key': 'error',
      // Continue with others...
    }
  }
];

// Option 2: Switch to strict preset
export default [
  ...drizzle.configs.strict
];
```

## Example Output

Here's what you might see with the "all" configuration:

```bash
/src/schema/users.ts
  12:3  error    Table 'users' must have a WHERE clause in delete operations      drizzle/enforce-delete-with-where
  23:5  error    UUID column 'organization_id' should have an index               drizzle/enforce-uuid-indexes
  45:1  warning  Table 'users' should have created_at and updated_at columns      drizzle/require-timestamp-columns

/src/queries/reports.ts
  8:10  warning  Avoid using SELECT * - specify needed columns explicitly         drizzle/no-select-star
  15:1  warning  Query contains 4 JOINs, which exceeds the recommended limit of 3 drizzle/limit-join-complexity

/src/schema/payments.ts
  5:1   warning  Table 'payment_methods' contains sensitive data and should have RLS enabled  drizzle/require-rls-enabled

✖ 6 problems (2 errors, 4 warnings)
```

## Next Steps

- Review [individual rules](/rules/) to understand each check
- Consider the [strict configuration](/configs/strict) for maximum enforcement
- Learn about [customizing rules](/guide/custom-instances) for your needs