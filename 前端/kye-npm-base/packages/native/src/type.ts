import { MiniAppPages } from './constants/miniAppConfig'

export type ENV = 'uat' | 'stg' | 'prod'

export enum AppResCode {
  SUCCESS = '0',
  ERROR = '-1', // 未知错误
  CANCEL = '-2', // 用户取消操作
  NOAUTH = '-3', // 权限不足
  WXAPISDKERROR = '-4', // 微信API错误
  JSSDKFAIL = '-5', // JSSDK加载失败
  WXCONFIGERROR = '-6', // 微信配置错误
  NOSUPPORT = '-7', // 不支持API
}

declare global {
  interface Window {
    wx: any
    dsBridge: any
    ap: any
    my: any
    webkit: any
    kye: any
    getPhotos: any
    onprivacyAuth: any
  }
}

export interface Config {
  wxjssdk: string
}

export interface ChooseImageParmas {
  count?: number
  sizeType?: ['original', 'compressed']
  sourceType?: ['album', 'camera']
}

export type WithErrorRes<T> = {
  errorMessage?: string
  errMsg?: string
  error?: string
  code?: string
} & T

export interface ChooseImageRes {
  imgList: ChooseImageFile[]
}

export interface ChooseImageFile {
  fileName: string
  fileSize: string
  base64: string
}

export interface ScanQRCodeParmas {
  needResult?: 0 | 1
  scanType?: ['qrCode', 'barCode']
}

export interface ScanQRCodeRes {
  scanResult: string
}

export interface NavigateToParmas {
  /** 小程序路由，或者app的page */
  url: string
  page?: MiniAppPages
  type?: 'navigateTo' | 'redirectTo' | 'switchTab' | 'reLaunch'
  params?: Record<string, string | number> | any
}

export interface NavigateBackParmas {
  delta: number
}

export interface ShareParmas {
  // 微信路径
  programPath?: string
  // 微信分享图片、支付宝分享小图片
  imageUrl?: string
  // 微信、支付宝、app分享标题
  title?: string
  // 支付宝分享路径
  path?: string
  //  支付宝搜索技巧
  searchTip?: string
  // 支付宝自定口令
  content?: string
  // 支付宝分享封面
  bgImgUrl?: string
  // app 分享类型
  contentType?: 'miniprogram' | 'image' | 'url'
  // app 分享图片
  imgUrl?: string
  // app 分享
  platform?: 'weixin' | 'weixin_timeline'
  // 支付宝 app 分享描述
  desc?: string
  // app 分享contentType为 url 时 分享链接
  link?: string
  // app 分享contentType为 miniprogram 时 分享小程序原始I
  programUserName?: string
  // app 分享版本类型
  programType?: number // 正式版:0，测试版:1，体验版:2
}

export interface PreviewImageParmas {
  current?: number | string
  urls?: string[]
}

export interface GetLocationParmas {
  type: 'wgs84' | 'gcj02'
}

export interface GetLocationRes {
  latitude: string
  longitude: string
}

export interface OpenLocationParmas {
  latitude: number
  longitude: number
  name?: string
  address?: string
  scale?: number
}

export interface OpenWebviewParmas {
  needLogin?: boolean
  withToken?: boolean
  url: string
  [key: string]: any
}

export type PostMessageParmas =
  | {
      plateform?: 'alipay' | 'wx' | 'app'
      method?: string
      taskKey?: string
      data?: Record<string, any>
    }
  | Record<string, any>

export interface OpenPreloadCacheWebViewParmas {
  page: string
}

export interface ChooseFileParmas {
  /** ['xls', 'xlsx', 'doc', 'docx', 'pdf'] */
  fileType: string[]
}

export interface ChooseFileRes {
  base64: string
  fileName: string
  fileSize: number
}

export interface CheckApiParmas {
  api: string
}

export interface CheckApiRes {
  /** 1 存在 0 不存在 */
  result: '1' | '0'
}

export interface GetClipboardDataParmas {
  necessary: boolean
}

export interface SetNavigationBarParmas {
  isHidden: boolean
}

