/* eslint-disable @typescript-eslint/ban-ts-comment */
import Taro, { ENV_TYPE } from '@tarojs/taro'

declare const my: any
declare const wx: any

// @ts-ignore
const systemInfo: any =
  'getSystemInfoAsync' in Taro ? Taro?.getSystemInfoSync() : {}

const ua = navigator.userAgent

const isMobile = /android|iphone|ipod|windows phone|mobile/.test(
  ua.toLowerCase(),
)

// 是不是纯血鸿蒙
export function isPureHarmony() {
  const ua = navigator.userAgent || ''
  return /OpenHarmony|HarmonyOS/i.test(ua) && !/Android/i.test(ua)
}

export const isWxApp = () => {
  const systemInfo = Taro.getSystemInfoSync()
  const host = (systemInfo as any)?.host
  const hostEnv = host?.env || ''
  return hostEnv === 'SAAASDK'
}

/** 微信小程序 */
export const isWxMiniApp = Taro.getEnv() === ENV_TYPE.WEAPP

/** 支付宝小程序 */
export const isAliMiniApp = Taro.getEnv() === ENV_TYPE.ALIPAY

/** 高德小程序 */
export const isAmapMiniApp = isAliMiniApp && !!my?.gd

export const isH5Env = process.env.TARO_ENV === 'h5'

export const isH5FSEnv = (isH5Env && /lark\//i.test(ua)) || isH5Env

export const isPcFsEnv = isH5Env && !isMobile

export const isPcWorkWx = () => {
  const systemInfo = Taro.getSystemInfoSync()
  const isPc = ['windows', 'mac'].includes(systemInfo.platform)
  const environment = (systemInfo as any)?.environment || ''
  return environment === 'wxwork' && isPc
}

export const isAndroid = /android/i.test(systemInfo.system)

export const isIos = /^(iPad|iPhone|iPod|iOS)/i.test(systemInfo.system)

export const isWorkWx = () => {
  const systemInfo = Taro.getSystemInfoSync()
  const environment = (systemInfo as any)?.environment || ''
  return environment === 'wxwork'
}

/**
 * 参数必填项检查
 * @description
 * - 用于减少重复的参数非空校验逻辑
 * - 如果有缺失，直接弹出 Toast 提示
 * @param params 参数对象
 * @param required 必填字段名称数组
 * @returns 是否通过校验
 */
export const checkParams = (
  params: Record<string, any>,
  required: string[],
): boolean => {
  const missing = required.some(
    (key) =>
      params[key] === null || params[key] === undefined || params[key] === '',
  )
  if (missing) {
    Taro.showToast({ title: '请检查参数', icon: 'none' })
    return false
  }
  return true
}

export const promisify = <T, P>(apiFunc: (params: P) => void) => {
  return (params: P): Promise<T> => {
    return new Promise((resolve, reject) => {
      apiFunc({
        ...params,
        success: (res: T) => resolve(res),
        fail: (error: TaroGeneral.CallbackResult) => reject(error),
      })
    })
  }
}

export async function ensureWechatInstalled() {
  try {
    const res = await promisify<
      { errMsg: string; hasWechatInstall: boolean },
      undefined
    >(wx.miniapp.hasWechatInstall)(undefined)
    return res.hasWechatInstall
  } catch {
    return false
  }
}

export type VersionCompareResult = -1 | 0 | 1

export function compareVersion(a: string, b: string): VersionCompareResult {
  const arrA = a.split('.').map((n) => Number(n))
  const arrB = b.split('.').map((n) => Number(n))
  const maxLen = Math.max(arrA.length, arrB.length)

  for (let i = 0; i < maxLen; i++) {
    const vA = arrA[i] ?? 0
    const vB = arrB[i] ?? 0

    if (vA > vB) return 1
    if (vA < vB) return -1
  }

  return 0
}
