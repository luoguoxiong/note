import { BatchOrderInfo } from '@order-public-sub-public/apis/types'
import { BATCH_MAX_LENGTH } from '@order-public-sub-public/constants'

import { CheckResponse, OrderInfo } from '@order-public-sub-public/types/waybill'
import { filterFiledSpace } from '@order-public-sub-public/utils'
import useEffect from '@order-public-sub-public/validate'
import { remoteBatchCheck } from '@order-public-sub-root-pages/order-batch/hooks/useBatchProcess'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const { remoteCheckDataHandOut } = useEffect()

/**
 * @description 新增收方
 * @param list
 * @returns
 */
export const addReceive = async (list: OrderInfo[]) => {
  const batchWaybillInfoList = piniaStore.order.batchWaybillInfoList || []
  // 批量最多十条运单
  if (batchWaybillInfoList?.length >= BATCH_MAX_LENGTH) {
    return
  }
  const storeFormData = piniaStore.order.orderState as unknown as BatchOrderInfo
  // 处理手机号空格
  const filterFormData = filterFiledSpace(storeFormData.commonWaybillInfo.waybillInfo)

  // 批量寄逻辑处理
  const resultData = await remoteBatchCheck('init', filterFormData, undefined, list)
  return remoteCheckDataHandOut(resultData as CheckResponse)
}
