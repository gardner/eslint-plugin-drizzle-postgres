import type { TSESLint } from "@typescript-eslint/utils";

type MessageIds = "noSelectStar";

const noSelectStarRule: TSESLint.RuleModule<MessageIds> = {
  defaultOptions: [],
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Avoid SELECT * queries. Explicitly list columns for better performance.",
      url: "https://github.com/drizzle-team/eslint-plugin-drizzle-postgres",
    },
    messages: {
      noSelectStar:
        "Avoid SELECT *. Explicitly list columns for better performance and clarity",
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        // Check for .select() with no arguments
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.property.type === "Identifier" &&
          node.callee.property.name === "select" &&
          node.arguments.length === 0
        ) {
          // Make sure this is likely a database query (has from() or similar)
          let parent = node.parent;
          let hasQueryMethod = false;

          while (parent && parent.type === "MemberExpression") {
            parent = parent.parent;
          }

          if (parent && parent.type === "CallExpression") {
            // Look for chained methods like from(), where(), etc.
            let current = parent;
            while (current && current.type === "CallExpression") {
              if (
                current.callee.type === "MemberExpression" &&
                current.callee.property.type === "Identifier"
              ) {
                const methodName = current.callee.property.name;
                if (["from", "where", "orderBy", "limit", "offset", "leftJoin", "innerJoin"].includes(methodName)) {
                  hasQueryMethod = true;
                  break;
                }
              }

              if (current.parent?.type === "CallExpression") {
                current = current.parent;
              } else if (
                current.parent?.type === "MemberExpression" &&
                current.parent.parent?.type === "CallExpression"
              ) {
                current = current.parent.parent;
              } else {
                break;
              }
            }
          }

          if (hasQueryMethod) {
            context.report({
              node,
              messageId: "noSelectStar",
            });
          }
        }
      },
    };
  },
};

export default noSelectStarRule;