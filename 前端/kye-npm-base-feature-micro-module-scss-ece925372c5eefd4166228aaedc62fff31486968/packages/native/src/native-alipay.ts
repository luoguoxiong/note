import { ALIPAYSDK } from './config'
import * as Type from './type'
import { NativeError } from './native-error'
import { ResourceLoader, generateUUID, addUrlParams } from '@kye-netc/utils'
import {
  checkOldMiniUrl,
  checkWhiteList,
  convertToNewMiniAppPage,
  getMiniAppUrl,
  LevelPageList,
} from './constants/miniAppConfig'
import { WechatJSSDK } from './type.wx'

export class AliNative {
  private bridge: any
  private messageTasks = new Map<string, (data: any) => void>()

  constructor() {
    this.init()
  }

  private async init(): Promise<void> {
    if (this.bridge) return

    const [isLoad] = await ResourceLoader.load([{ type: 'js', url: ALIPAYSDK }])

    if (!isLoad)
      throw new NativeError(Type.AppResCode.JSSDKFAIL, '加载支付宝 JSSDK 失败')

    this.bridge = window.my

    this.bridge.onMessage = this.handleMessage.bind(this)
  }

  private handleMessage(message: Type.PostMessageParmas): void {
    const { plateform, data, taskKey } = message
    if (plateform === 'alipay' && taskKey) {
      this.messageTasks.get(taskKey)?.(data)
      this.messageTasks.delete(taskKey)
    }
  }

  private createWaitingTask<T>(taskKey: string): Promise<T> {
    return new Promise((resolve) => this.messageTasks.set(taskKey, resolve))
  }

  private async call<T = void>(method: string, params: any = {}): Promise<T> {
    return new Promise<T>(async (resolve, reject) => {
      try {
        await this.init()
        this.bridge?.[method](params, resolve)
      } catch (e) {
        reject(e)
      }
    })
  }

  private async invoke<T>(method: string, params?: any): Promise<T> {
    await this.init()

    const taskKey = generateUUID()

    this.bridge.postMessage({
      plateform: 'alipay',
      method,
      taskKey,
      data: params,
    })

    const data = await this.createWaitingTask<Type.WithErrorRes<T>>(taskKey)
    if (data.error) this.handleError(data)
    return data
  }

  private handleError<T>(data: Type.WithErrorRes<T>): never {
    if (data instanceof NativeError) {
      throw data
    }
    const errorMap = {
      '11': Type.AppResCode.CANCEL,
      '2001': Type.AppResCode.NOAUTH,
    } as const

    const code =
      errorMap[data?.error as keyof typeof errorMap] || Type.AppResCode.ERROR
    throw new NativeError(code, data)
  }

  async chooseImage(
    params?: Type.ChooseImageParmas,
  ): Promise<Type.ChooseImageRes> {
    return this.invoke<Type.ChooseImageRes>('chooseImage', params)
  }

  async scanQRCode(
    params?: Type.ScanQRCodeParmas,
  ): Promise<Type.ScanQRCodeRes> {
    return this.invoke<Type.ScanQRCodeRes>('scanCode', params)
  }

  navigateTo(params: Type.NavigateToParmas): Promise<void> {
    let url = params.url
    let callApi = 'navigateTo' as keyof WechatJSSDK
    if (
      params.type &&
      ['navigateTo', 'redirectTo', 'switchTab', 'reLaunch'].includes(
        params.type,
      )
    ) {
      callApi = params.type
    }
    if (params.url) {
      // 匹配url传入了旧的小程序地址
      if (checkOldMiniUrl(params.url)) {
        url = addUrlParams(convertToNewMiniAppPage(params.url), params?.params)
      } else {
        url = addUrlParams(params.url, params?.params)
      }
    } else if (!params.url && params.page && getMiniAppUrl(params.page)) {
      // 匹配传入page参数
      url = addUrlParams(getMiniAppUrl(params.page), params?.params)
    }
    if (params.page && LevelPageList.includes(params.page)) {
      callApi = 'switchTab'
    }
    console.log('webUrl', url)
    return this.call(callApi, {
      url,
      needLogin: params?.params?.needLogin || 'false',
    })
  }

  navigateBack(params?: Type.NavigateBackParmas): Promise<void> {
    return this.call('navigateBack', params)
  }

  share(params?: Type.ShareParmas): Promise<void> {
    return this.invoke<void>('share', params)
  }

  async $navigateTo(parmas: Pick<Type.NavigateToParmas, 'url' | 'params'>) {
    const url = addUrlParams(parmas.url, parmas.params)
    return this.call('navigateTo', { url: url })
  }

  previewImage(
    params: Type.PreviewImageParmas = {
      current: '',
      urls: [],
    },
  ) {
    this.$navigateTo({
      url: addUrlParams(`/modules/native/pages/previewImage/index`, {
        current: encodeURIComponent(params?.current as string), // 当前显示图片的http链接
        urls: encodeURIComponent(JSON.stringify(params?.urls)),
      }),
    })
  }

  login(): Promise<void> {
    return this.navigateTo({
      url: '/modules/user/pages/login/index',
    })
  }

  async getLocation(
    params?: Type.GetLocationParmas,
  ): Promise<Type.GetLocationRes> {
    const data = await this.invoke<Type.WithErrorRes<Type.GetLocationRes>>(
      'getLocation',
      params,
    )
    if (data.latitude && data.longitude) {
      return { latitude: data.latitude, longitude: data.longitude }
    }
    this.handleError(data)
  }

  openLocation(params: Type.OpenLocationParmas): Promise<void> {
    return this.call('openLocation', params)
  }

  postMessage(params: Type.PostMessageParmas): Promise<void> {
    return this.call('postMessage', params)
  }

  openWebview(params: Type.OpenWebviewParmas): Promise<void> {
    return this.navigateTo({
      url: '/modules/webview/pages/webview/index',
      params: {
        url: params.url,
        ...(params.needLogin ? { needLogin: 'true' } : {}),
      },
    })
  }

  switchTab(params?: Type.SwitchTabParmas) {
    return this.call('switchTab', params)
  }

  reLaunch(params?: Type.RedirectToParams) {
    return this.call('reLaunch', params)
  }

  redirectTo(params?: Type.RedirectToParams) {
    return this.call('redirectTo', params)
  }

  miniprogramPay(params?: any) {
    const targetUrl = '/modules/pay/pages/alipay/index'
    const url = addUrlParams(targetUrl, params)
    return this.call('navigateTo', { url: url })
  }

  refreshSearch() {
    return this.postMessage({ data: { refresh: true } })
  }

  checkApi(params: { api: string }) {
    return new Promise((resolve) => {
      if (checkWhiteList.includes(params.api)) {
        resolve({ result: '1' })
      } else {
        resolve({ result: '0' })
      }
    })
  }

  downloadImage(params: Type.DownloadImageParmas) {
    return this.invoke<string>('saveImageToPhotosAlbum', {
      url: params.imageData,
    })
  }

  downloadFile(params: Type.DownloadFileParmas) {
    return this.invoke<string>('downloadFile', {
      url: params.url,
    })
  }

  saveImageToPhotosAlbum(url: string) {
    return this.invoke<string>('saveImageToPhotosAlbum', {
      url: url,
    })
  }
}
