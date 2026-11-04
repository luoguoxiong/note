import Taro from '@tarojs/taro'
import { ref } from 'vue'

let storageHeight = Number(Taro.getStorageSync('keyboardHeight'))

const keyboardHeight = ref(storageHeight || 380)

const systemInfo = Taro.getSystemInfoSync()
// eslint-disable-next-line no-undef
const OriginalPage = Page

// 支付宝 在 Taro 中只能通过这种方式
/*  #ifndef alipay  */
function KeyboardHeightAwarePage(pageOptions: any = {}) {
  const events = pageOptions.events || {}
  pageOptions.onKeyboardHeight = events.onKeyboardHeight = function (result: { height: number }) {
    // 只获取一次
    if (storageHeight || !result.height) return

    const isAndroid = systemInfo.platform.toLowerCase() === 'android'

    if (isAndroid) {
      keyboardHeight.value = result.height / systemInfo.pixelRatio
    } else {
      keyboardHeight.value = result.height
    }
    storageHeight = keyboardHeight.value
    Taro.setStorage({ key: 'keyboardHeight', data: keyboardHeight.value })
  }
  pageOptions.events = events
  return OriginalPage(pageOptions)
}
// eslint-disable-next-line no-undef
Object.assign(global, { Page: KeyboardHeightAwarePage })
/*  #endif  */

export { keyboardHeight }
