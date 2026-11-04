import { isAmapApp } from '@order-public-sub-public/utils/device'
import Taro from '@tarojs/taro'
import { YesOrNoString } from '@order-public-sub-public/constants'
import { ref } from 'vue'

export const uploadGoodsTypeResolve = ref()
export const uploadGoodsTypeReject = ref()

export const uploadGoodsTypePromise = () => {
  return new Promise((resolve, reject) => {
    uploadGoodsTypeResolve.value = resolve
    uploadGoodsTypeReject.value = reject
  })
}

export const pureBatteryFileUploadConfirm = ref<YesOrNoString | undefined>(YesOrNoString.NO)

/**
 * 禁用提示语
 */
export const disableAlertUnload = () => {
  if (isAmapApp) {
    return
  }
  try {
    Taro?.disableAlertBeforeUnload()
  } catch (error) {
    console.log('禁用提示语', error)
  }
}
/**
 * 返回拦截注册成功
 */
export const enableAlertUnload = async () => {
  if (isAmapApp) {
    // 高德小程序不支持返回拦截
    return false
  }
  try {
    Taro?.enableAlertBeforeUnload({
      message: '您的数据已保存，确定退出吗？',
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
