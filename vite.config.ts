import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import { readFileSync } from 'fs';

// https://vitejs.dev/config/
export default defineConfig({
  root: '.',
  build: {
    outDir: './build',
    sourcemap: false,
  },
  server: {
    port: 5174,
    fs: {
      // Allow Vite to serve files outside of the project root
      allow: ['..'],
    },
  },
  plugins: [react(), viteTsconfigPaths(), svgrPlugin()],
  esbuild: {
    loader: 'jsx', // Remove this if you're not using JSX
    include: [
      // Business as usual for .jsx and .tsx files
      'src/**/*.jsx',
      'src/**/*.tsx',
      'node_modules/**/*.jsx',
      'node_modules/**/*.tsx',

      // --- OR ---

      // Add these lines to allow all .js files to contain JSX
      'src/**/*.js',
      'node_modules/**/*.js',

      // Add these lines to allow all .ts files to contain JSX
      'src/**/*.ts',
      'node_modules/**/*.ts',
    ],
    exclude: [],
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
