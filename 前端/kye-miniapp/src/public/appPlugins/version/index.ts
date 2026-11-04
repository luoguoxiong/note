/**
 * @Desc: index
 * @Date: 2025/8/26
 */
import { VersionPlugin } from '@public/appPlugins/version/types'
import { isWeixinAppSync } from '@public/config'
import * as androidImpl from './platform/android'

let impl!: VersionPlugin // 平台实例
let initPromise: Promise<VersionPlugin> | null = null // 平台实例promise

/* 初始化平台 */
const initImpl = async (): Promise<VersionPlugin> => {
  if (impl) return impl
  if (initPromise) return initPromise

  const isWeixinApp = isWeixinAppSync() || false
  if (!isWeixinApp) {
    const err = '【app插件】 当前环境非微信app环境'
    console.error(err)
    return Promise.reject(err)
  }

  initPromise = (async () => {
    return androidImpl as VersionPlugin
  })()

  return initPromise
}

export function call<K extends keyof VersionPlugin>(
  methodName: K,
  ...args: Parameters<VersionPlugin[K]>
): ReturnType<VersionPlugin[K]> | Promise<ReturnType<VersionPlugin[K]>> {
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

/* 升级消息-监听 */
export const onMiniPluginEvent = (...args: Parameters<VersionPlugin['onMiniPluginEvent']>) =>
  call('onMiniPluginEvent', ...args)

/* 升级消息-取消监听 */
export const offMiniPluginEvent = (...args: Parameters<VersionPlugin['offMiniPluginEvent']>) =>
  call('offMiniPluginEvent', ...args)

/* 下载更新apk */
export const downloadUpdateApk = (...args: Parameters<VersionPlugin['downloadUpdateApk']>) =>
  call('downloadUpdateApk', ...args)

/* 安装apk */
export const installUpdateApk = (...args: Parameters<VersionPlugin['installUpdateApk']>) =>
  call('installUpdateApk', ...args)

/* 检测apk是否下载完成 */
export const checkUpdateApkDownloadDone = (...args: Parameters<VersionPlugin['checkUpdateApkDownloadDone']>) =>
  call('checkUpdateApkDownloadDone', ...args)
