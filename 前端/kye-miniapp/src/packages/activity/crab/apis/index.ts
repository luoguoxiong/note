/**
 * 大闸蟹活动 API 接口
 */
import { http } from '@public/utils/request'

// 大闸蟹活动 API 类
export class CrabAPI {
  /**
   * 新客户领券
   * @param param 领券参数
   */
  static async pickCoupon(param: { phone: string; sendIsOld: string; waybillCount: string; sendPrizeType: string }) {
    return http('kyact.redPrizeInfoErp.sendHairyCrabsPrize', param, {
      hideToast: true,
    })
  }
}

export default CrabAPI
