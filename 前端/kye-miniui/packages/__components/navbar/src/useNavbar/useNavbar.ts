/**
 * 获取自定义导航padding,height
 */
import Taro from '@tarojs/taro'
import { onMounted, ref } from 'vue'
import { useNavbarWeappUpdate } from '@packages/__components/navbar/src/useNavbar/useNavbarWeapp'
import { useNavbarAlipayUpdate } from '@packages/__components/navbar/src/useNavbar/useNavbarALipay'
import { getWindowInfo, getMenuButtonBoundingClientRect } from '@ky-miniui-lib/utils'
export type NavbarStatus = {
  appHeaderHeight: number
  statusBarHeight: number
  titleHeight: number
  paddingLeft: number
  paddingTop: number
  textRight: number
  alipayTitleFontSize: number
}

const navbarUpdateEffectMap = {
  WEAPP: useNavbarWeappUpdate,
  ALIPAY: useNavbarAlipayUpdate,
}

export const navAppHeaderHeight = ref(0)

// @ts-ignore
export function calcNavbarOffset(ENV) {
  let { statusBarHeight, windowWidth } = getWindowInfo()

  statusBarHeight = statusBarHeight || 20

  console.error('statusBarHeight', statusBarHeight)

  const { height, top, right, width } = getMenuButtonBoundingClientRect() // 胶囊按钮信息

  // 自定义导航高度
  const titleHeight = (top - statusBarHeight) * 2 + height
  // 最外层高度
  const appHeaderHeight = titleHeight + statusBarHeight
  // 左侧按钮距离
  const paddingLeft = windowWidth - right

  const paddingTop = statusBarHeight
  // 距离顶部padding-top

  // 标题字体大小 TODO 待适配设备
  const alipayTitleFontSize = 16

  // 右侧宽度(width胶囊宽度  + 间隔)
  const textRight = width + 4
  const result = {
    appHeaderHeight,
    statusBarHeight,
    titleHeight,
    paddingLeft,
    paddingTop,
    textRight,
    alipayTitleFontSize,
  }

  navAppHeaderHeight.value = result.appHeaderHeight
  return result
  // if (ENV === Taro.ENV_TYPE.WEAPP) {
  //   paddingTop = top + height / 2
  // }
  // if (ENV === Taro.ENV_TYPE.ALIPAY) {
  //   if (Taro.canIUse('getLeftButtonsBoundingClientRect')) {
  //     const { backButtonIcon, homeButtonIcon } = Taro.getLeftButtonsBoundingClientRect()
  //     if (homeButtonIcon) {
  //       paddingLeft = backButtonIcon.right
  //     } else if (backButtonIcon) {
  //       paddingLeft = backButtonIcon.right
  //     }
  //   }
  //   console.log('alipay>>>>')
  //   if (systemInfo.windowWidth > 768) {
  //     alipayTitleFontSize = (systemInfo.fontSizeSetting || 16) + 4
  //   }
  // }
}

/**
 * 获取导航栏高度信息
 * @returns {{statusBarHeight: any, appHeaderHeight: any}}
 */
export function getNavBarHeightInfo() {
  let { statusBarHeight } = getWindowInfo()
  statusBarHeight = statusBarHeight || 20
  const { height, top } = getMenuButtonBoundingClientRect() // 胶囊按钮信息
  // 自定义导航高度
  const titleHeight = (top - statusBarHeight) * 2 + height
  // 最外层高度
  const appHeaderHeight = titleHeight + statusBarHeight
  return {
    statusBarHeight,
    appHeaderHeight,
  }
}

export function useNavbarStatus(ENV) {
  const navbarNativeInfo = ref<NavbarStatus>({} as NavbarStatus)
  onMounted(() => {
    navbarNativeInfo.value = calcNavbarOffset(ENV)
  })
  return navbarNativeInfo
}
