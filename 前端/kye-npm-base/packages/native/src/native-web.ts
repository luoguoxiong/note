import * as Type from './type'
import { NativeError } from './native-error'
import { addUrlParams, generateUUID } from '@kye-netc/utils'
import {
  checkOldMiniUrl,
  convertToNewMiniAppPage,
  getMiniAppUrl,
  LevelPageList,
} from './constants/miniAppConfig'

export class WebNative {
  private messageTasks = new Map<string, (data: any) => void>()

  constructor() {
    window?.addEventListener('message', this.handleMessage.bind(this))
  }

  postMessage(data: any): void {
    window.parent?.postMessage(data, '*')
  }

  private handleMessage(message: Type.PostMessageParmas): void {
    const { plateform, data, taskKey } = message?.data
    if (plateform === 'web' && taskKey) {
      this.messageTasks.get(taskKey)?.(data)
      this.messageTasks.delete(taskKey)
    }
  }

  private createWaitingTask<T>(taskKey: string): Promise<T> {
    return new Promise((resolve) => this.messageTasks.set(taskKey, resolve))
  }

  private async invoke<T>(method: string, params?: any): Promise<T> {
    const taskKey = generateUUID()
    this.postMessage({
      plateform: 'web',
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

  async getLocation(
    params: Type.GetLocationParmas = { type: 'wgs84' },
  ): Promise<Type.GetLocationRes> {
    const { latitude, longitude } = await this.invoke<Type.GetLocationRes>(
      'getLocation',
      params,
    )
    if (latitude === '0' || longitude === '0') {
      throw new NativeError(Type.AppResCode.NOSUPPORT, '不支持')
    }
    return { latitude, longitude }
  }

  async scanQRCode(
    params?: Type.ScanQRCodeParmas,
  ): Promise<Type.ScanQRCodeRes> {
    const { scanResult } = await this.invoke<Type.ScanQRCodeRes>(
      'scanQRCode',
      params,
    )
    if (scanResult === '0') {
      throw new NativeError(Type.AppResCode.NOSUPPORT, '不支持')
    }
    return { scanResult }
  }

  async $navigateTo(parmas: Pick<Type.NavigateToParmas, 'url' | 'params'>) {
    const url = addUrlParams(parmas.url, parmas.params)
    this.invoke<Type.NavigateToParmas>('navigateTo', { url })
  }

  async switchTab(parmas: Pick<Type.NavigateToParmas, 'url' | 'params'>) {
    const url = addUrlParams(parmas.url, parmas.params)
    this.invoke<Type.NavigateToParmas>('switchTab', { url })
  }

  async reLaunch(parmas: Pick<Type.NavigateToParmas, 'url' | 'params'>) {
    const url = addUrlParams(parmas.url, parmas.params)
    this.invoke<Type.NavigateToParmas>('reLaunch', { url })
  }

  async redirectTo(parmas: Pick<Type.NavigateToParmas, 'url' | 'params'>) {
    const url = addUrlParams(parmas.url, parmas.params)
    this.invoke<Type.NavigateToParmas>('redirectTo', { url })
  }

  navigateTo(params: Type.NavigateToParmas) {
    let url = params.url
    let callApi: 'navigateTo' | 'redirectTo' | 'switchTab' | 'reLaunch' =
      'navigateTo'
    if (
      params.type &&
      ['navigateTo', 'redirectTo', 'switchTab', 'reLaunch'].includes(
        params.type,
      )
    ) {
      callApi = params.type
    }
    if (params.url) {
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
    const addParams = {} as any
    if (params?.params?.url) {
      addParams.url = params?.params?.url || ''
    }

    if (params?.params?.needLogin) {
      addParams.needLogin = params?.params?.needLogin || 'false'
    }

    const webUrl = addUrlParams(url, addParams)

    if (callApi === 'navigateTo') {
      this.$navigateTo({ url: webUrl })
    }

    if (callApi === 'redirectTo') {
      this.redirectTo({ url: webUrl })
    }

    if (callApi === 'switchTab') {
      this.switchTab({ url: webUrl })
    }

    if (callApi === 'reLaunch') {
      this.reLaunch({ url: webUrl })
    }

    // return this.call(callApi, { url: webUrl }, true)
  }

  previewImage(
    params: Type.PreviewImageParmas = {
      current: '',
      urls: [],
    },
  ) {
    this.$navigateTo({
      url: addUrlParams(`/modules/native/pages/previewImage/index`, {
        current: params?.current as string, // 当前显示图片的http链接
        urls: JSON.stringify(params?.urls),
      }),
    })
  }

  async openLocation(params: Type.OpenLocationParmas) {
    const res = (await this.invoke('openLocation', params)) as any

    if (res && res?.isOk === '0') {
      throw new NativeError(Type.AppResCode.NOSUPPORT, '不支持')
    }
  }

  openWebview(params: Type.OpenWebviewParmas) {
    this.navigateTo({
      url: '/modules/webview/pages/webview/index',
      params: {
        url: params.url,
        ...(params.needLogin ? { needLogin: 'true' } : {}),
      },
    })
  }

  async getClipboardData(
    params?: Type.GetClipboardDataParmas,
  ): Promise<string> {
    return this.invoke<string>('getClipboardData', params)
  }

  async saveImageToPhotosAlbum(imageUrl: string) {
    this.invoke('saveImageToPhotosAlbum', imageUrl)
  }

  login() {
    this.$navigateTo({ url: '/modules/user/pages/login/index' })
  }

  navigateBack(params?: Type.NavigateBackParmas): void {
    this.invoke('navigateBack', params)
  }
}
