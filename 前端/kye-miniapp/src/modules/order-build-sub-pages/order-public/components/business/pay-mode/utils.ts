import { isAliPayClient } from '@order-public-sub-public/utils/device'

export const restoreLayout = () => {
  if (!isAliPayClient) {
    return
  }
  if (window.visualViewport?.height === window.innerHeight) {
    window.scrollTo(0, 0) // 强制复位页面
  }
}

export const adjustLayoutForKeyboard = () => {
  window.scrollTo(0, 240)
}
