/**
 * 全局原生插件单例加载器
 *
 * 功能：
 * 1. 按 pluginId 缓存已加载的插件实例，只初始化一次
 * 2. 处理并发请求，相同 pluginId 同时多次调用共享同一个加载 Promise
 * 3. 多次调用 getNativePlugin 指向同一个插件实例
 */

interface PluginCacheItem {
  instance: any
  loadingPromise: Promise<any> | null
}

// 全局插件缓存 Map：key = pluginId, value = 缓存项
const pluginCache = new Map<string, PluginCacheItem>()

/**
 * 获取原生插件实例（全局单例）
 *
 * 同一个 pluginId 只会调用 wx.miniapp.loadNativePlugin 一次，
 * 后续调用直接返回缓存的插件实例。
 *
 * @param pluginId 插件 ID
 * @param debugLabel 可选的调试标签，用于日志输出
 * @returns Promise<插件实例>
 */
export function getNativePlugin(pluginId: string, debugLabel?: string): Promise<any> {
  const cacheKey = pluginId

  // 1. 已有实例，直接返回
  const cached = pluginCache.get(cacheKey)
  if (cached?.instance) {
    return Promise.resolve(cached.instance)
  }

  // 2. 正在加载中，复用同一个 Promise
  if (cached?.loadingPromise) {
    return cached.loadingPromise
  }

  // 3. 首次加载，创建新的加载 Promise
  if (debugLabel) {
    console.log(`【app插件】${debugLabel} 开始加载`)
  }

  const loadingPromise = new Promise<any>((resolve, reject) => {
    if (!wx?.miniapp?.loadNativePlugin) {
      reject(new Error('wx.miniapp.loadNativePlugin is not available'))
      return
    }

    wx.miniapp.loadNativePlugin({
      pluginId,
      success(plugin: any) {
        // 更新缓存：保存实例，清除 loadingPromise
        pluginCache.set(cacheKey, {
          instance: plugin,
          loadingPromise: null,
        })
        if (debugLabel) {
          console.log(`【app插件】${debugLabel} 加载完成`)
        }
        resolve(plugin)
      },
      fail(err: any) {
        // 加载失败，清除 loadingPromise，下次可以重试
        const current = pluginCache.get(cacheKey)
        if (current) {
          current.loadingPromise = null
        }
        if (debugLabel) {
          console.error(`【app插件】${debugLabel} 加载失败:`, err)
        }
        reject(err)
      },
    })
  })

  // 存入缓存
  pluginCache.set(cacheKey, {
    instance: null,
    loadingPromise,
  })

  return loadingPromise
}

/**
 * 清除指定插件的缓存（慎用，一般不需要）
 * 当插件需要重新加载时使用
 */
export function clearPluginCache(pluginId?: string): void {
  if (pluginId) {
    pluginCache.delete(pluginId)
    console.log(`【app插件】已清除插件缓存: ${pluginId}`)
  } else {
    pluginCache.clear()
    console.log('【app插件】已清除全部插件缓存')
  }
}

/**
 * 同步获取已缓存的插件实例（如果还未加载则返回 null）
 */
export function getCachedPluginSync(pluginId: string): any {
  return pluginCache.get(pluginId)?.instance ?? null
}
