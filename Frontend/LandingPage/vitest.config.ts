/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    pool: 'forks',
    include: ['src/**/__tests__/**/*.test.ts'],
    exclude: ['**/node_modules/**'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@convex-api': path.resolve(
        fileURLToPath(new URL('./src/__stubs__/convex-api.ts', import.meta.url))
      ),
    },
  },
});
