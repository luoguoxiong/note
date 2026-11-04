import { UserInfo } from '@/apis/user/types'
import { PlainObject } from '@/types'
import { getQueryObject } from '@/utils'
import { useUserStore } from '@/stores/user'

export const getToken = () => {
  const tokenFromQuery = getQueryObject().token
  if (tokenFromQuery) {
    setToken(tokenFromQuery)
    return tokenFromQuery
  } else {
    const tokenFromSession1 = window.sessionStorage.getItem('Token')
    const tokenFromSession2 = window.sessionStorage.getItem('token')
    const tokenFromSession3 = window.sessionStorage.getItem('TOKEN')
    return tokenFromSession1 || tokenFromSession2 || tokenFromSession3 || tokenFromQuery || ''
  }
}

export const setToken = (token = '') => {
  window.sessionStorage.setItem('Token', token)
  window.sessionStorage.setItem('token', token)
  window.sessionStorage.setItem('TOKEN', token)
}

export const removeToken = () => {
  sessionStorage.removeItem('Token')
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('TOKEN')
}

/**
 * 从 URL（search 或 hash query）同步 token 到 sessionStorage，并清除地址栏中的 token 字段
 */
export const syncTokenFromUrl = () => {
  const { origin, pathname, search, hash } = window.location
  const searchParams = new URLSearchParams(search)
  const hashQueryIndex = hash.indexOf('?')
  const hashPath = hashQueryIndex > -1 ? hash.slice(0, hashQueryIndex) : hash
  const hashParams = hashQueryIndex > -1 ? new URLSearchParams(hash.slice(hashQueryIndex + 1)) : new URLSearchParams()

  const token = searchParams.get('token') || hashParams.get('token') || ''
  if (!token) return

  setToken(token)

  /* 清除地址栏中的 token 字段（replaceState 不触发刷新/跳转） */
  searchParams.delete('token')
  hashParams.delete('token')
  const newSearch = searchParams.toString() ? `?${searchParams.toString()}` : ''
  const newHashQuery = hashParams.toString() ? `?${hashParams.toString()}` : ''
  window.history.replaceState(null, '', `${origin}${pathname}${newSearch}${hashPath}${newHashQuery}`)
}

class Auth {
  /* 从Pinia store获取用户信息 */
  async getUserInfoApi(): Promise<UserInfo> {
    const userStore = useUserStore()
    const userInfo = (await userStore.init()) || ({} as unknown as UserInfo)
    const { customCode } = userInfo
    const userInfoWithCode = Object.assign({}, userInfo, { customerCode: customCode })
    this.setUserInfo(userInfoWithCode)
    return userInfoWithCode
  }

  /**
   * 是否登录
   * @returns {boolean}
   */
  loggedIn() {
    return !!this.getToken()
  }

  getToken() {
    return getToken()
  }

  setToken(token = '') {
    setToken(token)
  }

  removeToken() {
    removeToken()
  }

  /**
   * 获取用户信息
   * @returns {null|any}
   */
  getUserInfo() {
    const data = sessionStorage.getItem('userInfo')
    if (data) {
      return JSON.parse(data)
    } else {
      return null
    }
  }

  setUserInfo(data: PlainObject) {
    if (data) {
      sessionStorage.setItem('userInfo', JSON.stringify(data))
    }
  }

  removeUserInfo() {
    sessionStorage.removeItem('userInfo')
  }
}

export default new Auth()

export type { Auth }
