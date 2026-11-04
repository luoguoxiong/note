import { http } from '@public/utils/request'
import { getToken } from '@public/storage/user'
import { loginFromType } from '@public/constants'
import { BuriedPointUserInfo } from '@public/apis/aplus/type'

/* 获取埋点用户基本信息(新) */
export const getBuriedPointUserInfo = (param = {}) => {
  const accessToken = getToken()
  return http<BuriedPointUserInfo>(
    'web.ssoUser.getBuriedPointUserInfo',
    { accessToken, type: loginFromType, ...param },
    { hideToast: true },
  )
}
