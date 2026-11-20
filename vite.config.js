import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // All /api requests are proxied to the Spring Boot backend on port 8080
      // This completely eliminates CORS issues — the browser talks to :5173 only
    
      '/api': {
        target: 'http://127.0.0.1:7002',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
