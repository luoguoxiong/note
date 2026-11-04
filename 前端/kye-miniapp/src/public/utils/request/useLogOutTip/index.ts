import Taro from '@tarojs/taro'
import { ref } from 'vue'
import { openLoginPage, isOpenedLoginPage } from '@public/utils/request/useLogOutTip/openLogin'
import { handleLoginControl } from '@modules/user/pages/login/service'
import { getAuthCode, isAmapMiniApp } from '@public/utils'
import { debounce } from '@public/utils'
import { fetchLogoutTip } from '@public/apis/user'
import { LogoutTipDataResponse } from '@public/apis/user/types'
import { socket } from '@/public/socket'

const logoutPromise = ref<Promise<any> | null>(null)
let resolveFn: ((v: any) => void) | null = null
let rejectFn: ((err: any) => void) | null = null

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
  const getLogoutModal = async (message?: string) => {
    try {
      // 已打开退登弹窗忽略本次
      if (isShowingLogoutModal.value) {
        return
      }
      removeLogOutRecord()
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
          if (res.confirm || isAmapMiniApp) {
            removeLogOutRecord()
            openLoginPage()
          }
        },
      })
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 退登原因核心接口逻辑
   */
  const runLogoutApi = async (options: any) => {
    try {
      Taro.hideLoading()
      const params = {
        token: options?.oldToken,
        wxCode: await getAuthCode(),
        method: options?.method,
      }
      const res = await fetchLogoutTip(params)

      // socket.close()

      // 必定 resolve
      resolveFn?.(res)
      // 场景: 已打开登录页
      if (isOpenedLoginPage()) {
        return res
      }

      const { tips, type } = (res?.data || {}) as LogoutTipDataResponse
      removeLogOutRecord()
      if (tips) {
        // IC_0005 用户触发自动登录
        if (type === 'IC_0005') {
          // 自动登录前 - 清除轻应用信息，轻应用现存在角标写入轻应用缓存异常问题
          handleLoginControl({ force: true })
        } else {
          // 未打开登录页打开退登弹窗
          if (!isOpenedLoginPage()) {
            getLogoutModal(tips)
          }
        }
      } else {
        // 无原因-跳转登录页
        openLoginPage()
      }

      return res
    } catch (err) {
      rejectFn?.(err)
      openLoginPage()
      throw err
    } finally {
      // 核心逻辑结束后再释放 promise
      logoutPromise.value = null
      resolveFn = null
      rejectFn = null
    }
  }

  const debounceRun = debounce((options) => {
    runLogoutApi(options)
  }, 200)

  /**
   * 退登原因查询单例 Promise API
   */
  const onLogoutTipApi = (options: { method?: string; from?: string; oldToken: string }) => {
    // 已存在，直接返回
    if (logoutPromise.value) return logoutPromise.value

    // 创建真正的 promise，并立即启动 runLogoutApi
    logoutPromise.value = new Promise((resolve, reject) => {
      resolveFn = resolve
      rejectFn = reject
      debounceRun(options)
    })

    return logoutPromise.value
  }

  return {
    isShowingLogoutModal,
    setShowingLogoutModal,
    getLogoutModal,
    onLogoutTipApi,
  }
}
