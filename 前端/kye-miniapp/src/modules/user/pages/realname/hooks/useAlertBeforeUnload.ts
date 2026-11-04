import { isAmapMiniApp } from '@/public/utils'
import Taro from '@tarojs/taro'

/**
 * 返回拦截注册成功
 */
export const enableAlertUnload = () => {
  if (isAmapMiniApp) {
    // 高德小程序不支持返回拦截
    return
  }
  try {
    Taro?.enableAlertBeforeUnload({
      message: '确定要退出实名认证吗，您的实名资料将不会被保存？',
      success: function (res) {
        console.log('返回拦截注册成功', res)
      },
      fail: function (err) {
        console.log('返回拦截注册失败', err)
      },
    })
  } catch (error) {
    console.log('Taro返回拦截注册失败', error)
  }
}

/**
 * 禁用提示语
 */
export const disableAlertUnload = () => {
  if (isAmapMiniApp) {
    return
  }
  try {
    Taro?.disableAlertBeforeUnload()
  } catch (error) {
    console.log('禁用提示语', error)
  }
}
