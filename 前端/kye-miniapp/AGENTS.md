# netc-ai-kits

NETC 前端 AI 助手配置仓库。通过 `@kyfe/ai-tools` 同步到各业务项目，为 AI 编码助手（Claude Code / Trae / Cursor / CodeBuddy / Codex）提供代码审查等技能与规则。

## 使用

详见 [README.md](./README.md)

<!-- AGENTS_CUSTOM_START -->
<!-- 各业务项目可在本标记之间保留自定义内容，ai-tools 同步时会保留此区域不被覆盖 -->
<!-- AGENTS_CUSTOM_END -->


# 构建打包插件 `@kye-netc/miniapp-plugins`

本文档只说明 `@kye-netc/miniapp-plugins`（当前版本 `0.0.14`）这个 Taro 插件在小程序构建中承担的职责与工作流程。它是一个**子应用编排插件**，负责在 Taro 编译前把多个独立 git 仓库的子应用代码拼装进主应用、编译后清理临时产物并校验体积。本文不涉及 `config/index.ts` 中的 webpack 链（terser / loader / cssModules 等）配置。

> 插件源码位于 `node_modules/@kye-netc/miniapp-plugins/src/`，入口为 `src/index.ts`。下文行号均相对该入口文件。

---

## 1. 插件如何接入项目

- 在 `config/index.ts` 的 `plugins` 数组中以**无参数**形式注册：`'@kye-netc/miniapp-plugins'`（`config/index.ts:85`）。
- 插件运行时通过动态 `import` 读取主应用的 `src/subpackagesConfig.ts`（`index.ts:587`），从中取三组数据：
  - `subPackagesConfig` —— 所有子应用信息（全局变量 `subpackages`，后续流程均以它为准）。
  - `publicConfig` —— `public` 公共子应用信息。
  - `excludeBaseModules` —— dev 环境下 `src/modules` 中需要忽略的目录（当前为 `['user', 'waybill', 'webview', 'setting', 'pay', 'app-plugin']`）。

---

## 2. 配置入口 `src/subpackagesConfig.ts`

这是插件唯一的配置源，**可手动维护**。每条子应用配置字段含义（`SubPackageItem`，见 `src/type/index.ts`）：

| 字段         | 含义                                                                           |
| ------------ | ------------------------------------------------------------------------------ |
| `name`       | 子应用名称，对应 git 仓库名（如 `kye-miniapp-order`）                          |
| `buildName`  | 构建目录名，即复制到主应用 `src/modules/` 下的目标文件夹名（如 `order-build`） |
| `src`        | 子应用源码目录，指向 `src/modules/{name}/src`                                  |
| `dest`       | 复制目标目录，指向 `src/modules/{buildName}`                                   |
| `git`        | git 仓库地址（prod 且带 `--branch` 时用于 clone）                              |
| `branch`     | 分支（实际生效的是命令行 `--branch` 参数，见下文）                             |
| `customPage` | 可选，`true` 表示读取该子包自定义的 `app.config.ts`，而非扫描 `pages/` 目录    |

当前主应用注册的子应用：

- `kye-miniapp-waybill` → `waybill-build`
- `kye-miniapp-order` → `order-build`（`customPage: true`）

`publicConfig` 指向 `src/public`，是公共代码子应用。

---

## 3. 自动生成的文件（请勿手动修改）

### `src/subpackages.ts`

