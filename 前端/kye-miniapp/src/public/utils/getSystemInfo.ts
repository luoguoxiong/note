import Taro from '@tarojs/taro'
import plateform from '@kye-netc/plateform'
import { isH5Env, isWxAppEnv } from './device'
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
    optionMenuWidth: number
    optionMenuRight: number
    optionMenuLeft: number
  }
  model: string
  brand: string
  system: string
  platform: string
  host: {}
}

let cachedSystemInfo: SystemInfo | null = null

export const getSystemInfo = async () => {
  if (cachedSystemInfo) {
    return cachedSystemInfo
  }

  let systemInfo: SystemInfo = {
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
  }

  let { statusBarHeight: _statusBarHeight, windowHeight, windowWidth } = plateform.getWindowInfo()

  const { model, brand, system, platform, host } = Taro.getSystemInfoSync()

  _statusBarHeight = _statusBarHeight || 20

  systemInfo.windowHeight = windowHeight
  systemInfo.windowWidth = windowWidth

  // 支付宝 偶现 top、left 等值为 0 的情况，可通过延时调用来规避。
  const menuButtonInfo = plateform.getMenuButtonBoundingClientRect()

  let { top, height } = menuButtonInfo
  // app 没有 顶部胶囊
  if (isWxAppEnv || isH5Env) {
    height = 0
  }

  const _titleHeight = (top - _statusBarHeight) * 2 + height

  const _navBarHeight = _titleHeight + _statusBarHeight

  systemInfo.statusBarHeight = _statusBarHeight
  systemInfo.titleHeight = _titleHeight
  systemInfo.navBarHeight = isH5Env ? 0 : _navBarHeight
  systemInfo.menuButtonInfo = menuButtonInfo
  systemInfo.model = model
  systemInfo.brand = brand
  systemInfo.system = system
  systemInfo.platform = platform
  systemInfo.host = host

  if (Taro.getApp()) {
    Taro.getApp().systemInfo = systemInfo
  }

  cachedSystemInfo = { ...systemInfo }

  return systemInfo
}
