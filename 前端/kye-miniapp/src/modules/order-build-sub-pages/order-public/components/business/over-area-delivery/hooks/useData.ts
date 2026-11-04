import { computed } from 'vue'

import { CommonDynamicItem } from '@order-public-sub-public/apis/types'
import { ModuleType } from '@order-public-sub-public/constants'
import {
  AddedServiceDimension,
  FieldsConfig,
  OverAreaDelivery,
  OverAreaDeliveryConfig,
  OverAreaDeliveryDimension,
} from '@order-public-sub-public/types'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
// eslint-disable-next-line max-lines-per-function
export default function useData() {
  // 获取业务数据
  const data = computed(() => piniaStore.schema.moduleDimensionData(ModuleType['超区派送']))
  const orderState = computed(() => piniaStore.order.moduleFormData(ModuleType.超区派送))
  const waybillNumber = computed(() => piniaStore.order.waybillNumber)
  const visible = computed(() => piniaStore.globalData.dynamicConfig('overAreaDelivery')?.visible)
  const disabledToastTips = computed(
    () => piniaStore.globalData.dynamicConfig('overAreaDelivery')?.branchSelfVo?.disabledToastTips,
  )
  const isFreightLookAuthFlag = computed(() => {
    return piniaStore.schema.moduleDimensionData(ModuleType['增值服务'])?.freightLookAuthFlag === '10'
  })
  const moduleConfig = computed(() => piniaStore.schema.moduleConfigData(ModuleType['超区派送']))
  const fieldsConfig = computed(() => (moduleConfig.value as OverAreaDeliveryConfig)?.fieldsConfig || [])

  /**
   * 超区模块网点自提配置属性：required、visible
   */
  const branchConfig = computed(() => {
    let visible = false,
      required = false
    const targetItem = getTargetItem(fieldsConfig.value, 'selfPickupBranch')
    console.log('branchConfig targetItem', targetItem)
    if (targetItem) {
      visible = targetItem.visible
      required = targetItem.required
    }
    return {
      visible,
      required,
    }
  })

  /**
   * 超区模块送货上门配置属性：required、visible
   */
  const homeDeliveryConfig = computed(() => {
    let visible = false,
      required = false
    const targetItem = getTargetItem(fieldsConfig.value, 'homeDelivery')
    console.log('homeDeliveryConfig targetItem', targetItem)
    if (targetItem) {
      visible = targetItem.visible
      required = targetItem.required
    }
    return {
      visible,
      required,
    }
  })

  // 获取超区模块网点自提是否需要是否必填等属性
  const required = computed(() => {
    const fieldsConfig = (moduleConfig.value as OverAreaDeliveryConfig)?.fieldsConfig || []
    const targetItem = fieldsConfig.find((item) => item.name === 'selfPickupBranch')
    if (targetItem) {
      return targetItem.required || false
    }
    return false
  })

  return {
    isFreightLookAuthFlag,
    data,
    waybillNumber,
    visible,
    disabledToastTips,
    orderState,
    required,
    branchConfig,
    homeDeliveryConfig,
    // 配置端配置的数据，如果没有配置则模块不显示
    fieldsConfig,
  }
}

const getTargetItem = (fieldsConfig: FieldsConfig[], key: string) => {
  return fieldsConfig.find((item) => item.name === key)
}