export interface CheckBluetoothAuthRes {
  /**
   * 0：已开启
   * 1：手机蓝牙未开启，请在设置页打开蓝牙
   * 2：APP蓝牙权限未开启，请在手机“设置-应用-跨越速运-蓝牙权限”进行设置，注意：前往设置后，APP会重新启动，可在查件中发起面单打印。
   * 3：手机定位未开启，请在设置页打开定位，注意：前往设置后，APP会重新启动，可在查件中发起面单打印。
   * 4：'APP定位权限未开启，请在手机“设置-应用-跨越速运-定位权限”进行设置，注意：前往设置后，APP会重新启动，可在查件中发起面单打印。
   */
  state: number
}

export interface GetBluetoothDeviceRes {
  address: string
  state: number
  deviceNo: string
  name: string
  printerType: string
  uuid: number
}

export interface DownloadImageParmas {
  imageData: string
}

export interface DownloadFileParmas {
  url: string
}

export interface ToastParmas {
  message: string
}

export interface SelectPhotosFromSDParmas {
  count: number
}

export interface JumpToNativePageParmas {
  pageCode: number
}

export interface SwitchTabParmas {
  /** 小程序路由，或者app的page */
  url: string
}

export interface RedirectToParams {
  /** 小程序路由，或者app的page */
  url: string
}

export interface CheckSystemPermissionParams {
  type: number
}

export interface StatusBarHeight {
  height: number
}

export type CustomParams = Record<string, any>

export interface OpenMiniProgramParmas {
  /** 小程序原始ID */
  userName: string
  /** 跳转路径 */
  path: string
  /** 0-正式版，1-开发版，2-体验版 */
  miniprogramType: number
}

export interface OpenMiniProgramParmas {
  appid: string
  userName: string
  /**正式版:0，测试版:1，体验版:2 */
  miniprogramType: number
  miniProgramName: string
}

export interface ShareImage {
  imagePath: string
  thumbPath?: string
  /** 发送的目标场景,0=分享到会话,1=分享到朋友圈，2=分享到收藏 */
  scene: 0 | 1 | 2
  /** 启动小程序username（小程序的原始id，gh_xxx） */
  entranceMiniProgramUsername: string
  /**启动小程路径；  */
  entranceMiniProgramPath: string
}

export interface ShareMiniApp {
  userName: string
  path: string
  title?: string
  imagePath: string
  webpageUrl: string
  withShareTicket: boolean
  miniprogramType: 0 | 1 | 2
  scene: number
}

interface ShareWebPage {
  title: string
  description: string
  thumbPath: string
  webpageUrl: string
  scene: 0 | 1 | 2
}

type ShareType = 'ShareImage' | 'ShareMiniApp' | 'ShareWebPage'

export interface ShareToWxMini {
  type: ShareType
  shareInfo: ShareMiniApp | ShareImage | ShareWebPage
}

export interface NativeType {
  /** 选择图片，转base64 */
  chooseImage: (parmas?: ChooseImageParmas) => Promise<ChooseImageRes>

  /** 扫码 */
  scanQRCode: (parmas?: ScanQRCodeParmas) => Promise<ScanQRCodeRes>

  /** 跳转至其他原生路由 */
  navigateTo: (parmas: NavigateToParmas) => Promise<void>

  /** 返回 */
  navigateBack: (params?: NavigateBackParmas) => Promise<void>

  /** 分享 */
  share: (params?: ShareParmas) => Promise<void>

  /** 预览图片 */
  previewImage: (parmas: PreviewImageParmas) => Promise<void>

  /** 登录 */
  login: () => Promise<void>

  /** 原生通信 */
  postMessage: (params: PostMessageParmas) => Promise<void>

  /** 定位获取经纬度 */
  getLocation: (parmas: GetLocationParmas) => Promise<GetLocationRes>

  /** 打开地图 */
  openLocation: (parmas: OpenLocationParmas) => Promise<void>

  /** 新开webview打开 */
  openWebview: (parmas: OpenWebviewParmas) => Promise<void>

  /** 仅App 跳转至预加载路由 */
  openPreloadCacheWebView: (
    parmas: OpenPreloadCacheWebViewParmas,
  ) => Promise<void>

