# 应用图标

## 📁 文件说明

这个目录用于存放应用图标文件。

### 需要的文件

```
assets/
├── icon.png   - 源图标/Linux 图标（1024x1024 推荐）
├── icon.ico   - Windows 图标
└── icon.icns  - macOS 图标
```

## 🚀 快速开始

### 1. 准备你的图标

创建一个 **1024x1024 像素** 的 PNG 图标，保存为 `icon.png`。

**设计建议**:
- 正方形，透明背景
- 简洁清晰的设计
- 在小尺寸下也能识别
- 主题：YouTube 下载相关（播放按钮、下载箭头等）

### 2. 转换为平台特定格式

#### 方法 A: 使用在线工具（推荐，最简单）

1. **Windows (.ico)**
   - 访问 https://icoconvert.com/
   - 上传 `icon.png`
   - 下载为 `icon.ico`

2. **macOS (.icns)**
   - 访问 https://cloudconvert.com/png-to-icns
   - 上传 `icon.png`
   - 下载为 `icon.icns`

3. **Linux**
   - 直接使用 `icon.png` 即可

#### 方法 B: 使用自动化工具

```bash
# 1. 安装工具
npm install --save-dev electron-icon-builder

# 2. 生成所有格式
npx electron-icon-builder --input=./assets/icon.png --output=./assets
```

#### 方法 C: macOS 命令行生成

如果你在 macOS 上：

```bash
# 运行这个脚本（需要有 icon.png）
./scripts/generate-icons-macos.sh
```

### 3. 验证图标

```bash
# 检查图标状态
node scripts/generate-icons.js

# 应该显示所有图标都存在（✓）
```

## 📐 尺寸要求

| 平台    | 格式  | 推荐尺寸         |
|---------|-------|------------------|
| 源文件  | PNG   | 1024x1024        |
| Windows | ICO   | 256x256（多尺寸）|
| macOS   | ICNS  | 512x512 或更大   |
| Linux   | PNG   | 512x512          |

## 🎨 图标资源

### 免费图标网站
- [Flaticon](https://www.flaticon.com/)
- [Icons8](https://icons8.com/)
- [IconFinder](https://www.iconfinder.com/)

### 设计工具
- [Canva](https://www.canva.com/) - 在线设计
- [Figma](https://www.figma.com/) - 专业设计
- [GIMP](https://www.gimp.org/) - 免费图像编辑器

## ⚠️ 注意事项

### 如果没有图标会怎样？

- ✅ **可以正常打包**，但会有警告
- ❌ 应用会使用**系统默认图标**
- 建议添加图标以提升专业度

### 提交到 Git

图标文件应该被提交到版本控制：

```bash
git add assets/icon.*
git commit -m "chore: add application icons"
```

### CI/CD 构建

确保图标文件存在于仓库中，否则自动构建的应用将使用默认图标。

## 📖 详细文档

查看 `ICON_GUIDE.md` 获取更详细的说明和教程。

## 💡 临时解决方案

如果你现在想先测试打包，可以暂时跳过图标配置。应用会使用 Electron 默认图标。

等你准备好自定义图标后，按照上面的步骤添加即可。
