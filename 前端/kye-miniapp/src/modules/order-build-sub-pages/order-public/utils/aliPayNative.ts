/* eslint-disable */
import { getQueryObject } from '@order-public-sub-public/utils'
import { isAliPayClient } from './device'
import { PlainObject } from '@order-public-sub-public/types'

const paramsToQuery = (params: Record<string, any> = {}) => {
  let arr = []
  for (const key in params) {
    if (typeof params[key] !== 'undefined') {
      arr.push(`${key}=${params[key]}`)
    }
  }
  return arr.join('&')
}

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

const navigateUrl = (params: { page?: string; params?: Record<string, any> | PlainObject }) => {
  let data = params.params || {}
  switch (params.page) {
    case 'waybillRoute':
      return `/modules/waybill/pages/waybill-route/index?${paramsToQuery(data)}`
    case 'search':
      return `/layout/pages/search/index`
    case 'orderRoute':
      return `/modules/waybill/pages/order-route/index?orderNo=${data.orderNo}`
    case 'waybillDetail':
      return `/modules/waybill/pages/waybill-detail/index?${paramsToQuery(data)}`
  }
}

export interface AliPayNativeParams {
  page?: string
  params?: Record<string, any>
  imageData?: string
  blueMethod?: string
  url?: string
  type?: string
  withToken?: boolean
  hideShare?: boolean
}

export const aliPayNative = (method: string, params: Record<string, string> = {}) => {
  return new Promise(async (resolve) => {
    switch (method) {
      case 'scanQRCode':
        window.my.postMessage({ data: { method: 'scanQRCode' } })
        break
      case 'postMessage':
        window.my.postMessage(params)
        break
      case 'navigateTo':
        if (params?.type === 'redirectTo') {
          window.my.redirectTo({ url: navigateUrl(params) })
        } else {
          window.my.navigateTo({ url: navigateUrl(params) })
        }
        break
      case 'navigateBack':
        window.my.navigateBack(params)
        break
      case 'login':
        let { accountLogin } = getQueryObject()
        if (accountLogin) {
          accountLogin = JSON.parse(accountLogin)
          window.my.navigateTo({
            url: `/modules/user/pages/login/index?diffPhoneFlag=${
              accountLogin.diffPhoneFlag || ''
            }&phoneDiffWechatFlag=${accountLogin.phoneDiffWechatFlag || ''}&appletPhone=${
              accountLogin.appletPhone
            }&officialPhone=${accountLogin.officialPhone}&diffWechatPhone=${
              accountLogin.diffWechatPhone
            }&diffWechatNotLoginFlag=${accountLogin.diffWechatNotLoginFlag || ''}`,
          })
        } else {
          window.my.navigateTo({
            url: '/modules/user/pages/login/index',
          })
        }
        break
      case 'downloadImage':
        console.log('点击下载图片触发原生')
        console.log(params.imageData)
        window.my.postMessage({ data: { method: 'downloadImage', filePath: params.imageData } })
        break
      case 'openWebview':
        if (params?.type === 'redirectTo') {
          window.my.redirectTo({
            url: `/modules/order/pages/webview/index?url=${encodeURIComponent(params.url)}&needLogin=${
              params.withToken
            }&hideShare=${params.hideShare || false}${params.blueMethod ? '&blueMethod=' + params.blueMethod : ''}`,
          })
        } else {
          window.my.navigateTo({
            url: `/modules/order/pages/webview/index?url=${encodeURIComponent(params.url)}&needLogin=${
              params.withToken
            }&hideShare=${params.hideShare || false}${params.blueMethod ? '&blueMethod=' + params.blueMethod : ''}`,
          })
        }
        break
      case 'checkApi':
        if (checkWhiteList.includes(params.api)) {
          resolve({ result: '1' })
        } else {
          resolve({ result: '0' })
        }
        break
      case 'openLocation':
        window.my.openLocation(params)
        break
      case 'enableAlertBeforeUnload':
        window.my.enableAlertBeforeUnload(params)
        break
      case 'getLocation':
        const location = await geolocation()
        resolve(location)
        break
    }
    resolve(true)
  })
}

const aliPayonMessage = (method: string, callback: Function) => {
  window.my.onMessage = (e: any) => {
    if (e?.method === method) {
      callback && callback(e)
    }
  }
}

export const aliPayNativeCallback = (method: string, callback: Function) => {
  if (isAliPayClient) {
    aliPayonMessage(method, callback)
  }
}

const geolocation = async () => {
  return new Promise((resolve) => {
    if (navigator.geolocation) {
      try {
        navigator.geolocation.getCurrentPosition(
          (position: { coords: { latitude: number; longitude: number } }) => {
            const { latitude, longitude } = position.coords
            resolve({ longitude, latitude })
          },
          (error: any) => {
            switch (error.code) {
              case error.PERMISSION_DENIED:
                console.error('用户拒绝了地理定位请求。')
                break
              case error.POSITION_UNAVAILABLE:
                console.error('位置信息不可用。')
                break
              case error.TIMEOUT:
                console.error('请求超时。')
                break
              case error.UNKNOWN_ERROR:
                console.error('发生未知错误。')
                break
            }
            resolve({})
          },
        )
      } catch (error) {
        resolve({})
        console.error('浏览器不支持地理定位。')
      }
    } else {
      resolve({})
      console.error('浏览器不支持地理定位。')
    }
  })
}
