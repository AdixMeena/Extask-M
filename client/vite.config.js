import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Fail loudly instead of moving to another port, which CORS would block.
    strictPort: true,
  },
});
