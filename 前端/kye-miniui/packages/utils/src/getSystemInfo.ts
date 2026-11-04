import Taro from '@tarojs/taro'
import { getWindowInfo, getMenuButtonBoundingClientRect } from './plateform'
interface SystemInfo {
  statusBarHeight: number
  titleHeight: number
  navBarHeight: number
  windowHeight: number
  windowWidth: number
  menuButtonInfo: {
    /** 下边界坐标，单位：px */
    bottom: number
    /** 高度，单位：px */
    height: number
    /** 左边界坐标，单位：px */
    left: number
    /** 右边界坐标，单位：px */
    right: number
    /** 上边界坐标，单位：px */
    top: number
    /** 宽度，单位：px */
    width: number
  }
  model: string
  brand: string
  system: string
  platform: string
  host: any
}

let cachedSystemInfo: SystemInfo | null = null

export const getSystemInfo = () => {
  if (cachedSystemInfo) {
    return cachedSystemInfo
  }

  const systemInfo: SystemInfo = {
    statusBarHeight: 20,
    titleHeight: 80,
    navBarHeight: 100,
    windowHeight: 0,
    windowWidth: 0,
    menuButtonInfo: {
      bottom: 0,
      height: 0,
      left: 0,
      right: 0,
      top: 0,
      width: 0,
    },
    model: '',
    brand: '',
    system: '',
    platform: '',
    host: {}
  }

  let { statusBarHeight: _statusBarHeight, windowHeight, windowWidth } = getWindowInfo()
  const { model, brand, system, platform, host } = Taro.getSystemInfoSync()

  _statusBarHeight = _statusBarHeight || 20

  systemInfo.windowHeight = windowHeight
  systemInfo.windowWidth = windowWidth

  // 支付宝 偶现 top、left 等值为 0 的情况，可通过延时调用来规避。
  const menuButtonInfo = getMenuButtonBoundingClientRect()

  const { top, height } = menuButtonInfo

  const _titleHeight = (top - _statusBarHeight) * 2 + height

  const _navBarHeight = _titleHeight + _statusBarHeight

  systemInfo.statusBarHeight = _statusBarHeight
  systemInfo.titleHeight = _titleHeight
  systemInfo.navBarHeight = _navBarHeight
  systemInfo.menuButtonInfo = menuButtonInfo
  systemInfo.model = model
  systemInfo.brand = brand
  systemInfo.system = system
  systemInfo.platform = platform
  systemInfo.host = host
  cachedSystemInfo = { ...systemInfo }

  return systemInfo
}
