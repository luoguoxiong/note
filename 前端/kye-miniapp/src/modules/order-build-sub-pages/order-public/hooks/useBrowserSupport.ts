import { checkBrowserSupportEs2015 } from '@order-public-sub-public/utils/device'

/**
 * @description 进入页面时检查兼容性
 */
export const checkBrowserSupport = () => {
  console.log('unsupport：', window.unsupport)
  console.log('hasCheckedSupport：', window.hasCheckedSupport)

  // 没有检查过兼容性才需要检查
  if (!window.hasCheckedSupport) {
    window.unsupport = !checkBrowserSupportEs2015()
    window.hasCheckedSupport = true
  } else {
    console.log('已检查过兼容性，无需再检查，unsupport: ', window.unsupport)
  }
}
