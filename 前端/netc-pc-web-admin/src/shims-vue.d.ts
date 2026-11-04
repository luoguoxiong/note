/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
   // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'unplugin-vue-components'
declare module '*.png'
declare module '*.svg'
declare module 'vue-cropper'
declare module 'pdfh5'
declare module 'element-plus/dist/locale/zh-cn.mjs'

interface Window {
  VConsole?: any
  wx?: any
  dsBridge?: any
  bridge?: any
  kuasheng_openUrl?:any
  VueRouter?: any
  Vuex?: any
   Vue?: any
  echarts: typeof import('echarts')
  kye?: {
    getToken?: () => string
  }
  addressPicker?: {
    setAddressInfo: (address: string) => void
  }
  webkit?: any
  __KYE_ERROR_LOG?: {
    CUSTOM_REPORT: Function
    REPORT: Function
  }
  UAPM_JSBridge?: any
  UAPM_JSB_CONFIG?: any
  visibleSkeleton: (status: string) => void
  existRelationMap: Record<string, any>
  existValidationMap: Record<string, any>
  $native: any
  schema: any
  $$recordCheckAgreement: boolean
  $umpOtherReport
  /** new-client zoom 组件挂载的全局缩放展示函数 (旧: window.showZoomPanel) */
  showZoomPanel?: (zoom: any) => void
  /** new-client update 组件挂载的壳回调 (旧: window.getProgress / getProgressNew / geDownloadResult / progressError) */
  getProgress?: (data: any) => void
  getProgressNew?: (data: any) => void
  geDownloadResult?: (res: any) => void
  progressError?: () => void
}

declare global {
  import type { UmpOtherReportType } from '@/reportUmp/type/types'
  interface Window {
    $umpOtherReport: UmpOtherReportType
  }
}

declare global {
  import type { Native } from '@/utils/native'
  import type { Auth } from '@/utils/auth'
  declare module 'vue' {
    interface ComponentCustomProperties {
      $native: Native
      $auth: Auth
    }
  }
}
// 使用示例
// import { getCurrentInstance } from 'vue'
// const vm = getCurrentInstance()!
// const { $native } = vm?.appContext.config.globalProperties

