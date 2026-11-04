import Taro, { ENV_TYPE } from '@tarojs/taro'
import { getEnv } from '@public/utils/device'
import { PlainObject } from '@public/utils/types'
import { ERRORS } from '@public/utils/request/constants'

interface NetworkTypeRes extends TaroGeneral.CallbackResult {
  networkAvailable: boolean
  networkType?: string
}

/* 检测网络异常提示 */
export const checkNetworkTypeToast = () => {
  return new Promise((resolve, reject) => {
    Taro.getNetworkType({
      complete: (res: NetworkTypeRes) => {
        console.log(res)
        if (getEnv() === ENV_TYPE.ALIPAY) {
          if (!res.networkAvailable) {
            Taro.showToast({ icon: 'none', title: ERRORS['Network Error'], duration: 2000 })
            reject(res)
          } else {
            resolve(true)
          }
        } else if (getEnv() === ENV_TYPE.WEAPP || getEnv() === ENV_TYPE.WEB) {
          if (res.errMsg === 'getNetworkType:ok' && res.networkType === 'none') {
            Taro.showToast({ icon: 'none', title: ERRORS['Network Error'], duration: 2000 })
            reject(res)
          } else {
            resolve(true)
          }
        }
      },
    })
  })
}

export const platform = {
  /* 隐藏所有页面添加到桌面功能 */
  hideAllAddToDesktopMenu(params: PlainObject = {}) {
    if (getEnv() === ENV_TYPE.ALIPAY) {
      my && my.hideAllAddToDesktopMenu(params)
    }
  },
}
