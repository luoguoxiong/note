import { PushPlugin } from '@public/appPlugins/push/types'
import { AppPluginIds } from '@public/appPlugins/constants'
import { getNativePlugin, getCachedPluginSync } from '@public/appPlugins/utils/pluginLoader'

/**
 * @Desc: ios
 * @Date: 2025/8/11
 */

/**
 * 获取实例（使用全局单例加载器）
 */
const getPluginInstance = (): Promise<any> => {
  return getNativePlugin(AppPluginIds['消息推送'], 'ios-push')
}

export const register: PushPlugin['registerPushSync'] = async (opts?: any) => {
  console.log('【app 插件】 调用方法 register')
  const pluginInstance = await getPluginInstance()
  if (!pluginInstance) {
    console.warn('【app插件】未初始化，请先调用 initPlugin()')
    return
  }
  if (typeof pluginInstance.registerPushSync === 'function') {
    return pluginInstance.registerPushSync(opts || {})
  }
}

/* 监听推送消息 */
export const onMiniPluginEvent: PushPlugin['onMiniPluginEvent'] = async (listener: (msg: any) => void) => {
  const plugin = await getPluginInstance()
  if (typeof plugin.onMiniPluginEvent === 'function') {
    plugin.onMiniPluginEvent(listener)
  }
}
/* 取消监听推送消息 */
export const offMiniPluginEvent: PushPlugin['offMiniPluginEvent'] = (listener: (msg: any) => void) => {
  const pluginInstance = getCachedPluginSync(AppPluginIds['消息推送'])
  if (!pluginInstance) {
    console.warn('【app插件】未初始化，请先调用 initPlugin()')
    return
  }

  if (typeof pluginInstance.offMiniPluginEvent === 'function') {
    pluginInstance.offMiniPluginEvent(listener)
  }
}
/* 极光消息-APP角标更新 */
export const resetBadgeSync: PushPlugin['resetBadgeSync'] = async (opts?: any) => {
  const pluginInstance = await getPluginInstance()
  console.log('【app 插件】 调用方法 resetBadgeSync', opts)
  if (typeof pluginInstance.resetBadgeSync === 'function') {
    return pluginInstance.resetBadgeSync(opts || {})
  } else {
    console.log('【app 插件】 调用方法 resetBadgeSync-错误')
  }
}

/* 获取极光-唯一id */
export const getRegistrationIDSync: PushPlugin['getRegistrationIDSync'] = async (opts) => {
  console.log('【app 插件】 调用方法 getRegistrationIDSync')
  const pluginInstance = await getPluginInstance()
  if (!pluginInstance) {
    console.warn('【app插件】未初始化，请先调用 initPlugin()')
    return
  }
  if (typeof pluginInstance.getRegistrationIDSync === 'function') {
    return pluginInstance.getRegistrationIDSync(opts || {})
  }
}

/* test-同步方法 */
export const mySyncFunc: PushPlugin['register'] = (opts?: any) => {
  console.log('【app 插件】 调用方法 mySyncFunc')
  const pluginInstance = getCachedPluginSync(AppPluginIds['消息推送'])
  if (!pluginInstance) {
    console.warn('【app插件】未初始化，请先调用 initPlugin()')
    return
  }
  if (typeof pluginInstance.mySyncFunc === 'function') {
    return pluginInstance.mySyncFunc(opts || {})
  }
}

export const myAsyncFuncwithCallback: PushPlugin['register'] = async (opts?: any) => {
  const plugin = await getPluginInstance()
  return new Promise((resolve, reject) => {
    console.log('【app 插件】 调用方法 myAsyncFuncwithCallback')
    if (typeof plugin.myAsyncFuncwithCallback === 'function') {
      plugin.myAsyncFuncwithCallback(opts || {}, resolve)
    } else {
      reject(new Error('iOS 插件未实现 mySyncFunc'))
    }
  })
}
