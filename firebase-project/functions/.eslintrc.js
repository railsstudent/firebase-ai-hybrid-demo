module.exports = {
    root: true,
    env: {
        es6: true,
        node: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
        "google",
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: ["tsconfig.json", "tsconfig.dev.json"],
        sourceType: "module",
    },
    ignorePatterns: [
        "/lib/**/*", // Ignore built files.
        "/generated/**/*", // Ignore generated files.
    ],
    plugins: ["@typescript-eslint", "import"],
    rules: {
        quotes: ["error", "double", { avoidEscape: true }],
        "import/no-unresolved": 0,
        "max-len": ["error", { code: 120 }],
        "object-curly-spacing": ["error", "always"],
        "prettier/prettier": [
            "error",
            {
                trailingComma: "all",
                tabWidth: 4,
                semi: true,
                singleQuote: false,
                printWidth: 120,
            },
        ],
    },
};
