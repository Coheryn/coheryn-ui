import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { coherynui } from '@coheryn/coherynui-vite-plugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    coherynui({
      layerPrefix: 'cyn',
      variablePrefix: 'cyn',
    }),
    react(),
  ],
});
