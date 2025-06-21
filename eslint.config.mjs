import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import eslintPluginPlugin from "eslint-plugin-eslint-plugin";
import nodePlugin from "eslint-plugin-n";

export default [
  js.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        require: "readonly",
        module: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "eslint-plugin": eslintPluginPlugin,
      n: nodePlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...eslintPluginPlugin.configs.recommended.rules,
      ...nodePlugin.configs.recommended.rules,
      "n/no-missing-import": "off", // TypeScript handles this
      "n/no-unsupported-features/es-syntax": "off", // We're using TypeScript
      "n/no-unpublished-import": ["error", {
        allowModules: ["@typescript-eslint/utils", "@typescript-eslint/rule-tester", "vitest"],
      }],
      "n/no-unpublished-require": ["error", {
        allowModules: ["@typescript-eslint/parser"],
      }],
      "@typescript-eslint/no-explicit-any": "off", // Used in AST traversal
      "@typescript-eslint/ban-ts-comment": ["error", {
        "ts-ignore": "allow-with-description",
      }],
    },
  },
  {
    files: ["tests/**/*.ts", "*.config.ts"],
    rules: {
      "@typescript-eslint/no-require-imports": "off", // Tests use require for parser
    },
  },
  {
    ignores: ["dist/**", "node_modules/**", "*.config.js", "*.config.mjs"],
  },
];