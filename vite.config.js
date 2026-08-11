import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- Inyección del motor

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <-- Activación del motor
  ],
})