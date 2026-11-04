import Taro from '@tarojs/taro'

/**
 * 更新navbar导航信息
 * @param ENV
 * @param systemInfo
 * @param top
 * @param height
 * @param state
 * @return {{paddingTop: any}}
 */
// @ts-ignore
export const useNavbarAlipayUpdate = ({ ENV, systemInfo, top, height }, state = {}) => {
  console.log('useNavbarAlipayUpdate')

  let { paddingLeft, alipayTitleFontSize } = state
  if (ENV === Taro.ENV_TYPE.ALIPAY) {
    if (Taro.canIUse('getLeftButtonsBoundingClientRect')) {
      const { backButtonIcon, homeButtonIcon } = Taro.getLeftButtonsBoundingClientRect()
      console.log('backButtonIcon', backButtonIcon, homeButtonIcon)
      if (backButtonIcon) {
        paddingLeft = backButtonIcon.right
      }
      if (homeButtonIcon && backButtonIcon) {
        paddingLeft = homeButtonIcon.left + backButtonIcon.right
      }
    }
    // 适配平板-标题高度
    if (systemInfo.windowWidth > 768) {
      alipayTitleFontSize = (systemInfo.fontSizeSetting || 16) + 4
    }
  }
  return {
    ...state,
    paddingLeft,
    alipayTitleFontSize,
  }
}
