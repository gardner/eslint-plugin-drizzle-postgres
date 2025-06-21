import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

type MessageIds = "missingTimestamps";

export interface Options {
  checkTables?: string[];
  ignoreTables?: string[];
}

const timestampColumnsRule: TSESLint.RuleModule<MessageIds, [Options?]> = {
  defaultOptions: [{}],
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Require tables to have created_at and updated_at timestamp columns.",
      url: "https://github.com/drizzle-team/eslint-plugin-drizzle",
    },
    messages: {
      missingTimestamps:
        "Table '{{tableName}}' should have created_at and updated_at columns",
    },
    schema: [
      {
        type: "object",
        properties: {
          checkTables: {
            type: "array",
            items: { type: "string" },
          },
          ignoreTables: {
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
    const checkTables = options.checkTables;
    const ignoreTables = options.ignoreTables || [];

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
        if (isTableCall(node)) {
          const tableNameArg = node.arguments[0];
          if (
            tableNameArg?.type === "Literal" &&
            typeof tableNameArg.value === "string"
          ) {
            const tableName = tableNameArg.value;

            // Skip if table is in ignore list
            if (ignoreTables.includes(tableName)) {
              return;
            }

            // Skip if checkTables is defined and table is not in the list
            if (checkTables && !checkTables.includes(tableName)) {
              return;
            }

            const columnsArg = node.arguments[1];
            if (columnsArg?.type === "ObjectExpression") {
              const columnNames = columnsArg.properties
                .filter((prop): prop is TSESTree.Property => prop.type === "Property")
                .map((prop) => {
                  if (prop.key.type === "Identifier") {
                    return prop.key.name;
                  }
                  if (prop.key.type === "Literal" && typeof prop.key.value === "string") {
                    return prop.key.value;
                  }
                  return null;
                })
                .filter((name): name is string => name !== null);

              const hasCreatedAt = columnNames.some(
                (name) => name === "created_at" || name === "createdAt"
              );
              const hasUpdatedAt = columnNames.some(
                (name) => name === "updated_at" || name === "updatedAt"
              );

              if (!hasCreatedAt || !hasUpdatedAt) {
                context.report({
                  node,
                  messageId: "missingTimestamps",
                  data: { tableName },
                });
              }
            }
          }
        }
      },
    };
  },
};

export default timestampColumnsRule;