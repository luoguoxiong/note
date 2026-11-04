import { AppPluginIds } from '@public/appPlugins/constants'
import { getNativePlugin, getCachedPluginSync } from '@public/appPlugins/utils/pluginLoader'

/**
 * @Desc: instance
 * @Date: 2025/8/26
 */

/**
 * 获取实例（使用全局单例加载器）
 * @returns {Promise<any> | Promise<Awaited<any>>}
 */
export const getPluginInstance = (): Promise<any> => {
  return getNativePlugin(AppPluginIds['消息推送'], 'version')
}

/**
 * 同步获取已缓存的插件实例
 */
export const getCachedPluginInstance = (): any => {
  return getCachedPluginSync(AppPluginIds['消息推送'])
}
