/* eslint-disable no-undef */
import Taro from '@tarojs/taro'
import { isAliMiniApp, isAmapMiniApp } from '../device'
import { alipayLowestVersion } from './config'
import { compareVersion } from '../tools'

export const checkVersion = () => {
  if (isAliMiniApp && !isAmapMiniApp) {
    const clientVersion = my.env.clientVersion || my.getSystemInfoSync().clientVersion
    if (compareVersion(clientVersion, alipayLowestVersion) < 0) {
      Taro.showModal({
        title: '提示',
        content: '当前支付宝版本过低，无法使用当前小程序的重要功能，请升级到最新支付宝版本。',
        showCancel: false,
        success: () => {
          my.ap.updateAlipayClient()
        },
      })
    }
  }
}
