/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Electron 壳能力封装
 * 提供与客户端壳交互的所有能力方法
 */
import type { Any, PlainObject } from '@/types'
import adapter from './adapter'
import kuasheng from './kuasheng'

const _window: Any = window

// ==================== 壳类型判断 ====================

/**
 * 判断是否在客户端的原生模式
 */
export const isClientMode = (): boolean => {
  const type = getClientFrameType()
  return !!type
}

/**
 * 判断是否在客户端的旧壳原生模式
 */
export const isOldClientMode = (): boolean => {
  const type = getClientFrameType()
  return type ? [1, 2, 3, 4].includes(type) : false
}
/**
 * 判断是否在 electron 版本的壳子里面
 */
export const isElectronClientMode = (): boolean => {
  const type = getClientFrameType()
  return type ? [5].includes(type) : false
}

/**
 * 判断是否在跨声的 3.0 壳子里面
 */
export const isKuaShenClientMode = (): boolean => {
  const type = getClientFrameType()
  return type ? [6].includes(type) : false
}

/**
 * 获取客户端壳的版本类型
 * @returns 壳类型，非客户端壳返回 undefined
 */
export const getClientFrameType = (): number | undefined => {
  // 开发测试用: url 带 clientType 参数可强制模拟壳类型(如 ?clientType=5 electron新壳 / 6 跨声3.0 / 1 旧壳)
  if (process.env.NODE_ENV === 'development') {
    const match = window.location.search.match(/[?&]clientType=(\d+)/)
    if (match) return Number(match[1])
  }
  if (_window['net_isInClient'] && typeof _window['net_isInClient'] === 'function') {
    return 1
  } else if (_window.webViewName && _window.mbQuery && typeof _window.mbQuery === 'function') {
    return 2
  } else if (_window.CefSharp) {
    return 3
  } else if (_window.electronClient) {
    return 5
  }
  if (_window.chrome?.webview?.hostObjects?.netFuncs) {
    return 4
  }
  if (_window.electronClient) {
    return 5
  }
  if (navigator.userAgent.indexOf('kuasheng_work') > -1) {
    return 6
  }
  return undefined
}

// ==================== 内部调用方法 ====================

/**
 * 调用 MiniBlink 壳方法
 */
const miniBlinkApi = (funcName: string, ...args: Any[]): Promise<any> => {
  return new Promise((resolve) => {
    _window['mbQuery'](1, JSON.stringify({ funcName, args }), (id: number, result: Any) => {
      console.log('MiniBlink 返回', id)
      resolve(JSON.parse(result))
    })
  })
}

/**
 * 调用 CefSharp 壳方法
 */
const callCefSharpApi = async (funcName: string, ...args: Any[]): Promise<any> => {
  await _window.CefSharp.BindObjectAsync('netObjAsync')
  const result = await _window.netObjAsync[funcName](...args)
  return result
}

/**
 * 调用 WebView2 壳方法
 */
const callWebview2Api = async (funcName: string, ...args: Any[]): Promise<any> => {
  const result = await _window.chrome.webview.hostObjects.netFuncs[funcName](...args)
  return result
}

/**
 * 通用调用方法，自动适配不同壳类型
 */
const __call = async (funcName: string, ...args: Any[]): Promise<any> => {
  const type = getClientFrameType()
  if (type === 4) {
    return await callWebview2Api(funcName, ...args)
  } else if (type === 3) {
    return await callCefSharpApi(funcName, ...args)
  } else if (type === 2) {
    return await miniBlinkApi(funcName, args)
  }

  if (_window[funcName] && typeof _window[funcName] === 'function') {
    return _window[funcName](...args)
  }
}

/**
 * 旧壳调用方法
 */
const __callOld = (funcName: any, ...args: any[]): any => {
  if (_window[funcName] && typeof _window[funcName] === 'function') {
    return _window[funcName](...args)
  }
}

/**
 * 判断是否存在相应的原生方法
 * @param funcName 方法名
 * @returns 是否存在
 */
export const existsNativeFunc = (funcName: Any): boolean => {
  if (!funcName) {
    return false
  }
  // 此处不可使用 await, existsNativeFunc 同步场景未验证
  const type = getClientFrameType()
  let netFunction = _window[funcName]
  if (type === 4) {
    netFunction = _window.chrome.webview.hostObjects.netFuncs[funcName]
  }
  let exists = netFunction && typeof netFunction === 'function'
  if (!exists && !funcName.startsWith('net_')) {
    funcName = `net_${funcName}`
    exists = _window[funcName] && typeof _window[funcName] === 'function'
    if (!exists && type === 4) {
      exists =
        _window.chrome.webview.hostObjects.netFuncs[funcName] &&
        typeof _window.chrome.webview.hostObjects.netFuncs[funcName] === 'function'
    }
  }
  return exists
}

