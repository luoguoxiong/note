import Taro from '@tarojs/taro'
import { onMounted, ref } from 'vue'
import plateform from '@kye-netc/plateform'

export function calcNavigationStatus() {
  const { height, top, right } = plateform.getMenuButtonBoundingClientRect()
  const systemInfo = Taro.getSystemInfoSync()
  const statusBarHeight = systemInfo.statusBarHeight!
  const titleBarHeight = height + (top - statusBarHeight) * 2

  const appHeaderHeight = statusBarHeight + titleBarHeight
  let paddingLeft = systemInfo.windowWidth - right

  // #region 处理支付宝小程序导航栏左侧按钮
  // eslint-disable-next-line no-undef
  if (process.env.TARO_ENV === 'alipay' && my.canIUse('getLeftButtonsBoundingClientRect')) {
    // eslint-disable-next-line no-undef
    const { backButtonIcon, homeButtonIcon } = my.getLeftButtonsBoundingClientRect()
    if (homeButtonIcon) {
      paddingLeft = backButtonIcon.right + 12
    } else if (backButtonIcon) {
      paddingLeft = backButtonIcon.right + 12
    }
  }
  // eslint-disable-next-line no-undef
  else if (process.env.TARO_ENV === 'alipay') {
    paddingLeft = 42
  }
  // #endregion

  return {
    appHeaderHeight,
    paddingLeft,
    statusBarHeight,
    titleBarHeight,
  }
}

export function useNavigationStatus() {
  const navigationSize = ref(calcNavigationStatus())

  onMounted(() => {
    navigationSize.value = calcNavigationStatus()
  })

  return navigationSize
}
