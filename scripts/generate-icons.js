#!/usr/bin/env node

/**
 * Simple icon generator script
 * This creates a basic placeholder icon if no icon exists
 * For production, replace with your own icon or use electron-icon-builder
 */

const fs = require('fs');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');

// Ensure assets directory exists
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Check if icon.png exists
const iconPath = path.join(assetsDir, 'icon.png');

if (fs.existsSync(iconPath)) {
  console.log('✓ Icon source file found: assets/icon.png');
  console.log('\nTo generate platform-specific icons, you can:');
  console.log('1. Install electron-icon-builder:');
  console.log('   npm install --save-dev electron-icon-builder');
  console.log('\n2. Run:');
  console.log('   npx electron-icon-builder --input=./assets/icon.png --output=./assets');
  console.log('\nOr follow the guide in assets/ICON_GUIDE.md for manual conversion.');
} else {
  console.log('⚠️  No icon source file found!');
  console.log('\nPlease add your icon file:');
  console.log('1. Create a 1024x1024 PNG image');
  console.log('2. Save it as: assets/icon.png');
  console.log('3. Convert to platform-specific formats:');
  console.log('   - Windows: icon.ico');
  console.log('   - macOS: icon.icns');
  console.log('   - Linux: icon.png (can use the same file)');
  console.log('\nSee assets/ICON_GUIDE.md for detailed instructions.');
  console.log('\n📚 Quick start:');
  console.log('   - Use online converters: https://icoconvert.com/ (ICO)');
  console.log('   - Use online converters: https://cloudconvert.com/png-to-icns (ICNS)');
  console.log('   - Or install: npm install --save-dev electron-icon-builder');
}

// Check for platform-specific icons
console.log('\n--- Icon Status ---');
const icons = {
  'icon.png': 'Source/Linux',
  'icon.ico': 'Windows',
  'icon.icns': 'macOS'
};

Object.entries(icons).forEach(([filename, platform]) => {
  const filePath = path.join(assetsDir, filename);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeMB = (stats.size / 1024).toFixed(2);
    console.log(`✓ ${filename.padEnd(15)} (${platform.padEnd(15)}) - ${sizeMB} KB`);
  } else {
    console.log(`✗ ${filename.padEnd(15)} (${platform.padEnd(15)}) - Missing`);
  }
});

console.log('\nNote: Missing icons will cause build warnings but won\'t prevent building.');
console.log('The app will use system default icons for missing platform icons.\n');
