import { useBatchProcess, useBatchPreProcess } from '@order-public-sub-root-pages/order-batch/hooks/useBatchProcess'
import { Schema } from '@order-public-sub-public/types'
import { useStore } from '@order-public-sub-public/store'
import { cloneDeep, pick } from 'lodash-es'
import { useUnifiedInfoSwitcher } from '@order-public-sub-public/components/business/batch/send-info-stand/hooks/useState'
import { batchProcessLoading } from '@order-public-sub-root-pages/order-batch/hooks/useBatchProcessUtils'

import { BatchOrderInfo, BatchProcessResultResponse, WaybillInfoList } from '@order-public-sub-public/apis/batch/types'
import { computed } from 'vue'
import { ModuleType, OrderPageType } from '@order-public-sub-public/constants'
import { ConfigDimension, DynamicConfig, estimatedCostItem } from '@order-public-sub-public/apis/types'
import { initStore } from '@order-public-sub-public/utils/store'
import { GlobalState, SchemaConfig } from '@order-public-sub-public/store/types'
import { getBatchNightFeeTip } from '@order-public-sub-public/components/business/goods-time/hooks/useBatchNightFeeTip'
// const { handleInitData } = useStaticAndDynamicData()

const { setUnifiedInfoSwitcher } = useUnifiedInfoSwitcher()
const piniaStore = useStore()

/**
 * @description 保存当前配置和上一次配置
 * @param configDimension
 */
const savePreConfigAndCurrentConfig = (configDimension: ConfigDimension) => {
  piniaStore.globalData.setCurrentConfig({
    currentConfig: pick(configDimension.staticConfig, ['configId', 'versionId', 'themeName', 'currentThemeName']),
  })

  const preTempConfig = piniaStore.schema.currentSchema
  const preConfig = pick(preTempConfig, ['configId', 'versionId', 'themeName'])
  piniaStore.globalData.setPreConfig({
    preConfig: {
      preConfigId: preConfig.configId,
      preVersionId: preConfig.versionId,
      preThemeName: preConfig.themeName,
    },
  })
}

/**
 * @description 设置批量费用动态配置
 * @param costItem
 */
export const setBatchEstimatedCostConfig = (costItem?: estimatedCostItem) => {
  // 设置预估费用
  if (costItem) {
    piniaStore.globalData.setWaybillEstimatedCost({
      data: {
        ...costItem,
        responses: [],
        couponTips: '',
      },
      orderPageType: OrderPageType.批量寄,
    })
  }
}

/**
 * @description 设置初始化数据
 * @param data
 */
export const handleBatchInitData = (data?: BatchProcessResultResponse) => {
  if (data) {
    // 本次寄件信息统一按钮
    setUnifiedInfoSwitcher(data?.commonWaybillInfo?.unifiedInfoSwitcher || false)
    if (data?.commonWaybillInfo) {
      const batchOrderInfo = {
        commonWaybillInfo: data?.commonWaybillInfo || {},
        waybillInfoList: (data.waybillInfoList as unknown as WaybillInfoList[]) || [],
      }
      piniaStore.order.updateOrder({
        orderPageType: piniaStore.root.getOrderPageType,
        data: batchOrderInfo as unknown as BatchOrderInfo,
      })

      // 更新schema数据
      piniaStore.schema.updateData({
        data: data?.commonWaybillInfo.moduleDimension,
      })

      piniaStore.globalData.setBatchRestrictData({ data: data?.commonWaybillInfo.restrictData })

      // 更新checkResultList
      piniaStore.globalData.setCheckResultList({ checkResultList: data?.commonWaybillInfo.checkResultList })

      if (data?.commonWaybillInfo?.configDimension) {
        const config = data?.commonWaybillInfo?.configDimension
        savePreConfigAndCurrentConfig(config)
        // 设置动态配置
        piniaStore.globalData.setDynamicConfig({
          dynamicConfig: config?.dynamicConfig as DynamicConfig,
        })

        setBatchEstimatedCostConfig(config?.dynamicConfig?.estimatedCost)
      }
    }
    getBatchNightFeeTip()
  }
}

export const useBatchInitData = async () => {
  batchProcessLoading.value = true
  const data = await useBatchProcess({
    elementsChange: ['init'],
    orderInfoList: [],
    container: '',
    moduleStyle: '',
    pageName: 'order-batch',
  })

  handleBatchInitData(data)

  return data
}

export const useBatchPreInitData = async (taskId: string) => {
  batchProcessLoading.value = true
  const data = await useBatchPreProcess(taskId)

  handleBatchInitData(data as unknown as BatchProcessResultResponse)

  return data
}

export const updateSchemaInOrderBatchWaybill = (schema: Schema) => {
  const orderPageType = computed(() => piniaStore.root.getOrderPageType)

  const hideModules = [
    ModuleType.寄方信息,
    ModuleType.收方信息,
    ModuleType.下单公司,
    ModuleType.Banner,
    ModuleType.需返程,
    ModuleType.货好时间,
    ModuleType.取货资料,
    ModuleType.给司机捎句话,
  ]

  hideModules.forEach((module) =>
    piniaStore.schema.updateModuleConfigByType({
      type: module,
      data: {
        visible: false,
        config: {
          visible: false,
        },
      },
      orderPageType: orderPageType.value,
    }),
  )

  schema.module[ModuleType.批量单票收件地址].visible = true
}

// 初始化批量改单条的store数据
export const initBatchUpdataOneStore = (toPageType: OrderPageType, waybillNumber: string) => {
  initStore(OrderPageType.批量寄单票)
  // 更新globalData
  const globalData = piniaStore.globalData.getGlobalData as GlobalState
  globalData.scrollTop = 0
  piniaStore.globalData.setGlobalData({ data: cloneDeep(globalData), orderPageType: toPageType })

  // 更新Extend
  const extendData = piniaStore.extend.getExtendData
  piniaStore.extend.setExtendData({
    data: extendData,
    orderPageType: toPageType,
  })

  // 更新Schema
  const schemaData = piniaStore.schema.currentSchema as SchemaConfig
  piniaStore.schema.updateSchema({
    staticConfig: { configId: '', schema: cloneDeep(schemaData.schema) },
    orderPageType: toPageType,
  })

  // TODO: 这里更新完增值费用,进去后被清掉了(type: ModuleType['预估费用']的地方均已排查,猜测估计是initStore影响)!
  setTimeout(() => {
    // 更新增值服务费用
    const estimatedCost = piniaStore.globalData.estimatedCost
    if (estimatedCost?.responses?.length) {
      const resultData = estimatedCost.responses.find((item) => item?.waybillNumber === waybillNumber)
      if (!resultData) return

      const resData = {
        ...resultData?.feeResponse,
        estimateFeeTip: resultData?.estimateFeeTip || '',
        noEstimateFeeText: resultData?.noEstimateFeeText || '',
      }
      // 更新预估运费业务组件维度数据 - 增值服务里面有用到response
      piniaStore.schema.updateModuleDimensionByType({
        type: ModuleType['预估费用'],
        data: {
          response: resData,
        },
        orderPageType: toPageType,
      })
    }
  }, 300)
}
