import { createCatalogsSortRule } from '../utils/create'
import { sortDependencyObject } from '../utils/helper'
import { iterateDependencyObjects } from '../utils/iterate'

export const RULE_NAME = 'catalogs-sort'
export const DEFAULT_FIELDS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
  'resolutions',
  'pnpm.overrides',
]

export type MessageIds = 'unexpectedOrder'
export type Options = [
  {
    fields?: string[]
    catalogOrder?: string[]
    otherGroupPosition?: 'first' | 'last'
  },
]

export default createCatalogsSortRule<Options>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      description: 'Sort dependency fields by catalog groups and package names.',
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          fields: {
            type: 'array',
            items: { type: 'string' },
            default: DEFAULT_FIELDS,
            description: 'Dependency fields to sort.',
          },
          catalogOrder: {
            type: 'array',
            items: { type: 'string' },
            default: [],
            description: 'Custom order for catalog groups (unspecified groups stay alphabetical after them).',
          },
          otherGroupPosition: {
            type: 'string',
            enum: ['first', 'last'],
            default: 'last',
            description: 'Place non-catalog dependencies before or after catalog groups.',
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unexpectedOrder: '`{{field}}` should be sorted by catalog group and package name.',
    },
  },
  defaultOptions: [{}],
  create(context, [options = {}]) {
    const {
      fields = DEFAULT_FIELDS,
      catalogOrder = [],
      otherGroupPosition = 'last',
    } = options

    for (const { field, node } of iterateDependencyObjects(context, fields)) {
      if (node.properties.length < 2)
        continue

      const replacement = sortDependencyObject({
        sourceCode: context.sourceCode,
        objectNode: node,
        catalogOrder,
        otherGroupPosition,
      })
      const current = context.sourceCode.getText(node as any)
      if (replacement === current)
        continue

      context.report({
        node: node as any,
        messageId: 'unexpectedOrder',
        data: { field },
        fix: fixer => fixer.replaceText(node as any, replacement),
      })
    }

    return {}
  },
})
