/**
 * market-page 页面相关 API
 */
import http from '@public/utils/request'

class MarketPageAPI {
  /**
   * 获取小程序分享参数
   * @param param.pageCode 页面编码
   */
  static async getMPShareParam(param: { pageCode: string }) {
    return http({
      url: 'kyact.adPageConfig.getMPShareParam',
      method: 'POST',
      data: param,
    })
  }
}

export default MarketPageAPI

