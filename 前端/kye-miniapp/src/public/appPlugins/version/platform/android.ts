/**
 * @Desc: android
 * @Date: 2025/8/26
 */

/* 监听推送消息 */
import { VersionPlugin } from '@public/appPlugins/version/types'
import { getPluginInstance } from '@public/appPlugins/version/instance'

const callFunc = async (method, opts: any) => {
  const plugin = await getPluginInstance()
  return new Promise((resolve, reject) => {
    console.log(`【app 插件】 调用方法 ${method}`)
    if (typeof plugin[method] === 'function') {
      plugin[method](opts || {}, resolve)
    } else {
      reject(new Error(`iOS 插件未实现 ${method}`))
    }
  })
}

export const onMiniPluginEvent: VersionPlugin['onMiniPluginEvent'] = async (listener: (msg: any) => void) => {
  const plugin = await getPluginInstance()
  if (typeof plugin?.onMiniPluginEvent === 'function') {
    console.log('【app插件】android onMiniPluginEvent 支付')
    plugin.onMiniPluginEvent(listener)
  }
}

/* 取消监听推送消息 */
export const offMiniPluginEvent: VersionPlugin['offMiniPluginEvent'] = async (listener: (msg: any) => void) => {
  const pluginInstance = await getPluginInstance()
  if (!pluginInstance) {
    console.warn('【app插件】未初始化，请先调用 initPlugin()')
    return
  }

  if (typeof pluginInstance.offMiniPluginEvent === 'function') {
    pluginInstance.offMiniPluginEvent(listener)
  }
}

/**
 * 下载更新apk
 * @param opts
 */
export const downloadUpdateApk = (opts) => {
  return callFunc('downloadUpdateApk', opts)
}

/**
 * 安装apk
 * @param opts
 * @returns {Promise<unknown>}
 */
export const installUpdateApk = (opts) => {
  return callFunc('installUpdateApk', opts)
}

/**
 * 检测apk是否下载完成
 * @param opts
 * @returns {Promise<unknown>}
 */
export const checkUpdateApkDownloadDone = (opts) => {
  return callFunc('checkUpdateApkDownloadDone', opts)
}
