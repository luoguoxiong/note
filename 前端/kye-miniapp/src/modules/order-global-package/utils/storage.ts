/**
 * 本地存储封装（从 @order-public/utils/storage 迁移）
 * 统一使用 Taro API，兼容多端
 */
import Taro from '@tarojs/taro'

export const localStorage = {
  getItem(key: string): string | null {
    try {
      return Taro.getStorageSync(key)
    } catch {
      return null
    }
  },
  setItem(key: string, value: string): void {
    try {
      Taro.setStorageSync(key, value)
    } catch (e) {
      console.warn('[storage] setItem error:', e)
    }
  },
  removeItem(key: string): void {
    try {
      Taro.removeStorageSync(key)
    } catch (e) {
      console.warn('[storage] removeItem error:', e)
    }
  },
}
