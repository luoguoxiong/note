/* eslint-disable max-params */
import { Any, PlainObject } from '@/types'
import Adapter from '@/utils/native/adapter'
import kuasheng from '@/utils/native/kuasheng'

/**
 * Native
 * 原生能力封装类
 */
const _window: Any = window

// 判断是否在客户端的原生模式
const isClientMode = () => {
  const type = getClientFrameType()
  return !!type
}
// 判断是否在客户端的旧壳原生模式
const isOldClientMode = () => {
  const type = getClientFrameType()
  return type && [1, 2, 3, 4].includes(type)
}
//判断是否在electron版本的壳子里面
const isElectronClientMode = () => {
  const type = getClientFrameType()
  return type && [5].includes(type)
}

// 判断是否在跨声的3.0壳子里面
const isKuaShenClientMode = () => {
  const type = getClientFrameType()
  return type && [6].includes(type)
}

/**
 * 调用C#方法
 * @param {string} funcName C#方法名
 * @param  {...any} args 参数
 * @returns
 */
const miniBlinkApi = (funcName: string, ...args: Any[]) => {
  return new Promise((resolve) => {
    _window['mbQuery'](1, JSON.stringify({ funcName, args }), (id: number, result: Any) => {
      console.log(id)
      resolve(JSON.parse(result))
    })
  })
}

/**
 * 获取客户端壳的版本
 * @returns 旧版返回1，新版返回2，非客户端壳返回undifinde
 */
const getClientFrameType = () => {
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
}

// 窗体操作 - 最小化、最大化、恢复默认、关闭，可拖动。不可拖动，
const win = {
  getState: () => {
    return __call('net_getWindowState')
  },
  minimize: () => {
    __call('net_setWindowState', 0)
  },
  maximize: () => {
    __call('net_setWindowState', 1)
  },
  resume: () => {
    __call('net_setWindowState', 2)
  },
  close: () => {
    __call('net_closeWindow')
  },
  sizable: () => {
    __call('net_setSizableState', true)
  },
  noSizable: () => {
    __call('net_setSizableState', false)
  },
  setLoginFormSize: () => {
    __call('net_setLoginFormSize')
  },
  setLoginFormFlag: (isLoginForm: boolean) => {
    __call('net_setLoginFormFlag', isLoginForm)
  },
}

// 缓存
const getCacheInfo = (key: string) => {
  return __call('net_getCacheInfo', key)
}

const setCacheInfo = (key: string, value: Any) => {
  if (isKuaShenClientMode() && typeof value === 'object') {
    value = JSON.stringify(value)
  }
  __call('net_setCacheInfo', key, value)
}

// 获取客户端本地打印机
const getPrinterList = () => {
  return __call('net_getPrinterList')
}

// 获取打印预览图
const getPrintViewImage = (directives: Any, dataJson: Any, templateType: Any) => {
  return __call('net_getPrintPreviewImage', directives, dataJson, templateType)
}

// 读取excel
const readExcel = (filePath: Any, headerIndex: Any) => {
  return __call('net_readExcel', filePath, headerIndex)
}
const readExcelAsync = (filePath: Any, headerIndex: Any) => {
  return __call('net_readExcelAsync', filePath, headerIndex)
}

// 读取excel, 仅支持壳1.0、2.0
const fileToBase64 = (filePath: Any, isReturnJson: PlainObject) => {
  return __call('net_fileToBase64', filePath, isReturnJson)
}

// 批量下载文件
const downLoadFileByBatch = (urlsJson: PlainObject, fileExtension: Any) => {
  return __call('net_downLoadFileByBatch', urlsJson, fileExtension)
}

const downLoadFile = (url: string, fileType: Any, fileName: string) => {
  url = downloadTemplateCompatible(url)
  return __call('net_downLoadFile', url, fileType, fileName)
}

/**
 * 获取离线包链接前缀
 * @returns {string}
 */
const getOffLinePath = function () {
  const index = window.location.href.indexOf('/index.html')
  return window.location.href.substr(0, index)
}

/**
 * 下载链接兼容离线包url下载
 * @param url <下载链接：window.location.origin + `templates/filename`>
 * @returns {*}
 */
const downloadTemplateCompatible = function (url: string) {
  if (url.startsWith('http')) {
    return url
  }
  if (is_native_offline()) {
    const fileIndex = url.indexOf('/templates')
    const filePath = url.substr(fileIndex)
    const offLinePath = getOffLinePath()
    url = `${offLinePath}${filePath}`
  }
  return url
}

