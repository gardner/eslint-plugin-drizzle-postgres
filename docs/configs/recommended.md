# Recommended Configuration

The recommended configuration provides essential safety rules to prevent the most common and dangerous mistakes when using Drizzle ORM.

## Philosophy

The recommended preset follows these principles:

- **Prevent data loss** - Focus on rules that prevent accidental data deletion or corruption
- **Minimal friction** - Only include rules that catch serious issues
- **Gradual adoption** - Easy to add to existing projects
- **Clear value** - Every rule prevents a real problem

## What's Included

```js
{
  rules: {
    'drizzle/enforce-delete-with-where': 'error',
    'drizzle/enforce-update-with-where': 'error',
    'drizzle/enforce-snake-case-naming': 'warn',
    'drizzle/no-select-star': 'warn'
  }
}
```

### Rule Breakdown

#### 🛡️ Safety Rules (Errors)

**enforce-delete-with-where** ❌ error
Prevents accidental deletion of all rows in a table. This is the #1 cause of data loss incidents.

```js
// ❌ Error: Will delete ALL users!
await db.delete(users);

// ✅ Correct: Specific deletion
await db.delete(users).where(eq(users.id, userId));
```

**enforce-update-with-where** ❌ error
Prevents accidental updates to all rows in a table, which can corrupt business-critical data.

```js
// ❌ Error: Makes ALL users admin!
await db.update(users).set({ role: 'admin' });

// ✅ Correct: Specific update
await db.update(users)
  .set({ role: 'admin' })
  .where(eq(users.id, userId));
```

#### 🏗️ Best Practice Rules (Warnings)

**enforce-snake-case-naming** ⚠️ warn
Encourages PostgreSQL naming conventions. Set as warning to allow gradual migration.

```js
// ⚠️ Warning: Use snake_case
const users = pgTable('users', {
  firstName: text('firstName') // Should be first_name
});

// ✅ Better: Follows conventions
const users = pgTable('users', {
  firstName: text('first_name')
});
```

**no-select-star** ⚠️ warn
Discourages SELECT * for better performance and explicit data fetching.

```js
// ⚠️ Warning: Fetches all columns
const allUsers = await db.select().from(users);

// ✅ Better: Explicit columns
const allUsers = await db.select({
  id: users.id,
  name: users.name,
  email: users.email
}).from(users);
```

## Usage

### Flat Config (ESLint 9+)

```js
// eslint.config.js
import drizzle from 'eslint-plugin-drizzle-postgres';

export default [
  ...drizzle.configs.recommended
];
```

### Legacy Config

```json
// .eslintrc.json
{
  "extends": ["plugin:drizzle/recommended"]
}
```

### With TypeScript

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
    rules: typescript.configs.recommended.rules,
  }
];
```

## When to Use

The recommended configuration is ideal for:

### ✅ Existing Projects
- Minimal disruption to current code
- Focus on preventing critical issues
- Warnings allow gradual improvement

### ✅ Getting Started
- Learn the most important patterns
- Not overwhelming for new users
- Clear value proposition

### ✅ Small Teams
- Focus on what matters most
- Less configuration to maintain
- Easy to understand and follow

## Customization

Start with recommended and add rules as needed:

```js
export default [
  ...drizzle.configs.recommended,
  {
    rules: {
      // Upgrade warnings to errors when ready
      'drizzle/enforce-snake-case-naming': 'error',
      'drizzle/no-select-star': 'error',

      // Add more rules gradually
      'drizzle/enforce-uuid-indexes': 'warn',
      'drizzle/require-timestamp-columns': 'warn',

      // Configure for your database instance name
      'drizzle/enforce-delete-with-where': ['error', {
        drizzleObjectName: 'database'
      }]
    }
  }
];
```

## Migration to Stricter Configs

When you're ready for more comprehensive linting:

```js
// Step 1: Fix all warnings from recommended
// Step 2: Switch to 'all' configuration
export default [
  ...drizzle.configs.all
];

// Step 3: Eventually move to 'strict' for new projects
export default [
  ...drizzle.configs.strict
];
```

## FAQ

**Q: Why are some rules warnings instead of errors?**
A: Warnings allow gradual adoption. Snake case naming and SELECT * are best practices but not critical for data integrity.

**Q: Can I use this with an existing large codebase?**
A: Yes! The recommended preset is specifically designed for gradual adoption. Only the most critical rules are errors.

**Q: Should I customize the preset?**
A: Start with the defaults. As your team gets comfortable, gradually add more rules or upgrade warnings to errors.

## Next Steps

- Learn about [individual rules](/rules/) in the preset
- Explore the more comprehensive [all configuration](/configs/all)
- See how to [customize rules](/guide/custom-instances) for your needs