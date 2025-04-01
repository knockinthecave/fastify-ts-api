import eslintPluginPrettier from 'eslint-plugin-prettier';
import prettierConfig from './.prettierrc.js'; // Prettier 설정 불러오기

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
    },
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      'prettier/prettier': ['warn', prettierConfig],
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': ['warn'],
    },
  },
];
