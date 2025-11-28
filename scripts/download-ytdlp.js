#!/usr/bin/env node

/**
 * Download yt-dlp binaries for all platforms
 * Used in CI/CD and can be run locally
 */

const fs = require('fs');
const https = require('https');
const { execSync } = require('child_process');
const path = require('path');

// Create directories
const platforms = ['win', 'mac', 'linux'];
platforms.forEach(platform => {
  const dir = path.join(__dirname, '..', 'resources', 'bin', platform);
  fs.mkdirSync(dir, { recursive: true });
});

console.log('Downloading yt-dlp binaries...');

/**
 * Download file from URL
 * @param {string} url - URL to download from
 * @param {string} dest - Destination file path
 */
function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);

    https.get(url, (response) => {
      // Follow redirects
      if (response.statusCode === 302 || response.statusCode === 301) {
        file.close();
        download(response.headers.location, dest).then(resolve).catch(reject);
      } else if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close(() => resolve());
        });
        file.on('error', (err) => {
          file.close();
          fs.unlink(dest, () => reject(err));
        });
      } else {
        file.close();
        reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      fs.unlink(dest, () => reject(err));
    });
  });
}

/**
 * Download all yt-dlp binaries
 */
async function downloadAll() {
  try {
    // Windows
    await download(
      'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe',
      path.join(__dirname, '..', 'resources', 'bin', 'win', 'yt-dlp.exe')
    );
    console.log('✓ Windows yt-dlp downloaded');

    // macOS
    const macPath = path.join(__dirname, '..', 'resources', 'bin', 'mac', 'yt-dlp');
    await download(
      'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_macos',
      macPath
    );
    if (process.platform !== 'win32') {
      execSync(`chmod +x "${macPath}"`, { stdio: 'inherit' });
    }
    console.log('✓ macOS yt-dlp downloaded');

    // Linux
    const linuxPath = path.join(__dirname, '..', 'resources', 'bin', 'linux', 'yt-dlp');
    await download(
      'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp_linux',
      linuxPath
    );
    if (process.platform !== 'win32') {
      execSync(`chmod +x "${linuxPath}"`, { stdio: 'inherit' });
    }
    console.log('✓ Linux yt-dlp downloaded');

    console.log('\n✅ All yt-dlp binaries downloaded successfully!\n');

    // Display file sizes
    console.log('File sizes:');
    platforms.forEach(platform => {
      const ext = platform === 'win' ? '.exe' : '';
      const filePath = path.join(__dirname, '..', 'resources', 'bin', platform, `yt-dlp${ext}`);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
        console.log(`  ${platform.padEnd(8)} ${sizeMB} MB`);
      }
    });

  } catch (err) {
    console.error('❌ Error downloading yt-dlp:', err.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  downloadAll();
}

module.exports = { downloadAll };
