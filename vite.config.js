import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'RootFacts - Fakta Sayuran AI',
        short_name: 'RootFacts',
        description: 'Kenali berbagai jenis sayuran melalui kamera dan temukan fakta menarik secara instan dengan bantuan kecerdasan buatan.',
        theme_color: '#10b981',
        background_color: '#f9fafb',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icons/apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'apple touch icon',
          },
        ],
        screenshots: [
          {
            src: '/screenshots/narrow.png',
            sizes: '540x720',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'RootFacts Mobile View',
          },
          {
            src: '/screenshots/wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'RootFacts Desktop View',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        additionalManifestEntries: [
          { url: '/model/model.json', revision: null },
          { url: '/model/weights.bin', revision: null },
          { url: '/model/metadata.json', revision: null },
        ],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 365 * 24 * 60 * 60,
              },
            },
          },
          {
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'cdn-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 3001,
    host: true,
  },
});
