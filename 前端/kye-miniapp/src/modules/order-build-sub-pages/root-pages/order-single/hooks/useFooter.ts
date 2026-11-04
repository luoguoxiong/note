import { ModuleType, OrderPageType } from '@order-public-sub-public/constants'
import { computed } from 'vue'
import { ServiceModeType } from '@order-public-sub-public/types'
import { useStore } from '@order-public-sub-public/store'
import { service } from '@order-public-sub-public/components/business/service-model/components/service-list/type'
const piniaStore = useStore()
const orderPageType = computed(() => piniaStore.root.getOrderPageType)
// 获取服务方式数据
const serviceMode = computed(() => {
  return piniaStore.schema.moduleDimensionData(ModuleType['服务方式']) || {}
})
// 获取服务方式列表
const serviceTypes = computed<service[]>(() => {
  const { serviceTypes = [] } = serviceMode.value
  return serviceTypes || []
})
// 选择的服务方式
const serviceModeValue = computed(() => {
  const { serviceMode } = piniaStore.order.moduleFormData(ModuleType['服务方式']) || {}
  return serviceMode || ''
})
// 服务方式是否都是双倍积分的
const allDoubleIntegral = computed(() => {
  const { allDoubleIntegral = false } = serviceMode.value
  return allDoubleIntegral
})
// 双倍积分标识展示
export const doubleIntegralFlag = computed(() => {
  if (orderPageType.value !== OrderPageType.单票) return false
  let flag = false
  if (serviceTypes.value.length) {
    for (let index = 0; index < serviceTypes.value.length; index++) {
      const element = serviceTypes.value[index]
      // 选中的是否是双倍积分服务方式
      if (serviceModeValue.value === element.serviceTypeCode) {
        flag = element.doubleIntegral
      }
      if (flag) break
    }
  }
  return allDoubleIntegral.value || flag
})
