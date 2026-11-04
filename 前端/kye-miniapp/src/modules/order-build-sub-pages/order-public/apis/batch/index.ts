/* 批量初始化接口 */
import { http } from '@order-public-sub-public/utils/request'
import { OrderInfo, OrderPickupInfo } from '@order-public-sub-public/types'
// import { getSourceAndChannel } from '@order-public-sub-public/configs'
import { getBatchApiCode, getBatchId, getSource } from '@order-public-sub-public/configs'
import {
  BatchProcessResultResponse,
  BatchProcessQuery,
  BatchOrderSuccessResponse,
  BatchSaveCheckResponse,
  BatchSaveTrySaveResponse,
  BatchSaveResultResponse,
  BatchSingleProcessResponse,
  UpdateRestrictAuditListRequest,
  BatchFiledInitPrams,
  BatchFildInitResponse,
  BatchSaveSingleWaybillRespones,
} from './types'
import { GetEstimateFeeByTaskIdResponse } from '@order-public-sub-public/apis/waybill/estimated-cost'
import { getWaybillSource } from '@order-public-sub-public/utils'
import { getChannelScene } from '@order-public-sub-public/apis/index'

/**
 * @description 批量过程中接口
 */
export const getBatchProcess = async (params: BatchProcessQuery) => {
  // const sourceAndChannel = await getSourceAndChannel()
  return http<{ taskId: string; needBindCustomerCode: boolean }>(
    'web.order.configOrder.batch.v1.process',
    {
      ...params,
    },
    { cancelDuplicated: true, toast: true },
  )
}

/**
 * @description 批量子运单单票过程中接口
 */
export const getBatchSingleProcess = async (params: BatchProcessQuery) => {
  // const sourceAndChannel = await getSourceAndChannel()
  const waybillSource = await getWaybillSource()
  return http<BatchSingleProcessResponse>(
    'web.order.batch.v1.singleProcess',
    {
      ...params,
      waybillSource,
    },
    { cancelDuplicated: true, toast: true },
  )
}

/**
 * @description 批量过程校验结果接口
 */
export const getBatchProcessResult = async (taskId: string) => {
  return http<BatchProcessResultResponse>('web.order.configOrder.batch.getProcessResult', { taskId })
}

/**
 * @description 批量过程初始化校验结果接口
 */
export const getInitBatchProcessResult = async (taskId: string, maxWaybillId: number) => {
  return http<BatchProcessResultResponse>('web.order.batch.getInitProcessResult', { taskId, maxWaybillId })
}

/**
 * @description 批量下单接口
 */
export const getBatchSaveCheck = async (
  waybillList: OrderInfo[],
  type: number,
  orderSaveInfo: { bulkCargoInfoList: OrderPickupInfo['bulkCargoInfos'] } | null,
) => {
  // const assetNumber = await getAssetCode()

  return http<BatchSaveCheckResponse>('web.order.batch.v1.saveCheck', { waybillList, type, orderSaveInfo })
}

/**
 * @description // 删除子运单数据
 */
export const deleteWaybillInfo = async (waybillIdList: string[]) => {
  const batchId = getBatchId()
  return http<{ estimateFeeResult: GetEstimateFeeByTaskIdResponse; taskId?: string }>('web.order.batch.processDelete', {
    batchId,
    waybillIdList,
  })
}

/**
 * @description // 批量修改单条 返回清缓存绑定
 */
export const batchCancelKaPreBind = (waybillList: string[]) => {
  return http<BatchSaveSingleWaybillRespones>(
    'web.order.configOrder.batchCancelKaPreBind',
    {
      waybillNumbers: waybillList,
    },
    { toast: false },
  )
}

/**
 * @description 批量下单校验结果接口
 */
export const getBatchTrySave = async (pageType: number) => {
  return http<BatchSaveTrySaveResponse>('web.order.batch.v2.trySave', { pageType })
}

/**
 * @description 批量下单八合一管控页面数据
 */
export const getBatchRestrictList = async (params: { pageType: number | null }) => {
  return http<BatchSaveResultResponse>('web.order.batch.v2.getRestrictList', params)
}

/**
 * @description 获取 批量下单成功页数据接口
 */
export const getBatchOrderSuccessData = () => {
  return http<BatchOrderSuccessResponse>('web.order.batch.getSaveResult', {})
}

/**
 * @description 管控数据 同意与否
 */
export const updateRestrictAuditList = (params: UpdateRestrictAuditListRequest[]) => {
  return http('web.order.batch.v2.updateRestrictAuditList', params)
}

/**
 * @description 运单信息管控
 */
export const getWaybillInfoList = (params: any) => {
  return http('web.order.batch.v2.updateRestrictWaybillDetail', params)
}

/**
 * @description 清除运单缓存，没有入参和返参
 * @returns
 */
export const clearWaybill = () => {
  return http('web.order.cache.cleanWaybill', {})
}

/**
 * @description 本次寄件信息统一按钮关闭
 * @returns
 */
export const closeUnifiedInfoSwitcher = () => {
  return http('web.order.batch.closeUnifiedInfoSwitcher', {})
}

/**
 * @description 获取夜间取货费以及大票货表格数据接口
 * @param submitOrder
 */
export const getPackageMsg = (params: any) => {
  return http<any>('web.order.batch.nightFeeAndBigTicket', params)
}

/**
 * @description 批量-清除运单缓存，没有入参和返参
 * @returns
 */
export const clearBatchWaybill = (params = {}) => {
  return http('web.order.cache.batch.cleanWaybill', params)
}

/**
 * @description 批量填写初始化接口
 */
export const getBatchFiledInit = async (params: BatchFiledInitPrams) => {
  const source = await getSource()
  const channelScene = getChannelScene()

  const apiCode = getBatchApiCode()

  return http<BatchFildInitResponse>(
    apiCode,
    { ...params, ...channelScene, source },
    {
      cancelDuplicated: true,
    },
  )
}
