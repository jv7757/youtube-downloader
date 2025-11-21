const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');

let mainWindow;
let downloadProcess = null;

const settingsPath = path.join(app.getPath('userData'), 'settings.json');

// 默认设置
const defaultSettings = {
  defaultResolution: '1080p',
  downloadPath: path.join(app.getPath('downloads'), 'YouTube'),
  proxyUrl: '',
  ytdlpPath: 'yt-dlp'
};

// 读取设置
function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      return { ...defaultSettings, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error('Error loading settings:', error);
  }
  return defaultSettings;
}

// 保存设置
function saveSettings(settings) {
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    frame: true,
    backgroundColor: '#f5f5f5',
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers

// 获取设置
ipcMain.handle('get-settings', () => {
  return loadSettings();
});

// 保存设置
ipcMain.handle('save-settings', (event, settings) => {
  return saveSettings(settings);
});

// 选择下载路径
ipcMain.handle('select-download-path', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// 获取视频信息
ipcMain.handle('get-video-info', async (event, url) => {
  const settings = loadSettings();

  return new Promise((resolve, reject) => {
    const args = [
      '--dump-json',
      '--no-playlist'
    ];

    if (settings.proxyUrl) {
      args.push('--proxy', settings.proxyUrl);
    }

    args.push(url);

    const ytdlp = spawn(settings.ytdlpPath, args);
    let output = '';
    let errorOutput = '';

    ytdlp.stdout.on('data', (data) => {
      output += data.toString();
    });

    ytdlp.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    ytdlp.on('close', (code) => {
      if (code === 0) {
        try {
          const info = JSON.parse(output);

          // 提取可用格式
          const formats = info.formats || [];
          const resolutions = [...new Set(formats
            .filter(f => f.height)
            .map(f => `${f.height}p`)
            .sort((a, b) => parseInt(b) - parseInt(a)))];

          resolve({
            title: info.title,
            duration: info.duration,
            thumbnail: info.thumbnail,
            resolutions: resolutions.length > 0 ? resolutions : ['best'],
            formats: ['mp4', 'webm', 'mkv']
          });
        } catch (error) {
          reject(new Error('Failed to parse video info'));
        }
      } else {
        reject(new Error(errorOutput || 'Failed to get video info'));
      }
    });
  });
});

// 下载视频
ipcMain.handle('download-video', async (event, { url, resolution, format }) => {
  const settings = loadSettings();

  // 确保下载目录存在
  if (!fs.existsSync(settings.downloadPath)) {
    fs.mkdirSync(settings.downloadPath, { recursive: true });
  }

  return new Promise((resolve, reject) => {
    const args = [
      '-f',
      resolution === 'best'
        ? `bestvideo[ext=${format}]+bestaudio[ext=m4a]/best[ext=${format}]/best`
        : `bestvideo[height<=${resolution.replace('p', '')}][ext=${format}]+bestaudio[ext=m4a]/best[height<=${resolution.replace('p', '')}][ext=${format}]/best`,
      '--merge-output-format',
      format,
      '-o',
      path.join(settings.downloadPath, '%(title)s.%(ext)s')
    ];

    if (settings.proxyUrl) {
      args.push('--proxy', settings.proxyUrl);
    }

    args.push(url);

    downloadProcess = spawn(settings.ytdlpPath, args);

    let errorOutput = '';

    downloadProcess.stdout.on('data', (data) => {
      const output = data.toString();
      const match = output.match(/(\d+\.?\d*)%/);
      if (match) {
        event.sender.send('download-progress', parseFloat(match[1]));
      }
    });

    downloadProcess.stderr.on('data', (data) => {
      const output = data.toString();
      errorOutput += output;

      const match = output.match(/(\d+\.?\d*)%/);
      if (match) {
        event.sender.send('download-progress', parseFloat(match[1]));
      }
    });

    downloadProcess.on('close', (code) => {
      downloadProcess = null;
      if (code === 0) {
        resolve({ success: true, path: settings.downloadPath });
      } else {
        reject(new Error(errorOutput || 'Download failed'));
      }
    });
  });
});

// 取消下载
ipcMain.handle('cancel-download', () => {
  if (downloadProcess) {
    downloadProcess.kill();
    downloadProcess = null;
    return true;
  }
  return false;
});

// 更新yt-dlp
ipcMain.handle('update-ytdlp', async () => {
  const settings = loadSettings();

  return new Promise((resolve, reject) => {
    const ytdlp = spawn(settings.ytdlpPath, ['-U']);

    let output = '';
    let errorOutput = '';

    ytdlp.stdout.on('data', (data) => {
      output += data.toString();
    });

    ytdlp.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    ytdlp.on('close', (code) => {
      if (code === 0 || output.includes('up to date') || errorOutput.includes('up to date')) {
        resolve({ success: true, message: 'yt-dlp updated successfully' });
      } else {
        reject(new Error(errorOutput || 'Update failed'));
      }
    });
  });
});

// 检查yt-dlp是否安装
ipcMain.handle('check-ytdlp', async () => {
  const settings = loadSettings();

  return new Promise((resolve) => {
    const ytdlp = spawn(settings.ytdlpPath, ['--version']);

    let version = '';

    ytdlp.stdout.on('data', (data) => {
      version += data.toString();
    });

    ytdlp.on('close', (code) => {
      resolve({
        installed: code === 0,
        version: version.trim()
      });
    });
  });
});
