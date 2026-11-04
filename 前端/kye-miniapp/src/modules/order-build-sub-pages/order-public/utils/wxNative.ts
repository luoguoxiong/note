import { closeToast, showToast } from '@order-public-sub-public/hooks/useShowToast'
import { getQueryObject, objectToUrlParams } from '@order-public-sub-public/utils'
import { PlainObject } from '@order-public-sub-public/types'
import type { Native } from './native'

let base_url = ''

const checkWhiteList = [
  'scanQRCode',
  'navigateTo',
  'navigateBack',
  'share',
  'previewImage',
  'login',
  'chooseImage',
  'refreshSearch',
  'checkApi',
  'openLocation',
  'getLocation',
  'openWebview',
]

interface Params {
  params?: Record<string, string>
  page?: string
  type?: string
  showSaveBtn?: boolean
  pcMiniProgram?: boolean
  current?: string
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
      return `/packages/waybill/route/index?${paramsToQuery(data)}`
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
      }&customerCode=${data.customerCode || ''}`
    case 'waybillDetail':
      return `/packages/webview/waybill-detail?${paramsToQuery(data)}`
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
      return `/packages/webview/real-name-auth?${objectToUrlParams(data)}`
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
  }
}
/* eslint-disable */

const paramsToQuery = (params: Record<string, string> = {}) => {
  const arr = []
  for (const key in params) {
    arr.push(`${key}=${params[key]}`)
  }
  return arr.join('&')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asyncImageData = (that: Native, localIds: any) => {
  const result: Record<string, string>[] = []
  return new Promise((resolve) => {
    getLocalImgData(that, localIds, result, resolve)
  })
}

const getLocalImgData = (
  that: Native,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  localIds: any,
  result: Record<string, string>[],
  resolve: <T>(value: T) => void,
) => {
  const localId = localIds.pop()
  that.bridge.getLocalImgData({
    localId: localId,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    success: (res: any) => {
      let localData = res.localData
      if (localData.indexOf('data:image') != 0) {
        //判断是否有这样的头部
        localData = 'data:image/jpeg;base64,' + localData
      }

      localData = localData.replace(/\r|\n/g, '').replace('data:image/jgp', 'data:image/jpeg')
      let suffix = '.png'
      if (localData.includes('data:image/jpeg')) {
        suffix = '.jpeg'
      } else if (localData.includes('data:image/jpg')) {
        suffix = '.jpg'
      }
      localData = localData.replace(/^data:image\/\w+;base64,/, '')
      result.push({
        fileName: `img-${new Date().getTime()}${suffix}`,
        fileSize: (getImgByteSize(localData) / 1024).toFixed(2),
        base64: localData,
      })
      if (localIds.length) {
        getLocalImgData(that, localIds, result, resolve)
      } else {
        resolve(result)
      }
    },
    fail: (error: any) => {
      console.log('执行getLocalImgData异常')
      console.log(error)
    },
  })
}
/**
 * 获取图片大小
 * @param base64
 * @returns {number}
 */
const getImgByteSize = (base64: string) => {
  let size = 0
  if (base64) {
    const equalIndex = base64.indexOf('=') // 获取=号下标
    if (equalIndex > 0) {
      const str = base64.substring(0, equalIndex) // 去除=号
      const strLength = str.length
      const fileLength = strLength - (strLength / 8) * 2 // 真实的图片byte大小
      size = Math.floor(fileLength) // 向下取整
    } else {
      const strLength = base64.length
      const fileLength = strLength - (strLength / 8) * 2
      size = Math.floor(fileLength) // 向下取整
    }
  }
  return size
}
// 一级页面
const LevelPageList = ['minePage', 'homePage', 'orderPage', 'search']
// 查询状态列表
const SearchStatusList = ['searchTab20', 'searchTab30', 'searchTab40']

export const wxNative = (
  method: string,
  params: Record<string, string> = {},
  that: Native,
  RES_CODE: Record<string, string>,
  visitEnv: string,
) => {
  if (visitEnv === 'stg') {
    base_url = 'http://ic-h5-stg.kye-erp.com'
  } else if (visitEnv === 'uat') {
    base_url = 'https://ic-h5-uat.kye-erp.com'
  } else {
    base_url = 'https://ic-h5.kye-erp.com'
  }
  return new Promise((resolve, reject) => {
    switch (method) {
      case 'scanQRCode':
        that.bridge.scanQRCode({
          ...params,
          complete: (res: Record<string, string>) => {
            console.log('scanQRCodeComplete', res)
            if (res.errMsg === 'scanQRCode:ok') {
              let result = res.resultStr
              if (result.includes(',')) {
                result = result.split(',')[1]
              }
              resolve({
                scanResult: result,
              })
            } else if (res.errMsg === 'scanQRCode:fail cancel' || res.errMsg === 'scanQRCode:cancel') {
              reject({
                code: RES_CODE.CANCEL,
                data: null,
                msg: '用户取消操作',
              })
            } else {
              reject({
                code: RES_CODE.ERROR,
                data: null,
                msg: 'scanQRCode 失败',
              })
            }
          },
        })
        break
      case 'navigateTo':
        if (LevelPageList.includes(params.page)) {
          that.bridge.miniProgram.switchTab({
            url: navigateUrl(params),
          })
        } else if (SearchStatusList.includes(params.page)) {
          const waybillStatus = params.page.split('searchTab')[1]
          that.bridge.miniProgram.postMessage({ data: { waybillStatus } })
          that.bridge.miniProgram.switchTab({
            url: navigateUrl(params),
          })
        } else {
          that.bridge.miniProgram[params.type || 'navigateTo']({
            url: navigateUrl(params),
          })
        }

        break
      case 'navigateBack':
        that.bridge.miniProgram.navigateBack(params)
        break
      case 'share':
        that.bridge.miniProgram.postMessage({ data: params })
        reject({
          code: RES_CODE.NO_SHARE,
          msg: '不支持直接分享，需要H5显示分享引导',
        })
        break
      case 'previewImage':
        if (params.showSaveBtn) {
          that.bridge.miniProgram.navigateTo({
            url: `/packages/waybill/saveImage/index?current=${params.current}&urls=${params.urls}`,
          })
        } else if (params.pcMiniProgram) {
          that.bridge.miniProgram.navigateTo({
            url: `/packages/waybill/previewImage/index?current=${encodeURIComponent(
              params.current,
            )}&urls=${encodeURIComponent(JSON.stringify(params.urls || []))}`,
          })
        } else {
          that.bridge.previewImage({
            current: params.current || params.urls[0],
            urls: params.urls,
          })
        }
        break
      case 'login':
        // eslint-disable-next-line no-case-declarations
        let { accountLogin } = getQueryObject()
        if (accountLogin) {
          accountLogin = JSON.parse(accountLogin)
          that.bridge.miniProgram.navigateTo({
            url: `/packages/user/accountInterwork/index?diffPhoneFlag=${
              accountLogin.diffPhoneFlag || ''
            }&phoneDiffWechatFlag=${accountLogin.phoneDiffWechatFlag || ''}&appletPhone=${
              accountLogin.appletPhone
            }&officialPhone=${accountLogin.officialPhone}&diffWechatPhone=${
              accountLogin.diffWechatPhone
            }&diffWechatNotLoginFlag=${accountLogin.diffWechatNotLoginFlag || ''}`,
          })
        } else {
          that.bridge.miniProgram.navigateTo({
            url: '/packages/user/login/index',
          })
        }
        break
      case 'chooseImage':
        that.bridge.chooseImage({
          count: params.count || 9, // 默认9
          sizeType: params.sizeType || ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
          sourceType: params.sourceType || ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
          fail: async (error: PlainObject) => {
            console.log('调用chooseImage失败')
            console.error(error)
          },
          success: async (res: PlainObject) => {
            console.log('chooseImage111', JSON.stringify(res))
            showToast({ message: '加载中...', forbidClick: true })
            if (res.errMsg === 'chooseImage:ok') {
              const result = await asyncImageData(that, res.localIds)
              closeToast()
              resolve({ imgList: result })
            } else {
              closeToast()
              reject({
                code: RES_CODE.ERROR,
                data: null,
                msg: '失败',
              })
            }
          },
        })
        break
      case 'refreshSearch':
        that.bridge.miniProgram.postMessage({ data: { refresh: true } })
        break
      case 'checkApi':
        if (checkWhiteList.includes(params.api)) {
          resolve({ result: '1' })
        } else {
          resolve({ result: '0' })
        }
        break
      case 'openLocation':
        that.bridge.openLocation(params)
        break
      case 'getLocation':
        that.bridge.getLocation({
          type: params.type || 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
          success: function (res: PlainObject) {
            resolve({
              latitude: res.latitude,
              longitude: res.longitude,
            })
          },
          fail: function (err: Error) {
            console.log(err, 'err------------------------------')
            reject(err)
          },
        })
        break
      case 'openWebview':
        that.bridge.miniProgram[params.type || 'navigateTo']({
          url: `/packages/webview/openWebview?url=${encodeURIComponent(params.url)}&needLogin=${
            params.withToken
          }&hideShare=${params.hideShare || false}${params.blueMethod ? '&blueMethod=' + params.blueMethod : ''}`,
        })
        break
      case 'postMessage':
        that.bridge.miniProgram.postMessage({ data: { ...params } })
        break
      case 'downloadImage':
        // 先判断是否为函数
        const saveImageToPhotosAlbum = that.bridge.miniProgram.saveImageToPhotosAlbum
        if (typeof saveImageToPhotosAlbum === 'function') {
          saveImageToPhotosAlbum({
            filePath: params.imageData,
          })
        }
        break
      case 'jumpBluetoothDeviceList':
        that.bridge.miniProgram.navigateTo({
          url: `/packages/mailing/print/index?printTraceId=${encodeURIComponent(params.traceId)}`,
        })
        break
      case 'jumpPrintPage':
        that.bridge.miniProgram.navigateTo({
          url: `/packages/mailing/print/printloading?taskId=${encodeURIComponent(
            params.taskId,
          )}&traceId=${encodeURIComponent(params.traceId)}&batchNos=${JSON.stringify(params.batchNos)}`,
        })
        break
    }
  })
}
