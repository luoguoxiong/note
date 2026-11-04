/**
 * 积分授权 API 接口
 */
import { http } from '@public/utils/request'

// 派送反馈
export class otherServiceAPI {
  static async agingMobileSearch(param: any) {
    return http('web.query.aging.agingMobileSearch', param, {
      hideToast: true,
    })
  }
}

export default otherServiceAPI
