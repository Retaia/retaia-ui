import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    files: ['src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            '../api/*',
            '../../api/*',
            '../../../api/*',
            '../application/*',
            '../../application/*',
            '../../../application/*',
          ],
        },
      ],
    },
  },
  {
    files: ['src/pages/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['../api/*', '../../api/*'],
        },
      ],
    },
  },
  {
    files: ['src/application/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            '../api/*',
            '../../api/*',
            '../../../api/*',
            '../services/*',
            '../../services/*',
            '../../../services/*',
            '../hooks/*',
            '../../hooks/*',
            '../../../hooks/*',
            '../pages/*',
            '../../pages/*',
            '../../../pages/*',
            '../components/*',
            '../../components/*',
            '../../../components/*',
          ],
        },
      ],
    },
  },
  {
    files: ['src/hooks/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: ['../pages/*', '../../pages/*', '../components/*', '../../components/*'],
        },
      ],
    },
  },
  {
    files: ['src/**/*.test.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'node:fs',
              message: 'Unit tests must not access real filesystem APIs.',
            },
            {
              name: 'node:fs/promises',
              message: 'Unit tests must not access real filesystem APIs.',
            },
            {
              name: 'node:child_process',
              message: 'Unit tests must not spawn real processes.',
            },
            {
              name: 'node:net',
              message: 'Unit tests must not access real network sockets.',
            },
            {
              name: 'node:dgram',
              message: 'Unit tests must not access real network sockets.',
            },
            {
              name: 'node:http',
              message: 'Unit tests must not access real HTTP clients/servers.',
            },
            {
              name: 'node:https',
              message: 'Unit tests must not access real HTTP clients/servers.',
            },
          ],
        },
      ],
    },
  },
])
