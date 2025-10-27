import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: [
          // project alias
          { find: '@', replacement: path.resolve(__dirname, '.') },
          // es-toolkit package on npm has exports that point to files under `dist` but
          // also (incorrectly) references `compat/*` at the package root. Map those
          // imports to the bundled `dist` files so Vite/esbuild can resolve them.
          { find: /^es-toolkit\/compat\/(.*)$/, replacement: path.resolve(__dirname, 'node_modules/es-toolkit/dist/compat/$1.mjs') },
          { find: /^es-toolkit\/array\/(.*)$/, replacement: path.resolve(__dirname, 'node_modules/es-toolkit/dist/array/$1.mjs') },
          { find: /^es-toolkit\/(.*)$/, replacement: path.resolve(__dirname, 'node_modules/es-toolkit/dist/$1.mjs') },
          // fallback for `es-toolkit` root import
          { find: 'es-toolkit', replacement: path.resolve(__dirname, 'node_modules/es-toolkit/dist/index.mjs') },
        ]
      }
    };
});
