import type { TSESLint } from "@typescript-eslint/utils";

type MessageIds = "useUUID";

const preferUuidRule: TSESLint.RuleModule<MessageIds> = {
  defaultOptions: [],
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Suggest using UUID for primary keys instead of serial/integer.",
      url: "https://github.com/drizzle-team/eslint-plugin-drizzle",
    },
    hasSuggestions: true,
    messages: {
      useUUID:
        "Consider using UUID for primary keys instead of serial/integer for better scalability",
    },
    schema: [],
  },
  create(context) {
    return {
      CallExpression(node) {
        // Check for serial().primaryKey() pattern
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.property.type === "Identifier" &&
          node.callee.property.name === "primaryKey" &&
          node.callee.object.type === "CallExpression" &&
          node.callee.object.callee.type === "Identifier" &&
          (node.callee.object.callee.name === "serial" ||
           node.callee.object.callee.name === "integer")
        ) {
          const columnNameArg = node.callee.object.arguments[0];
          const columnName = columnNameArg?.type === "Literal" && typeof columnNameArg.value === "string"
            ? columnNameArg.value
            : "id";

          context.report({
            node,
            messageId: "useUUID",
            suggest: [
              {
                messageId: "useUUID" as const,
                fix(fixer) {
                  return fixer.replaceText(
                    node,
                    `uuid('${columnName}').defaultRandom().primaryKey()`
                  );
                },
              },
            ],
          });
        }
      },
    };
  },
};

export default preferUuidRule;