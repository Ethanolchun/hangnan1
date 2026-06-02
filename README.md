# 航南生存模拟器：气味危机

一个纯前端静态点击小游戏，可直接部署到 GitHub Pages。

## 文件结构

```text
hangnan_survival_simulator/
├── index.html
├── style.css
├── script.js
└── README.md
```

## 本地运行

直接双击 `index.html` 即可打开。

## 部署到 GitHub Pages

1. 新建一个 GitHub 仓库，例如 `hangnan-survival-simulator`
2. 上传这四个文件到仓库根目录
3. 进入仓库 `Settings`
4. 找到 `Pages`
5. Source 选择 `Deploy from a branch`
6. Branch 选择 `main`，目录选择 `/root`
7. 保存后等待一会儿，GitHub 会生成网址

## 修改玩法

主要改 `script.js`：

- `scenes`：场景
- `smellSources`：气味源类型
- `randomEvents`：随机事件
- `actions`：按钮行动
- `getSuccessEnding()`：成功结局
- `getFailureEnding()`：失败结局

## 表达说明

本游戏吐槽的是忽视公共空间卫生的行为，不针对任何现实个人或群体。
