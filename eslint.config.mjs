import { ESLint } from 'eslint';
import typescriptParser from '@typescript-eslint/parser';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sortImport from 'eslint-plugin-import';

export default [
  {
    ignores: ['node_modules/*', 'dist/*', 'eslint.config.js'],
  },
  {
    files: ['**/*.{ts,gql}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
      },
      globals: {
        React: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin,
      'simple-import-sort': simpleImportSort,
      import: sortImport,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // 自定义您的规则
      // Customize your rules
      // 下面解决这个问题  Line 1:1:  Definition for rule 'react/no-unstable-nested-components' was not found  react/no-unstable-nested-components
      // 'react/no-unstable-nested-components': 'on',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      // 'no-unused-vars': 'error',
      // 'import/no-unresolved': 'error',
    },
  },
];
