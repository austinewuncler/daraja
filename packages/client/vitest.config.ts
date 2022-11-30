import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    globals: true,
    setupFiles: ['jest-extended/all', 'test/mocks/setup.ts'],
  },
});
