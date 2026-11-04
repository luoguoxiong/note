/**
 * @Desc: app push消息通知
 * @Date: 2025/8/11
 */
import { getSystemInfo } from '@public/utils/getSystemInfo'
import * as iosImpl from './platform/ios'
import * as androidImpl from './platform/android'
import { PushPlugin } from '@public/appPlugins/push/types'
import { isWeixinAppSync } from '@public/config'
import { PayPlugin } from '@public/appPlugins/pay/types'
import { isWxAppAndroid } from '@public/appPlugins/utils/device'

let impl!: PushPlugin // 平台实例
let initPromise: Promise<PushPlugin> | null = null // 平台实例promise

/* 初始化平台 */
const initImpl = async (): Promise<PushPlugin> => {
  if (impl) return impl
  if (initPromise) return initPromise

  const isWeixinApp = isWeixinAppSync() || false
  if (!isWeixinApp) {
    const err = '【app插件】 当前环境非微信app环境'
    console.error(err)
    return Promise.reject(err)
  }

  initPromise = (async () => {
    const { platform } = await getSystemInfo()
    if (['ios', 'devtools'].includes(platform)) impl = iosImpl as PushPlugin
    else if (['android', 'ohos'].includes(platform)) impl = androidImpl as PushPlugin
    else impl = androidImpl as PushPlugin
    return impl
  })()

  return initPromise
}

/**
 * 统一调用方法
 * - 同步方法: => 直接同步返回
 * - 其他情况 => 异步返回 Promise
 */
export function call<K extends keyof PushPlugin>(
  methodName: K,
  ...args: Parameters<PushPlugin[K]>
): ReturnType<PushPlugin[K]> | Promise<ReturnType<PushPlugin[K]>> {
  if (impl) {
    const method = impl[methodName]
    if (typeof method !== 'function') {
      throw new Error(`【app插件】方法不存在: ${String(methodName)}`)
    }
    // 直接调用并返回（同步/异步方法都支持）
    return (method as any)(...args)
  }

  // 如果还没初始化 > 走异步初始化
  return (async () => {
    const plugin = await initImpl()
    const method = plugin[methodName]
    if (typeof method !== 'function') {
      throw new Error(`【app插件】方法不存在: ${String(methodName)}`)
    }
    return (method as any)(...args)
  })()
}

/** 极光SDK方法初始化 */
export const register = (...args: Parameters<PushPlugin['register']>) => call('register', ...args)

/* 极光-唯一id获取 */
export const getRegistrationIDSync = (...args: Parameters<PushPlugin['getRegistrationIDSync']>) =>
  call('getRegistrationIDSync', ...args)

/* 极光消息-监听 */
export const onMiniPluginEvent = (...args: Parameters<PushPlugin['onMiniPluginEvent']>) =>
  call('onMiniPluginEvent', ...args)

/* 极光消息-取消监听 */
export const offMiniPluginEvent = (...args: Parameters<PushPlugin['offMiniPluginEvent']>) =>
  call('offMiniPluginEvent', ...args)

/* 极光-消息角标设置 */
export const resetBadgeSync = (...args: Parameters<PushPlugin['resetBadgeSync']>) => call('resetBadgeSync', ...args)

/* 启动检测推送消息处理 （仅android） */
export const checkPushHandleMessageSync = async (...args: Parameters<PushPlugin['checkPushHandleMessageSync']>) => {
  const isAppAndroid = await isWxAppAndroid()
  console.log('checkPushHandleMessageSync')
  if (isAppAndroid) {
    call('checkPushHandleMessageSync', ...args)
  }
}

/**
 * 以下为调试代码
 */

/* 同步方法-调试 */
export const mySyncFunc = (...args: Parameters<PushPlugin['mySyncFunc']>) => call('mySyncFunc', ...args)

/* 异步方法-调试 */
export const myAsyncFuncwithCallback = (...args: Parameters<PushPlugin['myAsyncFuncwithCallback']>) =>
  call('myAsyncFuncwithCallback', ...args)

/* 同步方法-调试 */
export const mySyncFunc1 = (...args: Parameters<PushPlugin['mySyncFunc']>) => call('mySyncFunc1', ...args)

/* 同步方法-调试 */
export const mySyncFunc2 = (...args: Parameters<PushPlugin['mySyncFunc']>) => call('mySyncFunc2', ...args)

/* 唤起支付宝支付(调试) */
export const payAliOrderAsyncWithCallback = (...args: Parameters<PayPlugin['payAliOrderAsyncWithCallback']>) =>
  call('payAliOrderAsyncWithCallback', ...args)
