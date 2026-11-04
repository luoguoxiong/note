import { isWeixinAppSync } from '@/public/config'
import { getEnv, isAmapMiniApp } from '@public/utils/device'
import grayHeaderStore from '@public/utils/request/grayHeader'
import { AnyParams, PlainObject } from '@public/utils/types'
import { ENV_TYPE } from '@tarojs/taro'
import md5 from 'js-md5'

// 根据环境设置 x-from
const APPID_MAP = {
  [ENV_TYPE.RN]: '111',
  [ENV_TYPE.WEB]: '114',
  [ENV_TYPE.WEAPP]: '114',
  [ENV_TYPE.ALIPAY]: '147',
}
/* 支付宝小程序默认x-from*/
export let defaultAppId = getEnv() && APPID_MAP[getEnv()]
if (isWeixinAppSync()) {
  defaultAppId = APPID_MAP[ENV_TYPE.RN]
}
if (isAmapMiniApp) {
  defaultAppId = '149'
}

export const createSign = (token: string, timestamp: number, body: PlainObject): string => {
  // @ts-ignore
  return md5(md5(token).toUpperCase() + timestamp + JSON.stringify(body || {})).toUpperCase()
}

/* 获取原生请求灰度头 */
export const getGrayHeaderInfo = () => {
  return grayHeaderStore.nativeGrayHeader || {}
}

/* 深度合并对象 */
export const deepMerge = (target: AnyParams, source: AnyParams) => {
  if (source && typeof source === 'function') {
    return source
  }
  // 如果源对象为空，直接返回目标对象
  if (!source || typeof source !== 'object') {
    return target
  }

  // 如果目标对象为空，直接返回源对象
  if (!target || typeof target !== 'object') {
    return source
  }

  // 遍历源对象的属性
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      // 如果属性是对象，则递归地合并
      if (source[key] instanceof Object && key in target) {
        target[key] = deepMerge(target[key], source[key])
      } else {
        // 否则直接赋值
        target[key] = source[key]
      }
    }
  }

  return target
}

/* 合并对象配置 - 使用:request config 配置深合并 */
export function mergerConfig(targetConfig: AnyParams, sourceConfig: AnyParams) {
  const targetConfigCopy = { ...targetConfig }
  const config = deepMerge(targetConfigCopy, sourceConfig) || {}
  return config
}
