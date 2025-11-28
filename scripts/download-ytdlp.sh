#!/bin/bash

# Script to download yt-dlp binaries for all platforms
# Usage: ./scripts/download-ytdlp.sh

set -e

echo "Creating resources directory structure..."
mkdir -p resources/bin/{win,mac,linux}

echo "Downloading yt-dlp for Windows..."
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe \
  -o resources/bin/win/yt-dlp.exe

echo "Downloading yt-dlp for macOS..."
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos \
  -o resources/bin/mac/yt-dlp
chmod +x resources/bin/mac/yt-dlp

echo "Downloading yt-dlp for Linux..."
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux \
  -o resources/bin/linux/yt-dlp
chmod +x resources/bin/linux/yt-dlp

echo ""
echo "✓ All yt-dlp binaries downloaded successfully!"
echo ""
echo "File sizes:"
ls -lh resources/bin/win/yt-dlp.exe
ls -lh resources/bin/mac/yt-dlp
ls -lh resources/bin/linux/yt-dlp
