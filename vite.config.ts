import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative base so the built `dist/` folder works from any path (GitHub Pages, USB stick, kiosk laptop).
  base: './',
  test: {
    environment: 'node',
  },
});
