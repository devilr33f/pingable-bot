import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import typescriptEslint from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import perfectionist from 'eslint-plugin-perfectionist'
import globals from 'globals'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  allConfig: js.configs.all,
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended
})

export default [
  {
    ignores: ['**/dist', '**/node_modules']
  },
  ...compat.extends('standard'),
  perfectionist.configs['recommended-natural'],
  {
    files: ['**/*.ts'],
    languageOptions: {
      ecmaVersion: 'latest',

      globals: {
        ...globals.node
      },
      parser: tsParser,
      sourceType: 'module'
    },

    plugins: {
      '@typescript-eslint': typescriptEslint
    },

    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['warn'],
      'brace-style': [0, '1tbs', {
        allowSingleLine: true
      }],
      'comma-dangle': ['error', 'always-multiline'],
      indent: ['warn', 2],
      'no-return-await': ['warn'],

      'no-unused-vars': ['off'],

      'perfectionist/sort-classes': ['warn', {
        groups: [
          'index-signature',
          'static-property',
          'private-property',
          'property',
          'constructor',
          'static-method',
          'private-method',
          'static-private-method',
          ['get-method', 'set-method'],
          'method',
          'unknown'
        ]
      }],

      'perfectionist/sort-enums': ['off'],

      'perfectionist/sort-imports': ['error', {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        internalPattern: ['@/**']
      }],
      'perfectionist/sort-interfaces': ['off'],
      'perfectionist/sort-object-types': ['off'],
      'perfectionist/sort-objects': ['off'],

      'perfectionist/sort-union-types': ['off']
    }
  }]