  /** App 选择文件 */
  chooseFile: (parmas: ChooseFileParmas) => Promise<ChooseFileRes>

  /** App 检查原生方法是否存在 */
  checkApi: (parmas: CheckApiParmas) => Promise<CheckApiRes>

  /** App 弹起软键盘 */
  showSoftKeyboard: () => Promise<void>

  /** 刷新查件tab页 */
  refreshSearch: () => Promise<void>

  /** App 获取原生端剪切板内容 */
  getClipboardData: (parmas: GetClipboardDataParmas) => Promise<string>

  /** App 设置导航栏展示 */
  setNavigationBar: (parmas: SetNavigationBarParmas) => Promise<void>

  /** App 打开小程序 */
  openMiniProgram: (parmas: OpenMiniProgramParmas) => Promise<void>

  /** App 校验蓝牙状态 */
  checkBluetoothAuth: () => Promise<CheckBluetoothAuthRes>

  /** App 获取当前连接的打印机的方法 */
  getBluetoothDevice: () => Promise<GetBluetoothDeviceRes>

  /** App 向打印机发送数据的方法 */
  sendBluetoothData: (parmas: any) => Promise<void>

  /** App 跳转打印机列表*/
  jumpBluetoothDeviceList: () => Promise<void>

  /** App 跳转打印机列表*/
  jumpPrintPage: () => Promise<void>

  /** App 未开启蓝牙时，打开手机蓝牙设置 */
  openBluetoothSet: () => Promise<void>

  /** App Ali 下载图片 */
  downloadImage: (parmas: DownloadImageParmas) => Promise<string>

  /** App Ali 下载资源 */
  downloadFile: (parmas: DownloadFileParmas) => Promise<string>

  /** App 打开远程资源 */
  openFile: (parmas: DownloadFileParmas) => Promise<void>

  /** App toast */
  toast: (parmas: ToastParmas) => Promise<void>

  /** App 退出登录 */
  logout: () => Promise<void>

  /** App 禁止滑动返回 */
  disableOnBack: () => Promise<void>

  /** App 打开相机 */
  openCamera: () => Promise<string>

  /** App 选择相册 */
  selectPhotosFromSD: (params: SelectPhotosFromSDParmas) => Promise<string[]>

  /** App 关闭webview窗口 */
  closeWindow: () => Promise<void>

  /** App 跳转至原生路由Code */
  jumpToNativePage: (parmas: JumpToNativePageParmas) => Promise<void>

  /** App 判断是否同意隐私协议 */
  hasPrivacyAuth: () => Promise<boolean>

  /** App 撤销同意隐私协议 */
  recallPrivacyAuth: () => Promise<void>
  /* App 切换tab */
  switchTab: (params: SwitchTabParmas) => Promise<void>
  /* App reLaunch 跳转 */
  reLaunch: (params: RedirectToParams) => Promise<void>
  /* App redirectTo 跳转 */
  redirectTo: (params: RedirectToParams) => Promise<void>
  /* 原生APP方法: 手机权限判断 4 地理位置权限*/
  checkSystemPermission: (params: CheckSystemPermissionParams) => Promise<void>
  /* 原生APP方法: 获取状态栏高度 */
  getStatusBarHeight: () => Promise<StatusBarHeight>
  /* 原生APP端特有: ios 软键盘顶起事件 */
  containerAutoFitKeyboardSize: (params: CustomParams) => Promise<void>

  /** 原生APP端特有: 更新APP */
  updateAPP: () => Promise<void>

  jumpNative: (parmas: JumpNativeIn) => void

  stopRecord?: any

  translateVoice?: any

  onVoiceRecordEnd?: any

  startRecord?: any

  openWebviewByMenu?: any

  saveImageToPhotosAlbum?: any
  aliPay?: any
  wechatPay?: any
  unifyPay?: any
  miniprogramPay?: any
  shareToWxMini?: any
  shareApp?: any
}

/** 1微信好友、2朋友圈 */
export type ShareApp = 1 | 2

export interface JumpNativeIn {
  target: string
}
