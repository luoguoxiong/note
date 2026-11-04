import Taro from '@tarojs/taro'
import { isAmapMiniApp } from '@/public/utils'

/**
 * 启用返回拦截
 *
 * 用户在表单有未提交数据时点击返回，弹出系统二次确认弹窗。
 * 用于"申请绑定其他公司"页面，与 H5 onBeforeRouteLeave 行为对齐。
 *
 * @param message 弹窗提示文案
 */
export const enableAlertUnload = (message = '您有信息未保存，确定要退出吗？') => {
  // 高德小程序不支持返回拦截
  if (isAmapMiniApp) return
  try {
    Taro?.enableAlertBeforeUnload({
      message,
      success: (res) => {
        console.log('返回拦截注册成功', res)
      },
      fail: (err) => {
        console.log('返回拦截注册失败', err)
      },
    })
  } catch (error) {
    console.log('Taro返回拦截注册失败', error)
  }
}

/**
 * 禁用返回拦截
 *
 * 提交成功跳转或无需拦截时调用。
 */
export const disableAlertUnload = () => {
  if (isAmapMiniApp) return
  try {
    Taro?.disableAlertBeforeUnload()
  } catch (error) {
    console.log('禁用返回拦截失败', error)
  }
}
