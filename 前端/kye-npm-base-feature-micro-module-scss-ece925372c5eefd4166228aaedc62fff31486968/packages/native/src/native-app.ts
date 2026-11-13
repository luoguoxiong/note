import { getConfig, APPJSSDK } from './config'
import * as Type from './type'
import {
  ResourceLoader,
  isIphone,
  isAppiOS,
  isIphoneSpecial,
  isAppAndroid,
} from '@kye-netc/utils'
import { NativeError } from './native-error'

export class AppNative {
  public config: Type.Config
  private bridge?: any

  constructor(env: Type.ENV) {
    this.config = getConfig(env)
    this.init()
  }

  private async init(): Promise<void> {
    if (this.bridge) return

    const [isLoad] = await ResourceLoader.load([{ type: 'js', url: APPJSSDK }])

    if (!isLoad)
      throw new NativeError(Type.AppResCode.JSSDKFAIL, '加载 appjsdk 失败')

    this.bridge = window['dsBridge']
  }

  private async call<T = any>(
    method: string,
    params?: Record<string, any>,
  ): Promise<T> {
    return new Promise(async (resolve, reject) => {
      await this.init()
      this.bridge.call(method, params || {}, (res: any) => {
        const resObject = typeof res === 'object' ? res : JSON.parse(res)
        if (resObject.code === Type.AppResCode.SUCCESS) {
          resolve(resObject.data)
        } else {
          reject(this.handleError(resObject)) // 使用统一的错误处理
        }
      })
    })
  }

  private handleError<T>(data: Type.WithErrorRes<T>) {
    const errorMap = {
      '-2': Type.AppResCode.CANCEL,
      '2001': Type.AppResCode.NOAUTH,
    } as const

    const code =
      errorMap[data?.code as keyof typeof errorMap] || Type.AppResCode.ERROR
    return new NativeError(code, data)
  }

  chooseImage(params?: Type.ChooseImageParmas): Promise<Type.ChooseImageRes> {
    return this.call('chooseImage', {
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      ...params,
    })
  }

  scanQRCode(params?: Type.ScanQRCodeParmas): Promise<Type.ScanQRCodeRes> {
    return this.call('scanQRCode', {
      needResult: 1,
      scanType: ['qrCode', 'barCode'],
      ...params,
    })
  }

  navigateTo(params: Type.NavigateToParmas): Promise<void> {
    return this.call('navigateTo', {
      ...(params || {}),
      page: params?.page || params?.url,
    })
  }

  navigateBack(params?: Type.NavigateBackParmas): Promise<void> {
    return this.call('navigateBack', params)
  }

  async share(params?: Type.ShareParmas): Promise<void> {
    return this.call('share', params)
  }

  async previewImage(params?: Type.PreviewImageParmas): Promise<void> {
    return this.call('previewImage', {
      ...params,
      current: `${params?.current}`, // ios 要字符串
    })
  }

  async login(): Promise<void> {
    return this.call('login')
  }

  postMessage(params?: Type.PostMessageParmas): Promise<void> {
    return this.call('postMessage', { data: params })
  }

  async getLocation(
    parmas: Type.GetLocationParmas,
  ): Promise<Type.GetLocationRes> {
    return this.call('getLocation', parmas)
  }

  async openLocation(params: Type.OpenLocationParmas): Promise<void> {
    return this.call('openLocation', params)
  }

  async openWebview(params: Type.OpenWebviewParmas) {
    return this.call('openWebview', {
      url: params.url,
      ...(params.needLogin ? { needLogin: true } : {}),
    })
  }

  openPreloadCacheWebView(params: Type.OpenPreloadCacheWebViewParmas) {
    return this.call('openPreloadCacheWebView', params)
  }

  chooseFile(params: Type.ChooseFileParmas) {
    return this.call('chooseFile', params)
  }

  checkApi(params: Type.CheckApiParmas) {
    return this.call('checkApi', params)
  }

  showSoftKeyboard() {
    return this.call('showSoftKeyboard')
  }

  refreshSearch() {
    return this.call('refreshSearch')
  }

  getClipboardData(params: Type.GetClipboardDataParmas): Promise<string> {
    return this.call('getClipboardData', params)
  }

  setNavigationBar(parmas: Type.SetNavigationBarParmas) {
    return this.call('setNavigationBar', parmas)
  }

  openMiniProgram(params: Type.OpenMiniProgramParmas) {
    return this.call('openMiniProgram', params)
  }
  async checkBluetoothAuth(): Promise<Type.CheckBluetoothAuthRes> {
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
    const localPath = await this.call('downloadFile', parmas)
    return this.call('openFile', { path: localPath })
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

  async checkSystemPermission(params: Type.CheckSystemPermissionParams) {
    return this.call('checkSystemPermission', params)
  }

  async getStatusBarHeight() {
    return this.call('getStatusBarHeight')
  }

  async containerAutoFitKeyboardSize(params: Type.CustomParams) {
    return this.call('containerAutoFitKeyboardSize', params)
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

  async openCamera() {
    await this.init()
    return new Promise((resolve) => {
      if (isIphone) {
        window.webkit.messageHandlers.openCamera.postMessage({
          callback: 'getPhotos',
        })
      } else {
        window.kye.openCamera()
      }

      window.getPhotos = (response: any) => {
        let content
        if (isIphone) {
          content = response[0].base64
        } else {
          content = response[0]
        }
        resolve(content)
      }
    })
  }

  async selectPhotosFromSD(params: Type.SelectPhotosFromSDParmas) {
    await this.init()
    return new Promise((resolve) => {
      if (isIphone) {
        window.webkit.messageHandlers.selectPhotosFromSD.postMessage({
          ...params,
          callback: 'getPhotos',
        })
      } else {
        window.kye.selectPhotosFromSD(params.count)
      }
      window.getPhotos = (response: any) => {
        resolve(response)
      }
    })
  }

  async closeWindow() {
    await this.init()
    if (isAppiOS || isIphoneSpecial) {
      window.webkit.messageHandlers.closeWindow.postMessage({
        callback: 'hello',
      })
    } else if (isAppAndroid) {
      window.kye.closeWindow()
    }
  }

  async jumpToNativePage(params: Type.JumpToNativePageParmas) {
    await this.init()
    if (isAppiOS) {
      window.webkit.messageHandlers.jumpToNativePage.postMessage({
        type: params.pageCode,
        callback: 'hello',
      })
    } else if (isAppAndroid) {
      window.kye.jumpToNativePage(params.pageCode)
    }
  }

  async hasPrivacyAuth() {
    await this.init()
    return new Promise((resolve) => {
      if (isAppAndroid) {
        if (window.kye.hasPrivacyAuth) {
          window.kye.hasPrivacyAuth('onprivacyAuth')
        }
      } else if (isAppiOS) {
        if (window.webkit.messageHandlers.hasPrivacyAuth) {
          window.webkit.messageHandlers.hasPrivacyAuth.postMessage({
            callback: 'onprivacyAuth',
          })
        }
      }
      window.onprivacyAuth = (val: string) => {
        resolve(`${val}` === '1')
      }
    })
  }

  async recallPrivacyAuth() {
    await this.init()
    if (isAppAndroid) {
      window.kye.recallPrivacyAuth()
    } else if (isAppiOS) {
      window.webkit.messageHandlers.recallPrivacyAuth.postMessage({
        callback: 'callback',
      })
    }
  }

  async openWebviewByMenu(parmas: any) {
    return this.call('openWebviewByMenu', parmas)
  }

  jumpNative(parmas: Type.JumpNativeIn) {
    this.call('jumpNative', parmas)
  }
}
