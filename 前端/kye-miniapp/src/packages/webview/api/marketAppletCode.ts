/**
 * market-applet-code 页面相关 API
 */
import http from '@public/utils/request'

// API 配置 - CRM 营销类接口使用固定 APPKEY
const APPKEY = 55409

class MarketAppletCodeAPI {
  /**
   * 营销-通过活动编码获取真实活动地址（新）
   * @param param.id 活动id
   * @param param.activityNo 活动编码
   */
  static async activityGetH5UrlNew(param: { id?: string; activityNo?: string }) {
    return http({
      url: 'crm.open.couponExternal.getH5Url',
      method: 'POST',
      data: param,
      appkey: APPKEY,
    })
  }
}

export default MarketAppletCodeAPI
