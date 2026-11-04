import Taro from '@tarojs/taro'

interface NavbarState {
  paddingTop?: number
  [key: string]: any // 如果你还有别的属性
}

/**
 * 更新navbar导航信息
 * @param ENV
 * @param top
 * @param height
 * @param state
 * @return {{paddingTop: any}}
 */
export const useNavbarWeappUpdate = ({ ENV, top, height }, state: NavbarState = {}) => {
  let { paddingTop } = state
  if (ENV === Taro.ENV_TYPE.WEAPP) {
    paddingTop = top + height / 2
  }
  return {
    ...state,
    paddingTop,
  }
}
