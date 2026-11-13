import * as Type from './type'
import {
  isWxApplet,
  isAliPayClient,
  isAppBrowse,
  isIosApp,
  isAndroidApp,
  getQueryObject,
  isWxApp,
} from '@kye-netc/utils'
import { convertToNewMiniAppUrl } from './constants/miniAppConfig'

interface NativeOptions {
  env: Type.ENV
  isNewWx?: boolean
}

export class Native implements Type.NativeType {
  private bridge: any

  private env: Type.ENV
  // 是否开启新微信sdk
  private isNewWx: boolean
  // 是否是新通用移动应用
  readonly isKyeMiniApp: boolean = false
  // 是不是企业微信PC
  readonly isPcWorkWx: boolean = false
  readonly isAliPayClient = !!isAliPayClient
  readonly isWxApplet = !!isWxApplet
  readonly isWxApp = !!isWxApp

  constructor({ env, isNewWx }: NativeOptions) {
    const { isMiniApp, isPcWorkWx } = getQueryObject()
    this.env = env
    this.isKyeMiniApp = !!isMiniApp
    this.isPcWorkWx = !!isPcWorkWx
    // 通用小程序默认开启新微信sdk
    this.isNewWx = !!isNewWx || this.isKyeMiniApp
    this.initMiniAppEnv()
    this.ensureBridge()
  }

  // 初始化通用小程序环境
  private initMiniAppEnv = () => {
    if (this.isKyeMiniApp) {
      sessionStorage.setItem('isMiniApp', String(this.isKyeMiniApp))
      sessionStorage.setItem('isPcWorkWx', String(this.isPcWorkWx))
    }
  }

  private async ensureBridge() {
    if (this.bridge) return

    if (isWxApp) {
      const { WxNative } = await import('./native-wx-app')
      this.bridge = new WxNative(this.env)
    } else if (isWxApplet) {
      if (!this.isNewWx) {
        const { WxNative } = await import('./native-wx')
        this.bridge = new WxNative(this.env)
      } else {
        const { WxNative } = await import('./native-wx-new')
        this.bridge = new WxNative(this.env)
      }
    } else if (isAliPayClient) {
      const { AliNative } = await import('./native-alipay')
      this.bridge = new AliNative()
    } else if (isAppBrowse) {
      const { AppNative } = await import('./native-app')
      this.bridge = new AppNative(this.env)
    } else {
      const { WebNative } = await import('./native-web')
      this.bridge = new WebNative()
    }
  }

  private async call<K extends keyof Type.NativeType>(
    method: K,
    ...args: Type.NativeType[K] extends (...args: any) => any
      ? Parameters<Type.NativeType[K]> | [] // 允许为空数组
      : never
  ): Promise<
    Type.NativeType[K] extends (...args: any) => any
      ? ReturnType<Type.NativeType[K]>
      : never
  > {
    await this.ensureBridge()

    if (!this.bridge || typeof this.bridge?.[method] !== 'function') {
      console.warn(`[Native] 当前环境暂不支持Api方法: ${method}`)
      return undefined as any // 返回 undefined，不抛错
    }
    try {
      return (this.bridge[method] as any)(...args)
    } catch (err) {
      console.error(`[Native] ${method} 执行异常:`, err)
      return undefined as any
    }
    // if (!this.bridge || !(method in this.bridge)) {
    //   return Promise.reject(
    //     new NativeError(Type.AppResCode.NOSUPPORT, `暂不支持Api${method}`),
    //   ) as any
    // }
    // return (this.bridge[method] as any)(...args)
  }

  /**
   * 获取当前环境
   * @returns {Promise<unknown>}
   */
  getSource(): Promise<{ source: string }> {
    return new Promise((resolve) => {
      let source: { source: string }
      if (isWxApplet) {
        source = { source: 'miniprogram' }
      } else if (isIosApp) {
        source = { source: 'iOS' }
      } else if (isAndroidApp) {
        source = { source: 'android' }
      } else if (isAliPayClient) {
        source = { source: 'aliPay' }
      } else {
        source = { source: 'other' }
      }
      resolve(source)
    })
  }

  async scanQRCode(params?: Type.ScanQRCodeParmas) {
    return this.call('scanQRCode', params)
  }

  async chooseImage(params?: Type.ChooseImageParmas) {
    return this.call('chooseImage', params)
  }

  async navigateTo(params: Type.NavigateToParmas) {
    return this.call('navigateTo', params)
  }

  async navigateBack(params?: Type.NavigateBackParmas) {
    return this.call('navigateBack', params)
  }

  async share(params?: Type.ShareParmas) {
    return this.call('share', params)
  }

  async previewImage(params: Type.PreviewImageParmas) {
    return this.call('previewImage', params)
  }

  async login() {
    return this.call('login')
  }

  async postMessage(params: Type.PostMessageParmas) {
    return this.call('postMessage', params)
  }

  async getLocation(params: Type.GetLocationParmas = { type: 'gcj02' }) {
    return this.call('getLocation', params)
  }

  async openLocation(params: Type.OpenLocationParmas) {
    return this.call('openLocation', params)
  }

  async openWebview(params: Type.OpenWebviewParmas) {
    return this.call('openWebview', params)
  }

