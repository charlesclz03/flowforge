'use strict'

module.exports = [
  {
    urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'google-fonts-webfonts',
      expiration: {
        maxEntries: 4,
        maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
      },
    },
  },
  {
    urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'google-fonts-stylesheets',
      expiration: {
        maxEntries: 4,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      },
    },
  },
  {
    urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'static-font-assets',
      expiration: {
        maxEntries: 4,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
      },
    },
  },
  {
    urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'static-image-assets',
      expiration: {
        maxEntries: 64,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      },
    },
  },
  {
    urlPattern: /\.(?:mp3|wav|ogg)$/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'audio-assets',
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      },
      rangeRequests: true, // Important for audio seeking
    },
  },
  {
    urlPattern: /\/_next\/image\?url=.+$/i,
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'next-image',
      expiration: {
        maxEntries: 64,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      },
    },
  },
  {
    urlPattern: /\.(?:mp4|webm)$/i,
    handler: 'CacheFirst',
    options: {
      cacheName: 'static-video-assets',
      expiration: {
        maxEntries: 32,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      },
      rangeRequests: true,
    },
  },
  {
    urlPattern: /^https:\/\/.*\.googleapis\.com\/.*$/i, // Supabase/Google Storage
    handler: 'StaleWhileRevalidate',
    options: {
      cacheName: 'storage-assets',
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 24 * 60 * 60, // 24 hours
      },
      rangeRequests: true,
    },
  },
]
