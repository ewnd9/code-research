import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import rsc from '@vitejs/plugin-rsc';

export default defineConfig({
  plugins: [
    react(),
    rsc({
      entries: {
        rsc: './src/entry.rsc.tsx',
        ssr: './src/entry.ssr.tsx',
        client: './src/entry.browser.tsx',
      },
    }),
  ],
  environments: {
    rsc: {
      build: {
        outDir: 'dist/rsc',
        rollupOptions: {
          input: { index: './src/entry.rsc.tsx' },
        },
      },
    },
    ssr: {
      build: {
        outDir: 'dist/ssr',
        rollupOptions: {
          input: { index: './src/entry.ssr.tsx' },
        },
      },
    },
    client: {
      build: {
        outDir: 'dist/client',
        rollupOptions: {
          input: { index: './src/entry.browser.tsx' },
        },
      },
    },
  },
});
