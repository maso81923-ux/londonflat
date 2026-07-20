import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-icon.svg', 'pwa-icon-192x192.png', 'pwa-icon-512x512.png', 'robots.txt'],
      manifest: {
        name: 'LondonFlat — Premium London Living',
        short_name: 'LondonFlat',
        description: 'The premier marketplace for high-performance real estate and flat-sharing in Greater London. Find verified premium flats, rooms, and apartments.',
        theme_color: '#020617',
        background_color: '#020617',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone'],
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        id: 'uk.londonflat.app',
        lang: 'en-GB',
        categories: ['real estate', 'property', 'lifestyle'],
        icons: [
          {
            src: 'pwa-icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'pwa-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [],
        prefer_related_applications: false,
        shortcuts: [
          {
            name: 'Browse Listings',
            short_name: 'Listings',
            description: 'Explore available properties in London',
            url: '/listings',
            icons: [{ src: 'pwa-icon-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Services',
            short_name: 'Services',
            description: 'Find London living service providers',
            url: '/services',
            icons: [{ src: 'pwa-icon-192x192.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,txt,xml}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'unsplash-images',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/api\.dicebear\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'avatar-images',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      },
      pwaAssets: {
        disabled: false
      }
    })
  ],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
})