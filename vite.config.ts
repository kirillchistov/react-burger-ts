import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

import react from '@vitejs/plugin-react';
import { checker } from 'vite-plugin-checker';
import readableClassnames from 'vite-plugin-readable-classnames';
import sassDts from 'vite-plugin-sass-dts';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

const githubPagesBase = '/react-burger-ts/';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    checker({
      typescript: true,
    }),
    react(),
    readableClassnames(),
    sassDts({
      enabledMode: ['development'],
      esmExport: true,
    }),
    tsconfigPaths(),
    {
      closeBundle: (): void => {
        if (mode !== 'production') {
          return;
        }

        copyFileSync(
          resolve(__dirname, 'dist/index.html'),
          resolve(__dirname, 'dist/404.html')
        );
      },
      name: 'copy-index-to-404',
    },
  ],
  base: mode === 'production' ? githubPagesBase : '/',
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest-setup.ts'],
  },
  server: {
    open: true,
  },
}));
