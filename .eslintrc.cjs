module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    commonjs: true,
    node: true,
    es6: true,
  },
  plugins: ["import", "@typescript-eslint"],
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
    sourceType: "module",
  },
  extends: [
    "eslint:recommended",
    "plugin:vue/essential",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  rules: {
    complexity: ["error", 10],
    "import/extensions": ["error", "always"],
    quotes: ["error", "single"],
    "@typescript-eslint/ban-ts-comment": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "no-unsafe-optional-chaining": "error",
    indent: ["error", 2],
    "no-extra-semi": "error",
    "no-case-declarations": "off",
    "object-curly-spacing": ["error", "always"],
    "vue/no-multi-spaces": ["error"],
    "vue/script-indent": ["error", 2, { baseIndent: 0 }],
    "vue/html-indent": [
      "error",
      2,
      {
        attribute: 1,
        baseIndent: 1,
        closeBracket: 0,
        alignAttributesVertically: true,
        ignores: [],
      },
    ],
    "vue/no-multiple-template-root": "off",
    "vue/multi-word-component-names": "off",
    "vue/no-empty-component-block": ["error"],
    "vue/no-unused-refs": "off",
    "vue/no-unused-properties": ["error"],
    "vue/mustache-interpolation-spacing": [2, "always"],
    "vue/component-name-in-template-casing": [
      "error",
      "PascalCase",
      {
        // для библиотечных компонентов предпочтителен kebab
        registeredComponentsOnly: true,
      },
    ],
  },
  overrides: [
    {
      files: ["*.vue"],
      rules: {
        indent: "off",
      },
    },
  ],
};
