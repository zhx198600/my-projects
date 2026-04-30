const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const prettier = require('eslint-plugin-prettier');

module.exports = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': 'error',
    },
    languageOptions: {
      globals: {
        node: true,
      },
    },
  },
  {
    ignores: ['node_modules', 'dist'],
  },
];
