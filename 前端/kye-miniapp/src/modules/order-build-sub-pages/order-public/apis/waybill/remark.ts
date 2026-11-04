import { http } from '@order-public-sub-public/utils/request'

// 删除运单标签接口
export const delteWaybillRemarkTag = (params: { waybillLogId: string; clearAll: boolean }) => {
  return http('web.order.waybillRemark.deleteHistory', params, { toast: false })
}

// 给取货司机捎句话标签接口
export const delteMessageToDriverRemarkTag = (params: { waybillLogId?: string; value?: string; clearAll: boolean }) => {
  return http('web.order.messageToDriver.deleteHistory', params, { toast: false })
}
