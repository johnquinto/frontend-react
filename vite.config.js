import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    port: 3000, // Para desenvolvimento local
    host: '0.0.0.0', // Torna a aplicação acessível de qualquer IP
    watch: {
      usePolling: true, // Essencial se você estiver fazendo mudanças na configuração de rede ou proxy
    },
  },
  preview: {
    port: 4173, // Porta usada pelo Render
    host: '0.0.0.0', // Expor a aplicação para qualquer IP
    allowedHosts: ['frontend-react-mxin.onrender.com'], // Adiciona o domínio do Render à lista de hosts permitidos
  },
});
