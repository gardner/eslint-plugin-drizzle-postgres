import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

type MessageIds = "invalidIndexName";

const indexNamingRule: TSESLint.RuleModule<MessageIds> = {
  defaultOptions: [],
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce naming convention for indexes: idx_tablename_column(s) or idx_tablename_purpose.",
      url: "https://github.com/drizzle-team/eslint-plugin-drizzle-postgres",
    },
    messages: {
      invalidIndexName:
        "Index should follow pattern: idx_tablename_column(s) or idx_tablename_purpose. Got: '{{name}}'",
    },
    schema: [],
  },
  create(context) {
    // Track current table name
    let currentTableName: string | null = null;

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
        // Track table name
        if (isTableCall(node)) {
          const tableNameArg = node.arguments[0];
          if (tableNameArg?.type === "Literal" && typeof tableNameArg.value === "string") {
            currentTableName = tableNameArg.value;
          }
        }

        // Check index naming
        if (
          node.callee.type === "Identifier" &&
          (node.callee.name === "index" ||
           node.callee.name === "uniqueIndex" ||
           node.callee.name === "unique")
        ) {
          const indexNameArg = node.arguments[0];
          if (indexNameArg?.type === "Literal" && typeof indexNameArg.value === "string") {
            const indexName = indexNameArg.value;

            // Check if it follows the pattern idx_[tablename]_[columns/purpose]
            const validPattern = /^(idx|uq|uk)_[a-z][a-z0-9_]*(_[a-z][a-z0-9_]*)*$/;

            if (!validPattern.test(indexName)) {
              context.report({
                node: indexNameArg,
                messageId: "invalidIndexName",
                data: { name: indexName },
              });
            } else if (currentTableName) {
              // Check if index name includes table name
              const prefix = node.callee.name === "index" ? "idx" : "uq";
              const expectedPrefix = `${prefix}_${currentTableName}_`;

              if (!indexName.startsWith(expectedPrefix)) {
                context.report({
                  node: indexNameArg,
                  messageId: "invalidIndexName",
                  data: { name: indexName },
                });
              }
            }
          }
        }
      },
    };
  },
};

export default indexNamingRule;