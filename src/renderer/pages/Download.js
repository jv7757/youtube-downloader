import React, { useState, useEffect } from 'react';
import '../styles/Download.css';

function Download() {
  const [url, setUrl] = useState('');
  const [videoInfo, setVideoInfo] = useState(null);
  const [resolution, setResolution] = useState('');
  const [format, setFormat] = useState('mp4');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    // 加载设置
    window.electronAPI.getSettings().then(setSettings);

    // 监听下载进度
    window.electronAPI.onDownloadProgress((prog) => {
      setProgress(prog);
    });
  }, []);

  useEffect(() => {
    if (settings && !resolution && videoInfo) {
      // 使用默认分辨率
      const defaultRes = settings.defaultResolution;
      if (videoInfo.resolutions.includes(defaultRes)) {
        setResolution(defaultRes);
      } else if (videoInfo.resolutions.length > 0) {
        setResolution(videoInfo.resolutions[0]);
      }
    }
  }, [settings, videoInfo]);

  const handleGetInfo = async () => {
    if (!url.trim()) {
      setError('请输入视频URL');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setVideoInfo(null);

    try {
      const info = await window.electronAPI.getVideoInfo(url);
      setVideoInfo(info);

      // 设置默认值
      if (settings && settings.defaultResolution && info.resolutions.includes(settings.defaultResolution)) {
        setResolution(settings.defaultResolution);
      } else if (info.resolutions.length > 0) {
        setResolution(info.resolutions[0]);
      }

      if (info.formats.length > 0) {
        setFormat(info.formats[0]);
      }
    } catch (err) {
      setError(err.message || '获取视频信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!videoInfo) {
      setError('请先获取视频信息');
      return;
    }

    setDownloading(true);
    setProgress(0);
    setError('');
    setSuccess('');

    try {
      const result = await window.electronAPI.downloadVideo({
        url,
        resolution,
        format
      });

      setSuccess(`下载完成！文件保存在: ${result.path}`);
      setProgress(100);
    } catch (err) {
      setError(err.message || '下载失败');
    } finally {
      setDownloading(false);
    }
  };

  const handleCancel = async () => {
    await window.electronAPI.cancelDownload();
    setDownloading(false);
    setProgress(0);
    setError('下载已取消');
  };

  const formatDuration = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="download-page">
      <div className="page-header">
        <h2 className="page-title">视频下载</h2>
        <p className="page-subtitle">输入YouTube视频链接开始下载</p>
      </div>

      <div className="download-container">
        <div className="input-section">
          <div className="url-input-group">
            <input
              type="text"
              className="url-input"
              placeholder="输入YouTube视频URL (例如: https://www.youtube.com/watch?v=...)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !loading && handleGetInfo()}
              disabled={loading || downloading}
            />
            <button
              className={`btn btn-primary ${loading ? 'loading' : ''}`}
              onClick={handleGetInfo}
              disabled={loading || downloading}
            >
              {loading ? '获取中...' : '获取信息'}
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error fade-in">
            <span className="alert-icon">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="alert alert-success fade-in">
            <span className="alert-icon">✓</span>
            <span>{success}</span>
          </div>
        )}

        {videoInfo && (
          <div className="video-info fade-in">
            <div className="video-preview">
              {videoInfo.thumbnail && (
                <img src={videoInfo.thumbnail} alt="Video thumbnail" className="thumbnail" />
              )}
              <div className="video-details">
                <h3 className="video-title">{videoInfo.title}</h3>
                {videoInfo.duration && (
                  <p className="video-duration">时长: {formatDuration(videoInfo.duration)}</p>
                )}
              </div>
            </div>

            <div className="download-options">
              <div className="option-group">
                <label className="option-label">分辨率</label>
                <select
                  className="select"
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  disabled={downloading}
                >
                  {videoInfo.resolutions.map((res) => (
                    <option key={res} value={res}>
                      {res}
                    </option>
                  ))}
                </select>
              </div>

              <div className="option-group">
                <label className="option-label">格式</label>
                <select
                  className="select"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  disabled={downloading}
                >
                  {videoInfo.formats.map((fmt) => (
                    <option key={fmt} value={fmt}>
                      {fmt.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {downloading && (
              <div className="progress-section">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="progress-text">{progress.toFixed(1)}%</p>
              </div>
            )}

            <div className="action-buttons">
              {!downloading ? (
                <button className="btn btn-success btn-large" onClick={handleDownload}>
                  <span className="btn-icon">⬇</span>
                  <span>开始下载</span>
                </button>
              ) : (
                <button className="btn btn-danger btn-large" onClick={handleCancel}>
                  <span className="btn-icon">✕</span>
                  <span>取消下载</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Download;
