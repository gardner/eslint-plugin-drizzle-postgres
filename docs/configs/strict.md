# Strict Configuration

The "strict" configuration enforces all best practices as errors, providing maximum safety and consistency for your Drizzle ORM code.

## Philosophy

The "strict" preset follows these principles:

- **Zero tolerance** - All rules enforced as errors
- **Best practices by default** - No compromises on code quality
- **Security first** - Mandatory RLS on sensitive data
- **Performance conscious** - Enforce optimal patterns from the start

## What's Included

```js
{
  rules: {
    // All rules as errors
    'drizzle/enforce-delete-with-where': 'error',
    'drizzle/enforce-update-with-where': 'error',
    'drizzle/enforce-uuid-indexes': 'error',
    'drizzle/enforce-snake-case-naming': 'error',
    'drizzle/enforce-index-naming': 'error',
    'drizzle/require-timestamp-columns': 'error',
    'drizzle/prefer-uuid-primary-key': 'error',
    'drizzle/no-select-star': 'error',
    'drizzle/limit-join-complexity': ['error', { maxJoins: 3 }],
    'drizzle/require-rls-enabled': ['error', {
      sensitivePatterns: ['user', 'account', 'payment', 'auth', 'session']
    }],
    'drizzle/prevent-rls-bypass': 'error'
  }
}
```

## Why Choose Strict?

### ✅ Greenfield Projects
Start with the highest standards from day one:
- No technical debt accumulation
- Consistent patterns throughout
- Team learns best practices immediately

### ✅ Security-Critical Applications
When handling sensitive data:
- Mandatory RLS enforcement
- No accidental data exposure
- Audit-friendly codebase

### ✅ High-Performance Requirements
Prevent performance issues before they occur:
- Required indexes on all UUID columns
- No SELECT * queries allowed
- Query complexity limits enforced

### ✅ Large Teams
Ensure consistency across many developers:
- No debates about conventions
- Automated enforcement
- Clear expectations

## Usage

### Flat Config (ESLint 9+)

```js
// eslint.config.js
import drizzle from 'eslint-plugin-drizzle-postgres';

export default [
  ...drizzle.configs.strict
];
```

### With TypeScript and Prettier

```js
// eslint.config.js
import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';
import drizzle from 'eslint-plugin-drizzle-postgres';

export default [
  js.configs.recommended,
  ...drizzle.configs.strict,
  prettier, // Must come after to override formatting rules
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      ...typescript.configs['strict-type-checked'].rules,
    },
  }
];
```

## Common Challenges and Solutions

### Challenge 1: Existing Codebase

Adopting strict mode on an existing codebase can be overwhelming. Here's a migration strategy:

```js
// Step 1: Audit current violations
// Run: npx eslint . --config eslint.config.strict.js --no-inline-config

// Step 2: Create migration config
export default [
  ...drizzle.configs.strict,
  {
    rules: {
      // Temporarily disable most challenging rules
      'drizzle/require-timestamp-columns': 'warn',
      'drizzle/enforce-snake-case-naming': 'warn',
      'drizzle/prefer-uuid-primary-key': 'warn',
    }
  }
];

// Step 3: Fix errors first, then upgrade warnings
// Step 4: Remove overrides when codebase is compliant
```

### Challenge 2: Legacy Tables

Working with existing database schemas:

```js
export default [
  ...drizzle.configs.strict,
  {
    rules: {
      // Configure for legacy tables
      'drizzle/require-timestamp-columns': ['error', {
        ignoreTables: ['legacy_users', 'imported_data', 'external_sync']
      }],
      'drizzle/enforce-snake-case-naming': ['error', {
        ignoreTables: ['UserProfiles', 'OrderItems'] // Existing tables
      }],
      'drizzle/require-rls-enabled': ['error', {
        sensitivePatterns: ['user', 'account', 'payment'],
        // Exclude legacy tables that can't have RLS
        ignoreTables: ['legacy_permissions']
      }]
    }
  }
];
```

### Challenge 3: Third-Party Integrations

When working with external systems:

```js
// For specific directories with different requirements
export default [
  ...drizzle.configs.strict,
  {
    files: ['src/integrations/**/*.ts'],
    rules: {
      // External APIs might require camelCase
      'drizzle/enforce-snake-case-naming': 'off',
      // Third-party webhooks might need SELECT *
      'drizzle/no-select-star': 'warn'
    }
  }
];
```

## Enforcement Patterns

### 1. Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "eslint --max-warnings 0"
    }
  }
}
```

### 2. CI/CD Pipeline

```yaml
# .github/workflows/lint.yml
name: Lint
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint -- --max-warnings 0
```

### 3. IDE Integration

```json
// .vscode/settings.json
{
  "eslint.enable": true,
  "eslint.rules.customizations": [
    {
      "rule": "drizzle/*",
      "severity": "error"
    }
  ],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Example Schema with Strict Mode

Here's what a compliant schema looks like:

```ts
import { pgTable, uuid, text, timestamp, index, unique } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  // UUID primary key (prefer-uuid-primary-key)
  id: uuid('id').defaultRandom().primaryKey(),

  // Snake case naming (enforce-snake-case-naming)
  email: text('email').notNull(),
  first_name: text('first_name'),
  last_name: text('last_name'),

  // Required timestamps (require-timestamp-columns)
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),

  // Foreign keys with indexes (enforce-uuid-indexes)
  organization_id: uuid('organization_id')
    .notNull()
    .references(() => organizations.id),
}, (table) => ({
  // Proper index naming (enforce-index-naming)
  email_idx: unique('idx_users_email').on(table.email),
  org_idx: index('idx_users_organization_id').on(table.organization_id),
}));

// RLS for sensitive table (require-rls-enabled)
await db.execute(sql`ALTER TABLE users ENABLE ROW LEVEL SECURITY`);

await db.execute(sql`
  CREATE POLICY users_select_own ON users
  FOR SELECT TO authenticated
  USING (auth.uid() = id)
`);

// Queries follow strict rules
// ✅ No SELECT * (no-select-star)
const userDetails = await db.select({
  id: users.id,
  email: users.email,
  name: sql`${users.first_name} || ' ' || ${users.last_name}`,
}).from(users)
  // ✅ Required WHERE clause (enforce-delete-with-where)
  .where(eq(users.id, userId));

// ✅ Limited joins (limit-join-complexity)
const userWithOrgAndTeam = await db.select()
  .from(users)
  .leftJoin(organizations, eq(users.organization_id, organizations.id))
  .leftJoin(teams, eq(users.team_id, teams.id))
  .where(eq(users.id, userId));
```

## Benefits of Strict Mode

### 1. **Predictable Performance**
- All foreign keys indexed
- No surprise full table scans
- Query complexity controlled

### 2. **Security by Default**
- RLS enforced on sensitive data
- No accidental data exposure
- Documented security bypasses

### 3. **Maintainable Codebase**
- Consistent naming patterns
- Audit trails with timestamps
- Clear data access patterns

### 4. **Team Scalability**
- No style debates
- Onboarding is clearer
- Fewer code review issues

## When NOT to Use Strict

Consider other presets if:

- Working with legacy codebases
- Rapid prototyping phase
- Learning Drizzle ORM
- Integration with external systems

## Next Steps

- Review each [individual rule](/rules/) to understand requirements
- Set up [CI/CD integration](/guide/ci-cd) to enforce standards
- Configure [custom instances](/guide/custom-instances) if needed
- Consider [gradual adoption](#common-challenges-and-solutions) for existing projects