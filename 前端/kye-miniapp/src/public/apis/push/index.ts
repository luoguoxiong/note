import { http } from '@public/utils/request'
import { ApiGetRoutePathByChannelResponse, ApiReLoginMsgPushResponse } from '@public/apis/push/type'

/* sso-APP重新登录极光推送 */
export const ApiReLoginMsgPush = (params) => {
  return http<ApiReLoginMsgPushResponse>(
    'web.ssoPush.reLoginMsgPush',
    { ...params },
    { unToken: true, hideToast: true },
  )
}

/* 根据渠道编码获取路由信息 (V1.0) */
export const ApiGetRoutePathByChannel = (params) => {
  return http<ApiGetRoutePathByChannelResponse[]>(
    'web.advertisement.getRoutePathByChannel',
    { ...params },
    { unToken: true, hideToast: true },
  )
}
/* 消息记录点击上报 */
export const ApiMsgPushRecordClickReport = (params) => {
  return http('web.message.msgPushRecord.clickReport', { ...params }, { unToken: false, hideToast: true })
}
