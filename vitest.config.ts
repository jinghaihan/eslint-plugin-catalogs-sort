import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      reportsDirectory: 'node_modules/.vitest/coverage',
    },
  },
})
