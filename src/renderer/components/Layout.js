import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Layout.css';

function Layout({ children, theme, toggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/download', icon: '⬇', label: '下载' },
    { path: '/settings', icon: '⚙', label: '设置' }
  ];

  return (
    <div className="layout">
      <nav className="sidebar">
        <div className="app-logo">
          <div className="logo-icon">▶</div>
          <h1 className="app-title">YouTube</h1>
        </div>

        <ul className="menu">
          {menuItems.map((item) => (
            <li
              key={item.path}
              className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <button className="theme-toggle" onClick={toggleTheme} title="切换主题">
            <span className="theme-icon">{theme === 'light' ? '🌙' : '☀️'}</span>
            <span className="theme-label">{theme === 'light' ? '黑暗模式' : '明亮模式'}</span>
          </button>
          <div className="version">v1.0.0</div>
        </div>
      </nav>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;
