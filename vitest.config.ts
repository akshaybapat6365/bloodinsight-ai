import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    environment: 'node'
  },
  resolve: {
    alias: {
      '@': '/workspace/bloodinsight-ai/src'
    }
  }
})
