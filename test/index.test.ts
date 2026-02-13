import type { InvalidTestCase, ValidTestCase } from 'eslint-vitest-rule-tester'
import { run } from 'eslint-vitest-rule-tester'
import jsoncParser from 'jsonc-eslint-parser'
import { describe, expect, it } from 'vitest'
import rule, { RULE_NAME } from '../src/rules/catalogs-sort'

const valid: ValidTestCase[] = [
  {
    filename: 'package.json',
    code: JSON.stringify({
      dependencies: {
        '@vueuse/core': 'catalog:frontend',
        '@types/node': 'catalog:types',
        'vue': 'workspace:*',
      },
      pnpm: {
        overrides: {
          react: 'catalog:frontend',
          vue: '^3.5.0',
        },
      },
    }, null, 2),
  },
  {
    filename: 'package.json',
    options: [
      {
        catalogOrder: ['lint', 'test'],
        otherGroupPosition: 'first',
      },
    ],
    code: `{
  "devDependencies": {
    "local-lib": "workspace:*",
    "eslint": "catalog:lint",
    "vitest": "catalog:test",
    "vue": "catalog:frontend"
  }
}`,
  },
  {
    filename: 'foo.json',
    code: JSON.stringify({
      dependencies: {
        b: 'catalog:test',
        a: 'catalog:build',
      },
    }, null, 2),
  },
]

const invalid: InvalidTestCase[] = [
  {
    filename: 'package.json',
    code: JSON.stringify({
      dependencies: {
        'zod': 'catalog:validation',
        '@types/node': 'catalog:types',
        'vue': '^3.5.0',
        '@vueuse/core': 'catalog:frontend',
        'react': 'workspace:*',
      },
    }, null, 2),
    errors: [{ messageId: 'unexpectedOrder' }],
    output: JSON.stringify({
      dependencies: {
        '@vueuse/core': 'catalog:frontend',
        '@types/node': 'catalog:types',
        'zod': 'catalog:validation',
        'react': 'workspace:*',
        'vue': '^3.5.0',
      },
    }, null, 2),
  },
  {
    filename: 'package.json',
    options: [
      {
        catalogOrder: ['lint', 'test', 'build'],
        otherGroupPosition: 'first',
      },
    ],
    code: JSON.stringify({
      devDependencies: {
        'vue': 'catalog:frontend',
        'tsup': 'catalog:build',
        'eslint': 'catalog:lint',
        'local-lib': 'workspace:*',
        'vitest': 'catalog:test',
      },
    }, null, 2),
    errors: [{ messageId: 'unexpectedOrder' }],
    output: `{
  "devDependencies": {
    "local-lib": "workspace:*",
    "eslint": "catalog:lint",
    "vitest": "catalog:test",
    "tsup": "catalog:build",
    "vue": "catalog:frontend"
  }
}`,
  },
  {
    filename: 'package.json',
    code: JSON.stringify({
      pnpm: {
        overrides: {
          react: 'catalog:frontend',
          vue: '^3.5.0',
          eslint: 'catalog:lint',
        },
      },
    }, null, 2),
    errors: [{ messageId: 'unexpectedOrder' }],
    output: JSON.stringify({
      pnpm: {
        overrides: {
          react: 'catalog:frontend',
          eslint: 'catalog:lint',
          vue: '^3.5.0',
        },
      },
    }, null, 2),
  },
]

run({
  name: RULE_NAME,
  rule,
  parser: jsoncParser,
  valid,
  invalid,
})

describe(RULE_NAME, () => {
  it('should expose docs url', () => {
    expect(rule.meta?.docs?.url)
      .toBe('https://github.com/jinghaihan/eslint-plugin-catalogs-sort/blob/main/src/rules/catalogs-sort.ts')
  })
})
