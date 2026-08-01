import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    assetsDir: 'app-assets',
  },
  test: {
    environment: 'node',
  },
});
