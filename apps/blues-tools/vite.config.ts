import { configDefaults, defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/blues/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
    exclude: [...configDefaults.exclude, 'node_modules/**', 'scripts/**/*.spec.ts'],
  },
})