// ==================== 窗体操作 ====================

/** 获取窗口状态 */
export const getState = () => __call('net_getWindowState')
/** 最小化窗口 */
export const minimize = () => __call('net_setWindowState', 0)
/** 最大化窗口 */
export const maximize = () => __call('net_setWindowState', 1)
/** 恢复窗口 */
export const resume = () => __call('net_setWindowState', 2)
/** 关闭窗口 */
export const close = () => __call('net_closeWindow')
/** 窗口可调整大小 */
export const sizable = () => __call('net_setSizableState', true)
/** 窗口不可调整大小 */
export const noSizable = () => __call('net_setSizableState', false)
/** 设置登录窗体大小 */
export const setLoginFormSize = () => __call('net_setLoginFormSize')

/**
 * 设置登录窗体标识
 * @param isLoginForm 是否登录窗体
 */

export const setLoginFormFlag = (isLoginForm: boolean) => __call('net_setLoginFormFlag', isLoginForm)

// ==================== 缓存操作 ====================

/**
 * 获取缓存信息
 * @param key 缓存键
 */
export const getCacheInfo = (key: string): Promise<any> => {
  return __call('net_getCacheInfo', key)
}

/**
 * 设置缓存信息
 * @param key 缓存键
 * @param value 缓存值
 */
export const setCacheInfo = (key: string, value: Any): Promise<any> => {
  let cacheValue = value
  if (isKuaShenClientMode() && typeof value === 'object') {
    cacheValue = JSON.stringify(value)
  }
  return __call('net_setCacheInfo', key, cacheValue)
}

// ==================== 打印相关 ====================

/**
 * 获取客户端本地打印机列表
 */
export const getPrinterList = (): Promise<any> => {
  return __call('net_getPrinterList')
}

/**
 * 获取打印预览图
 * @param directives 指令
 * @param dataJson 数据
 * @param templateType 模板类型
 */
export const getPrintViewImage = (directives: Any, dataJson: Any, templateType: Any): Promise<any> => {
  return __call('net_getPrintPreviewImage', directives, dataJson, templateType)
}

/**
 * 批量打印
 */
export const batchPrint = (
  templateText: string,
  data: PlainObject,
  options: { noType: Any; printName?: string }
): Promise<any> => {
  return __call('net_batchPrint', templateText, data, options.noType, options.printName)
}

/**
 * 异步批量打印
 */
export const batchPrintAsync = (
  templateText: string,
  data: PlainObject,
  options: { noType: Any; printName?: string; jsCallback: Any }
): Promise<any> => {
  return __call('net_batchPrintAsync', templateText, data, options.noType, options.printName, options.jsCallback)
}

/**
 * 批量打印（新方法）
 */
export const batchPrintNew = (printDataList: Any, printName?: string, noType?: Any): Promise<any> => {
  return __call('net_batchPrintNew', printDataList, printName, noType)
}

/**
 * 打印标签
 */
export const printTag = (data: Any, resourceID: Any): Promise<any> => {
  return __call('net_printTag', data, resourceID)
}

/**
 * 启动打印组件，没安装就会启动安装
 */
export const startKYEPrinter = (json: PlainObject): Promise<any> => {
  console.log('启动打印组件')
  return __call('electron_startKYEPrinter', json)
}

// ==================== 文件操作 ====================

/**
 * 读取 Excel
 */
export const readExcel = (filePath: Any, headerIndex: Any): Promise<any> => {
  return __call('net_readExcel', filePath, headerIndex)
}

/**
 * 异步读取 Excel
 */
export const readExcelAsync = (filePath: Any, headerIndex: Any): Promise<any> => {
  return __call('net_readExcelAsync', filePath, headerIndex)
}

/**
 * 文件转 Base64（仅支持壳 1.0、2.0）
 */
export const fileToBase64 = (filePath: Any, isReturnJson: PlainObject): Promise<any> => {
  return __call('net_fileToBase64', filePath, isReturnJson)
}

/**
 * 选择文件并返回 Base64
 */
export const selectFileToBase64 = (fileFilter: Any): Promise<any> => {
  return __call('net_selectFileToBase64', fileFilter)
}

/**
 * 获取指定文件大小
 */
export const getFileSize = async (filePath: Any): Promise<number> => {
  const size = parseInt(await __call('net_getFileSize', filePath))
  return size
}

/**
 * 下载单个文件
 */
export const downLoadFile = (url: string, fileType: Any, fileName: string): Promise<any> => {
  const compatibleUrl = downloadTemplateCompatible(url)
  return __call('net_downLoadFile', compatibleUrl, fileType, fileName)
}

