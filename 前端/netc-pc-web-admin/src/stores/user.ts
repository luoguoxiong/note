import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getInfo, checkRealNameAuth } from '@/apis/user'
import type { UserInfo, RealNameAuthInfo } from '@/apis/user/types'
import { LocalStorageManager } from '@/utils/storageManager'
import { getToken } from '@/utils/auth'
import { setCustomerCode, setCustomerData } from '@/stores/pc-web/deps/storage'

interface UserStoreState extends UserInfo {
  realNameInfo?: RealNameAuthInfo | null
}

/** 用户信息缓存有效期：1 天，过期后走正常请求路径 */
const USER_CACHE_EXPIRATION = 24 * 60 * 60 * 1000

export const useUserStore = defineStore('user', () => {
  const user = ref<UserStoreState | null>(null)
  const isInitialized = ref(false)
  const initPromise = ref<Promise<void> | null>(null)

  const currentCustomerCode = computed(() => {
    return user.value?.customCode || ''
  })

  const isRealNameAuth = computed(() => {
    return user.value?.realNameInfo?.isRealName || false
  })

  /**
   * 从 localStorage 读取用户信息缓存（首屏秒显）：
   * 按手机号作动态键（登录账号稳定且天然区分用户，token 每次登录都变会导致缓存永不命中），
   * 手机号从老基座 session 键 LOGIN_DATA 取，load 时先读 LOGIN_DATA 再取缓存
   */
  function loadCache(): boolean {
    try {
      const phone = JSON.parse(sessionStorage.getItem('LOGIN_DATA') || '{}')?.phone
      if (!phone) return false
      const cached = LocalStorageManager.get({ key: 'userInfo$', selfKey: phone })
      if (!cached) return false
      user.value = cached
      isInitialized.value = true
      return true
    } catch {
      // 缓存解析失败则忽略，走正常请求路径
      return false
    }
  }

  function saveCache() {
    try {
      const userInfo = user.value
      const phone = userInfo?.phone
      if (!phone || !userInfo) return
      LocalStorageManager.save({ key: 'userInfo$', selfKey: phone }, userInfo, USER_CACHE_EXPIRATION)
    } catch {
      // 缓存写入失败则忽略
    }
  }

  async function init(): Promise<UserStoreState | null> {
    if (isInitialized.value) return user.value
    if (initPromise.value) {
      await initPromise.value
      return user.value
    }

    // 缓存秒显（stale-while-revalidate）：有缓存立即返回，后台静默刷新覆盖（失败保留旧数据）
    if (getToken() && sessionStorage.getItem('homeReadyToken') === getToken() && loadCache()) {
      getUserInfo(true).catch(() => undefined)
      return user.value
    }

    initPromise.value = getUserInfo(false)
    await initPromise.value
    return user.value
  }

  async function getUserInfo(refresh = false) {
    if (!refresh && user.value) {
      return
    }

    if (!refresh && initPromise.value) {
      await initPromise.value
      return
    }

    const requestToken = getToken()
    const promise = (async () => {
      try {
        const [userRes, realNameRes] = await Promise.all([getInfo(), checkRealNameAuth()])
        if (requestToken !== getToken()) return

        if (userRes.code === 0 && userRes.data) {
          const realNameInfo = realNameRes.code === 0 && realNameRes.data ? realNameRes.data : undefined
          const info = userRes.data
          try {
            const loginData = JSON.parse(sessionStorage.getItem('LOGIN_DATA') || '{}')
            sessionStorage.setItem('LOGIN_DATA', JSON.stringify({ ...loginData, phone: info.phone }))
          } catch {
            sessionStorage.setItem('LOGIN_DATA', JSON.stringify({ phone: info.phone }))
          }
          user.value = {
            ...info,
            realNameInfo,
          }
          // 同步旧基座 session 键: CUSTOMER_DATA(customerInfo) + CUSTOMER_CODE(customCode)
          if (info.customerInfo) {
            setCustomerData(info.customerInfo)
          }
          setCustomerCode(info.customCode || '')
          // 接口成功后写入缓存，供下次首屏秒显
          saveCache()
        }
      } catch (error) {
        console.error('UserStore init failed:', error)
      } finally {
        if (requestToken === getToken()) {
          isInitialized.value = true
          initPromise.value = null
        }
      }
    })()

    initPromise.value = promise
    await promise
  }

  async function updateUserInfo() {
    await getUserInfo(true)
  }

  function reset() {
    user.value = null
    isInitialized.value = false
    initPromise.value = null
  }

  return {
    user,
    isInitialized,
    currentCustomerCode,
    isRealNameAuth,
    init,
    getUserInfo,
    updateUserInfo,
    reset,
  }
})
