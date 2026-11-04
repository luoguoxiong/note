import { getInfo, getCustomerCodeBindInfo, checkRealNameAuth } from '@/apis/user'
import { LocalStorageManager } from '@/utils/storageManager'

/**
 * 获取 token
 */
export function getToken(): string | null {
  return LocalStorageManager.get('token')
}

/**
 * 获取用户信息
 */
export async function getUserData(): Promise<Record<string, any> | null> {
  try {
    const res = await getInfo()
    if (res.code === 0 && res.data) {
      return res.data
    }
    return null
  } catch (error) {
    console.error('iframeBridge getUserData error:', error)
    return null
  }
}

/**
 * 获取客户编码列表
 */
export async function getCustomerList(): Promise<any[]> {
  try {
    const res = await getCustomerCodeBindInfo()
    if (res.code === 0 && res.data) {
      return res.data.customers || []
    }
    return []
  } catch (error) {
    console.error('iframeBridge getCustomerList error:', error)
    return []
  }
}

/**
 * 获取实名信息
 */
export async function getRealName(): Promise<Record<string, any> | null> {
  try {
    const res = await checkRealNameAuth()
    if (res.code === 0 && res.data) {
      return res.data
    }
    return null
  } catch (error) {
    console.error('iframeBridge getRealName error:', error)
    return null
  }
}
