import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const API_TARGET = process.env.VITE_API_TARGET || 'http://localhost:8000';

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,
    // In development the React app runs on :5173 with hot reload, so its
    // /api and /images calls are proxied to the Python server on :8000.
    // Without this the browser would treat them as same-origin and 404.
    // Where the Python API lives. Running Vite on the host it's localhost;
    // in the dev container the backend is another service, reachable by its
    // compose service name — hence the override.
    proxy: {
      '/api': API_TARGET,
      '/images': API_TARGET,
    },
  },
});
