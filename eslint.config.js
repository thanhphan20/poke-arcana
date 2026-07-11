import eslint from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import astroEslintPlugin from 'eslint-plugin-astro';
import * as astroParser from 'astro-eslint-parser';

export default [
  eslint.configs.recommended,
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': typescriptEslint
    },
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', ignoreRestSiblings: true }]
    }
  },
  {
    files: ['scripts/**/*.ts'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        process: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        Buffer: 'readonly'
      }
    }
  },
  {
    files: ['src/**/*.astro'],
    plugins: {
      astro: astroEslintPlugin
    },
    languageOptions: {
      parser: astroParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        parser: typescriptParser
      }
    }
  },
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      globals: {
        HTMLElement: 'readonly',
        HTMLScriptElement: 'readonly',
        HTMLInputElement: 'readonly',
        HTMLButtonElement: 'readonly',
        document: 'readonly',
        window: 'readonly',
        Event: 'readonly',
        CustomEvent: 'readonly',
        clearTimeout: 'readonly',
        customElements: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        Response: 'readonly',
        RequestInit: 'readonly',
        AbortController: 'readonly',
        ResizeObserver: 'readonly',
        getComputedStyle: 'readonly'
      }
    }
  },
  {
    ignores: ['dist/', 'node_modules/', '.astro/', '.vercel/']
  }
];
