import { TodoTabEnum, WaybillListRes } from '@/apis/home/types'
import type { UserInfo, RealNameAuthInfo } from '@/apis/user/types'
import type { MenuItem } from '@/stores/mock'
import type { HomeCacheData } from '@/stores/home'

interface StorageFactorySelfKey<T> {
  key: T // 键名
  selfKey: string | number // 自定义键
}

// 工厂模式创建localStorage或sessionStorage实例
class StorageFactory<S extends Record<string, unknown>> {
  private storage: Storage

  /**
   * 构造函数
   * @param storage 使用的存储，可以是 localStorage 或 sessionStorage
   */
  constructor(storage: Storage) {
    this.storage = storage
  }

  /**
   * 获取存储键
   * @param key 键名或包含键名和自定义键的对象
   * @returns 存储键
   */
  private getKey<T extends keyof S>(key: T | StorageFactorySelfKey<T>): string | undefined {
    if (typeof key === 'string') {
      return `st-${key.toString()}`
    }
    if (typeof key === 'object') {
      return `st-${key.key.toString()}-${key.selfKey}`
    }
  }

  /**
   * 存储数据
   * @param name 键名或包含键名和自定义键的对象
   * @param value 要存储的值
   * @param expirationTime 过期时间（可选）
   */
  save<T extends keyof S>(name: T | StorageFactorySelfKey<T>, value: S[T], expirationTime?: number): void {
    const key = this.getKey(name)
    if (key === void 0) {
      throw Error('save key is undefined')
    }
    // 动态键只保留一个：删除同前缀的其他缓存
    if (typeof name === 'object') {
      const prefix = `st-${name.key.toString()}-`
      const keysToRemove: string[] = []
      for (let i = 0; i < this.storage.length; i++) {
        const k = this.storage.key(i)
        if (k && k.startsWith(prefix) && k !== key) {
          keysToRemove.push(k)
        }
      }
      keysToRemove.forEach((k) => this.storage.removeItem(k))
    }
    const valueStr = {
      value,
      expirationTime: expirationTime ? new Date().getTime() + expirationTime : undefined,
    }
    this.storage.setItem(key, JSON.stringify(valueStr))
  }

  /**
   * 获取存储的数据
   * @param name 键名或包含键名和自定义键的对象
   * @returns 存储的值，如果不存在或已过期则返回 null
   */
  get<T extends keyof S>(name: T | StorageFactorySelfKey<T>): S[T] | null {
    const key = this.getKey(name)
    if (key === void 0) return null

    const storedItem = this.storage.getItem(key)

    if (storedItem === null) return null

    const parsedItem = JSON.parse(storedItem)

    if (!parsedItem.expirationTime || parsedItem.expirationTime > new Date().getTime()) {
      return parsedItem.value
    } else {
      this.storage.removeItem(key)
      return null
    }
  }

  /**
   * 移除存储的数据
   * @param name 键名
   */
  remove<K extends keyof S>(name: K): void {
    const key = this.getKey(name)
    if (key !== void 0) {
      this.storage.removeItem(key.toString())
    }
  }
}

type LocalStorageManagerIn = {
  token: string
  /** 首页数据缓存 */
  homeCache: HomeCacheData
  /** 轻应用数据缓存 [areaCode, MenuItem[]][]（按登录手机号+客户编码动态键，区分不同账号/角色） */
  lightAppCache$: [string, MenuItem[]][]
  /** 用户信息缓存（按手机号动态键，首屏秒显 + 后台刷新覆盖） */
  userInfo$: UserInfo & { realNameInfo?: RealNameAuthInfo | null }
}
/**
 * 规范:
 *
 * 动态键值，命名请采用$符号结尾，通过对象形式传参
 * LocalStorageManager.get({
 *    key: 'xxx$',
 *    selfKey: 1,
 * })
 *
 * 固定键值，通过字符串形式传参
 * LocalStorageManager.get('xxx')
 * */
export const LocalStorageManager = new StorageFactory<LocalStorageManagerIn>(window.localStorage)

type SessionStorageManagerIn = {
  token: string
  /**待办事项历史定位 */
  todoTab: TodoTabEnum
  /** 首页搜索运单数据缓存 */
  searchValue: WaybillListRes[]
  /** 点击埋点串连参数 */
  click_id: string
}
/**
 * 规范:
 *
 * 动态键值，命名请采用$符号结尾，通过对象形式传参
 * SessionStorageManager.get({
 *    key: 'xxx$',
 *    selfKey: 1,
 * })
 *
 * 固定键值，通过字符串形式传参
 * SessionStorageManager.get('xxx')
 * */
export const SessionStorageManager = new StorageFactory<SessionStorageManagerIn>(window.sessionStorage)