//打印
// eslint-disable-next-line max-params
const batchPrint = (templateText: string, data: PlainObject, noType: Any, printName: string | undefined) => {
  return __call('net_batchPrint', templateText, data, noType, printName)
}

// eslint-disable-next-line max-params
const batchPrintAsync = (
  templateText: string,
  data: PlainObject,
  noType: Any,
  printName: string | undefined,
  jsCallback: Any
) => {
  return __call('net_batchPrintAsync', templateText, data, noType, printName, jsCallback)
}

//打印新方法，批量
const batchPrintNew = (printDataList: Any, printName: string | undefined, noType: Any) => {
  return __call('net_batchPrintNew', printDataList, printName, noType)
}

//导出表格
const exportTable = (data: Any, fileName: string) => {
  if (isElectronClientMode()) {
    data = Adapter.xlsxDataInElectron(data)
  }
  return __call('net_exportTable', data, fileName)
}

//打印标签
const printTag = (data: Any, resourceID: Any) => {
  return __call('net_printTag', data, resourceID)
}

//获取版本号
const getVersion = () => {
  return __call('net_getVersionNo')
}

//选择文件并返回base64
const selectFileToBase64 = (fileFilter: Any) => {
  return __call('net_selectFileToBase64', fileFilter)
}

//取得指定文件大小
const getFileSize = async (filePath: Any) => {
  const size = parseInt(await __call('net_getFileSize', filePath))
  return size
}

//下载base64格式的文件
const downloadFileByBase64 = (base64: Any, fileName: string, isOpenFile = true) => {
  return __call('net_downloadFileByBase64', base64, fileName, isOpenFile)
}

// 批量下载文件带文件名
const downLoadFileByBatchNew = (urlsJson: PlainObject, fileExtension: Any) => {
  return __call('net_downLoadFileByBatch_New', urlsJson, fileExtension)
}

//获取剪贴板内容
const getClipboardContent = () => {
  return __call('net_getClipboardContent')
}

//获取网络代理信息
const getProxyInfo = () => {
  return __call('net_getProxyInfo')
}

//是否需要升级
const isNewVersion = () => {
  return __call('net_isNewVersion')
}

const systemUpgrade = () => {
  return __call('net_systemUpgrade')
}

// 刷新当前页 <web包：刷新当前url, 本地离线包：只刷新文件不刷新路由>
const reload = () => {
  const href = window.location.href
  const offlineHashIndex = (is_native_offline() && href.indexOf('#')) || -1
  const url = offlineHashIndex > 0 ? href.substring(0, offlineHashIndex) : href
  return __call('net_reload', url)
}

// 获取原生端当前测试环境标识
const environment = () => {
  return __callOld('net_environment')
}

// 更新原生端版本配置
const updatePackageSetting = (json: PlainObject) => {
  return __call('net_updatePackageSetting', json)
}

// 获取electron新壳的腾讯云日志链接
const getUpdateLog = (json: PlainObject) => {
  return __call('electron_updateLog', json)
}

// 测试代理
const testProxy = (json: PlainObject) => {
  return __call('electron_testProxy', json)
}
//设置代理
const setProxy = (json: PlainObject) => {
  return __call('electron_setProxy', json)
}
//打开控制台
const openDevTools = (json: PlainObject) => {
  return __call('electron_openDevTools', json)
}
//获取新壳的设备id
const getMachineId = () => {
  return __call('electron_machineId')
}
//获取系统信息
const getSystemInfo = () => {
  return __call('electron_getSystemInfo')
}
//刷新当前页面
const reloadCurrentPage = () => {
  return __call('electron_reloadCurrentPage')
}
//判断壳版本是否已经下载
const existsVersionFile = (json: PlainObject) => {
  return __call('electron_existsVersionFile', json)
}

//调用新打印组件，没安装就会启动安装
const startKYEPrinter = (json: PlainObject) => {
  console.log('启动打印组件')
  return __call('electron_startKYEPrinter', json)
}
const updateClient = (json: PlainObject) => {
  return __call('electron_updateClient', json)
}
const cancelUpdateClient = (json: PlainObject) => {
  return __call('electron_cancelUpdateClient', json)
}
const startSetup = (json: PlainObject) => {
  console.log('electron_startSetUp', json)
  return __call('electron_startSetUp', json)
}

