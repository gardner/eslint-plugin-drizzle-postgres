// @ts-ignore - RuleTester types are complex
import { RuleTester } from "@typescript-eslint/rule-tester";

import snakeCaseRule from "../src/enforce-snake-case-naming";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require("@typescript-eslint/parser"),
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
});

ruleTester.run("enforce-snake-case-naming", snakeCaseRule, {
  valid: [
    // Valid snake_case table and column names
    `const users = pgTable('users', {
      id: uuid('id'),
      first_name: text('first_name'),
      last_name: text('last_name'),
      created_at: timestamp('created_at'),
    })`,
    
    // Allow createdAt/updatedAt as exceptions
    `const posts = pgTable('posts', {
      id: uuid('id'),
      title: text('title'),
      createdAt: timestamp('createdAt'),
      updatedAt: timestamp('updatedAt'),
    })`,
    
    // Numbers are allowed in snake_case
    `const oauth2_tokens = pgTable('oauth2_tokens', {
      id: uuid('id'),
      token_v2: text('token_v2'),
      expires_in_30_days: boolean('expires_in_30_days'),
    })`,
  ],
  invalid: [
    // camelCase table name
    {
      code: `const userProfiles = pgTable('userProfiles', {
        id: uuid('id'),
      })`,
      errors: [{ 
        messageId: "useSnakeCase",
        data: { name: "userProfiles" }
      }],
    },
    
    // PascalCase table name
    {
      code: `const UserSettings = pgTable('UserSettings', {
        id: uuid('id'),
      })`,
      errors: [{ 
        messageId: "useSnakeCase",
        data: { name: "UserSettings" }
      }],
    },
    
    // camelCase column names
    {
      code: `const users = pgTable('users', {
        id: uuid('id'),
        firstName: text('firstName'),
        lastName: text('lastName'),
      })`,
      errors: [
        { messageId: "useSnakeCase", data: { name: "firstName" } },
        { messageId: "useSnakeCase", data: { name: "lastName" } },
      ],
    },
    
    // Mixed case issues
    {
      code: `const UserPosts = pgTable('UserPosts', {
        postId: uuid('postId'),
        userId: uuid('userId'),
        publishedAt: timestamp('publishedAt'),
      })`,
      errors: [
        { messageId: "useSnakeCase", data: { name: "UserPosts" } },
        { messageId: "useSnakeCase", data: { name: "postId" } },
        { messageId: "useSnakeCase", data: { name: "userId" } },
        { messageId: "useSnakeCase", data: { name: "publishedAt" } },
      ],
    },
  ],
});