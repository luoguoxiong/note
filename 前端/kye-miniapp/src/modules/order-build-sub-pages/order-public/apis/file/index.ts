import { http } from '@order-public-sub-public/utils/request'
import { WechatShareResponse } from './types'

// 获取微信分享图片
export const getWechatSharePicture = (params: { waybillNumber: string }) => {
  return http<WechatShareResponse>('web.client.orderShare.getWechatSharePicture', params)
}
