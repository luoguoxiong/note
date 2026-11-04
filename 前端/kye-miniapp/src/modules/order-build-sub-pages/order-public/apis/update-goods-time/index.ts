import { http } from '@order-public-sub-public/utils/request'
import { GoodsTimeWaybillResponse, UpdateGoodsTimeResult } from './type'
import { GoodsTimeVo } from '@order-public-sub-public/types'
import { GoodsTimeFlag } from '@order-public-sub-public/constants'

/**
 * @description 获取可修改货好时间运单列表
 * @returns
 */
export const getGoodsTimeWaybill = (params: { page: number; pageSize: number }) => {
  return http<GoodsTimeWaybillResponse>('web.query.waybill.modifyGoodsTimePage', params)
}

/**
 * 获取货好时间组件数据
//  * bizScene
 */
export const getGoodsTimeConfig = (bizScene: string) => {
  return http<GoodsTimeVo>('web.order.goodsTime.getModuleDimension', { waybillInfo: {}, bizScene: bizScene })
}

// 批量修改货好时间
export const batchGoodstimeUpdate = (params: {
  source: string
  goodsTime: string
  waybillNumbers: string[]
  goodsTimeFlag?: GoodsTimeFlag
}) => {
  return http<{ batchId: string }>('web.order.batch.goodsTime.update', params)
}

// 批量更新货好时间
export const getUpdateGoodsTimeResult = () => {
  return http<UpdateGoodsTimeResult>('web.order.batch.goodsTime.getUpdateResult')
}
