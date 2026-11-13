# kye CLI 使用文档

`kycli` 是一个用于自动化构建、上传和发布多端应用的命令行工具，支持 Android、iOS、小程序等平台的自动化构建与上传。

---

## 📦 安装

```bash
# 全局安装
npm install -g @kye-netc/cli

# 或使用 yarn
yarn global add @kye-netc/cli
```

安装完成后可通过命令行验证：

```bash
kycli --help
```

---

## 🚀 可用命令

### 1. 🏗️ 构建命令

```bash
kycli build [options]
```

#### 📖 功能说明

执行构建任务，根据指定的 **平台**、**环境**、**版本号** 进行自动化打包。

#### 🧩 可选参数

| 参数              | 类型              | 说明                                                    | 默认值                      |
| ----------------- | ----------------- | ------------------------------------------------------- | --------------------------- |
| `--app <apps>`    | `string`          | 指定要构建的平台，多个用逗号分隔，例如：`apk,wx,alipay` | `apk,ipa,wx,alipay,amap`    |
| `--env <env>`     | `'uat' \| 'prod'` | 指定构建环境                                            | `prod`                      |
| `--ver <version>` | `string`          | 指定构建版本号，未指定则使用 `package.json` 中的版本号  | 取自 `package.json.version` |

#### 🧰 示例

```bash
# 构建所有平台（生产环境）
kycli build

# 构建微信与支付宝小程序
kycli build --app wx,alipay

# 构建安卓 APK，UAT 环境，版本号 1.2.3
kycli build --app apk --env uat --ver 1.2.3
```

---

### 2. 💬 交互式构建

```bash
kycli start
```

#### 📖 功能说明

进入交互式构建流程，工具会自动引导选择构建平台，适合日常使用或不熟悉命令参数的情况。

#### 🧰 示例

```bash
kycli start
```

执行后会出现如下交互界面：

```
请选择要构建的平台:
❯ apk
  wx
  alipay
  amap
请选择环境:
❯ prod
  uat
```

---

### 3. ☁️ 上传命令

```bash
kycli upload
```

#### 📖 功能说明

本地如果已经打完包，可以上传应用包或小程序包至远程服务器或平台（如微信开发者平台、CI/CD 构建系统）。

#### 🧰 示例

```bash
# 上传最新构建结果
kycli upload
```

---

执行后会出现如下交互界面：

```
请选择要构建的平台:
❯ apk
  wx
  alipay
  amap
请选择环境:
❯ prod
  uat
```

### 4. 📝 创建发布日志

```bash
kycli log
```

#### 📖 功能说明

该命令用于生成或更新项目的发布日志（CHANGELOG.md）并完成对应的 Git 操作（提交、推送、打 tag）。执行流程为：

1. **版本选择与递增**：CLI 会提示选择版本变更类型（`major` / `minor` / `patch`），选择后会根据当前 `package.json` 的 `version` 进行递增，并写回 `package.json` 与 `project.miniapp.json`。同时会将 `project.miniapp.json` 中的 `versionCode` 自增（仅在执行变更时）。

2. **填写更新内容**：通过系统默认编辑器（editor prompt）输入本次发布的更新说明，内容不能为空。

3. **生成并写入 CHANGELOG.md**：工具会在仓库根目录生成或更新 `CHANGELOG.md`，格式如下：

```
# 📦 发布日志

## 🏷️ 版本 1.2.3
**发布时间：** 2025-11-06 12:00:00
**发布人：** Alice
**主分支：** main
**Git Tag：** v1.2.3

### 📦 子包信息
- package-a — 分支：feature/x
- package-b — 分支：main

**Android-sdk版本号：** 1.0.0

修复登录闪退问题，优化性能，新增扫码寄件功能。

---
```

4. **Git 提交与推送**：将所有修改（包括 `package.json`、`project.miniapp.json`、`CHANGELOG.md` 等） `git add -A`，并执行 `git commit -m "force# v<version>"`，随后将提交推送到当前分支。若提交或推送失败，CLI 会输出错误信息并停止后续的 tag 操作。

5. **创建并推送 Tag**：在主仓库创建 `v<version>` tag 并推送。若仓库存在子包（Git Submodules 或子文件夹含 `.git`），CLI 会尝试在每个子包的对应分支上创建相同的 tag。

#### 🧰 示例

```bash
# 交互式创建发布日志（包含版本递增）
kycli log
```

执行时会提示：

```
请选择版本变更类型：
❯ 修复版本号（patch）
  次版本号（minor）
  主版本号（major）

# 编辑器中输入更新内容，保存后退出
请输入 1.2.4 更新内容:
❯ 修复若干 bug，优化上传流程。
```

#### ⚠️ 注意事项

- 请确保在执行 `kycli log` 前本地仓库没有未提交的重要改动，CLI 会 `git add -A` 并提交全部改动。  
- 如果需要跳过版本变更或自定义更复杂的流程，可以手动修改 `package.json` 后直接运行 `kycli log`（但当前交互会再次要求选择变更类型并递增版本）。
- 如果你的项目包含子包（如 monorepo 子文件夹或 git submodules），请确保各子包的远程分支存在且可被访问，以便 CLI 能够为子包打 tag。

---

### 5. 🧭 查看帮助信息

```bash
kycli --help
```

显示所有命令及参数说明。

#### 🧰 示例

```bash
kycli --help
```

输出示例：

```
Usage:
  $ kycli <command> [options]

Commands:
  build     执行构建任务
  start     交互式构建流程
  upload    上传包
  log       创建发布日志
  help      查看帮助
  version   查看版本号
```

---

### 6. 🔖 查看版本号

```bash
kycli --version
```

显示当前 CLI 工具版本号（取自 `package.json`）。

---

## 🧩 支持的平台（PlatformType）

| 平台     | 说明         |
| -------- | ------------ |
| `apk`    | Android 应用 |
| `ipa`    | iOS 应用     |
| `wx`     | 微信小程序   |
| `alipay` | 支付宝小程序 |
| `amap`   | 高德小程序   |

---

## 🌱 支持的环境（EnvType）

| 环境   | 说明     |
| ------ | -------- |
| `uat`  | 测试环境 |
| `prod` | 生产环境 |

---

## cli.config.js 配置文件说明

```js
module.exports = (env) => {
  return {
    wx: {},
    alipay: {},
  }
}
```

###  微信小程序（wx）配置项说明
| 配置项              | 说明                                      |
| ------------------- | ----------------------------------------- |
| `output`            | App打包输出目录                           |
| `appid`             | 微信正式版 AppID                          |
| `privateKeyPath`    | 对应正式版私钥路径                        |
| `appidUat`          | 测试环境（UAT）AppID                      |
| `privateKeyPathUat` | UAT 私钥路径                              |
| `projectPath`       | 构建产物路径（微信小程序项目）            |
| `keyAlias`          | Android 签名别名                          |
| `keyPass`           | Android 签名密码                          |
| `keyStore`          | Android keystore 文件路径                 |
| `storePass`         | Android keystore 存储密码                 |
| `p12Password`       | iPhone .p12 签名密码                         |
| `profilePath`         | iPhone profile 文件(mobileprovision文件)文件路径 |
| `certificateName`     | iPhone Developer 证书名称                 |
| `p12Path`             | iPhone P12 文件路径                       |

### 支付宝小程序（alipay）配置项说明
| 配置项            | 说明                 |
| ----------------- | -------------------- |
| `appId`           | 支付宝小程序 AppId   |
| `identityKeyPath` | 支付宝 CLI 身份文件  |
| `projectPath`     | 支付宝小程序项目路径 |