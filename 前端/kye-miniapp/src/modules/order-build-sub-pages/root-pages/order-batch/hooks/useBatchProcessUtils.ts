import { ref } from 'vue'
import { OrderInfo, CheckResponse, CheckDetail, ChangeKeys } from '@order-public-sub-public/types'
import { BatchOrderInfo, BatchProcessResultResponse } from '@order-public-sub-public/apis/batch/types'

import { OrderPageType } from '@order-public-sub-public/constants'
import { filterFiledSpace, getQueryObject } from '@order-public-sub-public/utils'
import { unifiedInfoSwitcher } from '@order-public-sub-public/components/business/batch/send-info-stand/hooks/state'
import { bathValidateToSingle } from '@order-public-sub-public/validate/utils'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export const batchProcessLoading = ref(false)

export const batchProcessTimer = ref<number | undefined>(undefined)

export const filterTempData = (data: OrderInfo | undefined) => {
  const result: Record<string, unknown> = {}
  if (data) {
    const key = [
      'kaCustomerMap',
      'goodsTime',
      'sender',
      'addedService',
      'productInfo',
      'payMode',
      'messageToDriver',
      'waybillRemark',
      'pickupInformation',
    ]
    for (const item in data) {
      if (key.includes(item)) {
        result[item] = data[item as keyof OrderInfo]
      }
    }
  }
  return result
}

// eslint-disable-next-line complexity
export const handleAssembleData = (data: BatchProcessResultResponse | undefined, key?: string) => {
  const orderPageType = piniaStore.root.getOrderPageType

  let resultData = {} as CheckResponse
  let restrictWaybillNumber = ''

  if (orderPageType === OrderPageType.批量寄) {
    let checkResultList = undefined
    if (data?.commonWaybillInfo?.checkResultList) {
      checkResultList = data?.commonWaybillInfo?.checkResultList
    } else {
      if (data?.waybillInfoList?.length) {
        for (let i = 0; i <= data.waybillInfoList.length; i++) {
          const item = data?.waybillInfoList?.[i]
          if (item?.checkResultList && item?.checkResultList?.length > 0) {
            checkResultList = item?.checkResultList
            restrictWaybillNumber = item?.waybillNumber || ''
            break
          }
        }
      }
    }

    resultData = {
      moduleDimension: data?.commonWaybillInfo?.moduleDimension,
      needBindCustomerCode: data?.commonWaybillInfo?.needBindCustomerCode,
      restrictData: data?.commonWaybillInfo?.restrictData,
      waybillInfo: data?.commonWaybillInfo?.waybillInfo,
      configDimension: data?.commonWaybillInfo?.configDimension,
    } as unknown as CheckResponse

    if (checkResultList) {
      resultData.checkResultList = checkResultList
    }

    if (data?.commonWaybillInfo?.restrictData) {
      resultData.restrictData = data?.commonWaybillInfo?.restrictData
    }
  } else {
    let currentWaybill = data?.waybillInfoList?.[0]

    const { waybillNumber = '' } = getQueryObject()

    if (waybillNumber) {
      currentWaybill = data?.waybillInfoList?.filter((item) => item.waybillNumber === waybillNumber)?.[0]
    }

    resultData = {
      checkResultList: currentWaybill?.checkResultList,
      moduleDimension: currentWaybill?.moduleDimension,
      needBindCustomerCode: currentWaybill?.needBindCustomerCode,
      waybillInfo: currentWaybill?.waybillInfo,
      configDimension: {
        dynamicConfig: currentWaybill?.dynamicConfig,
      },
      status: currentWaybill?.status,
    } as unknown as CheckResponse

    if (currentWaybill?.restrictData) {
      resultData.restrictData = currentWaybill.restrictData
    }
    restrictWaybillNumber = currentWaybill?.waybillNumber || ''
  }

  if (data && resultData.checkResultList) {
    resultData.checkResultList = bathValidateToSingle(data).checkResultList
  }

  // 特殊处理
  if (key === 'init') {
    resultData = onGetInitCheckResultData(resultData, data)
  }

  return { resultData, restrictWaybillNumber }
}

/**
 * @description 获取commonWaybillInfo
 */
export const getCommonWaybillInfo = (
  orderPageType: OrderPageType,
  key: ChangeKeys | undefined,
  temporaryData?: OrderInfo,
) => {
  if (orderPageType === OrderPageType.批量寄 && key !== 'init') {
    const batchOrderState = piniaStore.order.orderStateByType(OrderPageType.批量寄) as BatchOrderInfo

    const { commonWaybillInfo } = batchOrderState

    const { waybillInfo } = commonWaybillInfo

    const filterData = !key?.includes('waybill') ? temporaryData : waybillInfo

    return {
      unifiedInfoSwitcher: unifiedInfoSwitcher.value || false,
      waybillInfo: filterFiledSpace(filterData as OrderInfo),
    }
  } else {
    return {}
  }
}

/**
 * @description 获取elementsChange
 * @param key
 * @returns
 */
export const getElementsChange = (key?: ChangeKeys) => {
  // 特殊处理elemensChange，调价计算费用的场景
  if (key?.includes('onlyEstimateFee')) {
    return ['waybill', 'onlyEstimateFee'] as ChangeKeys[]
  }
  return [key]
}

/*
 * 处理批量初始化checkResultList的问题
 */
const onGetInitCheckResultData = (checkData: CheckResponse, data: BatchProcessResultResponse | undefined) => {
  const resultData = checkData
  if (!data?.commonWaybillInfo) {
    return resultData
  }

  resultData.checkResultList = []

  if (data?.commonWaybillInfo?.checkResultList && data?.commonWaybillInfo?.checkResultList?.length > 0) {
    resultData.checkResultList = data?.commonWaybillInfo?.checkResultList as CheckDetail[]
  } else {
    if (data?.waybillInfoList) {
      resultData.checkResultList = (data?.waybillInfoList).reduce((pev, cur) => {
        if (cur.checkResultList && cur.checkResultList?.length > 0) {
          pev.push(...cur.checkResultList)
        }
        return pev
      }, [] as CheckDetail[])
    }
  }

  if (resultData?.checkResultList?.length) {
    resultData.checkResultList = resultData.checkResultList.sort((a, b) => (b.sort || 0) - (a.sort || 0))
  }

  return resultData
}
