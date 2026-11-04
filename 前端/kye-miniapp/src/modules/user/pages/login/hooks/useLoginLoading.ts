import { ref } from 'vue'
import Taro from '@tarojs/taro'
import { Any } from '@public/utils/types'
import { TIME_OUT } from '@public/utils/request/constants'
import { checkNetworkTypeToast } from '@public/utils'

// 登录按钮loading
const loginLoading = ref(false)

export default function useLoginLoading() {
  // 登录页loading timeout
  const loginLoadingTimeout = ref<Any>(null)
  /* 设置登录loading */
  const setLoginLoading = (value: boolean) => {
    loginLoading.value = value
  }
  /* 清空loading */
  const clearLoginLoading = () => {
    setLoginLoading(false)
    Taro.hideLoading()
    clearLoginLoadingTimeout()
  }

  const setLoginLoadingTimeout = () => {
    loginLoadingTimeout.value = setTimeout(async () => {
      // 进入倒计时自动关闭，没有走到下一步登录逻辑
      // Taro.hideLoading()
      setLoginLoading(false)
      clearLoginLoadingTimeout()
      try {
        // 重新检测弱网
        await checkNetworkTypeToast()
      } catch (e) {
        console.log(e)
      }
      // Taro.showToast({ title: RESPONSE_ERRORS?.ETIMEDOUT, icon: 'none' })
    }, TIME_OUT || 10000)
  }
  /* 开始loading + loading timeout*/
  const startLoginLoading = () => {
    setLoginLoading(true)
    setLoginLoadingTimeout()
  }
  /* 清空timeout */
  const clearLoginLoadingTimeout = () => {
    if (loginLoadingTimeout.value) {
      clearTimeout(loginLoadingTimeout.value)
    }
  }
  return {
    loginLoadingTimeout,
    loginLoading,
    setLoginLoadingTimeout,
    clearLoginLoadingTimeout,
    startLoginLoading,
    setLoginLoading,
    clearLoginLoading,
  }
}
