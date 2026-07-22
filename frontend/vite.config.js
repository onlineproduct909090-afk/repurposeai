import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['lucide-react']  // 🟢 YE LINE ADD KARO (Vite ko clean bundle banane ke liye)
  }
})