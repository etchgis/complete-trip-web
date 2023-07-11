import { defineConfig } from "cypress";
import path from 'path'
import vitePreprocessor from 'cypress-vite';

export default defineConfig({
  e2e: {
    // baseUrl: "http://localhost:5174",
    setupNodeEvents(on, config) {
      on('file:preprocessor', vitePreprocessor({
          configFile: path.resolve(__dirname, './vite.config.ts'),
          mode: 'development',
      }))
    },
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
    viewportHeight: 600,
    viewportWidth: 960,
  },
});
