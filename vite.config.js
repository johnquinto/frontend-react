import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 3000, // Para desenvolvimento local
  },
  preview: {
    port: 4173, // Para o Render
  },
});


