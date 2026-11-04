/**
 * 押金运费 API 接口
 */
import { http } from '@public/utils/request'
const env = process.env.TARO_APP_ENV || 'prod'
// API 配置
const APPKEY = env === 'prod' ? '80013' : '50342'

// 押金运费 API 类
export class DepositFreightAPI {
  /**
   * 获取二维码支付结果
   * @param param 支付参数
   */
  static async getQrCodePayResult(param: { uid: string }) {
    return http('web.marketing.recharge.getQrCodePayResult', param, {
      appkey: APPKEY,
      hideToast: true,
    })
  }
}

export default DepositFreightAPI
