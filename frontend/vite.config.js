import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 3000,
    proxy: {
      // Dev proxy: forwards /api and /health to backend
      '/api':    { target: 'http://localhost:5000', changeOrigin: true },
      '/health': { target: 'http://localhost:5000', changeOrigin: true },
    },
  },

  build: {
    // Reduce chunk size warnings threshold — important for t2.micro
    chunkSizeWarningLimit: 400,
    rollupOptions: {
      output: {
        // Manual chunking keeps initial bundle small
        manualChunks: {
          vendor:  ['react', 'react-dom', 'react-router-dom'],
          motion:  ['framer-motion'],
        },
      },
    },
    // Minify with esbuild (much faster than terser, low RAM usage)
    minify: 'esbuild',
    // Source maps off in production = smaller build
    sourcemap: false,
  },

  // esbuild target for modern browsers (smaller output)
  esbuild: { target: 'es2020' },
});
