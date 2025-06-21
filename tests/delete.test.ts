// @ts-ignore - RuleTester types are complex
import { RuleTester } from "@typescript-eslint/rule-tester";

import myRule from "../src/enforce-delete-with-where";

const ruleTester = new RuleTester({
  languageOptions: {
    parser: require("@typescript-eslint/parser"),
    parserOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
  },
});

ruleTester.run("my-rule", myRule, {
  valid: [
    "const a = db.delete({}).where({});",
    "delete db.something",
    `dataSource
      .delete()
      .where()`,
  ],
  invalid: [
    {
      code: "db.delete({})",
      errors: [{ messageId: "enforceDeleteWithWhere" }],
    },
    {
      code: "const a = await db.delete({})",
      errors: [{ messageId: "enforceDeleteWithWhere" }],
    },
    {
      code: "const a = db.delete({})",
      errors: [{ messageId: "enforceDeleteWithWhere" }],
    },
    {
      code: `const a = database
        .delete({})`,
      errors: [{ messageId: "enforceDeleteWithWhere" }],
    },
  ],
});