# 航南生存模拟器：气味危机 V7 Render Fix

这个版本用于修复 GitHub Pages 上旧 CSS 缓存导致的“页面渲染效果消失”。

## 关键修复

- `index.html` 不再引用 `style.css`，而是引用 `style-v7.css?v=7`
- `index.html` 不再引用 `script.js`，而是引用 `script-v7.js?v=7`
- 这样浏览器不会继续使用旧缓存文件
- 每回合仍然只随机出现 4 个可用选项
- 每天第 3 回合固定宿舍
- 所有道具初始数量都是 1

## 上传方式

请把 ZIP 解压后的 4 个文件全部上传到 GitHub 仓库根目录：

- index.html
- style-v7.css
- script-v7.js
- README.md

注意：可以不删除旧的 style.css 和 script.js，因为本版本已经不引用它们。
上传后等待 1–3 分钟，再使用 Ctrl + F5 强制刷新网页。
