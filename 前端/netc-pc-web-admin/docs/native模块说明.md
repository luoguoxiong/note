# Native 模块说明（src/native）

## 1. 概述

`src/native/` 是项目的统一 Native 能力层，负责将各类能力方法注册到 `@kye-netc/micro-native` 注册中心，供业务侧通过统一接口调用。

该模块覆盖三类能力：

1. **客户端壳能力**（`electron/`）：与旧壳、Electron 壳、跨声 3.0 壳等多种客户端壳交互
2. **浏览器与页面能力**（`bom/`、`dom/`）：BOM / DOM 层面的基础封装
3. **应用内基础能力**（`global/`、`router/`、`ui/`）：全局状态、路由跳转、消息提示

## 2. 目录结构

```
src/native/
├── index.ts              # 入口文件，注册所有能力模块到 @kye-netc/micro-native
├── event.ts              # Native 事件定义与发射
├── type.ts               # Native 事件 Key 枚举（类型定义）
├── electron/             # 客户端壳能力模块
│   ├── index.ts          # 主文件，包含所有壳能力方法（6 种壳类型）
│   ├── adapter.ts        # 适配器，处理网页与客户端行为差异
│   ├── kuasheng.ts       # 跨声 3.0 壳异步回调处理
│   ├── types.ts          # 壳能力类型定义
│   └── README.md         # electron 模块文档
├── bom/                  # BOM 能力模块
│   └── index.ts
├── dom/                  # DOM 能力模块
│   └── index.ts
├── global/               # 全局状态能力模块
│   └── index.ts
├── router/               # 路由能力模块
│   └── index.ts
└── ui/                   # UI 能力模块
    └── index.ts
```

## 3. 注册机制

入口文件 `src/native/index.ts`：

```typescript
import { native } from '@kye-netc/micro-native'
import * as electron from './electron/index'
import * as global from './global/index'
import * as bom from './bom/index'
import * as dom from './dom/index'
import * as router from './router/index'
import * as ui from './ui/index'

native.register({ ...electron, ...global, ...bom, ...dom, ...router, ...ui })
```

- 应用启动时通过 `import '@/native/index'` 完成注册（在 `main.ts` 中引入）
- 业务侧统一通过 `import { native } from '@kye-netc/micro-native'` 调用
- 新增能力模块只需独立开发后在该文件中注册，无需改动其他模块

### 注册方法清单

| 模块 | 注册的方法 |
|------|-----------|
| electron | `isClientMode`、`isOldClientMode`、`isElectronClientMode`、`isKuaShenClientMode`、`getClientFrameType`、`existsNativeFunc` 及全部壳能力方法（见第 5 节） |
| global | `getToken`、`getGlobalData`、`updateUserInfo`、`updateCustomerInfo`、`updateRealNameInfo`、`updateToken` |
| bom | `getLocationHref`、`reloadBrowserReload` |
| dom | `querySelector`、`querySelectorAll` |
| router | `locationRouter`、`vueRouter` |
| ui | `showMessage` |

## 4. 各模块详细说明

### 4.1 global（全局状态能力）

依赖 Pinia store `@/stores/global`。

| 方法 | 说明 |
|------|------|
| `getToken()` | 从 `sessionStorage` 获取 Token（key: `Token`） |
| `getGlobalData()` | 调用 global store 的 `getGlobalData()` 获取全局数据 |
| `updateUserInfo()` | 更新用户信息 |
| `updateCustomerInfo()` | 更新客户信息 |
| `updateRealNameInfo()` | 更新实名信息 |
| `updateToken()` | 更新 Token（**todo，当前为空实现**） |

### 4.2 bom（浏览器对象能力）

| 方法 | 说明 |
|------|------|
| `getLocationHref()` | 返回当前 `location.href` |
| `reloadBrowserReload()` | 调用 `location.reload()` 刷新页面 |

### 4.3 dom（文档对象能力）

| 方法 | 说明 |
|------|------|
| `querySelector(selectors)` | 判断选择器**是否存在**（返回 boolean，非返回元素） |
| `querySelectorAll(selectors)` | 判断选择器是否存在匹配项（返回 boolean） |

> 注意：与原生 DOM API 不同，这里返回的是布尔值，用于存在性判断。

### 4.4 router（路由能力）

依赖从 `@/main` 导出的 `router` 实例。

| 方法 | 说明 |
|------|------|
| `locationRouter(url)` | 原生跳转：`location.href = url`（整页跳转） |

`vueRouter(data?: VueRouterOptions)`：Vue Router 结构化跳转。

```typescript
interface VueRouterOptions {
  type: 'push' | 'replace' | 'back'
  location?: RouteLocationRaw  // push/replace 必填
  delta?: number               // back 时后退步数，默认 1
}
```

