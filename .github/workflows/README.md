# GitHub Actions Workflows

本目录包含自动化 CI/CD 工作流配置。

## Workflows

### build.yml - 构建和发布
- **触发**: 推送 `v*.*.*` tag 或手动触发
- **平台**: Linux, Windows, macOS
- **操作**: 构建 + 发布到 GitHub Releases

### test.yml - 测试构建
- **触发**: Push/PR 到 main/develop/claude/** 分支
- **平台**: Linux, Windows, macOS  
- **操作**: 构建测试（不发布）

## 发布新版本

```bash
# 1. 更新 package.json 中的 version
# 2. 提交并创建 tag
git commit -am "chore: bump version to 1.1.0"
git tag -a v1.1.0 -m "Release 1.1.0"
git push origin v1.1.0
```