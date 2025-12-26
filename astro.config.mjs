import { defineConfig } from 'astro/config';

export default defineConfig({
  srcDir: 'src',
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
});
