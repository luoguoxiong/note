import { CommonDynamicItem } from '@order-public-sub-public/apis/types'
import { ModuleType } from '@order-public-sub-public/constants'

import { BranchSelfPickUp, BranchSelfPickUpConfig, BranchSelfPickUpDimension } from '@order-public-sub-public/types'
import { computed } from 'vue'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
// 获取业务数据
export default function useData() {
  const data = computed(() => piniaStore.schema.moduleDimensionData(ModuleType.网点自提))
  const orderState = computed(() => piniaStore.order.moduleFormData(ModuleType.网点自提))

  const waybillNumber = computed(() => piniaStore.order.waybillNumber)
  const visible = computed(() => piniaStore.globalData.dynamicConfig('branchSelfPickUp')?.visible)
  const disabledToastTips = computed(() => piniaStore.globalData.dynamicConfig('branchSelfPickUp')?.disabledToastTips)
  const moduleConfig = computed(() => piniaStore.schema.moduleConfigData(ModuleType['网点自提']))

  const fieldsConfig = computed(() => (moduleConfig.value as BranchSelfPickUpConfig)?.fieldsConfig || [])

  const required = computed(() => {
    const fieldsConfig = (moduleConfig.value as BranchSelfPickUpConfig)?.fieldsConfig || []
    const targetItem = fieldsConfig.find((item) => item.name === 'selfPickupBranch')
    if (targetItem) {
      return targetItem.required || false
    }
    return false
  })

  return {
    data,
    waybillNumber,
    orderState,
    visible,
    disabledToastTips,
    required,
    // 配置端配置的数据，如果没有配置则模块不显示
    fieldsConfig,
  }
}
