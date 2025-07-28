import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Environment variables
const PORT = process.env.PORT || 3001;

export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
    }),
    visualizer({
      template: 'treemap',
      open: true,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/bundle-analysis.html',
    }),
  ],
  root: path.resolve(__dirname, './'),
  server: {
    port: 3002,
    strictPort: true,
    host: true,
    hmr: {
      overlay: true,
      port: 3002
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/ws': {
        target: 'ws://localhost:3000',
        ws: true
      }
    }
  },
  resolve: {
    alias: [
      { find: '@', replacement: path.resolve(__dirname, 'src') },
      { find: '@components', replacement: path.resolve(__dirname, 'src/components') },
      { find: '@hooks', replacement: path.resolve(__dirname, 'src/hooks') },
      { find: '@pages', replacement: path.resolve(__dirname, 'src/pages') },
      { find: '@utils', replacement: path.resolve(__dirname, 'src/utils') },
      { find: '@assets', replacement: path.resolve(__dirname, 'src/assets') },
      { find: '@contexts', replacement: path.resolve(__dirname, 'src/contexts') },
      { find: '@services', replacement: path.resolve(__dirname, 'src/services') },
    ],
  },
  define: {
    'process.env': {},
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
  optimizeDeps: {
    include: ['@chakra-ui/react', '@emotion/styled', '@emotion/react'],
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
    },
  },

});
