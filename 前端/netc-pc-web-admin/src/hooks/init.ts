/**
 * @Desc: init
 * @Author: wu xingtao
 * @Date: 2024/4/30
 */
import { UserInfo } from '@/apis/user/type'
import { usePcWebRootStore } from '@/stores/pc-web/root'
import { pinia } from '@/stores'
import { Any } from '@/types'
import apm from '@/utils/apm-sdk'
import auth from '@/utils/auth'

interface AppInitData {
  userInfo?: UserInfo
}

/**
 * 初始化页面配置
 * @param data
 */
export const appInitPage = async (data: AppInitData = {}) => {
  const { userInfo } = data
  if (userInfo) {
    initUserInfo(userInfo)
  } else {
    // 未获取到用户信息，手动拉取
    const userInfoAsync = await auth.getUserInfoApi()
    initUserInfo(userInfoAsync as Any)
  }
}

/**
 * 初始化写入userInfo
 * @param userInfo
 */
export const initUserInfo = (userInfo: UserInfo) => {
  if (userInfo) {
    // 保存userInfo用户数据(旧 SET_USER_INFO, Pinia 版同步写 sessionStorage)
    // 显式传 pinia：此处位于 await 之后的异步续体（无组件上下文），避免微前端环境下 activePinia 被子应用覆盖
    usePcWebRootStore(pinia).updateUserInfo(userInfo)
    // 实例化apm用户id
    apm.setUserId(userInfo.phone)
  }
}
