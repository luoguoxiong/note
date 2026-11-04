# src/native 方案设计文档

## 1. 背景与目标

### 1.1 背景

`netc-pc-web-admin` 作为快运 PC 端管理后台，需要在多种客户端壳环境中运行，包括旧壳（1-4）、Electron 壳（5）、跨声 3.0 壳（6）。不同壳环境的底层通信机制各异（全局函数、CefSharp、WebView2、MiniBlink），且项目还处于微前端（Micro-App）架构中，部分子应用通过 iframe 嵌入。

旧版 `src/utils/native/` 采用单文件模块，将所有壳能力集中到一个对象中导出，随着能力不断叠加，维护成本越来越高。新版 `src/native/` 作为统一 Native 能力层，对壳能力进行了模块化拆分和重构。

### 1.2 目标

- **统一壳能力接入**: 作为壳能力调用的单一入口，屏蔽底层壳差异
- **模块化拆分**: 按能力域拆分为 electron（壳能力） 和 user（用户能力） 子模块
- **可扩展**: 通过 `native.register()` 机制，新能力模块可独立开发、动态注册
- **渐进迁移**: 兼容旧版调用方式，支持逐步从 `@/utils/native` 迁移到 `src/native`

## 2. 整体架构

```
src/native/
├── index.ts              # 入口文件，注册所有能力模块到 @kye-netc/micro-native
├── README.md             # 本文档
├── electron/             # Electron/客户端壳能力模块
│   ├── index.ts          # 主文件，包含所有壳能力方法 (6种壳类型)
│   ├── adapter.ts        # 适配器，处理网页与客户端行为差异
│   ├── kuasheng.ts       # 跨声 3.0 壳异步回调处理
│   └── types.ts          # 壳能力类型定义
├── user/                 # 用户能力模块
│   └── index.ts          # 获取 Token、获取用户信息
```

### 2.1 依赖关系

```
@kye-netc/micro-native (注册中心)
        │
    native.register()
        │
    ┌────┴────┐
    │         │
 electron   user
 (壳能力)   (用户能力)
    │
    ├── adapter.ts  (适配层)
    └── kuasheng.ts (跨声回调)
```

### 2.2 调用链路

```
业务组件
    │
    ▼
@kye-netc/micro-native (统一接口)
    │
    ├── 壳检测 → getClientFrameType()
    │
    ├── 普通壳 (1-4) → window[funcName](...args)
    ├── MiniBlink(2) → mbQuery(JSON)
    ├── CefSharp(3)  → CefSharp.BindObjectAsync() → netObjAsync[funcName]
    ├── WebView2(4)  → chrome.webview.hostObjects.netFuncs[funcName]
    ├── Electron(5)  → window[funcName](...args)
    └── 跨声 3.0(6) → window[funcName](...args) + 异步回调映射
```

## 3. 模块设计

### 3.1 入口模块 (`index.ts`)

```typescript
import { native } from '@kye-netc/micro-native'
import * as electron from './electron/index'
import * as user from './user/index'

native.register({ ...electron, ...user })
```

- 在 `main.ts` 中通过 `import '@/native/index'` 在应用启动时完成注册
- `@kye-netc/micro-native` 作为统一的 Native 注册中心，将所有方法合并后暴露给业务使用
- 业务方通过 `import { native } from '@kye-netc/micro-native'` 调用

### 3.2 壳能力模块 (`electron/`)

#### 3.2.1 壳类型检测 (`index.ts`)

| 壳类型 | 检测标志 | 说明 |
|--------|----------|------|
| 1 (旧壳) | `window.net_isInClient` 存在 | 最早期的壳版本 |
| 2 (MiniBlink) | `window.mbQuery` 存在 | MiniBlink 内核 |
| 3 (CefSharp) | `window.CefSharp` 存在 | CefSharp 内核 |
| 4 (WebView2) | `window.chrome.webview.hostObjects` 存在 | WebView2 内核 |
| 5 (Electron) | `window.electronClient` 存在 | Electron 壳 |
| 6 (跨声 3.0) | `navigator.userAgent` 包含 `kuasheng_work` | 跨声最新壳 |

`getClientFrameType()` 为同步检测，按优先级顺序判断：

```typescript
export const getClientFrameType = (): number | undefined => {
  if (_window['net_isInClient']) return 1
  if (_window.mbQuery) return 2
  if (_window.CefSharp) return 3
  if (_window.electronClient) return 5
  if (_window.chrome?.webview?.hostObjects?.netFuncs) return 4
  if (navigator.userAgent.indexOf('kuasheng_work') > -1) return 6
  return undefined
}
```

