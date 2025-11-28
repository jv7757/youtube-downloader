const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const os = require('os');

let mainWindow;
let downloadProcess = null;

const settingsPath = path.join(app.getPath('userData'), 'settings.json');

// 获取打包的 yt-dlp 路径
function getBundledYtdlpPath() {
  // 判断是否在开发模式
  const isDev = !app.isPackaged;

  if (isDev) {
    // 开发模式：尝试使用项目中的 yt-dlp
    const platform = process.platform;
    let devPath;

    if (platform === 'win32') {
      devPath = path.join(__dirname, '../../resources/bin/win/yt-dlp.exe');
    } else if (platform === 'darwin') {
      devPath = path.join(__dirname, '../../resources/bin/mac/yt-dlp');
    } else {
      devPath = path.join(__dirname, '../../resources/bin/linux/yt-dlp');
    }

    // 如果开发模式下存在打包的版本，使用它；否则使用系统的 yt-dlp
    if (fs.existsSync(devPath)) {
      return devPath;
    }
    return 'yt-dlp'; // 使用系统 PATH 中的 yt-dlp
  }

  // 生产模式：使用打包的 yt-dlp
  const platform = process.platform;
  const resourcesPath = process.resourcesPath;

  if (platform === 'win32') {
    return path.join(resourcesPath, 'bin/win/yt-dlp.exe');
  } else if (platform === 'darwin') {
    return path.join(resourcesPath, 'bin/mac/yt-dlp');
  } else {
    return path.join(resourcesPath, 'bin/linux/yt-dlp');
  }
}

// 默认设置
const defaultSettings = {
  defaultResolution: '1080p',
  downloadPath: path.join(app.getPath('downloads'), 'YouTube'),
  proxyUrl: '',
  ytdlpPath: getBundledYtdlpPath()
};

// 读取设置
function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      const savedSettings = JSON.parse(data);

      // 如果保存的设置中没有 ytdlpPath 或者是默认的 'yt-dlp'，使用打包的版本
      if (!savedSettings.ytdlpPath || savedSettings.ytdlpPath === 'yt-dlp') {
        savedSettings.ytdlpPath = getBundledYtdlpPath();
      }

      return { ...defaultSettings, ...savedSettings };
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
      path.join(settings.downloadPath, '%(title)s.%(ext)s'),
      '--newline'
    ];

    if (settings.proxyUrl) {
      args.push('--proxy', settings.proxyUrl);
    }

    args.push(url);

    downloadProcess = spawn(settings.ytdlpPath, args);

    let errorOutput = '';
    let downloadStage = 0; // 0: 视频, 1: 音频, 2: 合并
    let maxProgress = 0; // 追踪最大进度，确保不回退

    const calculateTotalProgress = (stageProgress) => {
      // 分配权重：视频45%，音频45%，合并10%
      if (downloadStage === 0) {
        // 视频阶段：0-45%
        return stageProgress * 0.45;
      } else if (downloadStage === 1) {
        // 音频阶段：45-90%
        return 45 + stageProgress * 0.45;
      } else {
        // 合并阶段：90-100%
        return 90 + stageProgress * 0.10;
      }
    };

    const processOutput = (data) => {
      const output = data.toString();
      const lines = output.split('\n');

      for (const line of lines) {
        // 检测下载阶段
        if (line.includes('[download] Destination:') || line.includes('Downloading video')) {
          if (downloadStage === 0) {
            // 第一次是视频
            downloadStage = 0;
          } else if (downloadStage === 0 && maxProgress > 40) {
            // 如果视频下载已经过了40%，下一个Destination就是音频
            downloadStage = 1;
          }
        } else if (line.includes('[download]') && line.includes('has already been downloaded')) {
          // 文件已存在，跳到下一阶段
          if (downloadStage === 0) {
            maxProgress = Math.max(maxProgress, 45);
            event.sender.send('download-progress', 45);
            downloadStage = 1;
          } else if (downloadStage === 1) {
            maxProgress = Math.max(maxProgress, 90);
            event.sender.send('download-progress', 90);
            downloadStage = 2;
          }
        } else if (line.includes('[Merger]') || line.includes('Merging formats')) {
          // 合并阶段
          downloadStage = 2;
          maxProgress = Math.max(maxProgress, 90);
          event.sender.send('download-progress', 90);
        } else if (line.includes('Deleting original file') || line.includes('[ExtractAudio]')) {
          // 后处理阶段
          downloadStage = 2;
          const progress = 95;
          if (progress > maxProgress) {
            maxProgress = progress;
            event.sender.send('download-progress', progress);
          }
        }

        // 提取进度百分比
        const match = line.match(/\[download\]\s+(\d+\.?\d*)%/);
        if (match) {
          const stageProgress = parseFloat(match[1]);
          const totalProgress = calculateTotalProgress(stageProgress);

          // 确保进度只增不减
          if (totalProgress > maxProgress) {
            maxProgress = totalProgress;
            event.sender.send('download-progress', totalProgress);
          }
        }

        // 检测下载完成（当前阶段）
        if (line.includes('[download] 100%') || line.match(/\[download\]\s+100\.0%/)) {
          if (downloadStage === 0) {
            // 视频下载完成，准备下载音频
            const progress = 45;
            if (progress > maxProgress) {
              maxProgress = progress;
              event.sender.send('download-progress', progress);
            }
            downloadStage = 1;
          } else if (downloadStage === 1) {
            // 音频下载完成，准备合并
            const progress = 90;
            if (progress > maxProgress) {
              maxProgress = progress;
              event.sender.send('download-progress', progress);
            }
            downloadStage = 2;
          }
        }
      }
    };

    downloadProcess.stdout.on('data', (data) => {
      processOutput(data);
    });

    downloadProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      processOutput(data);
    });

    downloadProcess.on('close', (code) => {
      downloadProcess = null;
      if (code === 0) {
        // 确保进度达到100%
        event.sender.send('download-progress', 100);
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