- 由 `updateSubpackages()` 生成（`index.ts:166`），文件头注明「该文件为 kye-miniapp-plugins 自动生成，请勿手动修改删除」。
- 导出 `subpackages` 数组，内容最终合并进主应用 `app.config.ts` 的 `subPackages` 属性。
- 生成规则（对每个子应用）：
  - 非 `customPage`：扫描子应用 `src/pages/*/index` 作为页面，`root` 为 `modules/{buildName}`。
  - `customPage: true`：读取子应用自己的 `app.config.ts`，用正则提取 `defineAppConfig({...})` 的对象体并通过 `new Function` 执行（`getCustomAppConfig`，`index.ts:568`）：
    - 取其 `pages` 作为当前子包页面；
    - 若还含 `subPackages`（嵌套子包，如 `order-build-sub-pages`），则追加到全局 `subPackagesConfigAdded`，并把这些嵌套子包的 `root` 改写为 `modules/{buildName}-{原root}`（`index.ts:189`），随后合并进 `subpackages` 参与「复制 / 删除」流程。

> 因此 `config/index.ts` 中的 alias 才会引用 `order-build`、`order-build-sub-pages`、`freight-time` 等路径——它们都依赖插件生成的 `-build` 目录。

---

## 4. 复制规则（子应用代码 → 主应用）

`copyFolderRecursive(src, dest)`（`index.ts:103`）把子应用 `src/` 下内容复制到 `dest`，**固定排除**以下文件/目录：

- 文件：`app.config.ts`、`app.scss`、`app.ts`、`index.html`
- 目录：`public`

dev 监听（热更新）也遵守同一份忽略清单（`index.ts:243`）。

---

## 5. 环境分支

入口根据 `process.env.NODE_ENV` 分流（`index.ts:594`）：

### development（开发环境）

- 不读取配置中的子应用列表，而是 `devAssembleSubPackages()`（`index.ts:23`）：遍历 `src/modules` 下**本地实际存在**的目录（排除 `excludeBaseModules`），与 `subPackagesConfig` 取交集得到 `subpackages`。
- 即：dev 环境以「本地有哪些子模块」为准，不依赖 git 拉取。

### production（生产构建）

- 读取命令行参数 `ctx.runOpts.options.args.branch`（`index.ts:600`）：
  - **带 `--branch`**：先 `initOrPullPublic()` 拉取 public 子应用，再对每个子应用 `initOrPullSubpackages()` 用 `git clone / fetch / checkout / pull` 拉取指定分支代码（`index.ts:503`、`536`）。任一子模块失败即 `process.exit(1)`。
  - **不带 `--branch`**：退回 dev 的本地模式 `devAssembleSubPackages()`。

---

## 6. 构建钩子流程

### `onBuildStart`（编译开始前，`index.ts:614`）

1. `updateSubpackages()` 重新生成 `src/subpackages.ts`。
2. 把 `subPackagesConfigAdded`（嵌套子包）合并进 `subpackages`。
3. 删除每个子应用已存在的 `dest`（`-build`）目录（`deleteFolderRecursive`，`index.ts:51`）。
4. 对每个子应用执行 `copyFolderRecursive(src, dest)`，把代码复制到 `src/modules/{buildName}`。
5. 处理 **order-public 公共模块**（见第 7 节）。
6. 打印「编译开始」，交还 Taro 编译。

### `onBuildComplete`（编译结束后，`index.ts:649`）

- **development**：
  - 对每个子应用启动 `devWatchAndSync(src, dest)`（`index.ts:234`），用 `chokidar` 监听子应用 `src/`，文件 `add/change` 同步、`unlink/unlinkDir` 删除到对应 `-build` 目录——**这就是子应用热更新的实现**。
  - 另启动 `devWatchOrderPublicAndSync()`（`index.ts:335`）监听 `src/modules/order-global-package`，变化同步到所有 `includesOrderPublicDir` 子包下的 `order-global-package/`。
- **production**：
  - 删除所有 `dest`（`-build`）临时目录（清理构建副本）。
  - `checkDistDirectorySize()`（`index.ts:463`）校验体积，见第 8 节。

---

## 7. order-public 公共模块机制

定义在 `src/order-public-config.ts`：

- `includesOrderPublicDir = ['order-build', 'order-build-sub-pages', 'freight-time']` —— 需要使用 order-public 公共代码的子包（按 `buildName` 形态）。
- `orderPublicDir = src/modules/order-global-package` —— order-public 公共模块源目录。

