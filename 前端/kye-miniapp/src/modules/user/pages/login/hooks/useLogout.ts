import Taro from '@tarojs/taro'
import { fetchLoginOut } from '@modules/user/apis/login'
import { HttpCode } from '@public/utils/request/constants'
import { getApplicationListAll } from '@modules/user/pages/login/service'
import aPlus from '@public/utils/aplusConfig'
// import { report_clk_home_login_button } from '@modules/user/report/logout'
import { clearUserCache } from '@public/storage'
import { appPushLogoutOff } from '@public/utils/appPush'
import { socket } from '@/public/socket'

/* 退出登录 */
export const onUserLogout = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await fetchLoginOut({}).catch((e) => {
        console.log('fetchLoginOut error', e)
        throw e
      })
      clearUserCache()
      // 重新拉取轻应用列表
      getApplicationListAll()
      aPlus.setNologgedIn()
      // socket.close()
      resolve(res?.data)
    } catch (err) {
      clearUserCache()
      if (err?.code === HttpCode.EXPIRED || err?.code === 15793 || err?.code === HttpCode.EMPTY) {
        getApplicationListAll()
        resolve(true)
        return
      } else {
        reject(err)
      }
      reject(err)
    }
  })
}

// /* 清空用户缓存 */
// export const clearUserCache = () => {
//   console.log('clearUserCache >> 清空用户缓存')
//   removeStorageSync('TOKEN')
//   removeStorageSync('openId')
//   removeStorageSync('USER_INFO')
// }

export const logOutToast = () => {
  Taro.showToast({ title: '退登成功', icon: 'none' })
}

/* 退出登录模态框
 * 入口: 我的
 * */
export const onLogOutModal = (
  next: (_result: { confirm?: boolean }) => void,
  failCall?: (_err: { errMsg?: string }) => void,
) => {
  Taro.showModal({
    title: '温馨提示',
    content: '您确定要退出登录吗？',
    cancelColor: '#03050D',
    confirmText: '退出',
    confirmColor: '#8365F6',
    success: async function (res) {
      if (res.confirm) {
        Taro.showLoading({ mask: true, title: '加载中...' })
        await onUserLogout()
          .catch(() => {
            // 忽略接口报错
          })
          .finally(() => {
            Taro.hideLoading()
          })
        logOutToast()
        // 退登-取消极光订阅
        appPushLogoutOff()
        next && next(res)
      }
    },
    fail: function (err) {
      failCall && failCall(err)
    },
  })
}
