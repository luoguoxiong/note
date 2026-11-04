import { getInfo } from '@order-public-sub-public/apis/index'
import { getQueryObject } from '@order-public-sub-public/utils'
import { getToken as getTokenFromNative } from '@order-public-sub-public/utils/native'
import { isWxApplet, isWxPcApplet } from './device'
// import apm from './apm-sdk'
// import md5 from 'js-md5'
import { PlainObject } from '@order-public-sub-public/types'
import { sessionStorage } from './storage'
import Taro from '@tarojs/taro'

let tokenFromNative = ''
// 清空原生获取的token
const removeTokenFromNative = () => {
  tokenFromNative = ''
}
// 从原生获取token作fallback备用
const initTokenFromNative = () => {
  getTokenFromNative()
    .then((token: string | undefined) => {
      if (token) {
        tokenFromNative = token
        console.log('tokenFromNative: ', tokenFromNative)
      }
    })
    .catch(() => {
      // 注：过滤移动端和PC端微信小程序获取token异常，因为小程序方法返回的是reject（路径：src/native）getToken方法
      if (!isWxApplet || !isWxPcApplet) {
        // const phone = _getUserPhone()
        // 自定义上报到apm
        // const reportObj = {
        //   userId: md5(`${phone}netc`),
        //   url: window.location.href,
        //   tokenFromNative,
        //   error,
        // }
        // apm && apm.reportError(new Error(JSON.stringify(reportObj)))
      }
    })
}

const getTokens = () => {
  const tokenFromSession = sessionStorage.getItem('token')
  let tokenFromQuery = ''
  if (!tokenFromSession) {
    tokenFromQuery = getQueryObject().token
  }
  return {
    tokenFromSession,
    tokenFromQuery,
    tokenFromNative,
  }
}

// const _getUserPhone = () => {
//   const userInfo = sessionStorage.getItem('userInfo')
//   const phone = userInfo ? JSON.parse(userInfo).phone : '手机号缺失'
//   return phone
// }

/**
 * 尝试获取可用token
 * 'A8339ADD-0DEE-44DB-84EF-33F394AEB380_74334' ||
 * @returns {String} token
 */
const _getToken = async () => {
  const appToken = Taro.getStorageSync('TOKEN') || ''
  const { tokenFromSession, tokenFromQuery, tokenFromNative } = getTokens()
  const tokenCanUse =
    appToken || tokenFromSession || tokenFromQuery || tokenFromNative || '8F0C76A5-22F1-4256-9864-DAB7EAAB5410_93447' // 降级获取可用token

  // 如果依然没有可用token，再尝试从原生取一次token
  if (!tokenCanUse) {
    try {
      // 尝试从原生再次读取token
      const tokenRetry = await getTokenFromNative()
      return tokenRetry
    } catch (error) {
      return ''
    }
  }

  return tokenCanUse
}

export const getToken = _getToken

export const setToken = (token = '') => {
  sessionStorage?.setItem('token', token)
  initTokenFromNative()
}

export const removeToken = () => {
  sessionStorage.removeItem('token')
  removeTokenFromNative()
}

class Auth {
  /**
   * 初始化用户信息，不需要调用 getUserInfoByPhone 接口的 url pathname
   */
  // whiteListPathname = ['single-order', 'batch-order']

  /**
   * 初始化用户信息
   * @param token
   * @returns {Promise<void>}
   */
  // TODO 优化
  async initUserInfo(token: string) {
    this.setToken(token)
    console.log(location)
    // 注：不知道做啥的，先注释，正常后续逻辑
    // let str = location.hash.split('#/')[1]
    // str = str.split('?')[0]
    // if (this.whiteListPathname.includes(str)) return {}

    const { data } = await getInfo()
    const { customCode } = data
    const userInfo = Object.assign({}, data, { customerCode: customCode })
    this.setUserInfo(userInfo)
    return userInfo
  }

  /**
   * 是否登录
   * @returns {boolean}
   */
  loggedIn() {
    return !!this.getToken()
  }

  getToken() {
    return _getToken()
  }

  setToken(token = '') {
    sessionStorage?.setItem('token', token)
    initTokenFromNative()
  }

  removeToken() {
    sessionStorage.removeItem('token')
    removeTokenFromNative()
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
      sessionStorage?.setItem('userInfo', JSON.stringify(data))
    }
  }

  removeUserInfo() {
    sessionStorage.removeItem('userInfo')
  }
}

export default new Auth()

export type { Auth }
