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
  test: {
    // Vitest runs the unit tests under src. The archive folder holds retired
    // components, and TransitRoutes.test.jsx drives the page against live
    // services through a wrapper that loads Cypress commands, so neither can
    // run here.
    include: ['src/**/*.test.{js,jsx,ts,tsx}'],
    exclude: ['src/__tests__/TransitRoutes.test.jsx'],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
        '.ts': 'tsx',
        '.jsx': 'jsx',
        '.tsx': 'tsx',
      },
    },
  },
});
