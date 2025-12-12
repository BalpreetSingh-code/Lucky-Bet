import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/register': 'http://localhost:3000',
      '/login':    'http://localhost:3000',
      '/games':    'http://localhost:3000',
      '/play':     'http://localhost:3000',
      '/bonus':    'http://localhost:3000',
    }
  }
})