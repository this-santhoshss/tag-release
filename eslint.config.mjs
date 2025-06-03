// @ts-check
import fs from 'fs';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierPluginRecommended from 'eslint-plugin-prettier/recommended';
import * as importPluginX from 'eslint-plugin-import-x';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prettierConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, '.prettierrc'), 'utf-8'));

export default tseslint.config(
  {
    ignores: ['dist/', 'node_modules/'],
  },
  {
    files: ['tasks/**/*.ts'],
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      importPluginX.flatConfigs.recommended,
      importPluginX.flatConfigs.typescript,
      prettierPluginRecommended,
    ],
    rules: {
      '@typescript-eslint/array-type': 'error',
      'prettier/prettier': ['error', prettierConfig],

      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], ['type']],
          named: true,
          'newlines-between': 'always',
          warnOnUnassignedImports: true,
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'no-console': 'error',
    },
  },
  {
    files: ['src/cli.ts', 'src/main.ts'],
    rules: {
      'no-console': 'off', // allow console.log etc in CLI files
    },
  },
);