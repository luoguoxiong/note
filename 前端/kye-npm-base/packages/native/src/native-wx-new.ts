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

const JS_API_LIST = [
  'scanQRCode',
  'previewImage',
  'chooseImage',
  'chooseMedia',
  'getLocalImgData',
  'openLocation',
  'getLocation',
  'makePhoneCall',
  'postMessage',
  'startRecord',
  'translateVoice',
  'onVoiceRecordEnd',
  'stopRecord',
]

export class WxNative {
  public config: Type.Config
  public bridge!: WechatJSSDK

  constructor(env: Type.ENV) {
    this.config = getConfig(env)
    this.init()
  }

  private async init() {
    try {
      if (this.bridge) return
      const [isLoad] = await ResourceLoader.load([{ type: 'js', url: WXJSSDK }])
      if (!isLoad) {
        throw new NativeError(Type.AppResCode.JSSDKFAIL, '微信 JSSDK 失败')
      }
      this.bridge = window.wx
      await this.initWechat()
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  async initWechat() {
    try {
      const fetchSDKConf = async () => {
        const url = window.location.href.split('#')[0]
        const { data } = await fetch(this.config.wxjssdk, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            appkey: APIAPPKY,
            method: 'web.ssoWeChatTool.getJsSdkSign',
          },
          body: JSON.stringify({ url }),
        }).then((res) => res.json())

        return {
          beta: true,
          debug: false,
          appId: data.appid,
          timestamp: data.timestamp,
          nonceStr: data.noncestr,
          signature: data.signature,
          jsApiList: JS_API_LIST,
        }
      }

      const wx = window.wx
      wx.config(await fetchSDKConf())
      await new Promise<void>((resolve, reject) => {
        wx.ready(() => {
          console.info('wx.config ready')
          resolve()
        })
        wx.error(async (error: any) => {
          console.error('wx.config error:', error)
          reject(new NativeError(Type.AppResCode.WXCONFIGERROR, error))
        })
      })
    } catch (error) {
      throw new NativeError(Type.AppResCode.WXAPISDKERROR, '微信JSAPI错误')
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

  async chooseImage(
    params?: Type.ChooseImageParmas,
  ): Promise<Type.ChooseImageRes> {
    const res: any = await this.call('chooseImage', {
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      ...params,
    })
    const base64s = await this.getBase64BylocalId(res.localIds)
    return { imgList: base64s }
  }

  async scanQRCode(
    params?: Type.ScanQRCodeParmas,
  ): Promise<Type.ScanQRCodeRes> {
    const res: any = await this.call('scanQRCode', {
      needResult: 1,
      scanType: ['qrCode', 'barCode'],
      ...params,
    })
    const result = res.resultStr.includes(',')
      ? res.resultStr.split(',')[1]
      : res.resultStr
    return { scanResult: result }
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

  share(params?: Type.ShareParmas): Promise<void> {
    return this.postMessage({ data: params })
  }

  login(): Promise<void> {
    return this.navigateTo({ url: '/modules/user/pages/login/index' })
  }

  getLocation(params?: Type.GetLocationParmas): Promise<Type.GetLocationRes> {
    return this.call('getLocation', params)
  }

  openLocation(params: Type.OpenLocationParmas): Promise<void> {
    return this.call('openLocation', params)
  }

  previewImage(params?: Type.PreviewImageParmas): Promise<void> {
    return this.call('previewImage', params)
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

  getBase64BylocalId(localIds: string[]): Promise<Type.ChooseImageFile[]> {
    return Promise.all(localIds.map((id) => this.getLocalImgData(id)))
  }

  stopRecord(params?: any) {
    return this.call('stopRecord', params, true)
  }

  translateVoice(params?: any) {
    return this.call('translateVoice', params, false)
  }

  onVoiceRecordEnd(parmas?: any) {
    return this.call('onVoiceRecordEnd', parmas, false)
  }

  startRecord(parmas?: any) {
    return this.call('startRecord', parmas, false)
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

  private async getLocalImgData(
    localId: string,
  ): Promise<Type.ChooseImageFile> {
    const res: any = await this.call('getLocalImgData', { localId })
    const localData = this.formatLocalData(res.localData)
    const suffix = this.getImageSuffix(localData)
    const base64 = localData

    return {
      fileName: `img-${Date.now()}${suffix}`,
      fileSize: (this.getImgByteSize(base64) / 1024).toFixed(2),
      base64,
    }
  }

  private formatLocalData(localData: string): string {
    if (!localData.startsWith('data:image')) {
      localData = 'data:image/jpeg;base64,' + localData
    }
    return localData
      .replace(/\r|\n/g, '')
      .replace('data:image/jgp', 'data:image/jpeg')
  }

  private getImageSuffix(localData: string): string {
    if (localData.includes('data:image/jpeg')) return '.jpeg'
    if (localData.includes('data:image/jpg')) return '.jpg'
    return '.png'
  }

  private getImgByteSize(base64: string): number {
    if (!base64) return 0
    const strLength =
      base64.indexOf('=') > 0 ? base64.indexOf('=') : base64.length
    return Math.floor(strLength - (strLength / 8) * 2)
  }
}
