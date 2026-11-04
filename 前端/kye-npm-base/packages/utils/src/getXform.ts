import {
  isWxApp,
  isAppiOS,
  isAppAndroid,
  isWxApplet,
  isAliPayClient,
  isAmapApp,
  isH5FSEnv,
  isPcFSEnv,
} from './device'

type XformCode = '111' | '114' | '147' | '149' | '151' | '153'

export const getXform = (): XformCode => {
  if (isWxApp || isAppiOS || isAppAndroid) {
    return '111'
  }

  if (isWxApplet) {
    return '114'
  }

  if (isAmapApp) {
    return '149'
  }

  if (isAliPayClient) {
    return '147'
  }

  if (isPcFSEnv) {
    return '153'
  }

  if (isH5FSEnv) {
    return '151'
  }

  return '114'
}
