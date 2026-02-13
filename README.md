# eslint-plugin-catalogs-sort

[![npm version][npm-version-src]][npm-version-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]

Sort dependency fields in `package.json` by `catalog` groups, with autofix.

## Install

```bash
pnpm add -D eslint-plugin-catalogs-sort
```

## Quick Start (ESLint Flat Config)

```ts
import { configs } from 'eslint-plugin-catalogs-sort'

export default [
  ...configs.recommended,
]
```

## Rule

- `catalogs-sort/catalogs-sort`
- Source: [src/rules/catalogs-sort.ts](https://github.com/jinghaihan/eslint-plugin-catalogs-sort/blob/main/src/rules/catalogs-sort.ts)
- Fixable: `code`

Default fields:

- `dependencies`
- `devDependencies`
- `peerDependencies`
- `optionalDependencies`
- `resolutions`
- `pnpm.overrides`

Options:

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `fields` | `string[]` | built-in list above | Field paths to sort |
| `catalogOrder` | `string[]` | `[]` | Custom catalog group order |
| `otherGroupPosition` | `'first' \| 'last'` | `'last'` | Position of non-`catalog:` group |

## Example

Before:

```json
{
  "dependencies": {
    "@repo/config": "workspace:*",
    "@vueuse/core": "catalog:vue",
    "axios": "catalog:shared",
    "dayjs": "^1.11.13",
    "pinia": "catalog:vue",
    "vue": "catalog:vue",
    "vue-router": "catalog:vue",
    "zod": "catalog:shared"
  }
}
```

After `eslint --fix`:

```json
{
  "dependencies": {
    "axios": "catalog:shared",
    "zod": "catalog:shared",
    "@vueuse/core": "catalog:vue",
    "pinia": "catalog:vue",
    "vue": "catalog:vue",
    "vue-router": "catalog:vue",
    "@repo/config": "workspace:*",
    "dayjs": "^1.11.13"
  }
}
```

## License

[MIT](./LICENSE) License © [jinghaihan](https://github.com/jinghaihan)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/eslint-plugin-catalogs-sort?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/eslint-plugin-catalogs-sort
[npm-downloads-src]: https://img.shields.io/npm/dm/eslint-plugin-catalogs-sort?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/eslint-plugin-catalogs-sort
[bundle-src]: https://img.shields.io/bundlephobia/minzip/eslint-plugin-catalogs-sort?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=eslint-plugin-catalogs-sort
[license-src]: https://img.shields.io/badge/license-MIT-blue.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/jinghaihan/eslint-plugin-catalogs-sort/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=1fa669
[jsdocs-href]: https://www.jsdocs.io/package/eslint-plugin-catalogs-sort
