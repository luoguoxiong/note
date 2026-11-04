import { http } from '@order-public-sub-public/utils/request'
import { SdkType, SdkSign } from './types'

/**
 * @description 获取微信jssdk签名
 * @param params
 * @returns
 */
export const getJsSdkSign = (params: { url: string; type?: SdkType }) => {
  return http<SdkSign>('web.ssoWeChatTool.getJsSdkSign', params)
}
