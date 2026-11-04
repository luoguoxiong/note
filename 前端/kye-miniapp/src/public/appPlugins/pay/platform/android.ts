/**
 * @Desc: android
 * @Date: 2025/8/18
 */
import { AppPluginIds } from '@public/appPlugins/constants'
import { PayPlugin } from '@public/appPlugins/pay/types'
import { getNativePlugin, getCachedPluginSync } from '@public/appPlugins/utils/pluginLoader'

/**
 * 获取实例（使用全局单例加载器）
 */
const getPluginInstance = (): Promise<any> => {
  return getNativePlugin(AppPluginIds['消息推送'], 'android-pay')
}

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

/**
 * 唤起支付宝支付
 * @param opts
 * @returns {Promise<unknown>}
 */
export const payAliOrderAsyncWithCallback = async (opts) => {
  const plugin = await getPluginInstance()
  return new Promise((resolve, reject) => {
    console.log('【app 插件】 调用方法 payAliOrderAsyncWithCallback')
    if (typeof plugin.payAliOrderAsyncWithCallback === 'function') {
      console.log('【app 插件】 调用方法 payAliOrderAsyncWithCallback 调用成功')
      // plugin.payAliOrderAsyncWithCallback(opts || {}, resolve)
      plugin.payAliOrderAsyncWithCallback(opts || {}, (res) => {
        console.log('【app 插件】 调用方法payAliOrderAsyncWithCallback结果', res)
        resolve(res)
      })
    } else {
      reject(new Error('android 插件未实现 payAliOrderAsyncWithCallback'))
    }
  })
}

/**
 * 唤起银联支付
 * @param opts
 */
export const payUnifyAsyncWithCallback = (opts) => {
  return callFunc('payUnifyAsyncWithCallback', opts)
}

/* 监听推送消息 */
export const onMiniPluginEvent: PayPlugin['onMiniPluginEvent'] = async (listener: (msg: any) => void) => {
  const plugin = await getPluginInstance()
  if (typeof plugin?.onMiniPluginEvent === 'function') {
    console.log('【app插件】android onMiniPluginEvent 支付')
    plugin.onMiniPluginEvent(listener)
  }
}
/* 取消监听推送消息 */
export const offMiniPluginEvent: PayPlugin['offMiniPluginEvent'] = (listener: (msg: any) => void) => {
  const pluginInstance = getCachedPluginSync(AppPluginIds['消息推送'])
  if (!pluginInstance) {
    console.warn('【app插件】未初始化，请先调用 initPlugin()')
    return
  }

  if (typeof pluginInstance.offMiniPluginEvent === 'function') {
    pluginInstance.offMiniPluginEvent(listener)
  }
}
