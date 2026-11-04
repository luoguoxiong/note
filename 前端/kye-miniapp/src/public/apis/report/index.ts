import { http } from '@public/utils/request'

// 公众号自动回复已读上报 (V1.0)
export const reportWechatMsgReadApi = (params: { msgId: string }) => {
  return http<object>('web.basic.biz.wechat.autoReply.read', params)
}
