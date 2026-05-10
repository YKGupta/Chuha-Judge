import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname,
});

export default [
    // This pulls in the recommended import rules
    ...compat.extends("plugin:import/recommended"),
    {
        files: ["**/*.{js,mjs,cjs}"],
        languageOptions: {
            globals: globals.node,
            ecmaVersion: "latest",
            sourceType: "module",
        },
        rules: {
            "import/no-unresolved": "error", // Checks if file exists
            "import/named": "error", // Checks for named exports
            "import/no-self-import": "error", // Prevents importing a file into itself
            semi: ["error", "always"], // Mandate ending with semicolon
        },
    },
];
