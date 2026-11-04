/**
 * @Desc: app 唤起原生支付
 * @Date: 2025/8/11
 */
import { getSystemInfo } from '@public/utils/getSystemInfo'
import * as iosImpl from './platform/ios'
import * as androidImpl from './platform/android'
import { PayPlugin } from '@public/appPlugins/pay/types'
import { isWeixinAppSync } from '@public/config'

let impl!: PayPlugin // 平台实例
let initPromise: Promise<PayPlugin> | null = null // 平台实例promise

/* 初始化平台 */
const initImpl = async (): Promise<PayPlugin> => {
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
    if (['ios', 'devtools'].includes(platform)) impl = iosImpl as PayPlugin
    else if (['android', 'ohos'].includes(platform)) impl = androidImpl as PayPlugin
    else impl = androidImpl as PayPlugin
    return impl
  })()

  return initPromise
}

/**
 * 统一调用方法
 * - 同步方法: => 直接同步返回
 * - 其他情况 => 异步返回 Promise
 */
export function call<K extends keyof PayPlugin>(
  methodName: K,
  ...args: Parameters<PayPlugin[K]>
): ReturnType<PayPlugin[K]> | Promise<ReturnType<PayPlugin[K]>> {
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
/* 唤起支付宝支付 */
export const payAliOrderAsyncWithCallback = (...args: Parameters<PayPlugin['payAliOrderAsyncWithCallback']>) =>
  call('payAliOrderAsyncWithCallback', ...args)

/* 唤起银联支付 */
export const payUnifyAsyncWithCallback = (...args: Parameters<PayPlugin['payUnifyAsyncWithCallback']>) =>
  call('payUnifyAsyncWithCallback', ...args)

/* 支付结果通知-监听 */
export const onMiniPluginEvent = (...args: Parameters<PayPlugin['onMiniPluginEvent']>) =>
  call('onMiniPluginEvent', ...args)

/* 支付结果通知-取消监听 */
export const offMiniPluginEvent = (...args: Parameters<PayPlugin['offMiniPluginEvent']>) =>
  call('offMiniPluginEvent', ...args)
