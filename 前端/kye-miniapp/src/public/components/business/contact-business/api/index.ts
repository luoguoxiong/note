import { http } from '@public/utils/request'

// 查件-获取市场虚拟号及企业微信（用户手动修改呼出手机号）
export const getMarketVirtualContact = (parmas: any) => {
  return http<any>('web.market.contact.get', parmas, { hideToast: true })
}
