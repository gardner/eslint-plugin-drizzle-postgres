import type { TSESLint, TSESTree } from "@typescript-eslint/utils";

type MessageIds = "bypassDetected" | "missingRLSComment";

const preventRLSBypassRule: TSESLint.RuleModule<MessageIds> = {
  defaultOptions: [],
  meta: {
    type: "problem",
    docs: {
      description:
        "Prevent accidental RLS bypass and require documentation when bypass is necessary.",
      url: "https://github.com/drizzle-team/eslint-plugin-drizzle",
    },
    messages: {
      bypassDetected:
        "This query bypasses RLS using {{method}}. Use a service role client only when necessary and document why.",
      missingRLSComment:
        "Document why RLS bypass is necessary with a comment explaining the security implications.",
    },
    schema: [],
  },
  create(context) {
    // Pattern to check for RLS bypass explanations in comments
    const validBypassReasons = [
      /RLS\s+bypass/i,
      /security/i,
      /admin/i,
      /service\s+role/i,
      /system\s+operation/i,
      /migration/i,
      /background\s+job/i,
      /cron/i,
    ];

    function hasValidBypassComment(node: TSESTree.Node): boolean {
      const sourceCode = context.sourceCode;
      const comments = sourceCode.getCommentsBefore(node);
      
      return comments.some((comment) =>
        validBypassReasons.some((pattern) => pattern.test(comment.value))
      );
    }

    return {
      MemberExpression(node) {
        // Check for .rls().bypass() pattern
        if (
          node.property.type === "Identifier" &&
          node.property.name === "bypass" &&
          node.object.type === "CallExpression" &&
          node.object.callee.type === "MemberExpression" &&
          node.object.callee.property.type === "Identifier" &&
          node.object.callee.property.name === "rls"
        ) {
          if (!hasValidBypassComment(node)) {
            context.report({
              node,
              messageId: "missingRLSComment",
            });
          }
        }

        // Check for service/admin role usage
        if (
          node.property.type === "Identifier" &&
          ["serviceRole", "adminClient", "serviceClient", "bypassRLS"].includes(
            node.property.name
          )
        ) {
          context.report({
            node,
            messageId: "bypassDetected",
            data: { method: node.property.name },
          });
        }
      },

      // Check for specific patterns in function calls
      CallExpression(node) {
        // Check for Supabase service role key usage
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.property.type === "Identifier" &&
          node.callee.property.name === "createClient" &&
          node.arguments.length >= 2
        ) {
          // Look for service role key in second argument
          const authArg = node.arguments[1];
          if (
            authArg?.type === "ObjectExpression" &&
            authArg.properties.some(
              (prop) =>
                prop.type === "Property" &&
                prop.key.type === "Identifier" &&
                prop.key.name === "auth" &&
                prop.value.type === "ObjectExpression" &&
                prop.value.properties.some(
                  (authProp) =>
                    authProp.type === "Property" &&
                    authProp.key.type === "Identifier" &&
                    authProp.key.name === "autoRefreshToken" &&
                    authProp.value.type === "Literal" &&
                    authProp.value.value === false
                )
            )
          ) {
            // This pattern often indicates service role usage
            if (!hasValidBypassComment(node)) {
              context.report({
                node,
                messageId: "bypassDetected",
                data: { method: "service role client" },
              });
            }
          }
        }

        // Check for SECURITY DEFINER functions
        if (
          node.callee.type === "Identifier" &&
          node.callee.name === "sql" &&
          node.arguments[0]?.type === "TemplateLiteral"
        ) {
          const sqlContent = node.arguments[0].quasis
            .map((quasi) => quasi.value.raw)
            .join("");

          if (/SECURITY\s+DEFINER/i.test(sqlContent)) {
            if (!hasValidBypassComment(node)) {
              context.report({
                node,
                messageId: "bypassDetected",
                data: { method: "SECURITY DEFINER" },
              });
            }
          }
        }
      },
    };
  },
};

export default preventRLSBypassRule;