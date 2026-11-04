import { Coupon, ChangeKeys } from '@order-public-sub-public/types'

import { remoteBatchSingleCheck } from '@order-public-sub-root-pages/order-batch/hooks/useBatchSingleProcess'
import { WaybillInfoList } from '@order-public-sub-public/apis/types'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export const useCouponBatch = (waybillNumber: string, coupon: Coupon) => {
  const batchWaybillInfoList = piniaStore.order.batchWaybillInfoList
  let result = [] as WaybillInfoList[]
  if (batchWaybillInfoList && batchWaybillInfoList.length > 0) {
    result = batchWaybillInfoList?.map((item) => {
      if (item.waybillInfo?.waybillNumber === waybillNumber) {
        return {
          ...item,
          waybillInfo: { ...item.waybillInfo, coupon: { ...item.waybillInfo.coupon, ...coupon } },
        }
      }
      return item
    })
  }

  piniaStore.order.setBatchWaybillInfoList({ waybillInfoList: result as WaybillInfoList[] })
}

export const useCouponBatchProcess = async (waybillNumber: string, coupon: Coupon, elementsChange: string) => {
  useCouponBatch(waybillNumber, coupon)
  const batchWaybillInfoList = piniaStore.order.batchWaybillInfoList
  const temporaryData = batchWaybillInfoList?.filter((item) => item.waybillNumber === waybillNumber)?.[0]?.waybillInfo
  // await remoteBatchSingleCheck(elementsChange as ChangeKeys, temporaryData, undefined, [], undefined, true)
  await remoteBatchSingleCheck({ key: elementsChange as ChangeKeys, temporaryData, couponBatch: true })
}
