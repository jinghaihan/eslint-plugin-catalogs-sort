import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index'],
  exports: true,
  dts: {
    resolver: 'tsc',
  },
  external: ['eslint'],
})
