import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// fs.allow lets the dev server import the markdown guides that live at the
// repo root (MFE/, revision-sheets/) as ?raw modules.
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: [path.resolve(__dirname, '..')],
    },
  },
});
