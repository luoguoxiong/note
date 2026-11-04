/**
 * @Desc: version
 * @Date: 2025/10/28
 */

import packageConfig from '../../../package.json'
import Taro from '@tarojs/taro'
let appVersion: string = '' //临时变量，不用一直调用api获取

/* 仓库版本号 */
export const shellVersion = packageConfig.version

/* 获取多端app正式版本号 */
export const MINI_APP_VERSION = (() => {
  const { host } = Taro.getSystemInfoSync()
  console.log('miniApp host>>>', host)
  const version = host?.appVersion || APP_VERSION || '1.0.0'
  return version.startsWith('v') ? version : `v${version}`
})()

/* 实时获取资源包版本号 （避免资源包推送变更）*/
export const getMiniAppVersion = () => {
  const { miniapp } = wx?.getAccountInfoSync()
  const version = miniapp?.version
  if (!version) {
    return MINI_APP_VERSION
  }
  return version?.startsWith('v') ? version : `v${version}`
}

/* 获取微信小程序版本 */
export const getMiniProgramVersion = () => {
  const { miniProgram } = wx?.getAccountInfoSync()
  // 接口无版本,取shellVersion
  const version = miniProgram?.version || shellVersion
  return !version ? '' : version.startsWith('v') ? version : `v${version}`
}

/* 获取版本号用作请求头 */
export const getVersionAsHeader = () => {
  try {
    if (appVersion) {
      return appVersion
    }
    const { miniapp } = wx?.getAccountInfoSync()
    const version = miniapp?.version || shellVersion
    appVersion = version?.replace(/[vV]/g, '')
  } catch (e) {
    console.log(e)
    return shellVersion
  }
  return appVersion
}

// 版本比较 v1.1.0
// 如果 version1 小于 version2，返回 -1；
// 如果 version1 大于 version2，返回 1；
// 如果 version1 等于 version2，返回 0；
export const compareVersionNew = (version1: string, version2: string) => {
  const v1 = version1.split('.')
  const v2 = version2.split('.')

  for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
    const num1 = parseInt(v1[i] || '0')
    const num2 = parseInt(v2[i] || '0')

    if (num1 < num2) {
      return -1
    } else if (num1 > num2) {
      return 1
    }
  }

  return 0
}
