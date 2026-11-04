import { Ref, computed, ref } from 'vue'

import { BranchSelfPickUp, BranchSelfPickUpDimension } from '@order-public-sub-public/types'
import { ModuleType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export const modalShow = ref(false)
export const showBranchModal = () => {
  modalShow.value = true
}
export const hiddenBranchModal = () => {
  modalShow.value = false
}

export const options = computed(() => {
  // 从order store上取到最新的设置默认值
  const data = computed(() => piniaStore.schema.moduleDimensionData(ModuleType.网点自提))
  const orderData = piniaStore.order.moduleFormData('BranchSelfPickUp')
  return (
    data.value?.selfPickBranchesList?.map((item) => {
      return {
        label: item.branchName,
        id: item.branchId,
        checked: item.branchId === orderData?.selfPickBranchId ? ref(true) : ref(false),
      }
    }) || []
  )
})

// 清空选项选中状态
export const resetOptionsStatus = () => {
  options.value?.forEach((option: { checked: Ref<boolean> }) => {
    option.checked.value = false
  })
}

export const branchSelfPickUpStore = computed(() => piniaStore.order.moduleFormData(ModuleType.网点自提)) // store order的数据

// 入口文案
export const showValue = computed(() => {
  const { selfPickBranchName = '', selfPickupMobile } = branchSelfPickUpStore.value || {}
  if (selfPickBranchName || selfPickupMobile) {
    return selfPickBranchName && selfPickupMobile
      ? `${selfPickBranchName}/${selfPickupMobile}`
      : selfPickBranchName || selfPickupMobile
  }
  return ''
})
export const phoneData = ref('')
