import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 3000, // Para desenvolvimento local
  },
  preview: {
    port: 4173, // Porta para o Render
    host: '0.0.0.0', // Expor a aplicação para qualquer IP
    allowedHosts: ['frontend-react-w8wb.onrender.com'], // Adiciona o domínio do Render
  },
});
