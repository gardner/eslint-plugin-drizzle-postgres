import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

type MessageIds = "missingRLS" | "missingPolicy";

export interface Options {
  sensitiveTables?: string[];
  sensitivePatterns?: string[];
}

const requireRLSRule: TSESLint.RuleModule<MessageIds, [Options?]> = {
  defaultOptions: [{}],
  meta: {
    type: "problem",
    docs: {
      description:
        "Require Row-Level Security (RLS) on sensitive tables to protect data access.",
      url: "https://github.com/gardner/eslint-plugin-drizzle-postgres",
    },
    messages: {
      missingRLS:
        "Table '{{table}}' contains sensitive data and should have RLS enabled. Add RLS with: sql`ALTER TABLE {{table}} ENABLE ROW LEVEL SECURITY`",
      missingPolicy:
        "Table '{{table}}' has RLS enabled but no policies defined. This will block all access.",
    },
    schema: [
      {
        type: "object",
        properties: {
          sensitiveTables: {
            type: "array",
            items: { type: "string" },
          },
          sensitivePatterns: {
            type: "array",
            items: { type: "string" },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0] || {};
    const sensitiveTables = options.sensitiveTables || [];
    const sensitivePatterns = options.sensitivePatterns || [
      "user",
      "account",
      "profile",
      "payment",
      "order",
      "invoice",
      "medical",
      "health",
      "personal",
      "private",
      "auth",
      "session",
      "token",
    ];

    const tablesFound = new Map<string, TSESTree.Node>();
    const tablesWithRLS = new Set<string>();
    const tablesWithPolicies = new Set<string>();

    // Helper to check if a table name is sensitive
    function isSensitiveTable(tableName: string): boolean {
      const lowerName = tableName.toLowerCase();

      if (sensitiveTables.includes(tableName)) {
        return true;
      }

      return sensitivePatterns.some((pattern) =>
        lowerName.includes(pattern.toLowerCase())
      );
    }

    // Helper to check if this is a table definition call
    function isTableCall(node: TSESTree.CallExpression): boolean {
      if (node.callee.type === "Identifier") {
        return ["pgTable", "mysqlTable", "sqliteTable"].includes(
          node.callee.name
        );
      }
      return false;
    }

    return {
      CallExpression(node) {
        // Track table definitions
        if (isTableCall(node)) {
          const tableNameArg = node.arguments[0];
          if (
            tableNameArg?.type === "Literal" &&
            typeof tableNameArg.value === "string"
          ) {
            const tableName = tableNameArg.value;
            tablesFound.set(tableName, node);
          }
        }

        // Track sql`...` template literals for RLS and policies
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "sql" &&
          node.arguments[0]?.type === "TemplateLiteral"
        ) {
          const templateLiteral = node.arguments[0];
          const sqlContent = templateLiteral.quasis
            .map((quasi) => quasi.value.raw)
            .join("");

          // Check for RLS enablement
          const rlsMatch = /ALTER\s+TABLE\s+["']?(\w+)["']?\s+ENABLE\s+ROW\s+LEVEL\s+SECURITY/i.exec(
            sqlContent
          );
          if (rlsMatch && rlsMatch[1]) {
            tablesWithRLS.add(rlsMatch[1]);
          }

          // Check for policy creation
          const policyMatch = /CREATE\s+POLICY\s+.*?\s+ON\s+["']?(\w+)["']?/i.exec(
            sqlContent
          );
          if (policyMatch && policyMatch[1]) {
            tablesWithPolicies.add(policyMatch[1]);
          }
        }
      },

      "Program:exit"() {
        // Check each sensitive table
        tablesFound.forEach((node, tableName) => {
          if (isSensitiveTable(tableName)) {
            if (!tablesWithRLS.has(tableName)) {
              context.report({
                node,
                messageId: "missingRLS",
                data: { table: tableName },
              });
            } else if (!tablesWithPolicies.has(tableName)) {
              // Has RLS but no policies
              context.report({
                node,
                messageId: "missingPolicy",
                data: { table: tableName },
              });
            }
          }
        });
      },
    };
  },
};

export default requireRLSRule;