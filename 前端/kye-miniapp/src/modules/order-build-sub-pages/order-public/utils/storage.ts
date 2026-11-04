import Taro from '@tarojs/taro'
type StorageType = 'local' | 'session'
const isWeb = () => process.env.TARO_ENV === 'h5'
/**
 * 基于 Taro 的跨端存储工具
 */
/**
 * TaroStorage 是一个封装了本地存储和会话存储的工具类
 * 实现了单例模式，提供统一的 API 访问不同环境（H5/小程序）的存储功能
 *
 * 功能包括：
 * - 设置存储项(setItem)
 * - 获取存储项(getItem)
 * - 移除存储项(removeItem)
 * - 清空存储(clear)
 *
 * 自动处理不同环境的适配：
 * - H5 环境下使用浏览器原生 localStorage/sessionStorage
 * - 小程序环境下使用 Taro 的存储 API
 *
 * 所有操作都会自动进行 JSON 序列化/反序列化
 */
class TaroStorage {
  private static instance: TaroStorage
  private storageAdapter: {
    local: Taro.Storage
    session: Taro.Storage
  }

  private constructor() {
    this.initAdapter()
  }

  /**
   * 获取存储实例
   */
  public static getInstance(): TaroStorage {
    if (!TaroStorage.instance) {
      TaroStorage.instance = new TaroStorage()
    }
    return TaroStorage.instance
  }

  private initAdapter(): void {
    this.storageAdapter = {
      local: isWeb() ? window.localStorage : Taro,
      session: isWeb()
        ? window.sessionStorage
        : {
            setItem: (key: string, value: any) => this.setSession(key, value),
            getItem: (key: string) => this.getSession(key),
            removeItem: (key: string) => this.removeSession(key),
            clear: () => this.clearSession(),
          },
    }
  }

  // H5 环境直接使用浏览器 API
  // 小程序环境使用 Taro API
  private setSession(key: string, value: any): void {
    if (isWeb()) return
    Taro.setStorageSync(key, value)
  }

  private getSession(key: string): any {
    if (isWeb()) return null
    try {
      return Taro.getStorageSync(key)
    } catch (e) {
      console.error('getSession error:', e)
      return null
    }
  }

  private removeSession(key: string): void {
    if (isWeb()) return
    Taro.removeStorageSync(key)
  }

  private clearSession(): void {
    if (isWeb()) return
    try {
      const { keys } = Taro.getStorageInfoSync()
      keys.forEach((key) => Taro.removeStorageSync(key))
    } catch (e) {
      console.error('clearSession error:', e)
    }
  }

  /**
   * 设置存储值
   * @param type 存储类型
   * @param key 键名
   * @param value 值
   */
  public setItem<T>(type: StorageType, key: string, value: T): void {
    try {
      const storage = this.storageAdapter[type]
      let data: string | T = value
      if (typeof value !== 'string') {
        data = JSON.stringify(value)
      }

      if (isWeb()) {
        storage.setItem(key, data)
      } else {
        if (type === 'local') {
          Taro.setStorageSync(key, data)
        } else {
          this.setSession(key, data)
        }
      }
    } catch (e) {
      console.error(`[TaroStorage] setItem error:`, e)
    }
  }

  /**
   * 获取存储值
   * @param type 存储类型
   * @param key 键名
   * @returns 存储的值或 null
   */
  public getItem<T>(type: StorageType, key: string): T | null {
    try {
      const storage = this.storageAdapter[type]
      let value: string | null = null
      if (isWeb()) {
        value = storage.getItem(key)
      } else {
        if (type === 'local') {
          value = Taro.getStorageSync(key)
        } else {
          value = this.getSession(key)
        }
      }

      if (typeof value === 'string') {
        return value
      }

      return value ? JSON.parse(value) : null
    } catch (e) {
      console.error(`[TaroStorage] getItem error:`, e)
      return null
    }
  }

  /**
   * 移除存储项
   * @param type 存储类型
   * @param key 键名
   */
  public removeItem(type: StorageType, key: string): void {
    try {
      const storage = this.storageAdapter[type]

      if (isWeb()) {
        storage.removeItem(key)
      } else {
        if (type === 'local') {
          Taro.removeStorageSync(key)
        } else {
          this.removeSession(key)
        }
      }
    } catch (e) {
      console.error(`[TaroStorage] removeItem error:`, e)
    }
  }

  /**
   * 清空存储
   * @param type 存储类型
   */
  public clear(type: StorageType): void {
    try {
      const storage = this.storageAdapter[type]

      if (isWeb()) {
        storage.clear()
      } else {
        if (type === 'local') {
          Taro.clearStorageSync()
        } else {
          this.clearSession()
        }
      }
    } catch (e) {
      console.error(`[TaroStorage] clear error:`, e)
    }
  }
}

// 导出单例实例
export const storage = TaroStorage.getInstance()

// 快捷方法
export const localStorage = {
  setItem: <T = any>(key: string, value: T) => storage.setItem('local', key, value),
  getItem: <T = any>(key: string) => storage.getItem<T>('local', key),
  removeItem: (key: string) => storage.removeItem('local', key),
  clear: () => storage.clear('local'),
}

export const sessionStorage = {
  setItem: <T = any>(key: string, value: T) => storage.setItem('session', key, value),
  getItem: <T = any>(key: string) => storage.getItem<T>('session', key),
  removeItem: (key: string) => storage.removeItem('session', key),
  clear: () => storage.clear('session'),
}
