import { getOverLengthAndWeightFee } from '@order-public-sub-public/apis/product-info/index'
import { OverLengthAndWeightFee } from '@order-public-sub-public/apis/product-info/types'
import { reactive, computed } from 'vue'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

// 类型
import { GoodsSize, PickUp, Delivery, ServiceModeType, PayModeType, AddedService } from '@order-public-sub-public/types'
import { ModuleType, OrderPageType } from '@order-public-sub-public/constants'
import { volumeSize } from './state'
import { getQueryObject } from '@order-public-sub-public/utils'

export const overLengthAndWeightFee: OverLengthAndWeightFee = reactive({
  agent: null,
  overLengthTip: [],
  overWeightTips: '',
  goodsWeightDesc: '',
  billableWeight: {
    estimateWeight: '',
    grossWeightTips: '',
  },
  goodsTimeOptimiTips: '',
})

export const estimateWeight = computed(() => {
  return overLengthAndWeightFee?.billableWeight?.estimateWeight
})

export const grossWeightTips = computed(() => {
  return overLengthAndWeightFee?.billableWeight?.grossWeightTips
})

export const isShowGrossWeightTips = computed(() => {
  return Boolean(grossWeightTips.value)
})

const sendAddress = computed(() => {
  const { province, city, county, detailAddress } = piniaStore.order.moduleFormData(ModuleType['寄方信息']) || {}
  return `${province}${city}${county}${detailAddress}`
})

/* eslint-disable max-params */
export const useOverLengthAndWeight = async (count: number, weight: number, overLengths: GoodsSize[]) => {
  const overLengthsValidateList =
    overLengths?.filter(
      (item) => Number(item.width) && Number(item.count) && Number(item.height) && Number(item.length),
    ) || []
  const { province, city, county, detailAddress } = piniaStore.order.moduleFormData(ModuleType['收方信息']) || {}
  const receiverAddress = `${province}${city}${county}${detailAddress}`
  const serviceMode = piniaStore.order.moduleFormData(ModuleType['服务方式'])?.serviceMode
  const { payMode, paymentCustomerCode } = piniaStore.order.moduleFormData(ModuleType.付款方式) || {}

  // 获取增值服务木架方式
  const { woodenFrame } = piniaStore.order.moduleFormData(ModuleType['增值服务']) || {}

  // 批量寄在本次寄件信息统一中不调用超长超重接口
  const orderPageType = piniaStore.root.getOrderPageType

  if (orderPageType === OrderPageType.批量寄) {
    return
  }

  if (payMode) {
    const processPromise = piniaStore.globalData.initDataPromise
    if (processPromise) {
      await processPromise
    }
    const { waybillNumber = '' } = getQueryObject()
    const storeWaybillNumber = piniaStore.order.waybillNumber
    const { data } = await getOverLengthAndWeightFee({
      waybillNumber: waybillNumber || storeWaybillNumber || '',
      payMode: payMode,
      serviceMode: serviceMode,
      receiverAddress: receiverAddress,
      customerCode: paymentCustomerCode,
      sendAddress: sendAddress.value,
      volumeSize: volumeSize.value,
      overWeight: { count: count?.toString() || '0', weight: weight?.toString() || '0' },
      woodenFrame: woodenFrame ? Number(woodenFrame) : undefined,
      ...(overLengthsValidateList.length > 0 ? { overLengths: overLengthsValidateList } : {}),
    })
    if (!data) {
      return
    }
    const { agent, overWeightTips, goodsWeightDesc, overLengthTip, billableWeight, goodsTimeOptimiTips } = data
    overLengthAndWeightFee.agent = agent
    overLengthAndWeightFee.overWeightTips = overWeightTips
    overLengthAndWeightFee.goodsWeightDesc = goodsWeightDesc
    overLengthAndWeightFee.overLengthTip = overLengthTip
    overLengthAndWeightFee.billableWeight = billableWeight
    overLengthAndWeightFee.goodsTimeOptimiTips = goodsTimeOptimiTips
  }
}

export const resetOverLengthAndWeightFee = () => {
  overLengthAndWeightFee.agent = null
  overLengthAndWeightFee.overLengthTip = []
  overLengthAndWeightFee.overWeightTips = ''
  overLengthAndWeightFee.billableWeight = {
    estimateWeight: '',
    grossWeightTips: '',
  }
  overLengthAndWeightFee.goodsTimeOptimiTips = ''
}