// 检查是否安装老壳V2.1.0开始
const checkOldClient = () => {
  return __call('electron_checkOldClient')
}
// 打开控制面板卸载V2.1.0开始
const openUninstall = () => {
  return __call('electron_openUninstall')
}
//控制窗口拖动V2.1.0开始
const windowMove = (json: PlainObject) => {
  console.log('入参', json, typeof json)
  return __call('electron_windowMove', json)
}

//鼠标右击菜单V2.1.2开始
const setRightMenu = (arg: Any) => {
  return __call('electron_setRightMenu', arg)
}

//主窗口聚焦 V2.2.1及以上
const mainWindowFocus = (arg: Any) => {
  return __call('electron_mainWinFocus', arg)
}
//主窗口失焦 V2.2.1及以上
const mainWindowBlur = () => {
  return __call('electron_mainWinBlur')
}

//控制页面缩放，arg:add增加，decrease降低,3.0.6版本及以上
const switchZoom = (arg: Any) => {
  return __call('kuasheng_switchZoom', arg)
}
//获取当前页面缩放比例,3.0.6版本及以上
const getZoom = () => {
  return __call('kuasheng_getZoom')
}

//进入全屏，web页面元素进入全屏后，隐藏任务栏，达到与浏览器一致的全屏效果。3.1.11版本及以上
const requestFullscreen = () => {
  return __call('kuasheng_requestFullscreen')
}
//退出全屏，退出全屏后，恢复任务栏，达到与浏览器一致的全屏效果。3.1.11版本及以上
const exitFullscreen = () => {
  return __call('kuasheng_exitFullscreen')
}

//调用cef中.net方法
const callCefSharpApi = async (funcName: string, ...args: Any[]) => {
  await _window.CefSharp.BindObjectAsync('netObjAsync')
  const result = await _window.netObjAsync[funcName](...args)
  return result
}

//调用webview2中.net方法
const callWebview2Api = async (funcName: string, ...args: Any[]) => {
  const result = await _window.chrome.webview.hostObjects.netFuncs[funcName](...args)
  return result
}

const __call = async (funcName: string, ...args: Any[]) => {
  const type = await getClientFrameType()
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

const __callOld = (funcName: Any, ...args: Any[]) => {
  // if(getClientFrameType() === 2){
  //   // alert(JSON.stringify(args))
  //   return miniBlinkApi(funcName, args)
  // }
  if (_window[funcName] && typeof window[funcName] === 'function') {
    return _window[funcName](...args)
  }
}

/**
 * 判断是否存在相应的C#方法
 * @param {String} funcName 方法名
 * @returns
 */
const existsNativeFunc = (funcName: Any) => {
  if (!funcName) {
    return false
  }
  // 此处不可使用await, existsNativeFunc 同步场景未验证
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

/**
 * 是否为原生-离线包
 * @returns {*|boolean}
 */
const is_native_offline = () => {
  const href = window.location.href
  const protocol = window.location.protocol
  return isClientMode() && href.indexOf('offlinePackage') > 0 && protocol === 'file:'
}

if (isKuaShenClientMode()) {
  kuasheng.kuashengNativeAsyn()
}

const nativeOpenUrl = (url: string) => {
  if (isKuaShenClientMode()) {
    return __call('kuasheng_openUrl', `{"url": "${url}"}`)
  }
}

export default {
  nativeOpenUrl,
  existsNativeFunc,
  isClientMode,
  isOldClientMode,
  getClientFrameType,
  win,
  getCacheInfo,
  setCacheInfo,
  getPrinterList,
  getPrintViewImage,
  readExcel,
  readExcelAsync,
  fileToBase64,
  getFileSize,
  downLoadFileByBatch,
  downLoadFile,
  batchPrint,
  batchPrintAsync,
  exportTable,
  printTag,
  getVersion,
  selectFileToBase64,
  downloadFileByBase64,
  downLoadFileByBatchNew,
  getClipboardContent,
  getProxyInfo,
  batchPrintNew,
  isNewVersion,
  systemUpgrade,
  reload,
  environment,
  updatePackageSetting,
  is_native_offline,
  getUpdateLog,
  testProxy,
  setProxy,
  startKYEPrinter,
  openDevTools,
  updateClient,
  startSetup,
  getMachineId,
  cancelUpdateClient,
  existsVersionFile,
  getSystemInfo,
  reloadCurrentPage,
  checkOldClient,
  openUninstall,
  windowMove,
  setRightMenu,
  mainWindowFocus,
  mainWindowBlur,
  isKuaShenClientMode,
  isElectronClientMode,
  switchZoom,
  getZoom,
  requestFullscreen,
  exitFullscreen,
}
