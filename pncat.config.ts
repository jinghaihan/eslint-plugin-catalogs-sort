import { defineConfig, mergeCatalogRules } from 'pncat'

export default defineConfig({
  catalogRules: mergeCatalogRules([
    {
      name: 'prod',
      match: ['jsonc-eslint-parser'],
      priority: 0
    }
  ]),
  postRun: 'eslint --fix "**/package.json" "**/pnpm-workspace.yaml"',
})
