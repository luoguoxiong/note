/**
 * 积分授权 API 接口
 */
import { http } from '@public/utils/request'
import Taro from '@tarojs/taro'

// 积分授权 API 类
export class IntegralAuthAPI {
  /**
   * 积分授权转让
   * @param param 授权参数
   */
  static async authorizedTransfer(param: { targetMobile: string; operateSource: number }) {
    // 获取用户手机号
    const userInfo = Taro.getStorageSync('USER_INFO')
    const phone = userInfo?.phone || ''

    return http(
      'web.marketing.integral.accountCollect.authorizedTransfer',
      { ...param, phone },
      {
        hideToast: true,
      },
    )
  }

  /**
   * 检查手机号
   * @param param 检查参数
   */
  static async checkPhone(param: any) {
    return http('web.marketing.integral.accountCollect.check', param, {
      hideToast: true,
    })
  }

  /**
   * 获取转让协议
   * @param param 协议参数
   */
  static async getAgreement(param: any) {
    return http('web.help.getHelp', param, {
      hideToast: true,
    })
  }
}

export default IntegralAuthAPI
