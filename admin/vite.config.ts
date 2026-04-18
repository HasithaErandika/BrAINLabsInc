import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:3001',
      '/admin': 'http://localhost:3001',
      '/me': 'http://localhost:3001',
      '/blogs': 'http://localhost:3001',
      '/tutorials': 'http://localhost:3001',
      '/projects': 'http://localhost:3001',
      '/publications': 'http://localhost:3001',
      '/events': 'http://localhost:3001',
      '/grants': 'http://localhost:3001',
      '/content': 'http://localhost:3001',
    }
  }
})
