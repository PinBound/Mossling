/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { execSync } from 'node:child_process';

// Shown in Settings so you can tell which version is running.
const commit = (() => {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7);
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'dev';
  }
})();
const BUILD = { commit: process.env.BUILD_ID ?? commit, builtAt: new Date().toISOString() };

export default defineConfig({
  // GitHub Pages serves the game from /Mossling/; local dev and preview use /.
  base: process.env.BASE_PATH ?? '/',
  define: { __BUILD__: JSON.stringify(BUILD) },
  plugins: [
    react(),
    VitePWA({
      // 'prompt': the game decides when to switch versions (it saves first, and never mid-play).
      registerType: 'prompt',
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      manifest: {
        name: 'Mossling',
        short_name: 'Mossling',
        description:
          'A tiny moss-and-moth creature to care for, living in a clearing called the Hollow.',
        theme_color: '#3F5E3A',
        background_color: '#1E2A3A',
        display: 'standalone',
        orientation: 'any',
        start_url: '.',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,webp,svg,woff2,webmanifest}'],
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
      },
    }),
  ],
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['src/sim/**/*.ts'],
      exclude: ['src/sim/**/*.test.ts', 'src/sim/types.ts'],
      thresholds: { lines: 90, statements: 90, functions: 90, branches: 85 },
    },
  },
});
