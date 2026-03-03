import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin';

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/web',
  plugins: [react(), nxViteTsPaths()],
  server: {
    port: 4200,
    host: true,
  },
  preview: {
    port: 4200,
    host: true,
  },
  build: {
    outDir: '../../dist/src/apps/web',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