  async openPreloadCacheWebView(params: Type.OpenPreloadCacheWebViewParmas) {
    return this.call('openPreloadCacheWebView', params)
  }

  async chooseFile(params: Type.ChooseFileParmas) {
    return this.call('chooseFile', params)
  }

  async checkApi(params: Type.CheckApiParmas) {
    return this.call('checkApi', params)
  }

  async showSoftKeyboard() {
    return this.call('showSoftKeyboard')
  }

  async refreshSearch() {
    return this.call('refreshSearch')
  }
  async getClipboardData(parmas: Type.GetClipboardDataParmas) {
    return this.call('getClipboardData', parmas)
  }

  async setNavigationBar(parmas: Type.SetNavigationBarParmas) {
    return this.call('setNavigationBar', parmas)
  }

  async openMiniProgram(parmas: Type.OpenMiniProgramParmas) {
    return this.call('openMiniProgram', parmas)
  }

  saveImageToPhotosAlbum(imageUrl: string) {
    return this.call('saveImageToPhotosAlbum', imageUrl)
  }

  async checkBluetoothAuth() {
    return this.call('checkBluetoothAuth')
  }

  async getBluetoothDevice() {
    return this.call('getBluetoothDevice')
  }

  async sendBluetoothData(parmas: any) {
    return this.call('sendBluetoothData', parmas)
  }

  async jumpBluetoothDeviceList() {
    return this.call('jumpBluetoothDeviceList')
  }

  async jumpPrintPage() {
    return this.call('jumpPrintPage')
  }

  async openBluetoothSet() {
    return this.call('openBluetoothSet')
  }

  async downloadImage(parmas: Type.DownloadImageParmas) {
    return this.call('downloadImage', parmas)
  }

  async downloadFile(parmas: Type.DownloadFileParmas) {
    return this.call('downloadFile', parmas)
  }

  async openFile(parmas: Type.DownloadFileParmas) {
    return this.call('openFile', parmas)
  }

  async toast(parmas: Type.ToastParmas) {
    return this.call('toast', parmas)
  }

  async logout() {
    return this.call('logout')
  }

  async disableOnBack() {
    return this.call('disableOnBack')
  }

  async openCamera() {
    return this.call('openCamera')
  }

  async selectPhotosFromSD(
    parmas: Type.SelectPhotosFromSDParmas,
  ): Promise<string[]> {
    return this.call('selectPhotosFromSD', parmas)
  }

  async closeWindow() {
    return this.call('closeWindow')
  }

  async jumpToNativePage(params: Type.JumpToNativePageParmas) {
    return this.call('jumpToNativePage', params)
  }

  async hasPrivacyAuth(): Promise<boolean> {
    return this.call('hasPrivacyAuth')
  }

  async recallPrivacyAuth() {
    return this.call('recallPrivacyAuth')
  }
  async switchTab(params: Type.SwitchTabParmas) {
    const url = this.isNewWx ? convertToNewMiniAppUrl(params.url) : params.url
    return this.call('switchTab', { ...params, url })
  }
  async reLaunch(params: Type.RedirectToParams) {
    const url = this.isNewWx ? convertToNewMiniAppUrl(params.url) : params.url
    return this.call('reLaunch', { ...params, url })
  }
  async redirectTo(params: Type.RedirectToParams) {
    const url = this.isNewWx ? convertToNewMiniAppUrl(params.url) : params.url
    return this.call('redirectTo', { ...params, url })
  }
  /* 手机权限判断 4 地理位置权限*/
  async checkSystemPermission(params: Type.CheckSystemPermissionParams) {
    return this.call('checkSystemPermission', params)
  }
  /* APP端特有 手机权限判断 4 地理位置权限 */
  async getStatusBarHeight() {
    return this.call('getStatusBarHeight')
  }
  /* APP端特有: ios 软键盘顶起事件 */
  async containerAutoFitKeyboardSize(params: Type.CustomParams) {
    return this.call('containerAutoFitKeyboardSize', params)
  }

  stopRecord(params?: any) {
    return this.call('stopRecord', params, true)
  }

  translateVoice(params?: any) {
    return this.call('translateVoice', params, true)
  }

  onVoiceRecordEnd(parmas?: any) {
    return this.call('onVoiceRecordEnd', parmas, true)
  }

  startRecord(parmas?: any) {
    return this.call('startRecord', parmas, true)
  }

  openWebviewByMenu(parmas?: any) {
    return this.call('openWebviewByMenu', parmas)
  }
  aliPay(params?: any) {
    return this.call('aliPay', params)
  }
  wechatPay(params?: any) {
    return this.call('wechatPay', params)
  }
  unifyPay(params?: any) {
    return this.call('unifyPay', params)
  }
  miniprogramPay(params?: any) {
    return this.call('miniprogramPay', params)
  }
  shareToWxMini(params?: any) {
    return this.call('shareToWxMini', params)
  }
  shareApp(parmas: Type.ShareApp) {
    return this.call('shareApp', parmas)
  }

  async updateAPP() {
    await this.call('updateAPP')
  }

  jumpNative(parmas: Type.JumpNativeIn) {
    this.call('jumpNative', parmas)
  }
}
