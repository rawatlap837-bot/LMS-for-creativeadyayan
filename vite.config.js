import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true, gzipSize: true }) // opens a treemap after build
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          // add more entries here once you see what's big in the treemap
          // e.g. router: ['react-router-dom'], charts: ['chart.js']
        }
      }
    }
  }
})