/**
 * 功能版本配置文件
 * 维护需要特定版本以上才支持的功能
 */

import { MINI_APP_VERSION, compareVersionNew } from './version'

/**
 * iOS 选择文件功能需要的最低版本
 */
export const IOS_CHOOSE_FILE_MIN_VERSION = '8.2.33'

export const GET_DEVICEID_MIN_VERSION = '8.2.37'

/**
 * 原生方法名 -> 最低支持版本映射表
 */
const NATIVE_METHOD_MIN_VERSION_MAP: Record<string, string> = {
  chooseFile: IOS_CHOOSE_FILE_MIN_VERSION,
  getDeviceId: GET_DEVICEID_MIN_VERSION,
}

/**
 * 通用方法：检查当前版本是否支持指定的原生方法
 * @param methodName 原生方法名
 * @returns true 表示支持，false 表示不支持
 */
export function isSupportNativeMethod(methodName: string): boolean {
  const minVersion = NATIVE_METHOD_MIN_VERSION_MAP[methodName]
  if (!minVersion) {
    return false
  }
  const currentVersion = MINI_APP_VERSION.startsWith('v') ? MINI_APP_VERSION.slice(1) : MINI_APP_VERSION
  return compareVersionNew(currentVersion, minVersion) >= 0
}
