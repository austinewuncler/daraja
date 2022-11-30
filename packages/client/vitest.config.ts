import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    include: ['test/**/*.test.ts'],
    globals: true,
    setupFiles: ['jest-extended/all', 'test/mocks/setup.ts'],
  },
});
