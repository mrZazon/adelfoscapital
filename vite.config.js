import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        status: resolve(__dirname, 'status/index.html'),
        api: resolve(__dirname, 'api/index.html'),
      },
    },
  },
});