在 `onBuildStart` 中（`index.ts:638`）：对 `includesOrderPublicDir` 中每个子包，先删除其下 `order-global-package/`，再把 `orderPublicDir` 的内容复制进去。dev 环境下该目录的变化会同步到所有上述子包。

---

## 8. 构建产物体积校验（prod）

`checkDistDirectorySize()`（`index.ts:463`）针对 `dist/{TARO_ENV}`：

- **总包**超过 **30MB** → 打印 `[ERROR] ❌ 应用超过30MB的大小限制`。
- **任一子包**（`dist/{TARO_ENV}/modules/*`）超过 **2MB** → 打印 `[ERROR] ❌ 子应用 '{name}' 超过2MB大小限制`。

> 注意：当前实现只打印 `console.error`，不会中断构建。新增子包或引入大体积资源后需自查这两条限制（小程序平台本身也有分包上限）。

---

## 9. base.axml / base.wxml 模板适配

插件通过 `ctx.modifyWebpackChain` 注册 webpack 插件 `KyeModifyBaseAxmlPlugin`（`index.ts:670`，实现在 `src/plugins/kye-modify-base-axml-plugin.ts`）：

- 在 webpack `afterEmit` 钩子，递归扫描产物目录下所有 `.axml`（支付宝）/ `.wxml`（微信）文件。
- 用正则匹配 `<picker-view-column>` 模板并替换内容，适配 picker 组件场景（dev/prod 均生效）。
- 不支持的平台（如 `h5`）会 `console.warn` 跳过，不报错。

---

## 10. 常见注意点（排查 / 改动时）

- **查找/排查代码时优先跳过副本目录**：以下目录是插件运行时复制或生成的副本，搜索源码、改动代码时应忽略，避免改错位置或被大量重复命中干扰：
  - `src/modules/{buildName}/` 及其下内容（如 `order-build/`、`waybill-build/`、`freight-time/` 的 `pages/`、`order-global-package/`）。
  - `src/modules/{buildName}-{root}/`（如 `order-build-sub-pages/`）—— 嵌套子包副本。
  - 各子包下的 `order-global-package/` 与 `order-public/` —— 都是 order-public 公共模块的副本。

  对应的**真实源码**目录：
  - 子应用源：`src/modules/{git仓库名}/src/`（如 `src/modules/kye-miniapp-order/src/`）。
  - order-public 公共模块源：`src/modules/order-global-package/`（被复制到 `includesOrderPublicDir` 各子包下）。
  - public 公共子应用源：`src/public/`。

  例：freight-time 页面 `import ... from '@order-global-package-freight-time/...'` 经别名解析到 `src/modules/freight-time/order-global-package/...`（副本），真正源码在 `src/modules/order-global-package/...`。

- **`src/subpackages.ts` 是自动生成的**，修改无效；要调整子包列表请改 `src/subpackagesConfig.ts`。
- **dev 模式只认本地已存在的 `src/modules/{name}` 目录**，新拉子应用代码后若 dev 没识别，检查目录是否在 `excludeBaseModules` 里或目录名是否与配置 `name` 对应。
- **新增/改动子应用别名**：打包时别名读取的是主应用（因为子应用代码被整体复制到 `modules/{buildName}` 下），别名需指向 `buildName` 形态的路径，与 `config/index.ts` 的 `alias` 保持一致。
- **嵌套子包**（`customPage` 子应用 `app.config.ts` 内的 `subPackages`）会被插件追加为独立构建目录 `modules/{buildName}-{root}`，新增嵌套子包后确认对应 alias 已配置。
- **prod 体积告警不会中断构建**，超限需主动核查。
- 修改本插件逻辑应到插件仓库（`@kye-netc/miniapp-plugins` 源码），`node_modules` 内为发布产物，改动不持久。
