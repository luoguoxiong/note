import { nativeSave } from '@/modules/native/pages/api'
import { urlContact } from '@/public/utils'
import Taro from '@tarojs/taro'

export type CheckDeliveryPhoneParams = {
  // 寄件手机号
  phone: string
  // 检查方式 order 单票，batch 批量寄件
  type: 'order' | 'order-batch' | 'switch'
  bizLoad: string
  allowSameCompany?: number
  sendCodeStatus?: number
}

export const SUCCESS_LISTENER = 'checkDeliveryPhoneSuccess'
export const FAIL_LISTENER = 'checkDeliveryPhoneFail'

const cleanup = () => {
  Taro.eventCenter.off(SUCCESS_LISTENER)
  Taro.eventCenter.off(FAIL_LISTENER)
}

export async function checkDeliveryPhone(params: CheckDeliveryPhoneParams, poll = false) {
  Taro.eventCenter.trigger(FAIL_LISTENER, null)

  return new Promise<false | string>((resolve) => {
    const callback = (result: false | string) => {
      resolve(result)
      if (poll) {
        nativeSave({
          key: 'checkDeliveryPhone:' + params.phone,
          value: JSON.stringify({ result, isSuccess: true }),
        })
      }
      cleanup()
    }

    Taro.eventCenter.on(SUCCESS_LISTENER, (result: string) => callback(result))
    Taro.eventCenter.on(FAIL_LISTENER, () => callback(false))

    Taro.navigateTo({
      url: urlContact('/modules/privacy-phone/pages/sms-code/index', params),
      fail: () => callback(false),
    })
  })
}
