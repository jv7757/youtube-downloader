const { contextBridge, ipcRenderer } = require('electron');

// 暴露安全的API给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 设置相关
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  selectDownloadPath: () => ipcRenderer.invoke('select-download-path'),

  // 视频下载相关
  getVideoInfo: (url) => ipcRenderer.invoke('get-video-info', url),
  downloadVideo: (options) => ipcRenderer.invoke('download-video', options),
  cancelDownload: () => ipcRenderer.invoke('cancel-download'),
  onDownloadProgress: (callback) => {
    ipcRenderer.on('download-progress', (event, progress) => callback(progress));
  },

  // yt-dlp相关
  updateYtdlp: () => ipcRenderer.invoke('update-ytdlp'),
  checkYtdlp: () => ipcRenderer.invoke('check-ytdlp')
});
