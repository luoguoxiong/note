import { ref, watch, computed } from 'vue'

import { useValidate } from '../hooks/useValidate'
import { OverAreaDelivery } from '@order-public-sub-public/types'
import { ModuleType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export const hotZoneStatus = ref(false)

const moduleFormData = computed(() => piniaStore.order.moduleFormData(ModuleType['超区派送']))

export const useModuleHotZone = () => {
  const { validateCollection } = useValidate()

  watch(
    moduleFormData,
    async () => {
      const validate = await validateCollection()
      hotZoneStatus.value = validate.every((item) => item.passed)
      piniaStore.extend.updateHotZoneStore({
        data: { OverAreaDelivery: hotZoneStatus.value },
      })
    },
    { immediate: true, deep: true },
  )
}
