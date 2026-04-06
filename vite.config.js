import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Se instalou o plugin oficial do Vite para v4, use assim:
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})