import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import viteTsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  root: '.',
  build: {
    outDir: './build',
  },
  server: {
    port: 5174,
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
  // test: {
  //   globals: true,
  //   environment: 'jsdom',
  // },
});