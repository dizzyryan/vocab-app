// Simple SVG-based PWA icons generator
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateSVGIcon(size) {
  const starSize = size * 0.3;
  const smallSize = size * 0.08;
  const strokeWidth = size * 0.04;
  const center = size / 2;
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#a855f7;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <rect width="${size}" height="${size}" fill="url(#grad)"/>
  
  <!-- Main star -->
  <line x1="${center}" y1="${center - starSize}" x2="${center}" y2="${center + starSize}" 
        stroke="white" stroke-width="${strokeWidth}" stroke-linecap="round"/>
  <line x1="${center - starSize}" y1="${center}" x2="${center + starSize}" y2="${center}" 
        stroke="white" stroke-width="${strokeWidth}" stroke-linecap="round"/>
  <line x1="${center - starSize * 0.7}" y1="${center - starSize * 0.7}" 
        x2="${center + starSize * 0.7}" y2="${center + starSize * 0.7}" 
        stroke="white" stroke-width="${strokeWidth}" stroke-linecap="round"/>
  <line x1="${center - starSize * 0.7}" y1="${center + starSize * 0.7}" 
        x2="${center + starSize * 0.7}" y2="${center - starSize * 0.7}" 
        stroke="white" stroke-width="${strokeWidth}" stroke-linecap="round"/>
  
  <!-- Small sparkles -->
  ${[
    [size * 0.25, size * 0.25],
    [size * 0.75, size * 0.25],
    [size * 0.25, size * 0.75],
    [size * 0.75, size * 0.75]
  ].map(([x, y]) => `
  <line x1="${x}" y1="${y - smallSize}" x2="${x}" y2="${y + smallSize}" 
        stroke="white" stroke-width="${strokeWidth}" stroke-linecap="round"/>
  <line x1="${x - smallSize}" y1="${y}" x2="${x + smallSize}" y2="${y}" 
        stroke="white" stroke-width="${strokeWidth}" stroke-linecap="round"/>`
  ).join('')}
</svg>`;
}

// Generate icons
const publicDir = path.join(__dirname, 'public');

// Create 192x192 SVG
fs.writeFileSync(
  path.join(publicDir, 'pwa-192x192.svg'),
  generateSVGIcon(192)
);

// Create 512x512 SVG
fs.writeFileSync(
  path.join(publicDir, 'pwa-512x512.svg'),
  generateSVGIcon(512)
);

console.log('✓ Generated pwa-192x192.svg');
console.log('✓ Generated pwa-512x512.svg');
console.log('\nNote: SVG icons work for PWA. For better compatibility, you can convert these to PNG using an online tool or image editor.');
