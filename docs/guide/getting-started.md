# Getting Started

This guide will help you set up eslint-plugin-drizzle-postgres in your project.

## Prerequisites

Before installing eslint-plugin-drizzle-postgres, ensure you have:

- **Node.js** version 16.0.0 or higher
- **ESLint** version 9.0.0 or higher
- **Drizzle ORM** already set up in your project
- **PostgreSQL** as your database (this plugin is specifically designed for PostgreSQL)

## Installation

Install the plugin as a development dependency:

::: code-group

```bash [npm]
npm install --save-dev eslint-plugin-drizzle-postgres
```

```bash [pnpm]
pnpm add -D eslint-plugin-drizzle-postgres
```

```bash [yarn]
yarn add -D eslint-plugin-drizzle-postgres
```

```bash [bun]
bun add -D eslint-plugin-drizzle-postgres
```

:::

## Configuration

### Using Flat Config (ESLint 9+)

The recommended way to configure the plugin is using ESLint's flat config format:

```js
// eslint.config.js
import drizzle from 'eslint-plugin-drizzle-postgres';

export default [
  // Use the recommended preset
  ...drizzle.configs.recommended,

  // Your other ESLint configurations
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      // Override or add specific rules
      'drizzle/enforce-delete-with-where': 'error',
      'drizzle/enforce-update-with-where': 'error',
    }
  }
];
```

### Using Legacy Config (.eslintrc)

If you're still using the legacy configuration format:

```json
{
  "plugins": ["drizzle"],
  "extends": ["plugin:drizzle/recommended"],
  "rules": {
    "drizzle/enforce-delete-with-where": "error",
    "drizzle/enforce-update-with-where": "error"
  }
}
```

## Choosing a Configuration

The plugin comes with three preset configurations:

### Recommended (Default)

Perfect for getting started. Includes essential safety rules:

```js
export default [
  ...drizzle.configs.recommended
];
```

**Includes:**
- `enforce-delete-with-where` (error)
- `enforce-update-with-where` (error)
- `enforce-snake-case-naming` (warning)
- `no-select-star` (warning)

### All

Comprehensive ruleset with all available rules:

```js
export default [
  ...drizzle.configs.all
];
```

**Includes all rules with sensible defaults:**
- Safety rules as errors
- Schema conventions as warnings
- Performance suggestions as warnings
- RLS rules for sensitive tables

### Strict

Enforces all best practices as errors:

```js
export default [
  ...drizzle.configs.strict
];
```

**All rules enabled as errors** - perfect for new projects that want to enforce all best practices from the start.

## Basic Usage Example

Here's a complete example of setting up the plugin in a TypeScript project:

```js
// eslint.config.js
import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import drizzle from 'eslint-plugin-drizzle-postgres';

export default [
  js.configs.recommended,
  ...drizzle.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      // Customize Drizzle rules
      'drizzle/enforce-delete-with-where': 'error',
      'drizzle/enforce-update-with-where': 'error',
      'drizzle/enforce-uuid-indexes': 'warn',
    }
  }
];
```

## Verifying Installation

To verify the plugin is working correctly:

1. Create a test file with a Drizzle query that violates a rule:

```ts
// test-drizzle.ts
import { db } from './db';
import { users } from './schema';

// This should trigger an ESLint error
await db.delete(users);
```

2. Run ESLint:

```bash
npx eslint test-drizzle.ts
```

You should see an error like:
```
error  Delete operations must have a WHERE clause  drizzle/enforce-delete-with-where
```

## Custom Drizzle Instance Name

If you're using a custom name for your Drizzle instance (not `db`), configure the rules:

```js
{
  rules: {
    'drizzle/enforce-delete-with-where': ['error', {
      drizzleObjectName: 'database'
    }],
    'drizzle/enforce-update-with-where': ['error', {
      drizzleObjectName: 'database'
    }],
  }
}
```

## IDE Integration

Most modern IDEs support ESLint integration:

- **VS Code**: Install the [ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- **WebStorm**: ESLint is integrated by default
- **Neovim**: Use plugins like [nvim-lspconfig](https://github.com/neovim/nvim-lspconfig)

## Next Steps

- Learn about [individual rules](/rules/) and how to configure them
- Explore [advanced configuration options](/guide/custom-instances)
- Set up [CI/CD integration](/guide/ci-cd) to enforce rules in your pipeline