# Electron 壳能力封装

专门用于维护 netc-pc-web-admin 与客户端壳交互的所有能力方法。

## 目录结构

```
src/electron/
├── index.ts       # 主入口文件，包含所有壳能力方法
├── adapter.ts     # 适配器，处理网页与客户端不一致的情况
├── kuasheng.ts    # 跨声 3.0 壳异步回调处理
├── types.ts       # 类型定义
└── README.md      # 本文档
```

## 快速开始

### 方式一：按需导入

```typescript
import { isClientMode, win, batchPrint } from '@/electron'

// 判断是否在壳环境
if (isClientMode()) {
  // 调用窗体操作
  win.minimize()
  
  // 调用打印方法
  batchPrint(template, data, noType, printerName)
}
```

### 方式二：导入默认对象

```typescript
import electron from '@/electron'

if (electron.isClientMode()) {
  electron.win.maximize()
}
```

## 壳类型

| 类型值 | 壳名称 | 说明 |
|--------|--------|------|
| 1 | 旧壳 | 早期壳版本 |
| 2 | MiniBlink | MiniBlink 内核壳 |
| 3 | CefSharp | CefSharp 内核壳 |
| 4 | WebView2 | WebView2 内核壳 |
| 5 | Electron | Electron 壳 |
| 6 | 跨声 3.0 | 跨声最新 3.0 壳 |

### 类型判断方法

```typescript
import { 
  isClientMode,
  isOldClientMode, 
  isElectronClientMode, 
  isKuaShenClientMode,
  getClientFrameType 
} from '@/electron'

// 是否在任意壳环境
isClientMode()

// 是否在旧壳环境
isOldClientMode()

// 是否在 Electron 壳
isElectronClientMode()

// 是否在跨声 3.0 壳
isKuaShenClientMode()

// 获取具体的壳类型
getClientFrameType() // 返回 1-6 或 undefined
```

## 能力分类

### 1. 窗体操作

```typescript
import { win } from '@/electron'

win.getState()           // 获取窗口状态
win.minimize()           // 最小化
win.maximize()           // 最大化
win.resume()             // 恢复
win.close()              // 关闭
win.sizable()            // 可调整大小
win.noSizable()          // 不可调整大小
win.setLoginFormSize()   // 设置登录窗体大小
win.setLoginFormFlag(isLoginForm)  // 设置登录窗体标识
```

### 2. 缓存操作

```typescript
import { getCacheInfo, setCacheInfo } from '@/electron'

// 获取缓存
getCacheInfo('key')

// 设置缓存
setCacheInfo('key', 'value')
```

### 3. 打印相关

```typescript
import {
  getPrinterList,
  getPrintViewImage,
  batchPrint,
  batchPrintAsync,
  batchPrintNew,
  printTag,
  startKYEPrinter
} from '@/electron'

// 获取打印机列表
getPrinterList()

// 批量打印
batchPrint(templateText, data, noType, printName)

// 打印标签
printTag(data, resourceID)

// 启动打印组件
startKYEPrinter({})
```

### 4. 文件操作

```typescript
import {
  readExcel,
  readExcelAsync,
  fileToBase64,
  selectFileToBase64,
  getFileSize,
  downLoadFile,
  downLoadFileByBatch,
  downLoadFileByBatchNew,
  downloadFileByBase64,
  exportTable
} from '@/electron'

// 读取 Excel
readExcel(filePath, headerIndex)

// 选择文件并转 Base64
selectFileToBase64(filter)

// 下载文件
downLoadFile(url, fileType, fileName)

// 导出表格
exportTable(data, fileName)
```

### 5. 版本与系统信息

```typescript
import {
  getVersion,
  isNewVersion,
  systemUpgrade,
  updateClient,
  cancelUpdateClient,
  startSetup,
  existsVersionFile,
  checkOldClient,
  openUninstall,
  getMachineId,
  getSystemInfo,
  environment,
  updatePackageSetting
} from '@/electron'

// 获取版本号
getVersion()

// 检查是否需要升级
isNewVersion()

// 系统升级
systemUpgrade()

// 获取系统信息
getSystemInfo()
```

### 6. 代理相关

```typescript
import { getProxyInfo, testProxy, setProxy } from '@/electron'

// 获取代理信息
getProxyInfo()

// 测试代理
testProxy({ proxyConfig })

// 设置代理
setProxy({ proxyConfig })
```

### 7. 页面操作

```typescript
import { reload, reloadCurrentPage, clearCache } from '@/electron'

// 刷新页面
reload()

// 刷新当前页面（Electron）
reloadCurrentPage()

// 清除缓存（跨声壳）
clearCache()
```

### 8. 窗口控制

```typescript
import {
  windowMove,
  setRightMenu,
  mainWindowFocus,
  mainWindowBlur
} from '@/electron'

// 控制窗口拖动
windowMove({ x, y })

// 设置右键菜单
setRightMenu(menuConfig)

// 主窗口聚焦
mainWindowFocus({})

// 主窗口失焦
mainWindowBlur()
```

### 9. 缩放（跨声 3.0）

```typescript
import { switchZoom, getZoom } from '@/electron'

// 切换缩放
switchZoom('add')    // 增加
switchZoom('decrease') // 降低

// 获取当前缩放比例
getZoom()
```

### 10. 截图（跨声 3.0）

```typescript
import { startCaptureWnd } from '@/electron'

// 开始截图
startCaptureWnd()
```

### 11. 剪贴板

```typescript
import { getClipboardContent, getClipboardImageFile } from '@/electron'

// 获取剪贴板内容
getClipboardContent()

// 获取剪贴板图片
getClipboardImageFile()
```

### 12. 链接

```typescript
import { nativeOpenUrl, nativeBrowserOpenUrl } from '@/electron'

// 打开浏览器页面（仅跨声壳）
nativeOpenUrl('https://example.com')

// 打开浏览器页面（兼容网页和跨声壳）
nativeBrowserOpenUrl('https://example.com', '_blank')
```

### 13. 开发工具

```typescript
import { openDevTools } from '@/electron'

// 打开控制台
openDevTools({})
```

## 适配器

`adapter.ts` 提供了一些兼容方法：

```typescript
import { openLink, xlsxDataInElectron } from '@/electron/adapter'

// 智能打开链接（自动判断环境）
openLink('https://example.com')

// 处理 Excel 数据格式（Electron 壳专用）
const formattedData = xlsxDataInElectron(rawData)
```

## 离线包判断

```typescript
import { is_native_offline } from '@/electron'

if (is_native_offline()) {
  // 在离线包环境中
}
```

## 原生方法检查

```typescript
import { existsNativeFunc } from '@/electron'

// 检查是否存在某个原生方法
if (existsNativeFunc('net_someMethod')) {
  // 方法存在，可以调用
}
```

## 注意事项

1. **环境判断优先**：调用壳能力前，务必先用 `isClientMode()` 判断环境
2. **Promise 处理**：大部分方法返回 Promise，需要使用 async/await 或 .then() 处理
3. **跨声 3.0 特性**：缩放、截图等功能仅在跨声 3.0 壳中可用
4. **版本兼容**：部分功能有最低版本要求，使用前注意检查壳版本

## 迁移说明

从 `@/utils/native` 迁移到 `@/electron` 的方式：

```typescript
// 旧方式
import native from '@/utils/native'
native.isClientMode()

// 新方式
import { isClientMode } from '@/electron'
isClientMode()
```

或者保持默认对象导入：

```typescript
import electron from '@/electron'
electron.isClientMode()
```
