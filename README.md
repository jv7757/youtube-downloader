# YouTube Downloader

一个简洁现代化的 YouTube 视频下载器，基于 Electron 支持跨平台使用。

## 功能特性

- 🎬 **视频下载** - 支持下载 YouTube 视频
- 📺 **多分辨率** - 支持多种视频分辨率（4K、2K、1080p、720p等）
- 🎨 **多格式** - 支持 MP4、WebM、MKV 等格式
- ⚙️ **灵活配置** - 可自定义默认分辨率、下载路径、代理设置
- 🔄 **一键更新** - 内置 yt-dlp 更新功能
- 🎯 **现代UI** - 简洁美观的界面设计
- ✨ **流畅动画** - 精心设计的用户交互动画
- 🌍 **跨平台** - 支持 Windows、macOS、Linux

## 技术栈

- **Electron** - 跨平台桌面应用框架
- **React 18** - 用户界面库
- **Webpack 5** - 模块打包工具
- **yt-dlp** - YouTube 视频下载工具

## 安装要求

### 必需依赖

1. **Node.js** (v16+)
   - 下载: https://nodejs.org/

2. **yt-dlp**
   - macOS/Linux:
     ```bash
     # 使用 pip
     pip install yt-dlp
     
     # 或使用 homebrew (macOS)
     brew install yt-dlp
     ```

   - Windows:
     ```bash
     # 使用 pip
     pip install yt-dlp
     
     # 或下载可执行文件
     # https://github.com/yt-dlp/yt-dlp/releases
     ```

### 可选依赖

- **FFmpeg** - 用于视频格式转换和合并（推荐安装）
  - macOS: `brew install ffmpeg`
  - Ubuntu/Debian: `apt install ffmpeg`
  - Windows: https://ffmpeg.org/download.html

## 安装使用

### 1. 克隆项目

```bash
git clone <repository-url>
cd youtube-downloader
```

### 2. 安装依赖

```bash
npm install
```

### 3. 开发模式运行

```bash
npm run dev
```

### 4. 添加应用图标（可选）

为了让应用有自定义图标，需要准备图标文件：

```bash
# 1. 准备一个 1024x1024 的 PNG 图标，保存为 assets/icon.png

# 2. 转换为平台特定格式
# macOS 用户可以运行：
./scripts/generate-icons-macos.sh

# 或使用在线工具：
# - Windows (.ico): https://icoconvert.com/
# - macOS (.icns): https://cloudconvert.com/png-to-icns

# 3. 检查图标状态
node scripts/generate-icons.js
```

详细说明请查看 `assets/README.md`

### 5. 构建生产版本

```bash
npm run build
```

### 6. 打包应用

```bash
# 打包所有平台
npm run dist

# 打包 Windows 版本
npm run dist:win

# 打包 macOS 版本
npm run dist:mac

# 打包 Linux 版本
npm run dist:linux
```

打包完成后，安装包会生成在 `release` 目录下。

## 使用指南

### 下载视频

1. 启动应用后，会自动进入"下载"页面
2. 在输入框中粘贴 YouTube 视频链接
3. 点击"获取信息"按钮
4. 选择需要的分辨率和格式
5. 点击"开始下载"按钮

### 配置设置

1. 点击左侧导航栏的"设置"
2. 可以配置以下选项：
   - **默认分辨率**: 设置默认的视频分辨率
   - **下载路径**: 选择视频保存位置
   - **代理地址**: 配置网络代理（如需要）
   - **yt-dlp 路径**: 自定义 yt-dlp 可执行文件路径
3. 点击"保存设置"保存配置
4. 点击"更新 yt-dlp"更新下载工具

### 代理设置

如果需要使用代理，在设置页面的"代理地址"中输入代理服务器地址，格式如下：

- HTTP 代理: `http://127.0.0.1:7890`
- HTTPS 代理: `https://127.0.0.1:7890`
- SOCKS5 代理: `socks5://127.0.0.1:1080`

## 项目结构

```
youtube-downloader/
├── src/
│   ├── main/              # Electron 主进程
│   │   ├── main.js        # 主进程入口
│   │   └── preload.js     # 预加载脚本
│   └── renderer/          # React 渲染进程
│       ├── components/    # React 组件
│       ├── pages/         # 页面组件
│       ├── styles/        # CSS 样式
│       ├── App.js         # 应用根组件
│       ├── index.js       # 渲染进程入口
│       └── index.html     # HTML 模板
├── dist/                  # 构建输出目录
├── release/               # 打包输出目录
├── webpack.config.js      # Webpack 配置
├── package.json           # 项目配置
└── README.md             # 项目文档
```

## 开发说明

### 可用脚本

- `npm start` - 构建并启动应用
- `npm run dev` - 开发模式（带热重载）
- `npm run build` - 构建生产版本
- `npm run pack` - 打包应用（不创建安装包）
- `npm run dist` - 打包并创建安装包

### 修改配置

- Electron 配置: `src/main/main.js`
- Webpack 配置: `webpack.config.js`
- 打包配置: `package.json` 中的 `build` 字段

## 常见问题

### 1. yt-dlp 未找到

**问题**: 应用提示找不到 yt-dlp

**解决方案**:
- 确保已安装 yt-dlp: `yt-dlp --version`
- 在设置中配置正确的 yt-dlp 路径
- Windows 用户需要将 yt-dlp.exe 所在目录添加到系统 PATH

### 2. 下载失败

**问题**: 视频下载失败或卡住

**解决方案**:
- 检查网络连接
- 如果在国内，尝试配置代理
- 更新 yt-dlp 到最新版本
- 检查视频链接是否有效

### 3. 视频没有音频

**问题**: 下载的视频没有声音

**解决方案**:
- 安装 FFmpeg
- 确保 FFmpeg 已添加到系统 PATH
- 重新下载视频

### 4. 构建失败

**问题**: npm run build 失败

**解决方案**:
- 删除 node_modules 和 package-lock.json
- 重新运行 `npm install`
- 确保 Node.js 版本 >= 16

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 相关链接

- [yt-dlp](https://github.com/yt-dlp/yt-dlp)
- [Electron](https://www.electronjs.org/)
- [React](https://react.dev/)
- [FFmpeg](https://ffmpeg.org/)
