import { openURL } from '@modules/webview/utils'
import { INTEGRAL_CENTER_HOME_URL } from '../constants'

/** 打开积分中心首页 WebView */
export function openIntegralCenterHome() {
  openURL(INTEGRAL_CENTER_HOME_URL, { needLogin: true })
}
