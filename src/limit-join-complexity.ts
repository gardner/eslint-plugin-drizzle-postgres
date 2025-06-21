import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

type MessageIds = "tooManyJoins";

export interface Options {
  maxJoins?: number;
}

const limitJoinComplexityRule: TSESLint.RuleModule<MessageIds, [Options?]> = {
  defaultOptions: [{ maxJoins: 3 }],
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Limit the number of joins in a single query for better performance.",
      url: "https://github.com/gardner/eslint-plugin-drizzle-postgres",
    },
    messages: {
      tooManyJoins:
        "Query has {{count}} joins. Consider breaking into smaller queries or creating a view (max: {{max}})",
    },
    schema: [
      {
        type: "object",
        properties: {
          maxJoins: {
            type: "number",
            minimum: 1,
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0] || {};
    const maxJoins = options.maxJoins || 3;

    return {
      CallExpression(node) {
        // Check for join methods
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.property.type === "Identifier" &&
          ["leftJoin", "innerJoin", "rightJoin", "fullJoin"].includes(
            node.callee.property.name
          )
        ) {
          // Count joins in the chain
          let joinCount = 1;
          let current: TSESTree.Node | undefined = node.parent;

          // Walk up the chain to find all joins
          while (current) {
            if (
              current.type === "CallExpression" &&
              current.callee.type === "MemberExpression" &&
              current.callee.property.type === "Identifier" &&
              ["leftJoin", "innerJoin", "rightJoin", "fullJoin"].includes(
                current.callee.property.name
              )
            ) {
              joinCount++;
            }

            // Also walk down to find chained joins
            if (
              current.type === "MemberExpression" &&
              current.parent?.type === "CallExpression"
            ) {
              current = current.parent;
            } else if (current.type === "CallExpression") {
              // Check if parent is a member expression leading to another call
              if (
                current.parent?.type === "MemberExpression" &&
                current.parent.parent?.type === "CallExpression"
              ) {
                current = current.parent.parent;
              } else {
                current = current.parent;
              }
            } else {
              break;
            }
          }

          if (joinCount > maxJoins) {
            context.report({
              node,
              messageId: "tooManyJoins",
              data: { count: String(joinCount), max: String(maxJoins) },
            });
          }
        }
      },
    };
  },
};

export default limitJoinComplexityRule;