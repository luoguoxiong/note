import Taro, { useReady } from '@tarojs/taro'
import { ref } from 'vue'
import { getEnvConfig } from '../config'
import { isH5Env } from '../utils'

/** showTabBar 失败兜底重试延时（ms） */
const SHOW_TABBAR_RETRY_DELAY = 100

export const usePrivacePopup = () => {
  const { isApp } = getEnvConfig()
  const isAgree = ref(!!Taro.getStorageSync('IS_AGREE_PRIVACE') || isApp)

  useReady(() => {
    if (isAgree.value || isH5Env) return
    Taro.hideTabBar({
      fail: (err) => console.error('hideTabBar fail', err),
    })
  })

  const manualAgreeCallback = ref<(() => void) | null>(null)

  const agreePrivace = () => {
    isAgree.value = true
    Taro.showTabBar({
      fail: (err) => {
        console.error('showTabBar fail', err)
        // 避免异常情况导致下面 tabbar 出不来，兜底一层。
        setTimeout(() => Taro.showTabBar(), SHOW_TABBAR_RETRY_DELAY)
      },
    })
    Taro.setStorageSync('IS_AGREE_PRIVACE', true)
    if (manualAgreeCallback.value) {
      manualAgreeCallback.value()
      manualAgreeCallback.value = null
    }
  }

  const cancelAgree = () => {
    isAgree.value = true
    Taro.setStorageSync('IS_AGREE_PRIVACE', false)
    if (isH5Env) {
      return
    }
    Taro.exitMiniProgram({
      success: () => {
        Taro.setStorageSync('IS_AGREE_PRIVACE', false)
      },
    })
  }

  const waitForAgree = (onAlreadyAgreed: () => void, onPendingAgree: () => void) => {
    if (isAgree.value || isH5Env) {
      onAlreadyAgreed()
      manualAgreeCallback.value = null
      return
    }
    manualAgreeCallback.value = onAlreadyAgreed
    onPendingAgree()
  }

  return { isAgree, agreePrivace, cancelAgree, waitForAgree }
}
