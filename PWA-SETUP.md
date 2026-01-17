# PWA Setup Guide

Your vocab app is now a Progressive Web App (PWA)! 🎉

## What's a PWA?

A PWA allows users to:
- **Install the app** on their device (mobile or desktop)
- **Use it offline** with cached data
- **Get a native app-like experience** without app stores

## Features Enabled

✅ **Offline Support** - App works without internet connection
✅ **Installable** - Add to home screen on mobile/desktop
✅ **Auto-updates** - Service worker updates automatically
✅ **Fast Loading** - Assets are cached for quick access
✅ **Network-First Caching** - Supabase API calls cached for 7 days

## How to Install

### On Mobile (iOS/Android)
1. Open the app in your browser
2. Look for "Add to Home Screen" or "Install" prompt
3. Follow the installation steps
4. App icon will appear on your home screen

### On Desktop (Chrome/Edge)
1. Open the app in Chrome or Edge
2. Look for the install icon (⊕) in the address bar
3. Click "Install"
4. App will open in its own window

## Testing PWA Locally

1. Build the app:
   ```bash
   npm run build
   npm run preview
   ```

2. Open Chrome DevTools
3. Go to "Application" tab
4. Check "Manifest" and "Service Workers" sections

## Icon Files

The following PWA icons have been generated:
- `public/pwa-192x192.svg` - Small icon (192x192)
- `public/pwa-512x512.svg` - Large icon (512x512)

**Note:** For production, you may want to convert these SVG icons to PNG format for better compatibility across all devices.

## Deployment

When deploying to production:
1. Ensure HTTPS is enabled (required for PWA)
2. The service worker will be automatically registered
3. Users will see an install prompt on supported browsers

## Configuration

PWA settings can be modified in `vite.config.ts`:
- App name and description
- Theme colors
- Icon paths
- Caching strategies
- Offline behavior

Enjoy your PWA! 🚀
