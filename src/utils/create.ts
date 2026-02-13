import type { Rule } from 'eslint'

export type RuleModule<
  T extends readonly unknown[],
> = Rule.RuleModule & {
  name: string
  defaultOptions: T
}

interface RuleInput<T extends readonly unknown[]> {
  name: string
  meta: Rule.RuleMetaData
  defaultOptions: T
  create: (context: Rule.RuleContext, options: T) => Rule.RuleListener
}

const blobUrl = 'https://github.com/jinghaihan/eslint-plugin-catalogs-sort/blob/main/src/rules/'

function RuleCreator(urlCreator: (name: string) => string) {
  return function createNamedRule<
    T extends readonly unknown[],
  >({
    name,
    meta,
    defaultOptions,
    create,
  }: RuleInput<T>): RuleModule<T> {
    const docs = (meta.docs ?? {}) as Record<string, unknown>
    return createRule({
      name,
      meta: {
        ...meta,
        docs: {
          ...docs,
          url: typeof docs.url === 'string' ? docs.url : urlCreator(name),
        },
      },
      defaultOptions,
      create,
    })
  }
}

export function createEslintRule<
  T extends readonly unknown[],
>({
  name,
  meta,
  defaultOptions,
  create,
}: RuleInput<T>): RuleModule<T> {
  return createRule({
    name,
    meta,
    defaultOptions,
    create,
  })
}

function createRule<
  T extends readonly unknown[],
>({
  name,
  meta,
  defaultOptions,
  create,
}: RuleInput<T>): RuleModule<T> {
  return {
    name,
    meta,
    defaultOptions,
    create(context) {
      const optionsWithDefault = defaultOptions.map((defaultOption, index) => {
        const option = context.options[index]
        if (isObject(defaultOption) && isObject(option))
          return { ...defaultOption, ...option }

        return option ?? defaultOption
      }) as unknown as T

      return create(context, optionsWithDefault)
    },
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export const createCatalogsSortRule = RuleCreator(
  ruleName => `${blobUrl}${ruleName}.ts`,
)
