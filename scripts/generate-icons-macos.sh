#!/bin/bash

# Generate macOS .icns file from source PNG
# Requires: macOS with sips (built-in) and iconutil (built-in)

set -e

# Check if source icon exists
if [ ! -f "assets/icon.png" ]; then
  echo "❌ Error: assets/icon.png not found!"
  echo "Please create a 1024x1024 PNG icon first."
  exit 1
fi

echo "🎨 Generating macOS .icns icon from assets/icon.png..."

# Create temporary iconset directory
ICONSET_DIR="assets/icon.iconset"
rm -rf "$ICONSET_DIR"
mkdir -p "$ICONSET_DIR"

# Generate all required sizes
echo "  📐 Generating multiple resolutions..."
sips -z 16 16     assets/icon.png --out "$ICONSET_DIR/icon_16x16.png" > /dev/null 2>&1
sips -z 32 32     assets/icon.png --out "$ICONSET_DIR/icon_16x16@2x.png" > /dev/null 2>&1
sips -z 32 32     assets/icon.png --out "$ICONSET_DIR/icon_32x32.png" > /dev/null 2>&1
sips -z 64 64     assets/icon.png --out "$ICONSET_DIR/icon_32x32@2x.png" > /dev/null 2>&1
sips -z 128 128   assets/icon.png --out "$ICONSET_DIR/icon_128x128.png" > /dev/null 2>&1
sips -z 256 256   assets/icon.png --out "$ICONSET_DIR/icon_128x128@2x.png" > /dev/null 2>&1
sips -z 256 256   assets/icon.png --out "$ICONSET_DIR/icon_256x256.png" > /dev/null 2>&1
sips -z 512 512   assets/icon.png --out "$ICONSET_DIR/icon_256x256@2x.png" > /dev/null 2>&1
sips -z 512 512   assets/icon.png --out "$ICONSET_DIR/icon_512x512.png" > /dev/null 2>&1
sips -z 1024 1024 assets/icon.png --out "$ICONSET_DIR/icon_512x512@2x.png" > /dev/null 2>&1

# Generate .icns file
echo "  🔨 Creating .icns file..."
iconutil -c icns "$ICONSET_DIR" -o assets/icon.icns

# Clean up
rm -rf "$ICONSET_DIR"

echo "✅ Successfully generated assets/icon.icns!"
echo ""
echo "📋 Icon status:"
node scripts/generate-icons.js
