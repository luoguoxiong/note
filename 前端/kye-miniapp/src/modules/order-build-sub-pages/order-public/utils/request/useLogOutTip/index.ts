import Taro from '@tarojs/taro'
import { ref } from 'vue'
import { openLoginPage, hasOpenedLoginPage } from '@order-public-sub-public/utils/request/useLogOutTip/openLogin'
import { handleLoginControl } from '@modules/user/pages/login/service'
import { getAuthCodeValue } from '@order-public-sub-public/utils'
import { debounce, resetApplicationInfoStorage } from '@order-public-sub-public/utils'
import { getToken, clearUserCache } from '@order-public-sub-public/storage'
import { fetchLogoutTip } from '@order-public-sub-public/apis/user'
import { LogoutTipDataResponse } from '@order-public-sub-public/apis/user/types'

export const useLogOutTip = () => {
  // 退登弹窗是否打开
  const isShowingLogoutModal = ref(false)
  /* 更新退登状态 */
  const setShowingLogoutModal = (value: boolean) => {
    isShowingLogoutModal.value = value
  }
  /* 移除退登弹窗状态 */
  const removeLogOutRecord = () => {
    setShowingLogoutModal(false)
  }
  /* 唤起退登弹窗 */
  const getLogoutModal = async (message) => {
    try {
      // 已打开退登弹窗忽略本次
      if (isShowingLogoutModal.value) {
        return
      }
      // 记录已打开
      setShowingLogoutModal(true)
      await Taro.showModal({
        title: '温馨提示',
        content: message || '用户信息已失效，请重新登录',
        confirmText: '去登录',
        showCancel: false,
        confirmColor: '#8365f6',
        success: function (res) {
          // 确认按钮
          if (res.confirm) {
            removeLogOutRecord()
            openLoginPage()
            // handleLogOut()
          }
        },
      })
    } catch (e) {
      console.log(e)
    }
  }

  const onLogoutTipApi = debounce(() => {
    return new Promise(async (resolve, reject) => {
      Taro.hideLoading()
      const paramsToken = getToken()
      const params = {
        token: paramsToken,
        wxCode: await getAuthCodeValue(),
      }
      fetchLogoutTip(params)
        .then((res) => {
          resolve(res)
          // 当前无token(未清空token前 - 手动退登场景)
          if (!getToken()) {
            return
          }
          clearUserCache()
          const tokenCurrent = getToken()
          // 当前查询token错误原因且与缓存token不一致,忽略本次查询
          if (tokenCurrent && tokenCurrent !== paramsToken) {
            return
          }
          // 已存在登录页，忽略本次
          if (hasOpenedLoginPage()) {
            return
          }

          const { tips, type } = (res?.data || {}) as LogoutTipDataResponse
          if (tips) {
            // IC_0005 用户触发自动登录
            if (type === 'IC_0005') {
              removeLogOutRecord()
              // 自动登录前 - 清除轻应用信息，轻应用现存在角标写入轻应用缓存异常问题
              handleLoginControl({ force: true })
              resetApplicationInfoStorage()
            } else if (type === 'IC_0003') {
              // IC_0003:App端绑定微信
              removeLogOutRecord()
            } else {
              // 未打开登录页打开退登弹窗
              if (!hasOpenedLoginPage()) {
                getLogoutModal(tips)
              }
            }
          } else {
            openLoginPage()
            removeLogOutRecord()
          }
        })
        .catch((err) => {
          reject(err)
          openLoginPage()
        })
    })
  }, 200)

  return {
    isShowingLogoutModal,
    setShowingLogoutModal,
    getLogoutModal,
    onLogoutTipApi,
  }
}
