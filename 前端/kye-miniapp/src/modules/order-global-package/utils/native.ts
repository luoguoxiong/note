import {
  isWxApplet,
  isAppBrowse,
  isAppiOS,
  isAppAndroid,
  isWxAppletAndroid,
  isWxPcApplet,
  isIpad,
  isAndroidPad,
  isAliPayClient,
  isAndroid,
  isAmapApp,
} from './device'
import { isH5FSEnv, isPcFSEnv, isWebPc } from '@/public/utils'

export const isDesktopMiniprogram = () => {
  const userAgent = navigator.userAgent
  return isWxPcApplet || /WindowsWechat/i.test(userAgent) || /Windows NT/i.test(userAgent) || isWebPc // WindowWechat是桌面版微信小程序的用户代理的一部分
}
