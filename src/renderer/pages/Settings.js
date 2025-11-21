import React, { useState, useEffect } from 'react';
import '../styles/Settings.css';

function Settings() {
  const [settings, setSettings] = useState({
    defaultResolution: '1080p',
    downloadPath: '',
    proxyUrl: '',
    ytdlpPath: 'yt-dlp'
  });

  const [ytdlpInfo, setYtdlpInfo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadSettings();
    checkYtdlp();
  }, []);

  const loadSettings = async () => {
    try {
      const loadedSettings = await window.electronAPI.getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      showMessage('error', '加载设置失败');
    }
  };

  const checkYtdlp = async () => {
    try {
      const info = await window.electronAPI.checkYtdlp();
      setYtdlpInfo(info);
    } catch (error) {
      console.error('Check yt-dlp failed:', error);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const success = await window.electronAPI.saveSettings(settings);
      if (success) {
        showMessage('success', '设置保存成功');
      } else {
        showMessage('error', '设置保存失败');
      }
    } catch (error) {
      showMessage('error', '设置保存失败');
    } finally {
      setSaving(false);
    }
  };

  const handleSelectPath = async () => {
    const path = await window.electronAPI.selectDownloadPath();
    if (path) {
      setSettings({ ...settings, downloadPath: path });
    }
  };

  const handleUpdateYtdlp = async () => {
    setUpdating(true);
    try {
      const result = await window.electronAPI.updateYtdlp();
      if (result.success) {
        showMessage('success', 'yt-dlp 更新成功');
        checkYtdlp();
      } else {
        showMessage('error', 'yt-dlp 更新失败');
      }
    } catch (error) {
      showMessage('error', error.message || 'yt-dlp 更新失败');
    } finally {
      setUpdating(false);
    }
  };

  const resolutionOptions = [
    { value: '2160p', label: '4K (2160p)' },
    { value: '1440p', label: '2K (1440p)' },
    { value: '1080p', label: 'Full HD (1080p)' },
    { value: '720p', label: 'HD (720p)' },
    { value: '480p', label: 'SD (480p)' },
    { value: '360p', label: '360p' },
    { value: 'best', label: '最佳质量' }
  ];

  return (
    <div className="settings-page">
      <div className="page-header">
        <h2 className="page-title">设置</h2>
        <p className="page-subtitle">配置应用参数和下载选项</p>
      </div>

      <div className="settings-container">
        {message.text && (
          <div className={`alert alert-${message.type} fade-in`}>
            <span className="alert-icon">{message.type === 'success' ? '✓' : '⚠'}</span>
            <span>{message.text}</span>
          </div>
        )}

        <div className="settings-section">
          <h3 className="section-title">下载设置</h3>

          <div className="setting-item">
            <label className="setting-label">
              <span className="label-text">默认分辨率</span>
              <span className="label-desc">新下载任务的默认视频分辨率</span>
            </label>
            <select
              className="select"
              value={settings.defaultResolution}
              onChange={(e) => setSettings({ ...settings, defaultResolution: e.target.value })}
            >
              {resolutionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="setting-item">
            <label className="setting-label">
              <span className="label-text">下载路径</span>
              <span className="label-desc">视频文件的保存位置</span>
            </label>
            <div className="input-with-button">
              <input
                type="text"
                className="input"
                value={settings.downloadPath}
                onChange={(e) => setSettings({ ...settings, downloadPath: e.target.value })}
                placeholder="选择下载路径"
              />
              <button className="btn btn-secondary" onClick={handleSelectPath}>
                浏览
              </button>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3 className="section-title">网络设置</h3>

          <div className="setting-item">
            <label className="setting-label">
              <span className="label-text">代理地址</span>
              <span className="label-desc">HTTP/HTTPS/SOCKS代理 (例如: http://127.0.0.1:7890)</span>
            </label>
            <input
              type="text"
              className="input"
              value={settings.proxyUrl}
              onChange={(e) => setSettings({ ...settings, proxyUrl: e.target.value })}
              placeholder="http://127.0.0.1:7890"
            />
          </div>
        </div>

        <div className="settings-section">
          <h3 className="section-title">高级设置</h3>

          <div className="setting-item">
            <label className="setting-label">
              <span className="label-text">yt-dlp 路径</span>
              <span className="label-desc">yt-dlp 可执行文件的路径或命令名</span>
            </label>
            <input
              type="text"
              className="input"
              value={settings.ytdlpPath}
              onChange={(e) => setSettings({ ...settings, ytdlpPath: e.target.value })}
              placeholder="yt-dlp"
            />
          </div>

          <div className="setting-item">
            <div className="ytdlp-status">
              <div className="status-info">
                <span className="label-text">yt-dlp 状态</span>
                {ytdlpInfo && (
                  <div className="status-details">
                    {ytdlpInfo.installed ? (
                      <>
                        <span className="status-badge status-success">已安装</span>
                        <span className="status-version">版本: {ytdlpInfo.version}</span>
                      </>
                    ) : (
                      <span className="status-badge status-error">未安装</span>
                    )}
                  </div>
                )}
              </div>
              <button
                className={`btn btn-primary ${updating ? 'loading' : ''}`}
                onClick={handleUpdateYtdlp}
                disabled={updating}
              >
                {updating ? '更新中...' : '更新 yt-dlp'}
              </button>
            </div>
            <p className="setting-hint">
              如果未安装 yt-dlp，请访问{' '}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  // 用户需要手动安装
                }}
              >
                https://github.com/yt-dlp/yt-dlp
              </a>
              {' '}进行安装
            </p>
          </div>
        </div>

        <div className="settings-actions">
          <button
            className={`btn btn-success btn-large ${saving ? 'loading' : ''}`}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '保存中...' : '保存设置'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
