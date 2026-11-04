/**
 * CRM 摇奖活动 API
 */
import { http } from '@public/utils/request'

const APPKEY = 55409

export class LotteryNewAPI {
  /**
   * 获取活动信息
   */
  static async getActivityInfo(param: { activityId: string }) {
    return http('crm.open.lotteryActivityInfo.getByH5', param, {
      hideToast: true,
      appkey: APPKEY,
    })
  }

  /**
   * 抽奖
   */
  static async prizeDraw(param: { activityId: string; userKey?: string }) {
    return http('crm.open.lotteryActivityInfo.prizeDraw', param, {
      hideToast: true,
      appkey: APPKEY,
    })
  }

  /**
   * 中奖通知
   */
  static async winningNotice(param: { activityId: string }) {
    return http('crm.open.lotteryActivityInfo.winningNotice', param, {
      hideToast: true,
      appkey: APPKEY,
    })
  }
}

export default LotteryNewAPI

