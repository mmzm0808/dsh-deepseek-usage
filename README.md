# 📊 dsh-deepseek-usage

[English](README_EN.md) | 中文

## DeepSeek API 用量监测插件 

### 【峰谷提示】【实时余额】【实际价格涨幅计算】

右侧悬浮球显示充值余额，点击展开面板展示开放平台真实余额、累计消费、今日消费、API 请求次数、Tokens、分模型今日用量，并实时计算 8 月 17 日后的**实际涨价倍率** R0。

<p align="center">
  <img src="https://raw.githubusercontent.com/mmzm0808/dsh-deepseek-usage/master/docs/preview-light.jpg" alt="浅色模式预览" width="45%">
  <img src="https://raw.githubusercontent.com/mmzm0808/dsh-deepseek-usage/master/docs/preview-dark.jpg" alt="深色模式预览" width="45%">
</p>

<p align="center">
  <img alt="license" src="https://img.shields.io/badge/license-MIT-blue">
  <img alt="version" src="https://img.shields.io/badge/version-v0.1.0-blueviolet">
  <img alt="runtime" src="https://img.shields.io/badge/runtime-dsh%20web-4d6bfe">
</p>

## ✨ 特性

| 分类 | 说明 |
|---|---|
| 🟢 悬浮球 | 默认停靠右侧，可拖动上下移动，拖到左半边自动吸附左侧 |
| 📋 用量面板 | 充值余额、赠金余额、累计消费、今日消费、API 请求次数、Tokens、分模型用量 |
| 📈 R0 涨价倍率 | 实时计算 `A2 / A1`，其中 `A1` 为 8 月 17 日前每 Token 平均消费，`A2` 为 8 月 17 日起每 Token 平均消费 |
| 🔐 登录机制 | 未配置 userToken 时，可打开本地 Chrome / Edge / Brave / Chromium 等浏览器登录开放平台，自动读取并保存 userToken |
| 🚪 退出登录 | 一键清除本机保存的 userToken，方便切换账号重新登录 |
| 🖱️ 交互 | 点击面板外部自动收起；支持键盘 Esc 关闭；支持 reduced motion |

## 🚀 安装

### Git 安装

```sh
dsh plugin --profile web add github:mmzm0808/dsh-deepseek-usage
```

### 本地开发安装

```sh
dsh plugin --profile web add "<本仓库本地绝对路径>"
```

- 仓库已提交完整 `lib/` 构建产物，安装**无需执行构建脚本**（pnpm ≥10 的 allowBuilds 门禁不影响本插件）
- 安装后**重启 dsh**（新 bundle 层在启动时加载）
- DSH 插件开发使用 **pnpm**；GitHub 分发不要求发布 npm

## 📖 使用

1. **查看**：右侧悬浮球直接显示充值余额，点击展开用量面板
2. **拖动**：按住悬浮球上下拖动；松手时根据位置自动吸附左侧或右侧
3. **登录**：未登录时点击面板底部「登录」，在打开的 Chrome / Edge / Brave / Chromium 等浏览器窗口中登录 DeepSeek 开放平台
4. **退出登录**：点击面板底部「退出登录」，清除本机 userToken 后重新登录
5. **收起**：点击面板外部任意位置、Esc 或面板右上角 ✕ 均可收起

## 🔑 登录与配置

### ✅ 推荐方式：面板一键登录

不需要手动复制任何 token。

1. 打开悬浮球面板
2. 点击面板底部 **「登录」**
3. 插件会打开本地 Chrome / Edge / Brave / Chromium 等浏览器窗口进入 DeepSeek 开放平台
4. 你在窗口中正常登录
5. 登录成功后插件自动读取并保存 `userToken`，然后自动刷新数据

> 默认自动查找 Chrome、Edge、Brave、Chromium 等浏览器；也可通过环境变量 `DSH_DEEPSEEK_LOGIN_BROWSER` 指定浏览器可执行文件路径。

### 手动配置（可选）

`userToken` 是平台 Web 登录态，只作为配置项，不写入插件源码/包内。

在 profile 的 `cordis.patch.yml` 中配置：

```yaml
- id: deepseek-usage
  config:
    platformUserToken: '你的 userToken'
```

也可以设置环境变量：

```sh
DEEPSEEK_PLATFORM_USER_TOKEN=你的 userToken
```

手动获取方式：登录 `https://platform.deepseek.com/usage` → F12 → Application → Local Storage → `https://platform.deepseek.com` → `userToken` → 复制 JSON 里的 `value` 字段。

## 🗂️ 数据与安全

- 数据全部来自 DeepSeek 开放平台私有 API，与官方用量页同源，**不使用本地价格表，不估算消费**
- `userToken` 只保存在本机用户配置中，不进入插件源码或 Git 仓库
- API：`/api/deepseek-usage/state | refresh | login/start | login/status | logout`（**loopback-only**，仅本机可访问）
- 响应统一 `Cache-Control: no-store`

## 🛠️ 开发

```sh
pnpm install
pnpm build      # host tsc + client tsdown
pnpm typecheck
pnpm verify
```

## 🐋 Ventus 系列插件

| 插件 | 说明 | 仓库 |
|---|---|---|
| 🐳 dsh-ventus-whale | 蓝色大肥鱼 · DeepSeek 虎鲸 3D 桌宠 | [GitHub](https://github.com/mmzm0808/dsh-ventus-whale) |
| 📊 dsh-deepseek-usage | DeepSeek API 用量监测（悬浮球 + 面板） | [GitHub](https://github.com/mmzm0808/dsh-deepseek-usage) |
| 🔍 dsh-ventus-search | 多引擎搜索与正文抓取（Bing / 360 / Bilibili） | [GitHub](https://github.com/mmzm0808/dsh-ventus-search) |

## 📄 许可证

MIT License · Copyright (c) 2026 mmzm0808

## ⭐ Star History

<p align="center">
  <img alt="Star History" src="https://api.star-history.com/svg?repos=mmzm0808/dsh-deepseek-usage&type=Date">
</p>
