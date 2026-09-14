import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      provider: 'istanbul',
    },
    projects: [
      {
        plugins: [react()],
        resolve: {
          alias: {
            '@': path.resolve(__dirname, './'),
          },
        },
        test: {
          name: 'app',
          include: ['app/**/*.{test,spec}.{ts,tsx}'],
          environment: 'jsdom',
          globals: true,
          setupFiles: ['./vitest.setup.ts'],
        },
      },
      {
        resolve: {
          alias: {
            '@': path.resolve(__dirname, './'),
          },
        },
        test: {
          // bun:sqlite only resolves correctly through a native dynamic
          // import; Vite's SSR module runner returns undefined for its
          // named exports on a static import, so the module runner is
          // disabled for this project.
          name: 'lib',
          include: ['lib/**/*.{test,spec}.ts'],
          environment: 'node',
          globals: true,
          experimental: {
            viteModuleRunner: false,
          },
        },
      },
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
