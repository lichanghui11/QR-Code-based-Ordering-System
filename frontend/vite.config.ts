import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // "/api": {
      //   target: "http://localhost:5002",
      //   changeOrigin: true,
      //   rewrite: (path) => path.replace(/^\/api/, ""),
      // },
      '/api': "http://192.168.3.11:5002/",
      '/upload': "http://192.168.3.11:5002/",
      '/restaurant': {
        target: 'http://192.168.3.11:5002/', 
        ws: true,
      },
      '/desk': {
        target: 'http://192.168.3.11:5002/', 
        ws: true,
      }
    },
  },
});
