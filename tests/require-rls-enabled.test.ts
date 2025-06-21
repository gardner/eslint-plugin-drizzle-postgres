// @ts-ignore - RuleTester types are complex
import { RuleTester } from "@typescript-eslint/rule-tester";

import requireRLSRule from "../src/require-rls-enabled";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require("@typescript-eslint/parser"),
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
});

ruleTester.run("require-rls-enabled", requireRLSRule, {
  valid: [
    // Non-sensitive table names
    `const posts = pgTable('posts', {
      id: uuid('id'),
      title: text('title'),
    })`,
    
    `const categories = pgTable('categories', {
      id: uuid('id'),
      name: text('name'),
    })`,
    
    // Explicitly listed non-sensitive table
    {
      code: `const logs = pgTable('logs', {
        id: uuid('id'),
        message: text('message'),
      })`,
      options: [{ sensitiveTables: ["users", "accounts"] }],
    },
  ],
  invalid: [
    // Sensitive table without RLS
    {
      code: `const users = pgTable('users', {
        id: uuid('id'),
        email: text('email'),
        password: text('password'),
      })`,
      errors: [{ 
        messageId: "missingRLS",
        data: { table: "users" }
      }],
    },
    
    // Multiple sensitive tables
    {
      code: `const accounts = pgTable('accounts', {
        id: uuid('id'),
      });
      
      const user_profiles = pgTable('user_profiles', {
        id: uuid('id'),
      });
      
      const payment_methods = pgTable('payment_methods', {
        id: uuid('id'),
      });`,
      errors: [
        { messageId: "missingRLS", data: { table: "accounts" } },
        { messageId: "missingRLS", data: { table: "user_profiles" } },
        { messageId: "missingRLS", data: { table: "payment_methods" } },
      ],
    },
    
    // Custom sensitive table list
    {
      code: `const customers = pgTable('customers', {
        id: uuid('id'),
        name: text('name'),
      })`,
      options: [{ sensitiveTables: ["customers", "orders"] }],
      errors: [{ 
        messageId: "missingRLS",
        data: { table: "customers" }
      }],
    },
    
    // Pattern matching for sensitive tables
    {
      code: `const medical_history = pgTable('medical_history', {
        id: uuid('id'),
        diagnosis: text('diagnosis'),
      })`,
      errors: [{ 
        messageId: "missingRLS",
        data: { table: "medical_history" }
      }],
    },
    
    // Auth-related tables
    {
      code: `const auth_sessions = pgTable('auth_sessions', {
        id: uuid('id'),
        token: text('token'),
      })`,
      errors: [{ 
        messageId: "missingRLS",
        data: { table: "auth_sessions" }
      }],
    },
  ],
});