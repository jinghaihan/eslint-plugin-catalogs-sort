import type { ESLint, Linter } from 'eslint'
import * as jsoncParser from 'jsonc-eslint-parser'
import { name, version } from '../package.json'
import catalogsSort, { RULE_NAME } from './rules/catalogs-sort'

export const rules: ESLint.Plugin['rules'] = {
  [RULE_NAME]: catalogsSort,
}

export const plugin: ESLint.Plugin = {
  meta: {
    name,
    version,
  },
  rules,
}

const packageJsonConfig: Linter.Config = {
  name: 'catalogs-sort/package-json',
  files: [
    'package.json',
    '**/package.json',
  ],
  languageOptions: {
    parser: jsoncParser,
  },
  plugins: {
    'catalogs-sort': plugin,
  },
  rules: {
    'catalogs-sort/catalogs-sort': 'error',
  },
}

export const configs: {
  recommended: Linter.Config[]
} = {
  recommended: [packageJsonConfig],
} satisfies ESLint.Plugin['configs']

plugin.configs = configs

export default plugin
