import type { Rule } from 'eslint'
import type { AST } from 'jsonc-eslint-parser'

export function getPackageJsonRootNode(context: Rule.RuleContext): AST.JSONObjectExpression | undefined {
  if (!context.filename.endsWith('package.json'))
    return

  const ast = context.sourceCode.ast
  const root = ast.body[0] as unknown as AST.JSONExpressionStatement | undefined
  if (root?.expression.type === 'JSONObjectExpression')
    return root.expression
}

export function getObjectNodeByPath(
  root: AST.JSONObjectExpression,
  path: string[],
): AST.JSONObjectExpression | undefined {
  let current: AST.JSONObjectExpression | undefined = root

  for (const segment of path) {
    if (!current)
      return

    const property: AST.JSONProperty | undefined = current.properties.find((item: AST.JSONProperty) => {
      return item.key.type === 'JSONLiteral' && item.key.value === segment
    })
    if (!property?.value || property.value.type !== 'JSONObjectExpression')
      return
    current = property.value
  }

  return current
}

export function* iterateDependencyObjects(
  context: Rule.RuleContext,
  fields: string[],
): Generator<
  {
    field: string
    node: AST.JSONObjectExpression
  },
  void,
  unknown
> {
  const root = getPackageJsonRootNode(context)
  if (!root)
    return

  for (const field of fields) {
    const node = getObjectNodeByPath(root, field.split('.'))
    if (!node)
      continue

    yield {
      field,
      node,
    }
  }
}
