import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import eslint from 'vite-plugin-eslint';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    eslint({
      cache: false,
      include: ['src/**/*.{ts,tsx,js,jsx}'],
      exclude: ['node_modules', 'dist'],
      failOnError: false,
      overrideConfigFile: './.eslintrc.cjs'
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Simple approach: put ALL node_modules in one chunk
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          return null;
        },
      },
    },
    chunkSizeWarningLimit: 6000,
  },
});