示例：

```typescript
// push
vueRouter({ type: 'push', location: '/waybill/list' })
// replace
vueRouter({ type: 'replace', location: { name: 'home' } })
// 后退两步
vueRouter({ type: 'back', delta: 2 })
```

### 4.5 ui（消息提示能力）

`showMessage(data)`：基于 `element-plus` 的 `ElMessage` 封装的全局消息提示。

```typescript
type MessageType = 'success' | 'warning' | 'info' | 'error'

interface ShowMessageOptions extends Omit<MessageParams, 'type'> {
  type?: MessageType   // 默认 'info'
  message: string
}
```

- 传字符串时默认按 `info` 类型展示：`showMessage('保存成功')`
- 传对象时可指定类型及其他 ElMessage 参数：`showMessage({ message: '失败', type: 'error', duration: 3000 })`

### 4.6 事件模块（event.ts / type.ts）

| 文件 | 内容 |
|------|------|
| `event.ts` | `NativeEventKeys.GlobalStateChange = 'globalState-change'`；`emitGlobalStateChange(globalData)` 用于在全局状态（GlobalState）变更后通过 `native.emit` 广播通知 |
| `type.ts` | `NativeEventKeys.GlobalDataChange = 'globalData-change'` 枚举定义 |

> 注意：两个文件各自定义了同名枚举 `NativeEventKeys`，key 值不同（`globalState-change` vs `globalData-change`），使用时注意区分来源，避免混用。

## 5. electron 模块（客户端壳能力）

