# 应用图标指南

## 图标文件位置

将图标文件放在 `assets/` 目录下：

```
assets/
├── icon.png         # 源文件（至少 1024x1024）
├── icon.ico         # Windows 图标
├── icon.icns        # macOS 图标
└── icon-512x512.png # Linux 图标
```

## 不同平台的图标要求

### Windows (.ico)
- **格式**: ICO
- **推荐尺寸**: 256x256 像素（ICO 可包含多个尺寸）
- **支持尺寸**: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256
- **配置**: `package.json` 中 `build.win.icon`

### macOS (.icns)
- **格式**: ICNS
- **推荐尺寸**: 512x512 或 1024x1024 像素
- **支持尺寸**: 16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024
- **配置**: `package.json` 中 `build.mac.icon`

### Linux (.png)
- **格式**: PNG
- **推荐尺寸**: 512x512 像素
- **支持尺寸**: 256x256, 512x512
- **配置**: `package.json` 中 `build.linux.icon`

## 快速开始

### 方法 1: 使用在线工具转换

如果你已经有一个高分辨率的 PNG 图片（推荐 1024x1024）：

1. **准备源图标**: 将 PNG 文件保存为 `assets/icon.png`（至少 1024x1024 像素）

2. **生成 .ico 文件** (Windows):
   - 访问 https://icoconvert.com/
   - 上传 `icon.png`
   - 选择 256x256
   - 下载并保存为 `assets/icon.ico`

3. **生成 .icns 文件** (macOS):
   - 访问 https://cloudconvert.com/png-to-icns
   - 上传 `icon.png`
   - 下载并保存为 `assets/icon.icns`

4. **准备 Linux 图标**:
   ```bash
   # 如果需要调整尺寸到 512x512
   # 使用 ImageMagick 或其他工具
   cp assets/icon.png assets/icon-512x512.png
   ```

### 方法 2: 使用命令行工具

#### 安装 electron-icon-builder

```bash
npm install --save-dev electron-icon-builder
```

#### 准备源图标

将你的图标保存为 `assets/icon.png`（推荐 1024x1024 像素）

#### 生成所有格式

```bash
npx electron-icon-builder --input=./assets/icon.png --output=./assets
```

这会自动生成：
- `icon.ico` (Windows)
- `icon.icns` (macOS)
- 多个尺寸的 PNG 文件

### 方法 3: 在 macOS 上手动生成 .icns

如果你在 macOS 上开发：

```bash
# 创建临时目录
mkdir icon.iconset

# 生成不同尺寸（需要安装 ImageMagick: brew install imagemagick）
sips -z 16 16     assets/icon.png --out icon.iconset/icon_16x16.png
sips -z 32 32     assets/icon.png --out icon.iconset/icon_16x16@2x.png
sips -z 32 32     assets/icon.png --out icon.iconset/icon_32x32.png
sips -z 64 64     assets/icon.png --out icon.iconset/icon_32x32@2x.png
sips -z 128 128   assets/icon.png --out icon.iconset/icon_128x128.png
sips -z 256 256   assets/icon.png --out icon.iconset/icon_128x128@2x.png
sips -z 256 256   assets/icon.png --out icon.iconset/icon_256x256.png
sips -z 512 512   assets/icon.png --out icon.iconset/icon_256x256@2x.png
sips -z 512 512   assets/icon.png --out icon.iconset/icon_512x512.png
sips -z 1024 1024 assets/icon.png --out icon.iconset/icon_512x512@2x.png

# 生成 .icns 文件
iconutil -c icns icon.iconset -o assets/icon.icns

# 清理临时文件
rm -rf icon.iconset
```

## 图标设计建议

### 设计要点

1. **尺寸**: 至少 1024x1024 像素的 PNG 源文件
2. **格式**: 正方形，透明背景
3. **内容**: 简洁清晰，在小尺寸下也能识别
4. **颜色**: 避免过于复杂的渐变和细节

### YouTube Downloader 图标建议

可以考虑以下设计元素：
- YouTube 播放按钮样式（红色三角形）
- 下载箭头（↓）
- 视频/媒体相关图标
- 应用名称首字母（Y 或 YD）

### 示例资源

- **免费图标**:
  - https://www.flaticon.com/
  - https://icons8.com/
  - https://www.iconfinder.com/
- **在线设计**:
  - https://www.canva.com/
  - https://www.figma.com/

## 验证图标

### 检查文件是否存在

```bash
ls -lh assets/icon.*
```

应该看到：
```
assets/icon.icns        # macOS
assets/icon.ico         # Windows
assets/icon.png         # 源文件
assets/icon-512x512.png # Linux (可选)
```

### 测试构建

```bash
# 测试打包（不创建安装包）
npm run pack

# 检查打包后的应用是否有图标
```

## 常见问题

### Q: 打包后图标不显示？

A: 检查：
1. 图标文件路径是否正确
2. 图标格式是否匹配平台要求
3. 清理缓存后重新构建: `rm -rf dist release && npm run build && npm run dist`

### Q: macOS 上图标模糊？

A: 确保 .icns 文件包含 @2x 的高分辨率版本（Retina 显示屏）

### Q: Windows 图标显示默认图标？

A: 确保 .ico 文件包含多个尺寸，特别是 256x256

### Q: 需要为 CI/CD 准备图标吗？

A: 是的！确保图标文件被提交到 git：
```bash
git add assets/icon.*
git commit -m "chore: add application icons"
git push
```

## 示例配置

`package.json` 中的配置：

```json
{
  "build": {
    "appId": "com.youtube.downloader",
    "productName": "YouTube Downloader",
    "win": {
      "icon": "assets/icon.ico"
    },
    "mac": {
      "icon": "assets/icon.icns"
    },
    "linux": {
      "icon": "assets/icon.png"
    }
  }
}
```
