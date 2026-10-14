import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
    // Onglet Suivi : l'API FastAPI de server/ (lancée avec le site par `npm run dev`) tourne sur le port 8000
    // (surcharger avec la variable d'environnement SUIVI_API_TARGET si besoin).
    proxy: {
      '/api': process.env.SUIVI_API_TARGET || 'http://localhost:8000',
    },
  },
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
