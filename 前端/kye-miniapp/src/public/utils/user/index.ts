/**
 * @Desc: index
 * @Author: wu xingtao
 * @Date: 2024/11/20
 */
import { getToken } from '@public/storage/user'
import { isAliMiniApp, isAmapMiniApp, isH5Env, isWxMiniApp } from '../device'
import Taro from '@tarojs/taro'
import { getEnvConfig } from '@public/config'
import { promisify } from '../taroApiPromises'
import { getAmapAuthCode } from './getAmapAuthCode'

/* 状态是否登录 */
export const isLogined = () => {
  return getToken()
}

export const weixinAppLoginAsync = async () => {
  return promisify(wx.miniapp.login)({}) as unknown as Promise<{ code: string; errCode: number }>
}

type GetAuthCode = {
  (_options?: { needWxAppAuth: boolean }): Promise<string>
  code?: string
}

/**
 * 获取用户信息授权，取得授权信息
 * @param options
 * @param options.needWxAppAuth 是否需要app登录-微信授权
 */
export const getAuthCode: GetAuthCode = async (options = { needWxAppAuth: false }) => {
  const { isApp } = getEnvConfig()
  let result = ''
  if (options?.needWxAppAuth && isApp) {
    let res = await weixinAppLoginAsync().catch((e) => {
      console.error('getAuthCode weixinAppLoginAsync error', e)
      throw e
    })
    console.info('😁 weixinAppLoginAsync res', res)
    if (res.errCode || !res.code) throw { code: 10, msg: '微信登录失败' }
    getAuthCode.code = res.code
    result = res.code!
  } else if (isApp) {
    return getAuthCode.code || 'nobody'
  } else if (isAmapMiniApp) {
    const res = await getAmapAuthCode()
    result = res.authCode
  } else if (isAliMiniApp) {
    // eslint-disable-next-line no-undef
    const res = await my.getAuthCode()
    result = res.authCode
  } else {
    if (!isH5Env) {
      let res = await Taro.login()
      if (+res.errCode) throw { code: 10, msg: '微信登录失败' }
      result = res.code
    } else {
      result = 'nobody'
    }
  }

  return result
}

export const setSaaAUserId = (userId: string) => {
  if (isWxMiniApp && wx && wx.miniapp) {
    wx.miniapp.setSaaAUserId({ userId: userId || '' })
    console.info('SaaA User ID', userId)
  }
}
