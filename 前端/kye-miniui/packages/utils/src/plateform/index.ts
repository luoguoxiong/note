/* eslint-disable no-undef */
import Taro, { ENV_TYPE } from '@tarojs/taro'
import { canvasDraw, getCanvasContext } from './canvas'
/** 支付宝小程序 */
export const isAliMiniApp = Taro.getEnv() === ENV_TYPE.ALIPAY

/** 是不是高德小程序 */
// eslint-disable-next-line no-undef
export const isAmapMiniApp = isAliMiniApp && !!my?.gd

const ua = navigator.userAgent
export const isAndroid = /(Android);?[\s/]+([\d.]+)?(.*Mobile)/.test(ua)
export const isIphone = /(iPhone\sOS)\s([\d_]+)/.test(ua)

/**
 * 获取设备窗口信息
 * @returns Taro.getWindowInfo.Result
 */
export const getWindowInfo = (): Taro.getWindowInfo.Result => {
  const canuse = Taro.canIUse('getWindowInfo')
  if (canuse) {
    return Taro.getWindowInfo()
  } else {
    const res = Taro.getSystemInfoSync()
    return {
      pixelRatio: res.pixelRatio,
      screenWidth: res.screenWidth,
      screenHeight: res.screenHeight,
      windowWidth: res.windowWidth,
      windowHeight: res.windowHeight,
      statusBarHeight: res.statusBarHeight,
      safeArea: res.safeArea,
    }
  }
}

/**
 * 获取胶囊信息
 * @returns Taro.getMenuButtonBoundingClientRect.Rect
 */
export const getMenuButtonBoundingClientRect = (): Taro.getMenuButtonBoundingClientRect.Rect => {
  const canuse = Taro.canIUse('getMenuButtonBoundingClientRect')
  if (canuse) {
    const r = Taro.getMenuButtonBoundingClientRect()
    if (isAmapMiniApp) {
      if (my.env.platform === 'Android') {
        const { pixelRatio } = Taro.getSystemInfoSync()
        r.height /= pixelRatio
        r.width /= pixelRatio
        r.left /= pixelRatio
        r.right /= pixelRatio
        r.top /= pixelRatio
        r.bottom /= pixelRatio
      }
      return r
    }
    return r
  } else {
    const res = Taro.getSystemInfoSync()
    const top = res?.statusBarHeight ? res?.statusBarHeight + 8 : 20
    return {
      bottom: 82,
      height: 28,
      left: 306,
      right: 382,
      top,
      width: 76,
    }
  }
}

export default {
  getWindowInfo,
  getMenuButtonBoundingClientRect,
  getCanvasContext,
  canvasDraw,
}
