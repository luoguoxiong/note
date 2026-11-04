import { PushPlugin } from '@public/appPlugins/push/types'
import { AppPluginIds } from '@public/appPlugins/constants'
import { getNativePlugin, getCachedPluginSync } from '@public/appPlugins/utils/pluginLoader'

/**
 * @Desc: android
 * @Date: 2025/8/15
 */

/**
 * 获取实例（使用全局单例加载器）
 */
const getPluginInstance = (): Promise<any> => {
  return getNativePlugin(AppPluginIds['消息推送'], 'android-push')
}

/* 推送极光初始化sdk-注册 (同步方法) */
export const register: PushPlugin['register'] = async (opts?: any) => {
  const plugin = await getPluginInstance()
  if (typeof plugin?.registerPushSync === 'function') {
    return plugin.registerPushSync(opts || {})
  }
}

/* 监听推送消息 */
export const onMiniPluginEvent: PushPlugin['onMiniPluginEvent'] = async (listener: (msg: any) => void) => {
  const plugin = await getPluginInstance()
  if (typeof plugin?.onMiniPluginEvent === 'function') {
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
  console.log('【app 插件】 调用方法 resetBadgeSync ')
  const pluginInstance = await getPluginInstance()
  if (!pluginInstance) {
    console.warn('【app插件】未初始化，请先调用 initPlugin()')
    return
  }
  if (typeof pluginInstance.resetBadgeSync === 'function') {
    return pluginInstance.resetBadgeSync(opts || {})
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
    console.log('【app 插件】 调用方法 getRegistrationIDSync-开始')
    return pluginInstance.getRegistrationIDSync(opts || {})
  }
}

/* 启动检测推送消息处理 （android） */
export const checkPushHandleMessageSync = async () => {
  const pluginInstance = await getPluginInstance()
  if (!pluginInstance) {
    console.warn('【app插件】未初始化，请先调用 initPlugin()')
    return
  }
  // TODO mySyncFunc25 为调试插件代码缓存待移除
  if (typeof pluginInstance.mySyncFunc25 === 'function') {
    const result = pluginInstance.mySyncFunc25()
    console.log('appPlugin mySyncFunc25 result：', result)
  }
  if (typeof pluginInstance.checkPushHandleMessageSync === 'function') {
    return pluginInstance.checkPushHandleMessageSync()
  }
}

/* 以下为调试用代码 */
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
    console.log('【app 插件】 调用方法 testAsync')
    if (typeof plugin.testAsync === 'function') {
      plugin.testAsync(opts || {}, resolve)
    } else {
      reject(new Error('android 插件未实现 testAsync'))
    }
  })
}

export const mySyncFunc1: PushPlugin['register'] = (opts?: any) => {
  console.log('【app 插件】 调用方法 mySyncFunc1')
  const pluginInstance = getCachedPluginSync(AppPluginIds['消息推送'])
  if (!pluginInstance) {
    console.warn('【app插件】未初始化，请先调用 initPlugin()')
    return
  }
  if (typeof pluginInstance.mySyncFunc1 === 'function') {
    return pluginInstance.mySyncFunc1(opts || {})
  }
}

export const mySyncFunc2: PushPlugin['register'] = (opts?: any) => {
  console.log('【app 插件】 调用方法 mySyncFunc2')
  const pluginInstance = getCachedPluginSync(AppPluginIds['消息推送'])
  if (!pluginInstance) {
    console.warn('【app插件】未初始化，请先调用 initPlugin()')
    return
  }
  if (typeof pluginInstance.mySyncFunc2 === 'function') {
    return pluginInstance.mySyncFunc2(opts || {})
  }
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
