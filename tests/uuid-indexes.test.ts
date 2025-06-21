// @ts-ignore - RuleTester types are complex
import { RuleTester } from "@typescript-eslint/rule-tester";

import uuidIndexRule from "../src/enforce-uuid-indexes";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require("@typescript-eslint/parser"),
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
});

ruleTester.run("enforce-uuid-indexes", uuidIndexRule, {
  valid: [
    // UUID column with primaryKey
    `const users = pgTable('users', {
      id: uuid('id').primaryKey(),
      name: text('name')
    })`,
    
    // UUID column with unique constraint
    `const tokens = pgTable('tokens', {
      id: serial('id').primaryKey(),
      token: uuid('token').unique(),
    })`,
    
    // UUID column with table-level index
    `const posts = pgTable('posts', {
      id: uuid('id'),
      userId: uuid('user_id'),
    }, (table) => ({
      idIdx: index('posts_id_idx').on(table.id),
      userIdIdx: index('posts_user_id_idx').on(table.userId),
    }))`,
    
    // Mixed indexes
    `const orders = pgTable('orders', {
      id: uuid('id').primaryKey(),
      customerId: uuid('customer_id'),
      productId: uuid('product_id').unique(),
    }, (table) => ({
      customerIdx: index('orders_customer_idx').on(table.customerId),
    }))`,
    
    // Non-UUID columns don't need indexes
    `const products = pgTable('products', {
      id: serial('id').primaryKey(),
      name: text('name'),
      price: integer('price'),
    })`,
    
    // varchar column that's not UUID-like
    `const categories = pgTable('categories', {
      id: serial('id').primaryKey(),
      slug: varchar('slug', { length: 255 }),
    })`,
    
    // MySQL table with varchar UUID
    `const users = mysqlTable('users', {
      id: varchar('id', { length: 36 }).primaryKey(),
      email: text('email'),
    })`,
    
    // Table with function return syntax
    `const sessions = pgTable('sessions', {
      id: uuid('id'),
      userId: uuid('user_id'),
    }, (table) => {
      return {
        idIdx: index('sessions_id_idx').on(table.id),
        userIdIdx: index('sessions_user_id_idx').on(table.userId),
      };
    })`,
    
    // Composite index covering UUID column
    `const logs = pgTable('logs', {
      id: uuid('id'),
      timestamp: timestamp('timestamp'),
    }, (table) => ({
      compositeIdx: index('logs_composite_idx').on(table.id, table.timestamp),
    }))`,
    
    // UUID with default value and index
    `const apiKeys = pgTable('api_keys', {
      key: uuid('key').defaultRandom().primaryKey(),
      userId: uuid('user_id').unique(),
    })`,
  ],
  invalid: [
    // Basic UUID column without index
    {
      code: `const users = pgTable('users', {
        id: uuid('id'),
        name: text('name')
      })`,
      errors: [{ 
        messageId: "enforceUUIDIndexes",
        data: { columnName: "id" }
      }],
    },
    
    // Multiple UUID columns without indexes
    {
      code: `const posts = pgTable('posts', {
        id: uuid('id'),
        userId: uuid('user_id'),
        categoryId: uuid('category_id'),
      })`,
      errors: [
        { messageId: "enforceUUIDIndexes", data: { columnName: "id" } },
        { messageId: "enforceUUIDIndexes", data: { columnName: "user_id" } },
        { messageId: "enforceUUIDIndexes", data: { columnName: "category_id" } },
      ],
    },
    
    // UUID column with some indexes but not all
    {
      code: `const orders = pgTable('orders', {
        id: uuid('id').primaryKey(),
        customerId: uuid('customer_id'),
        productId: uuid('product_id'),
      }, (table) => ({
        customerIdx: index('orders_customer_idx').on(table.customerId),
      }))`,
      errors: [
        { messageId: "enforceUUIDIndexes", data: { columnName: "product_id" } },
      ],
    },
    
    // varchar column with UUID-like name
    {
      code: `const items = pgTable('items', {
        id: varchar('id', { length: 36 }),
        item_uuid: varchar('item_uuid', { length: 36 }),
      })`,
      errors: [
        { messageId: "enforceUUIDIndexes", data: { columnName: "id" } },
        { messageId: "enforceUUIDIndexes", data: { columnName: "item_uuid" } },
      ],
    },
    
    // text column ending with _id
    {
      code: `const relations = pgTable('relations', {
        parent_id: text('parent_id'),
        child_id: text('child_id'),
      })`,
      errors: [
        { messageId: "enforceUUIDIndexes", data: { columnName: "parent_id" } },
        { messageId: "enforceUUIDIndexes", data: { columnName: "child_id" } },
      ],
    },
    
    // MySQL table with unindexed UUIDs
    {
      code: `const sessions = mysqlTable('sessions', {
        session_id: varchar('session_id', { length: 36 }),
        user_id: varchar('user_id', { length: 36 }),
      })`,
      errors: [
        { messageId: "enforceUUIDIndexes", data: { columnName: "session_id" } },
        { messageId: "enforceUUIDIndexes", data: { columnName: "user_id" } },
      ],
    },
    
    // UUID with default but no index
    {
      code: `const tokens = pgTable('tokens', {
        token: uuid('token').defaultRandom(),
        userId: uuid('user_id').notNull(),
      })`,
      errors: [
        { messageId: "enforceUUIDIndexes", data: { columnName: "token" } },
        { messageId: "enforceUUIDIndexes", data: { columnName: "user_id" } },
      ],
    },
    
    // Empty table index callback
    {
      code: `const events = pgTable('events', {
        event_id: uuid('event_id'),
        org_id: uuid('org_id'),
      }, (table) => ({}))`,
      errors: [
        { messageId: "enforceUUIDIndexes", data: { columnName: "event_id" } },
        { messageId: "enforceUUIDIndexes", data: { columnName: "org_id" } },
      ],
    },
  ],
});