/**
 * 批量下载文件
 */
export const downLoadFileByBatch = (urlsJson: PlainObject, fileExtension: Any): Promise<any> => {
  return __call('net_downLoadFileByBatch', urlsJson, fileExtension)
}

/**
 * 批量下载文件（带文件名）
 */
export const downLoadFileByBatchNew = (urlsJson: PlainObject, fileExtension: Any): Promise<any> => {
  return __call('net_downLoadFileByBatch_New', urlsJson, fileExtension)
}

/**
 * 下载 Base64 格式文件
 */
export const downloadFileByBase64 = (base64: Any, fileName: string, isOpenFile = true): Promise<any> => {
  return __call('net_downloadFileByBase64', base64, fileName, isOpenFile)
}

/**
 * 导出表格
 */
export const exportTable = (data: Any, fileName: string): Promise<any> => {
  let tableData = data
  if (isElectronClientMode()) {
    tableData = adapter.xlsxDataInElectron(data)
  }
  return __call('net_exportTable', tableData, fileName)
}

// ==================== 离线包相关 ====================

/**
 * 判断是否为原生离线包
 */
export const is_native_offline = (): boolean => {
  const href = window.location.href
  const protocol = window.location.protocol
  return isClientMode() && href.indexOf('offlinePackage') > 0 && protocol === 'file:'
}

/**
 * 获取离线包链接前缀
 */
const getOffLinePath = (): string => {
  const index = window.location.href.indexOf('/index.html')
  return window.location.href.substring(0, index)
}

/**
 * 下载链接兼容离线包 URL 下载
 */
const downloadTemplateCompatible = (url: string): string => {
  if (url.startsWith('http')) {
    return url
  }
  if (is_native_offline()) {
    const fileIndex = url.indexOf('/templates')
    const filePath = url.substring(fileIndex)
    const offLinePath = getOffLinePath()
    url = `${offLinePath}${filePath}`
  }
  return url
}

// ==================== 版本与系统信息 ====================

/**
 * 获取版本号
 */
export const getVersion = (): Promise<any> => {
  // 开发测试用: url 带 clientVersion 参数可强制模拟壳版本(如 ?clientVersion=V3.1.2)
  if (process.env.NODE_ENV === 'development') {
    const match = window.location.search.match(/[?&]clientVersion=([^&]+)/)
    if (match) return Promise.resolve(decodeURIComponent(match[1]))
  }
  return __call('net_getVersionNo')
}

/**
 * 检查是否需要升级
 */
export const isNewVersion = (): Promise<any> => {
  return __call('net_isNewVersion')
}

/**
 * 系统升级
 */
export const systemUpgrade = (): Promise<any> => {
  return __call('net_systemUpgrade')
}

/**
 * 更新客户端
 */
export const updateClient = (json: PlainObject): Promise<any> => {
  return __call('electron_updateClient', json)
}

/**
 * 取消更新客户端
 */
export const cancelUpdateClient = (json: PlainObject): Promise<any> => {
  return __call('electron_cancelUpdateClient', json)
}

/**
 * 启动安装
 */
export const startSetup = (json: PlainObject): Promise<any> => {
  console.log('electron_startSetUp', json)
  return __call('electron_startSetUp', json)
}

/**
 * 判断壳版本是否已经下载
 */
export const existsVersionFile = (json: PlainObject): Promise<any> => {
  return __call('electron_existsVersionFile', json)
}

/**
 * 检查是否安装老壳（V2.1.0开始）
 */
export const checkOldClient = (): Promise<any> => {
  return __call('electron_checkOldClient')
}

/**
 * 打开控制面板卸载（V2.1.0开始）
 */
export const openUninstall = (): Promise<any> => {
  return __call('electron_openUninstall')
}

/**
 * 获取新壳的设备 ID
 */
export const getMachineId = (): Promise<any> => {
  return __call('electron_machineId')
}

/**
 * 获取系统信息
 */
export const getSystemInfo = (): Promise<any> => {
  return __call('electron_getSystemInfo')
}

/**
 * 获取原生端当前测试环境标识
 */
export const environment = (): any => {
  return __callOld('net_environment')
}

/**
 * 更新原生端版本配置
 */
export const updatePackageSetting = (json: PlainObject): Promise<any> => {
  return __call('net_updatePackageSetting', json)
}

// ==================== 代理相关 ====================

/**
 * 获取网络代理信息
 */
export const getProxyInfo = (): Promise<any> => {
  return __call('net_getProxyInfo')
}

/**
 * 测试代理
 */
export const testProxy = (json: PlainObject): Promise<any> => {
  return __call('electron_testProxy', json)
}

/**
 * 设置代理
 */
