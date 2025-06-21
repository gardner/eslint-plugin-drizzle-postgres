import type { TSESLint } from "@typescript-eslint/utils";
import deleteRule from "./enforce-delete-with-where";
import updateRule from "./enforce-update-with-where";
import uuidIndexRule from "./enforce-uuid-indexes";
import snakeCaseNamingRule from "./enforce-snake-case-naming";
import indexNamingRule from "./enforce-index-naming";
import timestampColumnsRule from "./require-timestamp-columns";
import preferUuidPrimaryKeyRule from "./prefer-uuid-primary-key";
import noSelectStarRule from "./no-select-star";
import limitJoinComplexityRule from "./limit-join-complexity";
import requireRLSEnabledRule from "./require-rls-enabled";
import preventRLSBypassRule from "./prevent-rls-bypass";
import { name, version } from "../package.json";

const plugin = {
  meta: { 
    name, 
    version,
    namespace: "drizzle"
  },
  rules: {
    "enforce-delete-with-where": deleteRule,
    "enforce-update-with-where": updateRule,
    "enforce-uuid-indexes": uuidIndexRule,
    "enforce-snake-case-naming": snakeCaseNamingRule,
    "enforce-index-naming": indexNamingRule,
    "require-timestamp-columns": timestampColumnsRule,
    "prefer-uuid-primary-key": preferUuidPrimaryKeyRule,
    "no-select-star": noSelectStarRule,
    "limit-join-complexity": limitJoinComplexityRule,
    "require-rls-enabled": requireRLSEnabledRule,
    "prevent-rls-bypass": preventRLSBypassRule,
  } satisfies Record<string, TSESLint.RuleModule<string, Array<unknown>>>,
  configs: {} as Record<string, TSESLint.Linter.Config[]>,
};

// Assign configs after plugin is defined so we can reference it
Object.assign(plugin.configs, {
  all: [
    {
      plugins: {
        drizzle: plugin,
      },
      rules: {
        "drizzle/enforce-delete-with-where": "error",
        "drizzle/enforce-update-with-where": "error",
        "drizzle/enforce-uuid-indexes": "error",
        "drizzle/enforce-snake-case-naming": "error",
        "drizzle/enforce-index-naming": "error",
        "drizzle/require-timestamp-columns": "warn",
        "drizzle/prefer-uuid-primary-key": "warn",
        "drizzle/no-select-star": "warn",
        "drizzle/limit-join-complexity": ["warn", { maxJoins: 3 }],
        "drizzle/require-rls-enabled": ["warn", {
          sensitivePatterns: ["user", "account", "payment", "auth", "session"]
        }],
        "drizzle/prevent-rls-bypass": "warn",
      },
    },
  ],
  recommended: [
    {
      plugins: {
        drizzle: plugin,
      },
      rules: {
        "drizzle/enforce-delete-with-where": "error",
        "drizzle/enforce-update-with-where": "error",
        "drizzle/enforce-snake-case-naming": "warn",
        "drizzle/no-select-star": "warn",
      },
    },
  ],
  strict: [
    {
      plugins: {
        drizzle: plugin,
      },
      rules: {
        "drizzle/enforce-delete-with-where": "error",
        "drizzle/enforce-update-with-where": "error",
        "drizzle/enforce-uuid-indexes": "error",
        "drizzle/enforce-snake-case-naming": "error",
        "drizzle/enforce-index-naming": "error",
        "drizzle/require-timestamp-columns": "error",
        "drizzle/prefer-uuid-primary-key": "error",
        "drizzle/no-select-star": "error",
        "drizzle/limit-join-complexity": ["error", { maxJoins: 3 }],
        "drizzle/require-rls-enabled": ["error", {
          sensitivePatterns: ["user", "account", "payment", "auth", "session"]
        }],
        "drizzle/prevent-rls-bypass": "error",
      },
    },
  ],
});

export default plugin;
export const { meta, rules, configs } = plugin;