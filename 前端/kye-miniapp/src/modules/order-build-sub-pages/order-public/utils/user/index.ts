/**
 * @Desc: index
 * @Author: wu xingtao
 * @Date: 2024/11/20
 */
import { getToken } from '@order-public-sub-public/storage/user'
import { ENV_TYPE, getEnv } from '@tarojs/taro'

/* 状态是否登录 */
export const isLogined = () => {
  return getToken()
}

/* 获取用户信息授权，取得授权信息 */
export const getAuthCode = async () => {
  if (getEnv() === ENV_TYPE.ALIPAY) {
    return (await my) && my.getAuthCode()
  }
  return Promise.resolve({})
}
/* 获取用户信息授权，取得授权码（authCode） */
export const getAuthCodeValue = async () => {
  const data = await getAuthCode()
  return data?.authCode
}
