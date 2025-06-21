import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

type MessageIds = "enforceUUIDIndexes";

export interface Options {
  drizzleObjectName?: string;
}

const uuidIndexRule: TSESLint.RuleModule<MessageIds, [Options?]> = {
  defaultOptions: [{ drizzleObjectName: "db" }],
  meta: {
    type: "problem",
    docs: {
      description:
        "Enforce that UUID columns have indexes to ensure query performance.",
      url: "https://github.com/drizzle-team/eslint-plugin-drizzle-postgres",
    },
    messages: {
      enforceUUIDIndexes:
        "UUID column '{{columnName}}' should have an index for better query performance. Add .primaryKey(), .unique(), or create an index in the table definition.",
    },
    schema: [
      {
        type: "object",
        properties: {
          drizzleObjectName: {
            type: "string",
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    // Helper to check if a node is a table definition call
    function isTableCall(node: TSESTree.CallExpression): boolean {
      if (node.callee.type === "Identifier") {
        return ["pgTable", "mysqlTable", "sqliteTable"].includes(node.callee.name);
      }
      return false;
    }

    // Helper to check if a column has UUID type
    function isUUIDColumn(node: TSESTree.CallExpression): boolean {
      if (node.callee.type === "Identifier" && node.callee.name === "uuid") {
        return true;
      }

      // Check for varchar/text columns with UUID-like names
      if (node.callee.type === "Identifier" &&
          ["varchar", "text", "char"].includes(node.callee.name) &&
          node.arguments[0]?.type === "Literal") {
        const columnName = String(node.arguments[0].value).toLowerCase();
        return columnName.includes("uuid") ||
               columnName.endsWith("_id") ||
               columnName === "id";
      }

      return false;
    }

    // Helper to check if a column has an index (primaryKey, unique, etc.)
    function hasColumnLevelIndex(node: TSESTree.Node): boolean {
      let current = node;

      while (current.type === "CallExpression" &&
             current.callee.type === "MemberExpression") {
        const propertyName = current.callee.property.type === "Identifier"
          ? current.callee.property.name
          : null;

        if (propertyName && ["primaryKey", "unique"].includes(propertyName)) {
          return true;
        }

        current = current.callee.object;
      }

      return false;
    }

    // Helper to get column name from column definition
    function getColumnName(node: TSESTree.CallExpression): string | null {
      if (node.arguments[0]?.type === "Literal") {
        return String(node.arguments[0].value);
      }
      return null;
    }

    // Helper to extract indexed columns from table callback
    // Returns a Set of property names (not column names)
    function extractIndexedProperties(node: TSESTree.CallExpression): Set<string> {
      const indexedProperties = new Set<string>();

      if (node.arguments[2]?.type === "ArrowFunctionExpression" ||
          node.arguments[2]?.type === "FunctionExpression") {
        const returnStatement = node.arguments[2].body;

        if (returnStatement.type === "BlockStatement") {
          // Handle: (table) => { return { ... } }
          const returnStmt = returnStatement.body.find(
            stmt => stmt.type === "ReturnStatement"
          ) as TSESTree.ReturnStatement | undefined;

          if (returnStmt?.argument?.type === "ObjectExpression") {
            processIndexObject(returnStmt.argument, indexedProperties);
          }
        } else if (returnStatement.type === "ObjectExpression") {
          // Handle: (table) => ({ ... })
          processIndexObject(returnStatement, indexedProperties);
        }
      }

      return indexedProperties;
    }

    function processIndexObject(objectExpr: TSESTree.ObjectExpression, indexedProperties: Set<string>) {
      objectExpr.properties.forEach((prop) => {
        if (prop.type === "Property" &&
            prop.value.type === "CallExpression") {

          // Check for index().on(table.column) pattern
          let current: any = prop.value;

          // Look for .on() calls
          while (current && current.type === "CallExpression") {
            if (current.callee?.type === "MemberExpression" &&
                current.callee.property?.type === "Identifier" &&
                current.callee.property.name === "on") {

              // Extract column references from .on() arguments
              current.arguments.forEach((arg: any) => {
                if (arg.type === "MemberExpression" &&
                    arg.property?.type === "Identifier") {
                  // Add the property name (e.g., "userId" not "user_id")
                  indexedProperties.add(arg.property.name);
                }
              });
              break; // Found the .on() call, no need to continue
            }

            if (current.callee?.type === "MemberExpression" &&
                current.callee.object) {
              current = current.callee.object;
            } else {
              break;
            }
          }
        }
      });
    }

    return {
      CallExpression(node) {
        // Check if this is a table definition
        if (isTableCall(node)) {
          // First, collect table-level indexes (property names, not column names)
          const tableIndexedProperties = extractIndexedProperties(node);

          // Then process column definitions
          if (node.arguments[1]?.type === "ObjectExpression") {
            node.arguments[1].properties.forEach((prop) => {
              if (prop.type === "Property" &&
                  prop.value.type === "CallExpression" &&
                  prop.key.type === "Identifier") {

                const propertyName = prop.key.name; // e.g., "userId"
                const columnCall = prop.value;
                let baseCall = columnCall;

                // Find the base column definition call
                while (baseCall.type === "CallExpression" &&
                       baseCall.callee.type === "MemberExpression" &&
                       baseCall.callee.object.type === "CallExpression") {
                  baseCall = baseCall.callee.object;
                }

                if (isUUIDColumn(baseCall)) {
                  const columnName = getColumnName(baseCall); // e.g., "user_id"
                  const hasColumnIndex = hasColumnLevelIndex(prop.value);
                  const hasTableIndex = tableIndexedProperties.has(propertyName);

                  if (columnName && !hasColumnIndex && !hasTableIndex) {
                    context.report({
                      node: prop.value,
                      messageId: "enforceUUIDIndexes",
                      data: { columnName },
                    });
                  }
                }
              }
            });
          }
        }
      },
    };
  },
};

export default uuidIndexRule;