import { ref, watch, computed } from 'vue'

import { useValidate } from '../hooks/useValidate'
import { ProductInfo } from '@order-public-sub-public/types'
import { ModuleType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export const hotZoneStatus = ref(false)

const moduleFormData = computed(() => piniaStore.order.moduleFormData(ModuleType['货物信息']))

export const useModuleHotZone = () => {
  const { validateCollection } = useValidate()

  watch(
    moduleFormData,
    () => {
      setTimeout(async () => {
        const validate = await validateCollection()
        hotZoneStatus.value = validate.every((item) => item.passed)
        piniaStore.extend.updateHotZoneStore({
          data: { ProductInfo: hotZoneStatus.value },
        })
      }, 200)
    },
    { immediate: true, deep: true },
  )
}
