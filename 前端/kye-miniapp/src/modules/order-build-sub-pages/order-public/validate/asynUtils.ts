//弹框点击结果上报
import { OrderInfo } from '@order-public-sub-public/types'
import { reportDialogResult } from '@order-public-sub-public/apis'
import { getChannel, getSource } from '@order-public-sub-public/configs'
import { cloneDeep } from 'lodash-es'

import { useActualWeight, useGoodsType } from '@order-public-sub-public/components/business/product-info/hooks/useState'
import { OrderPageType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const dangerReportOrderInfo = () => {
  let orderInfo
  if (piniaStore.root.getOrderPageType !== OrderPageType.批量寄) {
    orderInfo = cloneDeep(piniaStore.order.orderStateByType(piniaStore.root.getOrderPageType)) as OrderInfo
  }
  return orderInfo
}

//获取危险品管控的参数
export const dangerReportParams = () => {
  const orderInfo = dangerReportOrderInfo()
  const { actualWeight } = useActualWeight()
  const { goodsType } = useGoodsType()
  const productInfo = {
    actualWeight: actualWeight.value,
    goodsType: goodsType.value,
  }
  const waybillInfos = [
    {
      waybillNumber: orderInfo?.waybillNumber,
      productInfo: productInfo || orderInfo?.productInfo,
    },
  ]
  return waybillInfos
}
interface ReportDialogResultType {
  preLimitType: string
  result: string
  params?: Record<string, any>
  addWaybillInfos?: boolean
  addWaybillNumber?: boolean
}
export const reportDialogResultHandle = async (data: ReportDialogResultType) => {
  const { preLimitType, result, params, addWaybillInfos = true, addWaybillNumber = false } = data
  try {
    const bizSource = params?.bizSource || 'checkResultList'
    delete params?.bizSource
    const source = await getSource()
    const bizData = {
      type: preLimitType,
      confirm: result,
    }
    if (addWaybillNumber) {
      const orderInfo = dangerReportOrderInfo()
      Reflect.set(bizData, 'waybillNumber', orderInfo?.waybillNumber)
    }
    if (addWaybillInfos) {
      // 危险品管控的参数
      Reflect.set(bizData, 'waybillInfos', dangerReportParams())
    }
    Object.assign(bizData, params)
    return await reportDialogResult({
      bizSource,
      source,
      channel: getChannel(),
      bizData,
    })
  } catch (e) {
    console.error(e)
    return Promise.reject(e)
  }
}
