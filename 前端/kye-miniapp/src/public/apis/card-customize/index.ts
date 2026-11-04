import { http } from '@public/utils/request'
import type { GetCardConfigRequest, CardConfigResponse } from './types'

/** 查询卡片配置 */
export const getCardConfig = (params: GetCardConfigRequest) => {
  return http<CardConfigResponse>('web.query.cardConfig.get', params, {
    appkey: 55262,
    extraHeader: { 'x-framework-icgray': '0730' },
  })
}