#### 3.2.2 通用调用方法 (`__call`)

```
__call(funcName, ...args)
    │
    ├── type = 4 (WebView2) → callWebview2Api(funcName, ...args)
    ├── type = 3 (CefSharp) → callCefSharpApi(funcName, ...args)
    ├── type = 2 (MiniBlink) → miniBlinkApi(funcName, args)
    └── 其他 → window[funcName](...args)
```

#### 3.2.3 能力分类

| 分类 | 方法数 | 命名前缀 | 说明 |
|------|--------|----------|------|
| 窗体操作 | 9 | `net_getWindowState`, `net_setWindowState` 等 | 最小化、最大化、关闭、拖动等 |
| 缓存操作 | 2 | `net_getCacheInfo`, `net_setCacheInfo` | 壳层 KV 缓存 |
| 打印相关 | 6 | `net_batchPrint`, `net_getPrinterList` 等 | 批量打印、标签打印、打印组件 |
| 文件操作 | 10 | `net_readExcel`, `net_downLoadFile` 等 | Excel 读取、文件下载/导出 |
| 版本与系统 | 9 | `net_getVersionNo`, `electron_machineId` 等 | 版本检查、升级、系统信息 |
| 代理相关 | 3 | `net_getProxyInfo`, `electron_testProxy` 等 | 网络代理配置 |
| 页面操作 | 3 | `net_reload`, `electron_reloadCurrentPage` | 刷新、清除缓存 |
| 窗口控制 | 4 | `electron_windowMove`, `electron_setRightMenu` 等 | 拖动、右键菜单、聚焦/失焦 |
| 缩放 | 2 | `kuasheng_switchZoom`, `kuasheng_getZoom` | 跨声壳页面缩放 |
| 全屏 | 2 | `kuasheng_requestFullscreen`, `kuasheng_exitFullscreen` | 跨声壳进入/退出全屏（隐藏/恢复任务栏） |
| 截图 | 1 | `kuasheng_startCaptureWnd` | 跨声壳截图 |
| 剪贴板 | 2 | `net_getClipboardContent`, `kuasheng_getImageFilesFromClipBoard` | 剪贴板内容/图片 |
| 链接 | 2 | `kuasheng_openUrl`, `nativeBrowserOpenUrl` | 在壳中打开浏览器链接 |
| 开发工具 | 1 | `electron_openDevTools` | 打开控制台 |
| 离线包 | 2 | `is_native_offline` 判断 + 离线路径处理 | 原生离线包环境适配 |

#### 3.2.4 适配器 (`adapter.ts`)

提供跨环境兼容的能力：

- `openLink(url)`: 壳环境调用壳方法打开链接，网页环境使用 `window.open`
- `xlsxDataInElectron(data)`: Electron 壳中导出 Excel 时需要特殊的数据格式转换

#### 3.2.5 跨声异步回调 (`kuasheng.ts`)

跨声 3.0 壳部分方法是异步回调模式，需要将"发起调用"和"接收回调"做映射绑定：

```
调用过程:
1. 发起: window[key](...args)  →  壳执行操作
2. 回调: window[callbackKey](result)  →  Promise resolve/reject

回调映射:
  net_downLoadFile                → net_downLoadResult
  net_downLoadFileByBatch_New     → net_downLoadFileByBatchResult
  electron_testProxy              → electron_testProxyResult
  electron_updateLog              → electron_updateLogResult
  kuasheng_getZoom                → kuasheng_getZoomResult
  kuasheng_startCaptureWnd        → kuasheng_sendCaptureImageData
  kuasheng_getImageFilesFromClipBoard → kuasheng_getImageFilesFromClipBoardResult
```

### 3.3 用户模块 (`user/`)

```
user/
└── index.ts
    ├── getToken()       → 从 sessionStorage 获取 Token
    └── getUserInfo()    → 调用 Pinia store 初始化用户信息
```

该模块负责用户态相关能力，后续可以扩展登录、权限等能力。

## 4. 壳能力枚举 (`types.ts`)

```typescript
enum ClientFrameType {
  OLD = 1,       // 旧壳
  MINI_BLINK = 2, // MiniBlink
  CEF_SHARP = 3,  // CefSharp
  WEBVIEW2 = 4,   // WebView2
  ELECTRON = 5,   // Electron
  KUASHENG = 6,   // 跨声 3.0
}
```

配套类型定义：`WindowState`、`PrinterInfo`、`SystemInfo`、`ProxyInfo`、`NativeResponse<T>`、`ExportTableData`、`PrintData` 等。

## 5. 与旧版对比

