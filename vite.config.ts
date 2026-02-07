import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // This injects your API key into the process.env object at build time
    'process.env.API_KEY': JSON.stringify("AIzaSyD-B5CAzUdboUr80WsspHOK_xnIOFKEWdI"),
  },
  server: {
    port: 3000,
  }
});