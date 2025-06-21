# Custom Drizzle Instances

By default, eslint-plugin-drizzle-postgres assumes your Drizzle instance is named `db`. However, many projects use different names for their database instances. This guide shows how to configure the plugin for custom instance names.

## The Problem

The plugin looks for patterns like:

```js
db.delete(users).where(...);
db.update(users).set(...);
db.select().from(users);
```

But your code might use:

```js
database.delete(users).where(...);
myDb.update(users).set(...);
client.select().from(users);
```

## Configuration

Several rules support the `drizzleObjectName` option:

- `enforce-delete-with-where`
- `enforce-update-with-where`
- `no-select-star`
- `limit-join-complexity`

### Basic Configuration

```js
// eslint.config.js
export default [{
  rules: {
    'drizzle/enforce-delete-with-where': ['error', {
      drizzleObjectName: 'database'
    }],
    'drizzle/enforce-update-with-where': ['error', {
      drizzleObjectName: 'database'
    }],
    'drizzle/no-select-star': ['warn', {
      drizzleObjectName: 'database'
    }],
    'drizzle/limit-join-complexity': ['warn', {
      drizzleObjectName: 'database',
      maxJoins: 3
    }]
  }
}];
```

## Common Patterns

### Pattern 1: Named Imports

```js
// db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';

export const database = drizzle(...);
```

```js
// eslint.config.js
export default [{
  rules: {
    'drizzle/enforce-delete-with-where': ['error', {
      drizzleObjectName: 'database'
    }]
  }
}];
```

### Pattern 2: Multiple Databases

If you have multiple database instances, you'll need separate ESLint configurations:

```js
// databases.ts
export const primaryDb = drizzle(...);
export const analyticsDb = drizzle(...);
```

Unfortunately, the current plugin version doesn't support multiple instance names simultaneously. You have a few options:

#### Option 1: Use a common pattern

```js
// Rename to use a common pattern
export const db = drizzle(...);        // Main database
export const dbAnalytics = drizzle(...); // Analytics database

// Configure for the base pattern
{
  rules: {
    'drizzle/enforce-delete-with-where': ['error', {
      drizzleObjectName: 'db' // Matches both 'db' and 'dbAnalytics'
    }]
  }
}
```

#### Option 2: Use directory-specific configs

```js
// eslint.config.js
export default [
  // Config for main app
  {
    files: ['src/**/*.ts'],
    rules: {
      'drizzle/enforce-delete-with-where': ['error', {
        drizzleObjectName: 'primaryDb'
      }]
    }
  },
  // Config for analytics module
  {
    files: ['src/analytics/**/*.ts'],
    rules: {
      'drizzle/enforce-delete-with-where': ['error', {
        drizzleObjectName: 'analyticsDb'
      }]
    }
  }
];
```

### Pattern 3: Class-based Instances

```js
// database.service.ts
export class DatabaseService {
  private db = drizzle(...);

  async deleteUser(userId: string) {
    // This won't be caught by the plugin
    return this.db.delete(users).where(eq(users.id, userId));
  }
}
```

For class-based patterns, consider:

1. Extracting the Drizzle instance:
```js
export class DatabaseService {
  public database = drizzle(...);
}

// Usage
const dbService = new DatabaseService();
await dbService.database.delete(users).where(...);
```

2. Adding wrapper methods that enforce safety:
```js
export class DatabaseService {
  private db = drizzle(...);

  async safeDelete<T>(
    table: Table<T>,
    where: SQL
  ) {
    if (!where) {
      throw new Error('WHERE clause required for delete operations');
    }
    return this.db.delete(table).where(where);
  }
}
```

## Creating a Preset

For consistency across your project, create a custom preset:

```js
// eslint-config-custom-drizzle.js
import drizzle from 'eslint-plugin-drizzle-postgres';

const customDbName = 'database';

export default [
  {
    plugins: {
      drizzle: drizzle,
    },
    rules: {
      'drizzle/enforce-delete-with-where': ['error', {
        drizzleObjectName: customDbName
      }],
      'drizzle/enforce-update-with-where': ['error', {
        drizzleObjectName: customDbName
      }],
      'drizzle/no-select-star': ['warn', {
        drizzleObjectName: customDbName
      }],
      'drizzle/limit-join-complexity': ['warn', {
        drizzleObjectName: customDbName,
        maxJoins: 3
      }],
      // Rules that don't need customization
      'drizzle/enforce-snake-case-naming': 'error',
      'drizzle/enforce-uuid-indexes': 'error',
      'drizzle/require-timestamp-columns': 'warn',
      'drizzle/require-rls-enabled': 'warn',
    }
  }
];
```

Then use it:

```js
// eslint.config.js
import customDrizzleConfig from './eslint-config-custom-drizzle.js';

export default [
  ...customDrizzleConfig,
  // Your other configs
];
```

## Testing Your Configuration

Create a test file to verify your configuration:

```js
// test-eslint-config.ts
import { database } from './db';
import { users } from './schema';

// This should trigger an error with custom config
await database.delete(users);

// This should pass
await database.delete(users).where(eq(users.id, '123'));
```

Run ESLint to verify:

```bash
npx eslint test-eslint-config.ts
```

## Limitations and Workarounds

### Current Limitations

1. **Single instance name per rule** - Can't specify multiple names
2. **No regex support** - Must be exact string match
3. **No dynamic detection** - Can't automatically detect your instance name

### Future Improvements

We're considering these enhancements:

- Multiple instance names: `drizzleObjectName: ['db', 'database', 'client']`
- Pattern matching: `drizzleObjectName: /^(db|database)$/`
- Auto-detection based on imports

## Best Practices

1. **Standardize naming** - Use consistent names across your codebase
2. **Document your choice** - Add comments explaining non-standard names
3. **Export from central location** - Makes refactoring easier

```js
// db/index.ts
/**
 * Main database instance
 * ESLint is configured to recognize 'database' as the Drizzle instance
 */
export const database = drizzle(client, { schema });

// Re-export for backward compatibility if needed
export { database as db };
```

## Next Steps

- Learn about [TypeScript integration](/guide/typescript)
- Set up [CI/CD integration](/guide/ci-cd)
- Explore [all available rules](/rules/)