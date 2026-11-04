import { urlContact } from '@public/utils'
import kyeNavigate from '@public/utils/native/navigate'
import Taro from '@tarojs/taro'

interface OpenUrlParams {
  needLogin?: boolean
  unDecodeUrl?: boolean
  [key: string]: any
}

export const openURL = function (
  url: string,
  params: OpenUrlParams = {},
  navigateFn: 'navigateTo' | 'redirectTo' | 'switchTab' = 'navigateTo',
  isKyNative: boolean = true,
) {
  let decodedURL = url

  if (params?.unDecodeUrl) {
    decodedURL = url
  } else {
    decodedURL = decodeURIComponent(url)
  }

  const h5BaseURL = process.env.TARO_APP_HTTP_URL

  const target = /^https?:\/\//.test(decodedURL) ? decodedURL : h5BaseURL + decodedURL

  const webviewUrl = urlContact('/modules/webview/pages/webview/index?url=' + encodeURIComponent(target), params || {})

  const openFn = isKyNative ? kyeNavigate[navigateFn].bind(kyeNavigate) : Taro[navigateFn]

  openFn({
    url: webviewUrl,
    ...(params || {}),
  })
}
