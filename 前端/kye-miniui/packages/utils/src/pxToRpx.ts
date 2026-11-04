import Taro from '@tarojs/taro'

export function pxToRpx(px: number, designWidth: number = 750): number {
  const { windowWidth } = Taro.getSystemInfoSync()
  return (px * designWidth) / windowWidth
}

export function rpxToPx(rpx: number, designWidth: number = 750): number {
  const { windowWidth } = Taro.getSystemInfoSync()
  return Math.round((rpx * windowWidth) / designWidth)
}
