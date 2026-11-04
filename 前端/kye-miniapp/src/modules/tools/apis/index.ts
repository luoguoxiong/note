/**
 * @Desc: index
 * @Date: 2025/11/21
 */
import { http } from '@public/utils/request'
import * as ApiTypes from './type'

export const getSignData = async (params: ApiTypes.SiginReq) => {
  return await http<ApiTypes.SiginRes>('web.activity.graphicCode.generateSalesCheckInCode', params)
}

export const getThirdBusinessSignStatus = (params: ApiTypes.ThirdBusinessSignStatusReq) => {
  return http<ApiTypes.ThirdBusinessSignStatus>('web.activity.graphicCode.faceCheckInCodeVerify', params)
}

/**
 * @description 获取微信jssdk签名
 * @param params
 * @returns
 */
export const getJsSdkSign = (params: { url: string; type?: any }) => {
  return http('web.ssoWeChatTool.getJsSdkSign', params)
}
