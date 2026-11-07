import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';
import path from 'node:path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // Allow frontend to import the Convex generated API from the backend
      '@convex-api': path.resolve(__dirname, './src/convex/api'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api/auth': {
        target: 'https://quaint-poodle-413.ap-southeast-2.convex.site',
        changeOrigin: true,
        headers: {
          origin: 'http://localhost:5173',
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
