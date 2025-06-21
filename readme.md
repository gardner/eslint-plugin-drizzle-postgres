# eslint-plugin-drizzle

Official ESLint plugin for [Drizzle ORM](https://orm.drizzle.team/) to help you avoid common pitfalls and enforce best practices.

## Features

- **Safety Rules**: Prevent accidental data loss with required WHERE clauses
- **Schema Conventions**: Enforce naming conventions and schema best practices  
- **Performance**: Catch missing indexes and query performance issues
- **Security**: Row-Level Security (RLS) enforcement for sensitive tables
- **Type Safety**: PostgreSQL-specific type recommendations

## Installation

```bash
npm install --save-dev eslint-plugin-drizzle
# or
pnpm add -D eslint-plugin-drizzle
# or
yarn add -D eslint-plugin-drizzle
# or
bun add -D eslint-plugin-drizzle
```

## Setup

### Flat Config (ESLint 9+)

```js
// eslint.config.js
import drizzle from 'eslint-plugin-drizzle';

export default [
  {
    plugins: {
      drizzle: drizzle,
    },
    rules: {
      'drizzle/enforce-delete-with-where': 'error',
      'drizzle/enforce-update-with-where': 'error',
    },
  },
];
```

### Using Preset Configurations

```js
// eslint.config.js
import drizzle from 'eslint-plugin-drizzle';

export default [
  // Use one of the preset configs
  ...drizzle.configs.recommended,
  // or
  ...drizzle.configs.all,
  // or  
  ...drizzle.configs.strict,
];
```

### Legacy Config (.eslintrc)

```json
{
  "plugins": ["drizzle"],
  "rules": {
    "drizzle/enforce-delete-with-where": "error",
    "drizzle/enforce-update-with-where": "error"
  }
}
```

## Rules

### Safety Rules

- **enforce-delete-with-where**: Require WHERE clause in DELETE statements to prevent accidental full table deletions
- **enforce-update-with-where**: Require WHERE clause in UPDATE statements to prevent accidental full table updates

### Schema & Naming Conventions

- **enforce-snake-case-naming**: Enforce snake_case naming for tables and columns (PostgreSQL convention)
- **enforce-index-naming**: Enforce consistent index naming: `idx_tablename_column(s)`
- **require-timestamp-columns**: Require `created_at` and `updated_at` columns on tables

### Performance Rules

- **enforce-uuid-indexes**: Require indexes on UUID columns for better query performance
- **prefer-uuid-primary-key**: Suggest using UUID instead of serial/integer for primary keys
- **no-select-star**: Discourage SELECT * queries for better performance
- **limit-join-complexity**: Limit the number of joins in a single query (default: 3)

### Security Rules (RLS)

- **require-rls-enabled**: Require Row-Level Security on tables containing sensitive data
- **prevent-rls-bypass**: Detect and require documentation when bypassing RLS

## Preset Configurations

### `recommended`

Basic safety rules to prevent common mistakes:
- Required WHERE clauses for DELETE/UPDATE
- Snake case naming enforcement
- Prevents SELECT * queries

### `all`

Comprehensive ruleset with sensible defaults:
- All safety rules
- Schema conventions (with warnings)
- Performance suggestions
- Basic RLS enforcement

### `strict`

Enforces all best practices with error severity:
- All rules enabled as errors
- Strict RLS enforcement for sensitive tables
- Required timestamp columns
- Enforced naming conventions

## Configuration Options

Some rules accept configuration options:

```js
{
  rules: {
    // Configure sensitive table patterns
    'drizzle/require-rls-enabled': ['error', {
      sensitivePatterns: ['user', 'account', 'payment', 'auth'],
      sensitiveTables: ['custom_table']
    }],
    
    // Set maximum number of joins
    'drizzle/limit-join-complexity': ['warn', { 
      maxJoins: 5 
    }],
    
    // Configure timestamp column requirements
    'drizzle/require-timestamp-columns': ['error', {
      checkTables: ['users', 'posts'], // Only check specific tables
      ignoreTables: ['migrations']      // Ignore specific tables
    }]
  }
}
```

## Requirements

- ESLint >= 9.0.0
- Node.js >= 16.0.0

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

MIT