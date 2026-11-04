import { getConfig, WXJSSDK, APIAPPKY } from './config'
import * as Type from './type'
import { WechatJSSDK } from './type.wx'
import { NativeError } from './native-error'
import { addUrlParams, ResourceLoader } from '@kye-netc/utils'
import {
  checkOldMiniUrl,
  checkWhiteList,
  convertToNewMiniAppPage,
  getMiniAppUrl,
  LevelPageList,
} from './constants/miniAppConfig'
import { nativeGet, parseShareParams, createTaskId } from './utils'

export class WxNative {
  public config: Type.Config
  public bridge!: WechatJSSDK
  public env: Type.ENV
  constructor(env: Type.ENV) {
    this.config = getConfig(env)
    this.env = env
    this.init()
  }

  private async init() {
    try {
      if (this.bridge) return
      const [isLoad] = await ResourceLoader.load([{ type: 'js', url: WXJSSDK }])
      if (!isLoad)
        throw new NativeError(Type.AppResCode.JSSDKFAIL, '微信 JSSDK 失败')
      this.bridge = window.wx
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  private handleError<T>(error: Type.WithErrorRes<T>): NativeError {
    if (error instanceof NativeError) return error

    const wxErrorMsg = error?.errMsg || ''
    const errorMap = [
      { key: 'cancel', code: Type.AppResCode.CANCEL },
      { key: 'permission denied', code: Type.AppResCode.NOAUTH },
    ]

    const match = errorMap.find(({ key }) => wxErrorMsg.includes(key))
    return new NativeError(match?.code || Type.AppResCode.ERROR, error)
  }

  private async call<T>(
    method: keyof WechatJSSDK,
    params: any = {},
    isMiniApi?: boolean,
  ): Promise<T> {
    await this.init()
    const apis = isMiniApi ? this.bridge?.miniProgram : this.bridge
    return new Promise((resolve, reject) => {
      apis?.[method]({
        ...params,
        complete: (res: any) => {
          if (res?.errMsg) {
            res?.errMsg?.includes(':ok')
              ? resolve(res)
              : reject(this.handleError(res))
          } else {
            resolve(res)
          }
        },
      })
    })
  }

  /**
   * 将远程图片地址转为 base64
   * @param {string} url 远程图片地址
   * @returns {Promise<string>} base64 字符串
   */
  async imageUrlToBase64(url: string): Promise<string> {
    const response = await fetch(url)
    const blob = await response.blob()

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string) // 结果就是 base64
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  async chooseImage(
    params?: Type.ChooseImageParmas,
  ): Promise<Type.ChooseImageRes> {
    const taskKey = createTaskId('chooseImage')
    this.$navigateTo({
      url: `/modules/native/pages/base/index`,
      params: {
        taskKey: taskKey,
        taskMethod: 'chooseImage',
        data: JSON.stringify(params),
      },
    })
    const data = await nativeGet(taskKey, this.env === 'prod')
    const parseData = JSON.parse(data)
    if (parseData.isSuccess) {
      const imageList = await Promise.all(
        parseData.result.map(async (path: string) => {
          const base64 = await this.imageUrlToBase64(path)
          const fileSize = (this.getImgByteSize(base64) / 1024).toFixed(2) // KB
          return {
            fileName: `img-${Date.now()}.jpg`,
            fileSize,
            base64,
          }
        }),
      )
      return { imgList: imageList }
    } else {
      throw Error(parseData.data)
    }
  }

  private getImgByteSize(base64: string): number {
    if (!base64) return 0
    const strLength =
      base64.indexOf('=') > 0 ? base64.indexOf('=') : base64.length
    return Math.floor(strLength - (strLength / 8) * 2)
  }

  async scanQRCode(
    params: Type.ScanQRCodeParmas = {},
  ): Promise<Type.ScanQRCodeRes> {
    const taskKey = createTaskId('scanQRCode')
    this.$navigateTo({
      url: `/modules/native/pages/base/index`,
      params: {
        taskKey: taskKey,
        taskMethod: 'scanCode',
        data: JSON.stringify(params),
      },
    })
    const data = await nativeGet(taskKey, this.env === 'prod')
    const parseData = JSON.parse(data)
    if (parseData.isSuccess) {
      return { scanResult: parseData.result.result }
    } else {
      throw Error(parseData.data)
    }
  }

  async saveImageToPhotosAlbum(imageUrl: string) {
    this.$navigateTo({
      url: `/modules/native/pages/saveImageToPhotosAlbum/index`,
      params: {
        url: imageUrl,
      },
    })
  }

  async openMiniProgram(parmas: Type.OpenMiniProgramParmas) {
    this.$navigateTo({
      url: `/modules/native/pages/openMiniProgram/index`,
      params: {
        ...parmas,
      },
    })
  }

  async $navigateTo(parmas: Pick<Type.NavigateToParmas, 'url' | 'params'>) {
    const url = addUrlParams(parmas.url, parmas.params)
    return this.call('navigateTo', { url: url }, true)
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
    return this.call(callApi, { url: webUrl }, true)
  }

  navigateBack(params?: Type.NavigateBackParmas): Promise<void> {
    return this.call('navigateBack', params, true)
  }

  share(params?: Type.ShareParmas) {
    return this.shareToWxMini(
      parseShareParams(params || {}, this.env === 'prod'),
    )
  }

  login(): Promise<void> {
    return this.navigateTo({ url: '/modules/user/pages/login/index' })
  }

  async getLocation(
    params: Type.GetLocationParmas = { type: 'wgs84' },
  ): Promise<Type.GetLocationRes> {
    const taskKey = createTaskId('getLocation')
    this.$navigateTo({
      url: `/modules/native/pages/base/index`,
      params: {
        taskKey: taskKey,
        taskMethod: 'getLocation',
        data: JSON.stringify(params),
      },
    })
    const data = await nativeGet(taskKey, this.env === 'prod')
    const parseData = JSON.parse(data)
    if (parseData.isSuccess) {
      return parseData.result
    } else {
      throw Error(parseData.data)
    }
  }

  async getClipboardData(params: Type.GetClipboardDataParmas): Promise<string> {
    const taskKey = createTaskId('getClipboardData')
    this.$navigateTo({
      url: `/modules/native/pages/base/index`,
      params: {
        taskKey: taskKey,
        taskMethod: 'getClipboardData',
        data: JSON.stringify(params),
      },
    })
    const data = await nativeGet(taskKey, this.env === 'prod')
    const parseData = JSON.parse(data)
    if (parseData.isSuccess) {
      return parseData.result.data
    } else {
      throw Error(parseData.data)
    }
  }

  async openFile(parmas: Type.DownloadFileParmas) {
    const taskKey = createTaskId('openFile')
    this.$navigateTo({
      url: `/modules/native/pages/base/index`,
      params: {
        taskKey: taskKey,
        taskMethod: 'openFile',
        data: JSON.stringify(parmas),
      },
    })
    const data = await nativeGet(taskKey, this.env === 'prod')
    const parseData = JSON.parse(data)
    if (parseData.isSuccess) {
      return parseData.result
    } else {
      throw Error(parseData.data)
    }
  }

  openLocation(params: Type.OpenLocationParmas) {
    this.$navigateTo({
      url: `/modules/native/pages/openLocation/index`,
      params: {
        ...params,
      },
    })
  }

  shareToWxMini(parmas: Type.ShareToWxMini) {
    this.$navigateTo({
      url: `/modules/native/pages/share/index`,
      params: {
        type: parmas.type,
        shareInfo: JSON.stringify(parmas.shareInfo),
      },
    })
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

  postMessage(params?: Type.PostMessageParmas): Promise<void> {
    return this.call('postMessage', params, true)
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
    return this.call('switchTab', params, true)
  }

  reLaunch(params?: Type.RedirectToParams) {
    return this.call('reLaunch', params, true)
  }

  redirectTo(params?: Type.RedirectToParams) {
    return this.call('redirectTo', params, true)
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

  aliPay(params?: any) {
    const targetUrl = '/modules/native/pages/appPay/alipay/index'
    const orderString = params?.orderString || params?.orderStr
    if (orderString) {
      params.orderString = encodeURIComponent(orderString)
    }
    if (params?.orderStr) {
      delete params?.orderStr
    }
    const url = addUrlParams(targetUrl, params)
    return this.call('navigateTo', { url: url }, true)
  }

  wechatPay(params?: any) {
    const targetUrl = '/modules/native/pages/appPay/wxpay/index'
    const url = addUrlParams(targetUrl, params)
    return this.call('navigateTo', { url: url }, true)
  }

  unifyPay(params?: any) {
    const targetUrl = '/modules/native/pages/appPay/unifypay/index'
    const { channel, data } = params
    const opts = {
      channel,
      ...(data || {}),
    }
    const url = addUrlParams(targetUrl, opts)
    return this.call('navigateTo', { url: url }, true)
  }

  miniprogramPay(params?: any) {
    const targetUrl = '/modules/pay/pages/wxpay/index'
    const url = addUrlParams(targetUrl, params)
    return this.call('navigateTo', { url: url }, true)
  }

  shareApp(share: Type.ShareApp) {
    const shareType = {
      1: 0,
      2: 1,
    }
    this.navigateTo({
      url: addUrlParams(`/modules/native/pages/share/index`, {
        type: 'ShareWebPage',
        shareInfo: JSON.stringify({
          title: '跨越速运',
          description: '跨越速运一诺定达',
          thumbPath: encodeURIComponent(
            'https://ic-img.ky-express.com/netc/20250609_7897039519_!!1749434735235_176_176.png',
          ),
          webpageUrl: encodeURIComponent(
            'https://a.app.qq.com/o/simple.jsp?pkgname=com.oxbix.spanlogistics',
          ),
          scene: shareType[share],
        }),
      }),
    })
  }

  updateAPP() {
    return this.navigateTo({ url: '/modules/native/pages/updateApp/index' })
  }
}