// ==================== @kye-netc/micro-native 模块完整类型声明 ====================
// 说明：包内部使用 mapped type (NativeCustomMethods) 定义 native 类型，
// declaration merging 无法让已编译的 mapped type 动态更新，故需覆盖整个模块。
/* eslint-disable-next-line */ declare module '@kye-netc/micro-native' {
  export type NativeMode = 'standalone' | 'iframe' | 'micro-app' | 'micro-module'

  export const native: {
    // ==================== 公开 API ====================
    register<T extends Record<string, (...args: any[]) => any>>(methods: T): void
    clear(): void
    getRegisteredMethods(): string[]
    destroy(): void
    onMessage(callback: (payload: { fromApp: string; data: any }) => void): () => void
    addEventListener(event: string, callback: (...args: any[]) => void): void
    removeEventListener(event: string, callback: (...args: any[]) => void): void
    emit(event: string, ...args: any[]): void
    getMode(): NativeMode
    setAppName(name: string): void
    getAppName(): string

    // ==================== 壳类型判断 ====================
    isClientMode: () => Promise<boolean>
    isOldClientMode: () => Promise<boolean>
    isElectronClientMode: () => Promise<boolean>
    isKuaShenClientMode: () => Promise<boolean>
    getClientFrameType: () => Promise<number | undefined>
    existsNativeFunc: (funcName: any) => Promise<boolean>

    // ==================== 窗体操作 ====================
    getState: () => Promise<any>
    minimize: () => Promise<any>
    maximize: () => Promise<any>
    resume: () => Promise<any>
    close: () => Promise<any>
    sizable: () => Promise<any>
    noSizable: () => Promise<any>
    setLoginFormSize: () => Promise<any>
    setLoginFormFlag: (isLoginForm: boolean) => Promise<any>

    // ==================== 缓存操作 ====================
    getCacheInfo: (key: string) => Promise<any>
    setCacheInfo: (key: string, value: any) => Promise<any>

    // ==================== 打印相关 ====================
    getPrinterList: () => Promise<any>
    getPrintViewImage: (directives: any, dataJson: any, templateType: any) => Promise<any>
    batchPrint: (templateText: string, data: Record<string, any>, options: { noType: any; printName?: string }) => Promise<any>
    batchPrintAsync: (templateText: string, data: Record<string, any>, options: { noType: any; printName?: string; jsCallback: any }) => Promise<any>
    batchPrintNew: (printDataList: any, printName?: string, noType?: any) => Promise<any>
    printTag: (data: any, resourceID: any) => Promise<any>
    startKYEPrinter: (json: Record<string, any>) => Promise<any>

    // ==================== 文件操作 ====================
    readExcel: (filePath: any, headerIndex: any) => Promise<any>
    readExcelAsync: (filePath: any, headerIndex: any) => Promise<any>
    fileToBase64: (filePath: any, isReturnJson: Record<string, any>) => Promise<any>
    selectFileToBase64: (fileFilter: any) => Promise<any>
    getFileSize: (filePath: any) => Promise<number>
    downLoadFile: (url: string, fileType: any, fileName: string) => Promise<any>
    downLoadFileByBatch: (urlsJson: Record<string, any>, fileExtension: any) => Promise<any>
    downLoadFileByBatchNew: (urlsJson: Record<string, any>, fileExtension: any) => Promise<any>
    downloadFileByBase64: (base64: any, fileName: string, isOpenFile?: boolean) => Promise<any>
    exportTable: (data: any, fileName: string) => Promise<any>

    // ==================== 离线包相关 ====================
    is_native_offline: () => Promise<boolean>

    // ==================== 版本与系统信息 ====================
    getVersion: () => Promise<any>
    isNewVersion: () => Promise<any>
    systemUpgrade: () => Promise<any>
    updateClient: (json: Record<string, any>) => Promise<any>
    cancelUpdateClient: (json: Record<string, any>) => Promise<any>
    startSetup: (json: Record<string, any>) => Promise<any>
    existsVersionFile: (json: Record<string, any>) => Promise<any>
    checkOldClient: () => Promise<any>
    openUninstall: () => Promise<any>
    getMachineId: () => Promise<any>
    getSystemInfo: () => Promise<any>
    environment: () => Promise<any>
    updatePackageSetting: (json: Record<string, any>) => Promise<any>

    // ==================== 代理相关 ====================
    getProxyInfo: () => Promise<any>
    testProxy: (json: Record<string, any>) => Promise<any>
    setProxy: (json: Record<string, any>) => Promise<any>

    // ==================== 页面操作 ====================
    reload: () => Promise<any>
    reloadCurrentPage: () => Promise<any>
    clearCache: () => Promise<any>

    // ==================== 开发工具 ====================
    openDevTools: (json: Record<string, any>) => Promise<any>

    // ==================== 窗口控制 ====================
    windowMove: (json: Record<string, any>) => Promise<any>
    setRightMenu: (arg: any) => Promise<any>
    mainWindowFocus: (arg: any) => Promise<any>
    mainWindowBlur: () => Promise<any>

    // ==================== 缩放相关（跨声3.0） ====================
    switchZoom: (arg: any) => Promise<any>
    getZoom: () => Promise<any>

    // ==================== 截图相关（跨声3.0） ====================
    startCaptureWnd: () => Promise<any>

    // ==================== 剪贴板相关 ====================
    getClipboardContent: () => Promise<any>
    getClipboardImageFile: () => Promise<any>

    // ==================== 链接相关 ====================
    nativeOpenUrl: (url: string) => Promise<any>
    nativeBrowserOpenUrl: (url: string, name?: string) => Promise<any>

    // ==================== 更新日志 ====================
    getUpdateLog: (json: Record<string, any>) => Promise<any>

    // ==================== 用户相关 ====================
    getToken: () => Promise<string>
    getUserInfo: () => Promise<any>
  }
  export default native
}

