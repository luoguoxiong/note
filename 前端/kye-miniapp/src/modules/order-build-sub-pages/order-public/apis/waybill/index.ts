import { http } from '@order-public-sub-public/utils/request'
import {
  AddedServiceFee,
  CheckResponse,
  OrderInfo,
  OrderResponse,
  PreloadQuery,
  pageDefaultInfoType,
  processQuery,
  ITemplateDimensionResponse,
} from '@order-public-sub-public/types'
import { getSourceAndChannel } from '@order-public-sub-public/configs'
import { CheckBeforeEnterType, OrderSceneType, YesOrNoString } from '@order-public-sub-public/constants'
import { elementsChangeWhiteList } from '@order-public-sub-public/utils/cancel'
import { ServiceModeResponse, SubmitOptions, IChoosableTimesItem } from '@order-public-sub-public/apis/waybill/types'

/**
 * @description 费用计算接口
 * @param query 参数
 */
export const addedServiceFeeProcess = async (query: processQuery) => {
  const sourceAndChannel = await getSourceAndChannel()
  return http<AddedServiceFee>(
    'web.order.addedValueService.get',
    {
      ...query,
      ...sourceAndChannel,
    },
    { toast: true },
  )
}

/**
 * @description process init 切换接口
 * @param query
 * @returns
 */
export const initProcess = (query: processQuery) => {
  return checkInProcess(query, 'web.order.init.singleProcess')
}

/**
 * @description 填单过程中的检查接口
 * @param query 参数
 */
export const checkInProcess = async (query: processQuery, apiCode = 'web.order.configOrder.singleProcess') => {
  const {
    orderInfo,
    elementsChange,
    moduleStyle: container,
    pageName,
    cacheStrategy = null,
    textCode,
    callFlag,
    waybillSource,
  } = query
  const sourceAndChannel = await getSourceAndChannel()
  // const assetNumber = await getAssetCode()

  let cancelDuplicated = true
  // 特定elementChange key不取消请求
  if (elementsChangeWhiteList.includes(elementsChange[0] || '')) {
    cancelDuplicated = false
  }

  return http<CheckResponse>(
    apiCode,
    {
      orderInfo,
      elementsChange,
      container,
      pageName,
      cacheStrategy,
      textCode,
      ...sourceAndChannel,
      // assetNumber,
      callFlag,
      waybillSource,
    },
    { cancelDuplicated: cancelDuplicated, toast: true },
  )
}

/**
 * @description 初始化的检查接口
 * @param query 参数
 */
// export const initProcess = async (query: processQuery) => {
//   const {
//     orderInfo,
//     elementsChange,
//     moduleStyle: container,
//     pageName,
//     cacheStrategy = null,
//     textCode,
//     callFlag,
//     waybillSource,
//   } = query
//   const sourceAndChannel = await getSourceAndChannel()
//   // const assetNumber = await getAssetCode()
//
//   let cancelDuplicated = true
//   // 特定elementChange key不取消请求
//   if (elementsChangeWhiteList.includes(elementsChange[0] || '')) {
//     cancelDuplicated = false
//   }
//
//   return http<CheckResponse>(
//     'web.order.init.singleProcess',
//     {
//       orderInfo,
//       elementsChange,
//       container,
//       pageName,
//       cacheStrategy,
//       textCode,
//       ...sourceAndChannel,
//       // assetNumber,
//       callFlag,
//       waybillSource,
//     },
//     { cancelDuplicated: cancelDuplicated, toast: true }
//   )
// }
/**
 * @description 单票提交下单接口
 * @param submitOrder
 */
export const submitOrder = async (waybillInfo: OrderInfo, options: SubmitOptions = {}) => {
  // const assetNumber = await getAssetCode()

  return http<OrderResponse>('web.order.configOrder.single.v1.orderSave', {
    waybillInfo,
    // assetNumber,
    type: OrderSceneType.SINGLE,
    ...options,
  })
}

/**
 * @description 调价审核提交下单接口
 * @param submitOrder
 */
export const submitAdjustOrder = async (waybillInfo: OrderInfo, options: SubmitOptions = {}) => {
  return http<OrderResponse>('web.order.configOrder.single.v1.adjustOrderSave', {
    waybillInfo,
    type: OrderSceneType.SINGLE,
    ...options,
  })
}

/**
 * @description 修改运单下单接口
 * @param submitOrder
 */
export const modifyOrder = async (waybillInfo: OrderInfo, options: SubmitOptions = {}) => {
  // const assetNumber = await getAssetCode()

  return http<OrderResponse>('web.order.configOrder.single.v1.modifySave', {
    waybillInfo,
    // assetNumber,
    type: OrderSceneType.SINGLE,
    ...options,
  })
}

/**
 * @description 设置用户行为
 */
export const putUserSetting = (
  key: CheckBeforeEnterType,
  value: {
    configId?: string
    versionId?: string
    themeName?: string
    preConfigId?: string
    preVersionId?: string
    preThemeName?: string
  },
) => {
  return http('web.order.setting.common.putUserSetting', { key, value })
}

/**
 * @description 获取用户的初始化设置
 */
export const getPageDefaultInfo = async () => {
  const sourceAndChannel = await getSourceAndChannel()
  return http<pageDefaultInfoType>('web.order.configOrder.query.pageDefaultInfo', { ...sourceAndChannel })
}

/**
 * @description 获取服务方式
 * @returns
 */
export const getServiceModes = (params: { orderInfo: OrderInfo; initFlag: YesOrNoString }) => {
  return http<ServiceModeResponse>('web.order.configOrder.getServiceModes', params, {
    cancelDuplicated: true,
  })
}

/**
 * @description 批量单条获取服务方式
 * @param params
 * @returns
 */
export const getBatchServiceModes = (params: { orderInfo: OrderInfo; initFlag: YesOrNoString }) => {
  return http<ServiceModeResponse>('web.order.configOrder.batchServiceModes', params, {
    cancelDuplicated: true,
  })
}

/**
 * @description 通知后端预加载数据，该接口不需要使用返回值
 * @param query
 * @returns
 */
export const preloadOrderData = async (query: PreloadQuery) => {
  const sourceAndChannel = await getSourceAndChannel()
  // const assetNumber = await getAssetCode()

  return http('web.order.configOrder.single.preLoadOrderData', {
    ...query,
    ...sourceAndChannel,
    // assetNumber,
  })
}

export const cancelAuditOrder = async (idList: string[]) => {
  return http('web.order.configOrder.audit.cancelWaybillDraft', { idList })
}

export const getTemplateList = async (params: {
  templateId?: number | string | null
  channel: string | undefined
  channelScene: any
}) => {
  return http<ITemplateDimensionResponse>('web.order.config.template.v2.list', params)
}

/**
 * @description 查询派货预约时间可选时段
 * @param waybillNumber 运单号
 */
export const queryDispatchTimeRange = async (waybillNumber: string) => {
  return http<{
    nodeId: string
    nodeName: string
    choosableTimes: IChoosableTimesItem[]
    exactTimeEarliestStartTime: string
  }>('web.order.dispatch.choseTime', { waybillNumber }, { toast: false })
}
