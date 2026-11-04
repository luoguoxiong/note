import * as push from './push'
import * as pay from './pay'
import * as version from './version'
import * as permission from './permission'
import { chooseFile } from './chooseFile'
import { getDeviceId } from './getDeviceId'
import { appPluginError as error } from '@public/appPlugins/utils/error'
import { getNativePlugin, clearPluginCache, getCachedPluginSync } from '@public/appPlugins/utils/pluginLoader'

export const AppPlugin = {
  pay,
  push,
  version,
  permission,
  chooseFile,
  error,
  getDeviceId,
  /**
   * 全局单例插件加载器
   * 同一个 pluginId 只初始化一次，多次调用返回同一个插件实例
   */
  getNativePlugin,
  clearPluginCache,
  getCachedPluginSync,
}