| 维度 | 旧版 `utils/native/index.ts` | 新版 `src/native/index.ts` |
|------|------------------------------|----------------------------|
| 组织方式 | 单文件 ~500 行，所有方法平铺 | 按能力域拆分为 electron/user 子模块 |
| 注册机制 | 直接 export default 对象 | 通过 `@kye-netc/micro-native` 的 `register()` 注册 |
| 调用方式 | `import native from '@/utils/native'` | `import { native } from '@kye-netc/micro-native'` |
| iframe 支持 | 内置 iframe bridge 检测和代理 | 由 `micro-native` 层统一处理 |
| 类型系统 | 较少类型定义 | 独立的 `types.ts`，完善的接口定义 |
| 可扩展性 | 需修改主文件 | 新增模块独立开发，register 注册即可 |

### 5.1 旧版拆解

旧版 `utils/native/` 包含的辅助文件：

```
utils/native/
├── index.ts          # 主文件，约 510 行单文件
├── index-iframe.ts   # iframe 模式下的方法代理
├── adapter.ts        # 适配器
├── fileUntil.ts      # 文件工具
├── kuasheng.ts       # 跨声异步回调
└── parentNativeHelp.ts  # 父窗口 native 帮助
```

新版迁移后：
- `electron/index.ts` 继承 `utils/native/index.ts` 的核心壳能力
- `utils/native/adapter.ts` → `electron/adapter.ts`（逻辑基本一致）
- `utils/native/kuasheng.ts` → `electron/kuasheng.ts`（逻辑一致）
- `utils/native/index-iframe.ts` → 由 `@kye-netc/micro-native` 层接管
- `utils/native/parentNativeHelp.ts` → 由 iframe bridge 层接管

## 6. 离线包支持

通过 `is_native_offline()` 检测当前是否在离线包环境：

```typescript
export const is_native_offline = (): boolean => {
  const href = window.location.href
  const protocol = window.location.protocol
  return isClientMode() && href.indexOf('offlinePackage') > 0 && protocol === 'file:'
}
```

离线包场景下：
- 文件下载链接需重新拼接为本地路径 (`downloadTemplateCompatible`)
- 刷新行为不同：只刷新文件内容而非路由

## 7. 使用示例

### 壳环境检测

```typescript
import { native } from '@kye-netc/micro-native'

// 判断是否在壳中
const isClient = await native.isClientMode()

// 获取壳类型
const frameType = await native.getClientFrameType()

// 特定壳判断
const isElectron = await native.isElectronClientMode()
const isKuaShen = await native.isKuaShenClientMode()
```

### 调用壳能力

```typescript
// 窗体操作
await native.minimize()
await native.maximize()

// 打印
const printers = await native.getPrinterList()
await native.batchPrint(template, data, { noType, printName })

// 文件操作
const base64 = await native.selectFileToBase64('*')
await native.exportTable(data, '报表.xlsx')

// 版本信息
const version = await native.getVersion()
const machineId = await native.getMachineId()
```

### 在组件中使用

```vue
<script setup lang="ts">
import { native } from '@kye-netc/micro-native'

const isClient = ref(false)
native.isClientMode().then(res => { isClient.value = res })
</script>
```

## 8. 注意事项

1. **环境判断前置**: 调用壳能力前应先通过 `isClientMode()` 判断当前环境，壳外调用将无响应
2. **异步处理**: 大部分壳能力方法返回 Promise，需用 async/await 或 .then() 消费
3. **壳版本兼容**: 部分能力有最低壳版本要求（如 windowMove 需 V2.1.0+），调用前需确认
4. **跨声回调**: 跨声 3.0 壳的异步方法通过回调映射实现 Promise 化，初始化时自动完成 hook
5. **方法存在性检查**: 使用 `existsNativeFunc(funcName)` 同步判断原生方法是否可用
6. **迁移兼容**: `utils/native/` 旧文件暂保留，支持渐进迁移

## 9. 演进路线

| 阶段 | 内容 | 状态 |
|------|------|------|
| v1 | 从 `utils/native` 提取壳能力到 `src/native/electron`，建立模块化结构 | ✅ 已完成 |
| v2 | 引入 `@kye-netc/micro-native` 作为统一注册中心，`src/native/index.ts` 作为入口 | ✅ 已完成 |
| v3 | 新增 `user` 模块，分离用户态能力 | ✅ 已完成 |
| v4 | 逐步废弃 `utils/native/`，业务迁移到 `@kye-netc/micro-native` | 进行中 |
| v5 | 扩展更多能力模块（如打印、文件上传等独立子模块） | 规划中 |