详细文档见 [src/native/electron/README.md](file:///Users/kye/Documents/KYE-WORK/PC/netc-pc-web-admin/src/native/electron/README.md)，此处为核心速览。

### 5.1 壳类型

| 类型值 | 壳名称 | 检测标志 |
|--------|--------|----------|
| 1 | 旧壳 | `window.net_isInClient` 为函数 |
| 2 | MiniBlink | `window.webViewName` + `window.mbQuery` 函数 |
| 3 | CefSharp | `window.CefSharp` 存在 |
| 4 | WebView2 | `window.chrome.webview.hostObjects.netFuncs` 存在 |
| 5 | Electron | `window.electronClient` 存在 |
| 6 | 跨声 3.0 | `navigator.userAgent` 包含 `kuasheng_work` |

- `getClientFrameType()`：同步检测，返回 1-6 或 `undefined`（非壳环境）
- 开发环境支持 URL 参数模拟：`?clientType=5` 强制指定壳类型；`?clientVersion=V3.1.2` 强制指定壳版本
- 环境判断方法：`isClientMode()`、`isOldClientMode()`（1-4）、`isElectronClientMode()`（5）、`isKuaShenClientMode()`（6）

### 5.2 通用调用机制（`__call`）

```
__call(funcName, ...args)
    ├── type = 4 (WebView2)  → chrome.webview.hostObjects.netFuncs[funcName](...args)
    ├── type = 3 (CefSharp)  → CefSharp.BindObjectAsync('netObjAsync') → netObjAsync[funcName](...args)
    ├── type = 2 (MiniBlink) → mbQuery(1, JSON.stringify({funcName, args}), callback)
    └── 其他 (1/5/6)         → window[funcName](...args)
```

`existsNativeFunc(funcName)`：同步判断原生方法是否存在（WebView2 下额外检查 `net_` 前缀变体）。

### 5.3 能力分类速览

| 分类 | 代表方法 | 备注 |
|------|----------|------|
| 壳判断 | `isClientMode`、`getClientFrameType` 等 | 同步 |
| 窗体操作 | `getState`、`minimize`、`maximize`、`resume`、`close`、`sizable`、`noSizable`、`setLoginFormSize`、`setLoginFormFlag` | |
| 缓存操作 | `getCacheInfo(key)`、`setCacheInfo(key, value)` | 跨声壳下对象值自动 `JSON.stringify` |
| 打印相关 | `getPrinterList`、`getPrintViewImage`、`batchPrint`、`batchPrintAsync`、`batchPrintNew`、`printTag`、`startKYEPrinter` | |
| 文件操作 | `readExcel(Async)`、`fileToBase64`、`selectFileToBase64`、`getFileSize`、`downLoadFile`、`downLoadFileByBatch(New)`、`downloadFileByBase64`、`exportTable` | Electron 壳下 `exportTable` 自动做数据格式转换 |
| 离线包 | `is_native_offline()` | 壳内 + `file:` 协议 + href 含 `offlinePackage` |
| 版本与系统 | `getVersion`、`isNewVersion`、`systemUpgrade`、`updateClient`、`cancelUpdateClient`、`startSetup`、`existsVersionFile`、`checkOldClient`、`openUninstall`、`getMachineId`、`getSystemInfo`、`environment`、`updatePackageSetting` | `environment` 走旧壳同步调用 `__callOld` |
| 代理相关 | `getProxyInfo`、`testProxy`、`setProxy` | |
| 页面操作 | `reload`（离线包只刷新文件不刷新路由）、`reloadCurrentPage`、`clearCache`（仅跨声壳） | |
| 开发工具 | `openDevTools` | |
| 窗口控制 | `windowMove`（V2.1.0+）、`setRightMenu`（V2.1.2+）、`mainWindowFocus`、`mainWindowBlur`（V2.2.1+） | |
| 缩放（跨声） | `switchZoom('add'/'decrease')`、`getZoom`（3.0.6+） | |
| 全屏（跨声） | `requestFullscreen`、`exitFullscreen`（3.1.11+，隐藏/恢复任务栏） | |
| 截图（跨声） | `startCaptureWnd` | |
| 剪贴板 | `getClipboardContent`、`getClipboardImageFile` | |
| 链接 | `nativeOpenUrl`（仅跨声）、`nativeBrowserOpenUrl`（跨声壳/网页兼容） | |
| 更新日志 | `getUpdateLog` | 获取腾讯云日志链接 |

### 5.4 适配器（adapter.ts）

- `openLink(url)`：壳环境走 `nativeBrowserOpenUrl`，网页环境 `window.open(url, '_blank')`
- `xlsxDataInElectron(data)`：Electron 壳导出 Excel 的数据格式转换
  - 转换前：`[{ key: 'value' }]`
  - 转换后：`[{ name: '', data: [[key...], [value...]] }]`

### 5.5 跨声异步回调（kuasheng.ts）

跨声 3.0 壳部分方法为异步回调模式，模块在壳环境初始化时自动 hook，将回调 Promise 化（`res.code === 0` resolve，否则 reject）：

| 调用方法 | 回调方法 |
|----------|----------|
| `net_downLoadFile` | `net_downLoadResult` |
| `net_downLoadFileByBatch_New` | `net_downLoadFileByBatchResult` |
| `electron_testProxy` | `electron_testProxyResult` |
| `electron_updateLog` | `electron_updateLogResult` |
| `kuasheng_getZoom` | `kuasheng_getZoomResult` |
| `kuasheng_startCaptureWnd` | `kuasheng_sendCaptureImageData` |
| `kuasheng_getImageFilesFromClipBoard` | `kuasheng_getImageFilesFromClipBoardResult` |

原方法保存为 `window[funcName_oldFun]`，避免重复 hook（幂等）。

## 6. 使用示例

```typescript
import { native } from '@kye-netc/micro-native'

// 环境判断
const isClient = native.isClientMode()

// 路由跳转
native.vueRouter({ type: 'push', location: '/home' })

// 消息提示
native.showMessage({ message: '操作成功', type: 'success' })

// 壳能力
if (native.isElectronClientMode()) {
  const printers = await native.getPrinterList()
  await native.batchPrint(template, data, { noType: 1, printName: '打印机A' })
}

// 全局数据
const token = native.getToken()
await native.getGlobalData()
```

## 7. 注意事项

1. **环境判断前置**：调用壳能力前先用 `isClientMode()` 判断，壳外调用无响应
2. **异步消费**：大部分壳能力返回 Promise，需 `await` / `.then()` 消费
3. **版本要求**：部分能力有最低壳版本要求（如 `windowMove` 需 V2.1.0+）
4. **开发模拟**：开发环境可通过 `?clientType=` / `?clientVersion=` URL 参数模拟壳环境和版本
5. **DOM 方法语义**：`dom` 模块的 `querySelector/querySelectorAll` 返回布尔值而非元素
6. **事件枚举重复**：`type.ts` 与 `event.ts` 各有一个 `NativeEventKeys`，key 值不同，勿混用
7. **迁移兼容**：旧版 `utils/native/` 暂保留，业务应逐步迁移至 `@kye-netc/micro-native` 统一调用

## 8. 演进记录

| 阶段 | 内容 |
|------|------|
| v1 | 从 `utils/native` 提取壳能力到 `src/native/electron`，建立模块化结构 |
| v2 | 引入 `@kye-netc/micro-native` 作为统一注册中心，`src/native/index.ts` 作为入口 |
| v3 | 能力域扩展：由 electron/user 拆分为 electron / bom / dom / global / router / ui 六个模块 |
| v4 | 逐步废弃 `utils/native/`，业务迁移到 `@kye-netc/micro-native`（进行中） |
