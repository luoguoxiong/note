import { getConfig, WXJSSDK, APIAPPKY } from './config'
import * as Type from './type'
import { WechatJSSDK } from './type.wx'
import { NativeError } from './native-error'
import { addUrlParams, ResourceLoader } from '@kye-netc/utils'
import { checkWhiteList } from './constants/miniAppConfig'

/** 对象转url参数 */
const objectToUrlParams = (obj: Record<string, any> = {}) => {
  const tempArray = []
  for (const item in obj) {
    if (item) {
      tempArray.push(`${item}=${obj[item]}`)
    }
  }
  return tempArray?.join('&')
}

let base_url = ''

interface Params {
  params?: Record<string, string>
  page?: string
  type?: string
  showSaveBtn?: boolean
  pcMiniProgram?: boolean
  current?: string
  url?: string
  urls?: string[]
  count?: number
  sizeType?: string[]
  sourceType?: string[]
  api?: string
}

/* eslint-disable */
const navigateUrl = (params: Params) => {
  const data = params.params || {}
  switch (params.page) {
    case 'payment':
      return `/packages/pay/search/index?waybill=${data.waybillNo}`
    case 'search':
      return '/pages/search/index'
    case 'waybillRoute':
      return `/packages/waybill/route/index?${objectToUrlParams(data)}`
    case 'orderRoute':
      return `/packages/webview/order-route?orderNo=${data.orderNo}`
    case 'barcode':
      return `/packages/webview/barcode?waybillNo=${data.waybillNo}`
    case 'evaluation':
      return `/packages/webview/evaluation?flag=${data.flag}&orderNo=${data.orderNo}&waybillNo=${data.waybillNo}&scoreType=${data.scoreType}`
    case 'searchResult':
      return `/packages/webview/search-result?orderNo=${data.orderNo || ''}`
    case 'onlineService':
      return `/packages/webview/onlineService?paramsNum=${data.paramsNum}&type=${data.type}&needLogin=true`
    case 'order':
      return `/packages/mailing/single/index?type=${data.type || ''}&waybillNo=${data.waybillNo || ''}&orderNo=${
        data.orderNo || ''
      }&customerCode=${data.customerCode || ''}&sourcePage=${data.sourcePage || ''}`
    case 'waybillDetail':
      return `/packages/webview/waybill-detail?${objectToUrlParams(data)}`
    case 'payAuth':
      return `/packages/webview/pay-auth?applets=true&customerCode=${data.customerCode}`
    case 'payAuthRecord':
      return `/packages/webview/pay-auth`
    case 'effectiveOptimize':
      return `/packages/other/optimizeDetail/index?page=${data.page}`
    case 'customerCode':
      return `/packages/customerCode/nativeCustomer?from=${data.from}&title=${data.title || ''}`
    case 'customerCodeIntro':
      return `/packages/customerCode/customerCodeIntro`
    case 'realNameAuth':
      return '/packages/webview/real-name-auth'
    case 'questionnaire':
      return `/packages/webview/questionnaire?sourceKey=${data.sourceKey}&pageKey=${data.pageKey}&p=${data.p}`
    case 'orderSuccess':
      console.log(
        '/packages/webview/orderSuccess?${objectToUrlParams()}',
        `/packages/webview/orderSuccess?${objectToUrlParams(data)}`,
      )
      return `/packages/webview/orderSuccess?${objectToUrlParams(data)}`
    // return `/packages/webview/orderSuccess?type=${data.type}&waybillNo=${data.waybillNo}&customerCode=${data.customerCode}&length=${data.length}&goodsTime=${data.goodsTime}`
    case 'batchOrder':
      if (data.type === 'scanFillSingle') {
        return `/packages/mailing/scanFillSingle/index?orderNumber=${data.orderNo}`
      } else {
        return `/packages/mailing/batch/index`
      }
    case 'sendAddressBook':
      return `/packages/international/addressBook/index?pageState=send`
    case 'receiveAddressBook':
      return `/packages/international/addressBook/index?pageState=receive`
    case 'sendAddress':
      return `/packages/international/sendAddress/index?rowData=${encodeURIComponent(
        JSON.stringify(data.rowData || {}),
      )}`
    case 'receiveAddress':
      return `/packages/international/receiveAddress/index?rowData=${encodeURIComponent(
        JSON.stringify(data.rowData || {}),
      )}`
    case 'internationalDetail':
      return `/packages/international/waybillNoDetail/index?waybillNo=${data.waybillNo || ''}`
    case 'internationalOrder':
      return `/packages/international/order/index?waybillNo=${data.waybillNo || ''}&action=${data.action || ''}`
    case 'driverNotice':
      return '/packages/webview/notice-driver-pickup' // 待通知司机取货列表页
    case 'mailbox':
      return `/packages/webview/openWebview?url=${encodeURIComponent(
        `${base_url}/president-mailbox.html#/feedback-home`,
      )}&customParams=${JSON.stringify({ needLogin: true })}` // 提议/吐槽
    case 'credit':
      return `/packages/webview/openWebview?url=${encodeURIComponent(
        `${base_url}/integral-center.html#/integral-home`,
      )}&customParams=${JSON.stringify({ needLogin: true })}` // 积分中心
    case 'coupon':
      return `/packages/webview/openWebview?url=${encodeURIComponent(
        `${base_url}/coupon-list-new.html#/valid?orderResource=6`,
      )}&customParams=${JSON.stringify({ needLogin: true, needPhone: true })}` // 优惠券一级页面
    case 'reward':
      return `/packages/webview/openWebview?url=${encodeURIComponent(
        `${base_url}/bonus.html#/bonus-home`,
      )}&customParams=${JSON.stringify({ needLogin: true })}` // 奖励金主页
    case 'preferences':
      return '/packages/webview/preference-setting' // 偏好设置
    case 'feedback':
      return `/packages/webview/openWebview?url=${encodeURIComponent(
        `${base_url}/function-feedback.html#/feedback-home`,
      )}&customParams=${JSON.stringify({ needLogin: true, needUA: true, needVersion: true, needSource: true })}` // 反馈页
    case 'minePage':
      return '/pages/mypage/index' // 我的页面
    case 'homePage':
      return '/pages/index/index' // 首页
    case 'orderPage':
      return '/pages/entry/index' // 寄件一级页面
    case 'gift':
      return `/packages/webview/openWebview?url=${encodeURIComponent(
        `${base_url}/buy-stock.html#/`,
      )}&customParams=${JSON.stringify({ needLogin: true, needOpenid: true })}` // 福利专区
    case 'prepaidFreight':
      return `/packages/webview/openWebview?url=${encodeURIComponent(
        `${base_url}/deposit-freight.html#/`,
      )}&customParams=${JSON.stringify({ needLogin: true, needOpenid: true })}`
    case 'searchTab20':
      return '/pages/search/index' // 待揽件页面
    case 'searchTab30':
      return '/pages/search/index' // 待签收页面
    case 'searchTab40':
      return '/pages/search/index' // 已签收页面
    case 'defaultSetting': // 寄件模版
      return 'modules/order-build/order-public/components/business/template-view/index'
  }
}

// 一级页面
const LevelPageList = ['minePage', 'homePage', 'orderPage', 'search']
// 查询状态列表
const SearchStatusList = ['searchTab20', 'searchTab30', 'searchTab40']

export class WxNative {
  public config: Type.Config
  public bridge!: WechatJSSDK

  constructor(env: Type.ENV) {
    this.config = getConfig(env)
    this.init()
    this.initBaseUrl(env)
  }

  private async init() {
    try {
      if (this.bridge) return
      const [isLoad] = await ResourceLoader.load([{ type: 'js', url: WXJSSDK }])
      if (!isLoad)
        throw new NativeError(Type.AppResCode.JSSDKFAIL, '微信 JSSDK 失败')
      this.bridge = window.wx
      await this.initWechat()
    } catch (error: any) {
      throw this.handleError(error)
    }
  }

  private initBaseUrl(env: Type.ENV) {
    if (env === 'uat') {
      base_url = 'https://ic-h5-uat.kye-erp.com'
    } else {
      base_url = 'https://ic-h5.kye-erp.com'
    }
  }

  async initWechat() {
    try {
      const url = window.location.href.split('#')[0]
      const response = await fetch(this.config.wxjssdk, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          appkey: APIAPPKY,
          method: 'web.ssoWeChatTool.getJsSdkSign',
        },
        body: JSON.stringify({ url }),
      })
      const result = (await response.json())?.data
      const wx = window.wx
      wx.config({
        beta: true,
        debug: false,
        appId: result.appid,
        timestamp: result.timestamp,
        nonceStr: result.noncestr,
        signature: result.signature,
        jsApiList: [
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
        ],
      })
      console.error(result)
      await new Promise<void>((resolve, reject) => {
        console.error(wx)
        wx.ready(() => {
          console.error(2222)
          resolve()
        })
        wx.error((error: any) =>{
          console.error(error)
          reject(new NativeError(Type.AppResCode.WXCONFIGERROR, error))
        })
      })
    } catch (error) {
      console.error(error)
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
    debugger
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

  navigateTo(params: Params): Promise<void> {
    let url = params.url as any
    let callApi = 'navigateTo' as keyof WechatJSSDK
    if (params.page) {
      if (LevelPageList.includes(params.page)) {
        url = navigateUrl(params)
        callApi = 'switchTab'
      } else if (SearchStatusList.includes(params.page)) {
        const waybillStatus = params.page.split('searchTab')[1]
        this.call('postMessage', { data: { waybillStatus } }, true)
        url = navigateUrl(params)
        callApi = 'switchTab'
      } else {
        url = navigateUrl(params)
        callApi = (params?.type || 'navigateTo') as keyof WechatJSSDK
      }
    }

    const addParams = {} as any
    if (params?.params?.url) {
      addParams.url = params?.params?.url || ''
    }

    if (params?.params?.needLogin) {
      addParams.needLogin = params?.params?.needLogin || 'false'
    }

    const webUrl = addUrlParams(url, addParams)
    console.log('webUrl', webUrl)
    return this.call(callApi, { url: webUrl }, true)
  }

  navigateBack(params?: Type.NavigateBackParmas): Promise<void> {
    return this.call('navigateBack', params, true)
  }

  share(params?: Type.ShareParmas): Promise<void> {
    return this.postMessage({ data: params })
  }

  login(): Promise<void> {
    return this.navigateTo({ url: '/packages/user/login/index' })
  }

  getLocation(params: Type.GetLocationParmas): Promise<Type.GetLocationRes> {
    return this.call('getLocation', {
      ...params,
      type: params?.type || 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
    })
  }

  openLocation(params: Type.OpenLocationParmas): Promise<void> {
    return this.call('openLocation', params)
  }

  previewImage(params: any): Promise<void> {
    if (params.showSaveBtn) {
      return this.call(
        'navigateTo',
        {
          url: `/packages/waybill/saveImage/index?current=${params.current}&urls=${params.urls}`,
        },
        true,
      )
    } else if (params.pcMiniProgram) {
      return this.call(
        'navigateTo',
        {
          url: `/packages/waybill/previewImage/index?current=${encodeURIComponent(params.current)}&urls=${encodeURIComponent(JSON.stringify(params.urls || []))}`,
        },
        true,
      )
    } else {
      return this.call('previewImage', {
        ...params,
        current: params.current || params.urls[0],
        urls: params.urls,
      })
    }
  }

  postMessage(params?: Type.PostMessageParmas): Promise<void> {
    return this.call('postMessage', params, true)
  }

  openWebview(params: Type.OpenWebviewParmas): Promise<void> {
    return this.navigateTo({
      url: '/packages/webview/openWebview',
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
    return this.call('stopRecord', params)
  }

  translateVoice(params?: any) {
    return this.call('translateVoice', params)
  }

  onVoiceRecordEnd(parmas?: any) {
    return this.call('onVoiceRecordEnd', parmas)
  }

  startRecord(parmas?: any) {
    return this.call('startRecord', parmas)
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