export const setProxy = (json: PlainObject): Promise<any> => {
  return __call('electron_setProxy', json)
}

// ==================== 页面操作 ====================

/**
 * 刷新当前页（web包刷新 url，本地离线包只刷新文件不刷新路由）
 */
export const reload = (): Promise<any> => {
  const href = window.location.href
  const offlineHashIndex = (is_native_offline() && href.indexOf('#')) || -1
  const url = offlineHashIndex > 0 ? href.substring(0, offlineHashIndex) : href
  return __call('net_reload', url)
}

/**
 * 刷新当前页面（Electron）
 */
export const reloadCurrentPage = (): Promise<any> => {
  return __call('electron_reloadCurrentPage')
}

/**
 * 清除缓存（跨声壳）
 */
export const clearCache = (): Promise<any> | undefined => {
  if (isKuaShenClientMode() && _window['electron_reloadlgnoreCache']) {
    return __call('electron_reloadlgnoreCache')
  }
  return undefined
}

// ==================== 开发工具 ====================

/**
 * 打开控制台
 */
export const openDevTools = (json: PlainObject): Promise<any> => {
  return __call('electron_openDevTools', json)
}

// ==================== 窗口控制 ====================

/**
 * 控制窗口拖动（V2.1.0开始）
 */
export const windowMove = (json: PlainObject): Promise<any> => {
  console.log('入参', json, typeof json)
  return __call('electron_windowMove', json)
}

/**
 * 鼠标右击菜单（V2.1.2开始）
 */
export const setRightMenu = (arg: Any): Promise<any> => {
  return __call('electron_setRightMenu', arg)
}

/**
 * 主窗口聚焦（V2.2.1及以上）
 */
export const mainWindowFocus = (arg: Any): Promise<any> => {
  return __call('electron_mainWinFocus', arg)
}

/**
 * 主窗口失焦（V2.2.1及以上）
 */
export const mainWindowBlur = (): Promise<any> => {
  return __call('electron_mainWinBlur')
}

// ==================== 缩放相关（跨声3.0） ====================

/**
 * 控制页面缩放（add增加，decrease降低，3.0.6版本及以上）
 */
export const switchZoom = (arg: Any): Promise<any> => {
  return __call('kuasheng_switchZoom', arg)
}

/**
 * 获取当前页面缩放比例（3.0.6版本及以上）
 */
export const getZoom = (): Promise<any> => {
  return __call('kuasheng_getZoom')
}

// ==================== 全屏相关（跨声3.0） ====================

/**
 * 进入全屏：web 页面元素进入全屏后，隐藏任务栏，达到与浏览器一致的全屏效果（3.1.11版本及以上）
 */
export const requestFullscreen = (): Promise<any> => {
  return __call('kuasheng_requestFullscreen')
}

/**
 * 退出全屏：退出全屏后，恢复任务栏，达到与浏览器一致的全屏效果（3.1.11版本及以上）
 */
export const exitFullscreen = (): Promise<any> => {
  return __call('kuasheng_exitFullscreen')
}

// ==================== 截图相关（跨声3.0） ====================

/**
 * 开始截图
 */
export const startCaptureWnd = (): Promise<any> => {
  return __call('kuasheng_startCaptureWnd')
}

// ==================== 剪贴板相关 ====================

/**
 * 获取剪贴板内容
 */
export const getClipboardContent = (): Promise<any> => {
  return __call('net_getClipboardContent')
}

/**
 * 获取剪贴板图片
 */
export const getClipboardImageFile = (): Promise<any> => {
  return __call('kuasheng_getImageFilesFromClipBoard')
}

// ==================== 链接相关 ====================

/**
 * 打开浏览器页面（跨声壳）
 */
export const nativeOpenUrl = (url: string): Promise<any> | undefined => {
  if (isKuaShenClientMode()) {
    return __call('kuasheng_openUrl', `{"url": "${url}"}`)
  }
  return undefined
}

/**
 * 打开浏览器页面（兼容跨声壳和网页）
 */
export const nativeBrowserOpenUrl = (url: string, name = '_blank'): any => {
  if (isKuaShenClientMode() && _window['kuasheng_openUrl']) {
    return __call('kuasheng_openUrl', `{"url": "${url}"}`)
  } else {
    window.open(url, name)
  }
}

// ==================== 更新日志 ====================

/**
 * 获取 electron 新壳的腾讯云日志链接
 */
export const getUpdateLog = (json: PlainObject): Promise<any> => {
  return __call('electron_updateLog', json)
}

// ==================== 初始化 ====================

// 初始化跨声壳异步回调
if (isKuaShenClientMode()) {
  kuasheng.kuashengNativeAsyn()
}
