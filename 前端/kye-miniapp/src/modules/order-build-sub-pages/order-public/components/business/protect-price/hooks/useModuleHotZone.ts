import { ref, watch, computed } from 'vue'

import { useValidate } from '../hooks/useValidate'
import { ProtectPrice } from '@order-public-sub-public/types'
import { ModuleType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export const hotZoneStatus = ref(false)

const moduleFormData = computed(() => piniaStore.order.moduleFormData(ModuleType['物品保价']))

export const useModuleHotZone = () => {
  const { validateCollection } = useValidate()

  watch(
    moduleFormData,
    async () => {
      const validate = await validateCollection()
      hotZoneStatus.value = validate.every((item) => item.passed)
      piniaStore.extend.updateHotZoneStore({
        data: { ProtectPrice: hotZoneStatus.value },
      })
    },
    { immediate: true, deep: true },
  )
}
