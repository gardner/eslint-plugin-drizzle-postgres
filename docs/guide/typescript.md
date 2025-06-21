# TypeScript Integration

This guide covers how to use eslint-plugin-drizzle-postgres with TypeScript projects.

## Setup

### Prerequisites

Ensure you have the required TypeScript packages:

```bash
npm install --save-dev typescript @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### Basic Configuration

```js
// eslint.config.js
import tsParser from '@typescript-eslint/parser';
import typescript from '@typescript-eslint/eslint-plugin';
import drizzle from 'eslint-plugin-drizzle-postgres';

export default [
  ...drizzle.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json', // For type-aware rules
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      ...typescript.configs.recommended.rules,
    },
  },
];
```

## Type-Safe Schema Definitions

### Leveraging TypeScript with Drizzle

```ts
import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// Define schema with proper types
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  role: text('role', { enum: ['user', 'admin'] }).default('user'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  email_idx: index('idx_users_email').on(table.email),
}));

// Type inference
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

// Type-safe queries
async function getUserById(id: string): Promise<User | undefined> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return user;
}
```

## Common TypeScript Patterns

### 1. Type-Safe Repository Pattern

```ts
// repositories/user.repository.ts
import { eq, and, sql } from 'drizzle-orm';
import { db } from '@/db';
import { users, type User, type NewUser } from '@/schema/users';

export class UserRepository {
  async create(data: NewUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(data)
      .returning();

    return user;
  }

  async findById(id: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user ?? null;
  }

  async update(id: string, data: Partial<Omit<User, 'id'>>): Promise<User | null> {
    const [updated] = await db
      .update(users)
      .set({
        ...data,
        updated_at: new Date(),
      })
      .where(eq(users.id, id)) // ✅ ESLint enforces WHERE clause
      .returning();

    return updated ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db
      .delete(users)
      .where(eq(users.id, id)) // ✅ ESLint enforces WHERE clause
      .returning({ id: users.id });

    return result.length > 0;
  }
}
```

### 2. Type-Safe Query Builders

```ts
// queries/user.queries.ts
import { SQL, and, eq, gte, lte, like } from 'drizzle-orm';
import { users } from '@/schema/users';

interface UserFilters {
  role?: 'user' | 'admin';
  search?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}

export function buildUserWhereClause(filters: UserFilters): SQL | undefined {
  const conditions: SQL[] = [];

  if (filters.role) {
    conditions.push(eq(users.role, filters.role));
  }

  if (filters.search) {
    conditions.push(
      like(users.name, `%${filters.search}%`)
    );
  }

  if (filters.createdAfter) {
    conditions.push(gte(users.created_at, filters.createdAfter));
  }

  if (filters.createdBefore) {
    conditions.push(lte(users.created_at, filters.createdBefore));
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

// Usage
const filteredUsers = await db
  .select({
    id: users.id,
    email: users.email,
    name: users.name,
    role: users.role,
  })
  .from(users)
  .where(buildUserWhereClause({ role: 'admin', search: 'john' }));
```

### 3. Type-Safe Transactions

```ts
// services/user.service.ts
import { db } from '@/db';
import { users, profiles, type NewUser, type NewProfile } from '@/schema';

interface CreateUserWithProfile {
  user: NewUser;
  profile: Omit<NewProfile, 'user_id'>;
}

export async function createUserWithProfile(
  data: CreateUserWithProfile
): Promise<{ userId: string; profileId: string }> {
  return await db.transaction(async (tx) => {
    // Create user
    const [user] = await tx
      .insert(users)
      .values(data.user)
      .returning({ id: users.id });

    // Create profile
    const [profile] = await tx
      .insert(profiles)
      .values({
        ...data.profile,
        user_id: user.id,
      })
      .returning({ id: profiles.id });

    return {
      userId: user.id,
      profileId: profile.id,
    };
  });
}
```

## ESLint Configuration for TypeScript

### Strict Type Checking

```js
// eslint.config.js
export default [
  ...drizzle.configs.strict,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      ...typescript.configs['strict-type-checked'].rules,
      // Additional TypeScript rules
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
    },
  },
];
```

### Monorepo Configuration

```js
// eslint.config.js (root)
export default [
  ...drizzle.configs.recommended,
  {
    files: ['packages/*/src/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./packages/*/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Customize per package if needed
      'drizzle/enforce-delete-with-where': ['error', {
        drizzleObjectName: 'db'
      }],
    },
  },
];
```

## Type Safety Best Practices

### 1. Use Branded Types for IDs

```ts
// types/branded.ts
declare const brand: unique symbol;

export type Brand<T, TBrand> = T & { [brand]: TBrand };

export type UserId = Brand<string, 'UserId'>;
export type PostId = Brand<string, 'PostId'>;

// schema/users.ts
export const users = pgTable('users', {
  id: uuid('id').$type<UserId>().defaultRandom().primaryKey(),
  // ...
});

// Now TypeScript prevents mixing IDs
async function getUser(userId: UserId) { /* ... */ }
async function getPost(postId: PostId) { /* ... */ }

const userId = 'some-uuid' as UserId;
const postId = 'other-uuid' as PostId;

getUser(userId); // ✅ OK
getUser(postId); // ❌ Type error
```

### 2. Zod Integration for Runtime Validation

```ts
import { z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { users } from '@/schema/users';

// Generate Zod schemas from Drizzle tables
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  name: z.string().min(2).max(100),
});

export const selectUserSchema = createSelectSchema(users);

// Use in API routes
export async function createUserHandler(req: Request) {
  const body = await req.json();

  // Validate input
  const validated = insertUserSchema.parse(body);

  // Type-safe insert
  const [user] = await db
    .insert(users)
    .values(validated)
    .returning();

  return user;
}
```

### 3. Type-Safe Migrations

```ts
// migrations/utils.ts
import { sql } from 'drizzle-orm';
import { db } from '@/db';

export async function enableRLS(tableName: string) {
  await db.execute(
    sql`ALTER TABLE ${sql.identifier(tableName)} ENABLE ROW LEVEL SECURITY`
  );
}

export async function createPolicy(
  policyName: string,
  tableName: string,
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
  clause: string
) {
  await db.execute(sql`
    CREATE POLICY ${sql.identifier(policyName)}
    ON ${sql.identifier(tableName)}
    FOR ${sql.raw(operation)}
    TO authenticated
    ${sql.raw(clause)}
  `);
}

// Usage
await enableRLS('users');
await createPolicy(
  'users_select_own',
  'users',
  'SELECT',
  'USING (auth.uid() = id)'
);
```

## Troubleshooting

### Common Issues

1. **Parser errors with TypeScript syntax**
   ```js
   // Ensure parser is configured
   languageOptions: {
     parser: tsParser,
   }
   ```

2. **Type-aware rules not working**
   ```js
   // Provide project configuration
   parserOptions: {
     project: './tsconfig.json',
   }
   ```

3. **Slow linting with type checking**
   ```js
   // Use separate configs for fast and full checks
   export default [
     // Fast checks (no type info)
     ...drizzle.configs.recommended,
     // Type-aware checks only in CI
     process.env.CI && typeAwareConfig,
   ].filter(Boolean);
   ```

## Next Steps

- Set up [CI/CD integration](/guide/ci-cd) with TypeScript checks
- Configure [custom Drizzle instances](/guide/custom-instances)
- Explore [strict configuration](/configs/strict) for maximum type safety