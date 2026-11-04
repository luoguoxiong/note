/**
 * 全民拓客 API 服务
 */
import { http } from '@public/utils/request'

class ExpandCustomerAPI {
  /**
   * 访问统计
   * @param params.openid - 微信小程序openid
   * @param params.employeeId - 员工Id
   * @param params.contactsPhone - 联系人手机号
   */
  static async visit(params: { openid: string; employeeId: string; contactsPhone: string }) {
    return http('wechat.expandcustomers.visit', params)
  }

  /**
   * 提交客户资源
   */
  static async submitCustomer(params: any) {
    return http('wechat.expandcustomers.submitCustomer', params)
  }

  /**
   * 生成图片验证码
   */
  static async getImgCode(params: { phone: string }) {
    return http('kyact.redPrizeInfoErp.getImgCode', params)
  }

  /**
   * 校验图形验证码
   */
  static async checkImgCode(params: { phone: string; imgCodeKey: string; imgCode: string }) {
    return http('kyact.redPrizeInfoErp.checkImgCode', params)
  }

  /**
   * 校验短信验证码
   */
  static async checkSmsCode(params: { phone: string; smsCode: string }) {
    return http('kyact.redPrizeInfoErp.checkSmsCode', params)
  }
}

export default ExpandCustomerAPI
