import path from 'path';
import { defineConfig, loadEnv } from 'vite';
/// <reference types="vitest" />
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    optimizeDeps: {
      exclude: ['@google/generative-ai']
    },
    define: {
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      chunkSizeWarningLimit: 1200,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('router')) {
                return 'vendor-react';
              }
              if (id.includes('@google/generative-ai')) {
                return 'vendor-ai';
              }
              if (id.includes('pdfjs-dist')) {
                return 'vendor-pdf';
              }
              if (id.includes('papaparse') || id.includes('html2canvas') || id.includes('file-saver') || id.includes('i18next')) {
                return 'vendor-utils';
              }
              return 'vendor'; // all other node_modules
            }
          }
        }
      }
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './setupTests.ts',
    }
  };
});
