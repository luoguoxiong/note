/**
 * 节日活动 API 接口
 */
import { http } from '@public/utils/request'

// 节日活动 API 类
export class FestivalDrawAPI {
  /**
   * 获取活动抽奖结果
   * @param param 抽奖参数
   */
  static async getLuckyDraw(param: { token: string; activityType: number }) {
    return http('kyact.prize.user.getLuckyDraw', param, {
      hideToast: true,
    })
  }

  /**
   * 保存签到信息
   * @param param 签到信息参数
   */
  static async saveInfo(param: {
    token: string
    name: string
    mobile: string
    company: string
    industry: string
    openId: string
  }) {
    return http('kyact.prize.user.saveInfo', param, {
      hideToast: true,
    })
  }
}

export default FestivalDrawAPI

