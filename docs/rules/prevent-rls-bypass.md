# prevent-rls-bypass

Detect and require documentation when bypassing Row-Level Security (RLS).

## 📖 Rule Details

This rule detects patterns that bypass Row-Level Security and ensures they are properly documented. RLS bypass should be rare and always intentional, typically only used for administrative operations, migrations, or system-level processes.

### ❌ Incorrect

```js
// Using service role without documentation
const supabase = createClient(url, serviceRoleKey);

// Bypassing RLS without explanation
await db.rls().bypass().select().from(users);

// Using admin client without context
const data = await adminClient.from('sensitive_data').select();

// SECURITY DEFINER without documentation  
sql`
  CREATE FUNCTION delete_user(user_id uuid)
  RETURNS void AS $$
  BEGIN
    DELETE FROM users WHERE id = user_id;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
`;
```

### ✅ Correct

```js
// RLS bypass: Admin dashboard requires access to all user data for support
const supabase = createClient(url, serviceRoleKey);

// RLS bypass: Migration script needs to update all user records
await db.rls().bypass()
  .update(users)
  .set({ newColumn: 'default' });

// Service role: Background job to clean up expired sessions across all users
const adminClient = createAdminClient();
await adminClient.from('sessions')
  .delete()
  .lt('expires_at', new Date());

// SECURITY DEFINER: Allows users to delete their own account and related data
// Security: Function validates user ownership before deletion
sql`
  CREATE FUNCTION delete_user_account(user_id uuid)
  RETURNS void AS $$
  BEGIN
    -- Verify the user is deleting their own account
    IF auth.uid() != user_id THEN
      RAISE EXCEPTION 'Unauthorized';
    END IF;
    
    DELETE FROM users WHERE id = user_id;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
`;
```

## 💡 Why This Rule?

RLS bypass can create serious security vulnerabilities:

- **Accidental exposure** - Service role keys in client code
- **Overly broad access** - Using admin access when not necessary
- **Audit trail gaps** - Bypassed operations may not be logged
- **Compliance violations** - May violate data protection regulations

This rule ensures that every RLS bypass is:
1. Intentional and documented
2. Used only when necessary
3. Clearly explained for security audits

## ⚙️ Options

This rule has no configurable options. It relies on code comments to determine if RLS bypass is properly documented.

## 🔧 Example Configuration

::: code-group

```js [Flat Config]
// eslint.config.js
export default [{
  rules: {
    'drizzle/prevent-rls-bypass': 'error'
  }
}];
```

```json [Legacy Config]
// .eslintrc.json
{
  "rules": {
    "drizzle/prevent-rls-bypass": "error"
  }
}
```

:::

## 📝 Valid Bypass Patterns

The rule looks for these keywords in comments to validate RLS bypass:

- `RLS bypass`
- `security`
- `admin`
- `service role`
- `system operation`
- `migration`
- `background job`
- `cron`

### Examples of Valid Documentation

```js
// ✅ RLS bypass: Daily cron job to archive old records
const result = await adminDb.delete(oldRecords);

// ✅ Service role required: Admin dashboard for customer support
const supabase = createClient(url, serviceRoleKey);

// ✅ System operation: Cleanup orphaned data across all tenants  
await db.rls().bypass().delete(orphanedRecords);

// ✅ Migration: Backfilling new column for existing users
// Security: One-time migration script, not used in production
await bypassRLS(async (db) => {
  await db.update(users).set({ feature_flags: {} });
});
```

## 🏗️ Best Practices

### 1. Use Environment-Specific Clients

```js
// Good: Separate clients for different contexts
const publicClient = createClient(url, anonKey);        // For public operations
const authClient = createClient(url, authKey);          // For authenticated users
const adminClient = createClient(url, serviceRoleKey);   // For admin operations only

// Use the appropriate client for each context
export async function getUserProfile(userId: string) {
  return authClient.from('users').select().eq('id', userId);
}

export async function adminGetAllUsers() {
  // RLS bypass: Admin dashboard requires full user list
  return adminClient.from('users').select();
}
```

### 2. Wrap Admin Operations

```js
// Create a wrapper that enforces documentation
export async function withAdminAccess<T>(
  reason: string,
  operation: (client: SupabaseClient) => Promise<T>
): Promise<T> {
  console.log(`Admin access used: ${reason}`);
  // Add additional logging, monitoring, or alerts here
  
  return operation(adminClient);
}

// Usage
const allUsers = await withAdminAccess(
  'Support ticket #1234 - investigating user issue',
  (client) => client.from('users').select()
);
```

### 3. Use Database Functions When Appropriate

```js
// Instead of bypassing RLS in application code,
// use SECURITY DEFINER functions for specific operations

sql`
  -- Function to allow users to transfer ownership
  -- Security: Validates current ownership before transfer
  CREATE FUNCTION transfer_ownership(
    resource_id uuid,
    new_owner_id uuid
  ) RETURNS void AS $$
  BEGIN
    -- Verify current user owns the resource
    IF NOT EXISTS (
      SELECT 1 FROM resources 
      WHERE id = resource_id 
      AND owner_id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'Unauthorized';
    END IF;
    
    -- Transfer ownership
    UPDATE resources 
    SET owner_id = new_owner_id 
    WHERE id = resource_id;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
`;
```

## 🚫 When to Disable

This rule should rarely be disabled. If you must disable it:

```js
/* eslint-disable drizzle/prevent-rls-bypass */
// WARNING: This file contains RLS bypass operations
// Purpose: Database migration scripts
// Review: Security team approved on 2024-01-15
// Ticket: SEC-1234

import { adminClient } from './admin-client';

// Migration scripts...
/* eslint-enable drizzle/prevent-rls-bypass */
```

## 🔗 Related Rules

- [require-rls-enabled](/rules/require-rls-enabled) - Ensure RLS is enabled on sensitive tables

## 📚 Further Reading

- [PostgreSQL Security Documentation](https://www.postgresql.org/docs/current/sql-grant.html)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [OWASP Database Security](https://owasp.org/www-project-database-security/)