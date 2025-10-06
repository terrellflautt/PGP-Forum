#!/usr/bin/env node

/**
 * PWA Icon Generator
 * Generates all required PWA icons from source image
 *
 * This script creates optimized icons for:
 * - Standard PWA icons (192x192, 512x512)
 * - Maskable icons (safe zone for Android)
 * - Apple touch icons (iOS)
 * - Favicons
 */

const fs = require('fs');
const path = require('path');

// Icon configurations
const iconSizes = [
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 192, name: 'icon-192-maskable.png', maskable: true },
  { size: 512, name: 'icon-512-maskable.png', maskable: true }
];

console.log('🎨 PWA Icon Generator');
console.log('====================\n');

const publicDir = path.join(__dirname, '..', 'public');
const sourceIcon = path.join(publicDir, 'logo512.png');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
  console.log('✓ Using sharp for high-quality icon generation');
} catch (err) {
  console.log('⚠ sharp not found. Install with: npm install --save-dev sharp');
  console.log('📝 Using existing icons from public/logo192.png and public/logo512.png\n');
  generateFallbackIcons();
  process.exit(0);
}

// Check if source exists
if (!fs.existsSync(sourceIcon)) {
  console.error('❌ Source icon not found:', sourceIcon);
  console.log('Please provide a logo512.png file in the public directory');
  process.exit(1);
}

async function generateIcons() {
  console.log(`📂 Source: ${sourceIcon}\n`);

  for (const config of iconSizes) {
    const outputPath = path.join(publicDir, config.name);

    try {
      let pipeline = sharp(sourceIcon).resize(config.size, config.size, {
        fit: 'contain',
        background: { r: 10, g: 0, b: 18, alpha: 1 } // #0a0012
      });

      // Add safe zone for maskable icons (80% of icon size)
      if (config.maskable) {
        const safeZoneSize = Math.floor(config.size * 0.8);
        const padding = Math.floor((config.size - safeZoneSize) / 2);

        pipeline = sharp(sourceIcon)
          .resize(safeZoneSize, safeZoneSize, { fit: 'contain' })
          .extend({
            top: padding,
            bottom: padding,
            left: padding,
            right: padding,
            background: { r: 10, g: 0, b: 18, alpha: 1 }
          });
      }

      await pipeline.png({ quality: 100 }).toFile(outputPath);
      console.log(`✓ Generated ${config.name} (${config.size}x${config.size}${config.maskable ? ' - maskable' : ''})`);
    } catch (err) {
      console.error(`❌ Failed to generate ${config.name}:`, err.message);
    }
  }

  console.log('\n✨ Icon generation complete!\n');
  console.log('📋 Next steps:');
  console.log('1. Copy existing icons if needed:');
  console.log('   cp public/logo192.png public/icon-192.png');
  console.log('   cp public/logo512.png public/icon-512.png');
  console.log('2. Update manifest.json with new icon paths');
  console.log('3. Add iOS meta tags to index.html');
}

function generateFallbackIcons() {
  console.log('📋 Creating fallback icon structure...\n');

  // Copy existing icons to new names
  const iconMappings = [
    { from: 'logo192.png', to: 'icon-192.png' },
    { from: 'logo512.png', to: 'icon-512.png' },
    { from: 'logo192.png', to: 'icon-192-maskable.png' },
    { from: 'logo512.png', to: 'icon-512-maskable.png' },
    { from: 'logo192.png', to: 'apple-touch-icon.png' }
  ];

  for (const mapping of iconMappings) {
    const fromPath = path.join(publicDir, mapping.from);
    const toPath = path.join(publicDir, mapping.to);

    if (fs.existsSync(fromPath) && !fs.existsSync(toPath)) {
      fs.copyFileSync(fromPath, toPath);
      console.log(`✓ Copied ${mapping.from} → ${mapping.to}`);
    }
  }

  console.log('\n✨ Fallback icons created!\n');
  console.log('⚠ For production, install sharp for optimized maskable icons:');
  console.log('  npm install --save-dev sharp');
  console.log('  node scripts/generate-icons.js');
}

// Run icon generation
if (sharp) {
  generateIcons().catch(err => {
    console.error('❌ Icon generation failed:', err);
    process.exit(1);
  });
}
