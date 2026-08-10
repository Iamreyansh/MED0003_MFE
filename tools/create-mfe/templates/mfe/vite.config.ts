import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { federation } from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: '__FEDERATION__',
      filename: 'remoteEntry.js',
      manifest: true,
      exposes: {
        './Mfe': './src/mfe/Mfe.tsx',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '18.3.1',
          strictVersion: true,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '18.3.1',
          strictVersion: true,
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
  build: {
    target: 'chrome89',
    cssCodeSplit: false,
  },
  server: {
    origin: 'http://localhost:__PORT__',
    cors: true,
  },
  preview: {
    cors: true,
  },
});
