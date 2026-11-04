import { ref, computed, watch } from 'vue'
import { orderBatch, orderBatchWaybill } from './data'

import { AddedServiceDimension, EstimatedCostConfig, EstimatedCostDimension } from '@order-public-sub-public/types'
import { ModuleType } from '@order-public-sub-public/constants'
import router from '@order-public-sub-public/router'
import { isEmptyText } from '@order-public-sub-public/utils'
import { isEmpty } from 'lodash-es'
// import { isNull } from 'lodash-es'
import { singleFeeData } from './singleFeePolling'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
const { data, totalCount, isLoading } = singleFeeData()
// 中间状态-有权限的展示
export const showFreightLookAuthFlag = ref(false)

// 预估运费是否有权限展示 为什么要和isFreightLookAuthFlag 分开写，目的第一次进来时 没取到freightLookAuthFlag时 不展示申请入口，避免闪送
export const isAuthFlag = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['增值服务'])?.freightLookAuthFlag
})

export const showNoPrice = computed(() => {
  const waybillNumber = router.currentRoute.value.query?.waybillNumber as string
  if (waybillNumber) {
    const estimatedCost = piniaStore.globalData.estimatedCost
    const responsesMap = estimatedCost?.responsesMap
    if (responsesMap) {
      const responsesItem = responsesMap[waybillNumber]
      if (!responsesMap[waybillNumber]?.feeResponse?.totalAmount) {
        return true
      }
      console.log('responsesItem: ', responsesItem)
    }
    return false
  } else if (!isEmpty(data?.value)) {
    // 单票沒有waybillNumber的情况下，data.value可能有值，需要兼容判断一下
    return data.value?.waybillAmount === 0
  }
  if (data?.value === null || isEmptyText(totalCount.value)) {
    return true
  }
  return false
})

// 一开始时visible的话
// 先显示loading，## 接口返回完成后
// 然后没权限的话，显示****，
// 有权限的话显示金额，
// 最后在没有金额显示暂无报价

// 获取业务数据
export function useData() {
  const estimatedCostData = computed(() => piniaStore.schema.moduleDimensionData(ModuleType['预估运费']))

  const visible = computed(
    () => piniaStore.globalData.dynamicConfig('estimatedCost')?.visible || orderBatch.value || orderBatchWaybill.value,
  )

  // 电子协议是否需要滑动
  const noNeedRead = computed(() => piniaStore.schema.moduleConfigData(ModuleType['预估运费']).noNeedRead)

  // 预估运费是否有权限展示
  const isFreightLookAuthFlag = computed(() => {
    return piniaStore.schema.moduleDimensionData(ModuleType['增值服务'])?.freightLookAuthFlag === '10'
  })

  watch(
    () => isFreightLookAuthFlag.value,
    (newV) => {
      if (newV) {
        showFreightLookAuthFlag.value = true
        isLoading.value = false
      } else {
        showFreightLookAuthFlag.value = false
        isLoading.value = false
      }
    },
    {
      immediate: true,
    },
  )

  return { EstimatedCostData: estimatedCostData, isFreightLookAuthFlag, visible, noNeedRead }
}
