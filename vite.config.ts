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
