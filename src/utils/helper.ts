import type { Rule } from 'eslint'
import type { AST } from 'jsonc-eslint-parser'

interface Item {
  property: AST.JSONProperty
  packageName: string
  group: string
}

interface SortedItems {
  items: Item[]
  groups: string[]
}

interface SortDependencyObjectOptions {
  sourceCode: Rule.RuleContext['sourceCode']
  objectNode: AST.JSONObjectExpression
  catalogOrder: string[]
  otherGroupPosition: 'first' | 'last'
}

const CATALOG_PREFIX = 'catalog:'
const OTHER_GROUP = '__other__'

export function sortDependencyObject({
  sourceCode,
  objectNode,
  catalogOrder,
  otherGroupPosition,
}: SortDependencyObjectOptions): string {
  const sorted = sortProperties(objectNode.properties, catalogOrder, otherGroupPosition)
  return toObjectText(sourceCode, objectNode, sorted)
}

function sortProperties(
  properties: AST.JSONProperty[],
  catalogOrder: string[],
  otherGroupPosition: 'first' | 'last',
): SortedItems {
  const catalogGroups = new Map<string, Item[]>()
  const otherItems: Item[] = []

  for (const property of properties) {
    const packageName = getPropertyName(property)
    const specifier = getStringLiteral(property.value) ?? ''

    const catalogName = parseCatalogName(specifier)
    if (catalogName != null) {
      if (!catalogGroups.has(catalogName))
        catalogGroups.set(catalogName, [])
      catalogGroups.get(catalogName)?.push({
        property,
        packageName,
        group: `catalog:${catalogName}`,
      })
    }
    else {
      otherItems.push({
        property,
        packageName,
        group: OTHER_GROUP,
      })
    }
  }

  for (const items of catalogGroups.values())
    items.sort((a, b) => compareText(a.packageName, b.packageName))
  otherItems.sort((a, b) => compareText(a.packageName, b.packageName))

  const customOrder = new Map<string, number>()
  for (const [index, catalogName] of catalogOrder.entries()) {
    if (!customOrder.has(catalogName))
      customOrder.set(catalogName, index)
  }

  const catalogNames = [...catalogGroups.keys()].sort((a, b) => {
    const aIndex = customOrder.get(a)
    const bIndex = customOrder.get(b)

    if (aIndex != null && bIndex != null)
      return aIndex - bIndex
    if (aIndex != null)
      return -1
    if (bIndex != null)
      return 1
    return compareText(a, b)
  })

  const items: Item[] = []
  const groups: string[] = []
  const addItems = (segment: Item[]): void => {
    for (const item of segment) {
      items.push(item)
      groups.push(item.group)
    }
  }

  if (otherGroupPosition === 'first')
    addItems(otherItems)

  for (const catalogName of catalogNames)
    addItems(catalogGroups.get(catalogName) ?? [])

  if (otherGroupPosition === 'last')
    addItems(otherItems)

  return { items, groups }
}

function toObjectText(
  sourceCode: Rule.RuleContext['sourceCode'],
  objectNode: AST.JSONObjectExpression,
  sorted: SortedItems,
): string {
  if (!sorted.items.length)
    return sourceCode.getText(objectNode as any)

  const isMultiLine = objectNode.loc.start.line !== objectNode.loc.end.line
  if (!isMultiLine)
    return toSingleLineObjectText(sourceCode.getText(objectNode as any), sorted.items, sourceCode)

  const lineBreak = sourceCode.text.includes('\r\n') ? '\r\n' : '\n'
  const firstProperty = sorted.items[0].property
  const firstLine = sourceCode.lines[firstProperty.loc.start.line - 1] ?? ''
  const propertyIndent = firstLine.slice(0, firstProperty.loc.start.column)

  const closeLoc = sourceCode.getLocFromIndex(objectNode.range[1] - 1)
  const closeLine = sourceCode.lines[closeLoc.line - 1] ?? ''
  const closeIndent = closeLine.slice(0, closeLoc.column)

  let body = ''
  for (const [index, item] of sorted.items.entries()) {
    if (index > 0)
      body += `,${lineBreak}`
    body += `${propertyIndent}${sourceCode.getText(item.property as any)}`
  }

  return `{${lineBreak}${body}${lineBreak}${closeIndent}}`
}

function toSingleLineObjectText(
  current: string,
  sortedItems: Item[],
  sourceCode: Rule.RuleContext['sourceCode'],
): string {
  const hasSpaceAfterOpen = /^\{\s+/.test(current)
  const hasSpaceBeforeClose = /\s+\}$/.test(current)
  const body = sortedItems
    .map(item => sourceCode.getText(item.property as any))
    .join(', ')

  if (!body)
    return '{}'

  return `{${hasSpaceAfterOpen ? ' ' : ''}${body}${hasSpaceBeforeClose ? ' ' : ''}}`
}

function parseCatalogName(specifier: string): string | undefined {
  if (!specifier.startsWith(CATALOG_PREFIX))
    return

  return specifier.slice(CATALOG_PREFIX.length)
}

function compareText(a: string, b: string): number {
  return a.localeCompare(b, 'en')
}

function getLiteralString(node: AST.JSONLiteral): string | undefined {
  return typeof node.value === 'string' ? node.value : undefined
}

function getStringLiteral(node: AST.JSONNode): string | undefined {
  if (node.type !== 'JSONLiteral')
    return

  return getLiteralString(node)
}

function getPropertyName(property: AST.JSONProperty): string {
  if (property.key.type === 'JSONLiteral') {
    const literal = getLiteralString(property.key)
    return literal ?? ''
  }

  if (property.key.type === 'JSONIdentifier')
    return property.key.name

  return ''
}
