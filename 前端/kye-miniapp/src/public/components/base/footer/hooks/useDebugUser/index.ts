/**
 * @Desc: useDebugUser
 * @Date: 2025/11/4
 */
import { loginSuccess } from '@modules/user/pages/login/service'
import { isH5Env } from '@public/utils'
import userInfoLocalH5 from './userInfoLocalH5'

let userInfoLocal: Record<string, any> | undefined

if (process.env.NODE_ENV === 'development') {
  // 仅开发环境引入
  userInfoLocal = userInfoLocalH5
}

const useDebugUser = () => {
  const setDebugUserInfo = () => {
    loginSuccess({ ...userInfoLocal })
  }
  const showDebugUser = () => {
    return isH5Env && process.env.NODE_ENV === 'development'
  }
  return {
    setDebugUserInfo,
    showDebugUser,
  }
}

export default useDebugUser
