import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

type MessageIds = "useSnakeCase";

const snakeCaseRule: TSESLint.RuleModule<MessageIds> = {
  defaultOptions: [],
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce snake_case naming convention for PostgreSQL tables and columns.",
      url: "https://github.com/drizzle-team/eslint-plugin-drizzle",
    },
    messages: {
      useSnakeCase:
        "PostgreSQL tables/columns should use snake_case: '{{name}}'",
    },
    schema: [],
  },
  create(context) {
    // Helper to check if a string is in valid snake_case
    function isValidSnakeCase(name: string): boolean {
      return /^[a-z][a-z0-9_]*$/.test(name);
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
        // Check table names
        if (isTableCall(node)) {
          const tableNameArg = node.arguments[0];
          if (tableNameArg?.type === "Literal" && typeof tableNameArg.value === "string") {
            const tableName = tableNameArg.value;
            if (!isValidSnakeCase(tableName)) {
              context.report({
                node: tableNameArg,
                messageId: "useSnakeCase",
                data: { name: tableName },
              });
            }
          }

          // Check column names
          const columnsArg = node.arguments[1];
          if (columnsArg?.type === "ObjectExpression") {
            columnsArg.properties.forEach((prop) => {
              if (
                prop.type === "Property" &&
                prop.key.type === "Identifier"
              ) {
                const columnName = prop.key.name;
                // Allow common camelCase exceptions like createdAt, updatedAt
                const allowedCamelCase = ["createdAt", "updatedAt"];
                if (!isValidSnakeCase(columnName) && !allowedCamelCase.includes(columnName)) {
                  context.report({
                    node: prop.key,
                    messageId: "useSnakeCase",
                    data: { name: columnName },
                  });
                }
              }
            });
          }
        }
      },
    };
  },
};

export default snakeCaseRule;