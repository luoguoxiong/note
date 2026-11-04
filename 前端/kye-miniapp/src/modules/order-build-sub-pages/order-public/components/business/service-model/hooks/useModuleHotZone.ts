import { ref, watch, computed } from 'vue'

import useValidate from '../hooks/useValidate'
import { ServiceModeType } from '@order-public-sub-public/types'
import { ModuleType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export const hotZoneStatus = ref(false)

export const moduleFormDataService = computed(() => piniaStore.order.moduleFormData(ModuleType['服务方式']))

export const useModuleHotZone = () => {
  const { validateCollection } = useValidate()

  watch(
    moduleFormDataService,
    async () => {
      const validate = await validateCollection()
      hotZoneStatus.value = validate.every((item) => item.passed)
      piniaStore.extend.updateHotZoneStore({
        data: { ServiceMode: hotZoneStatus.value },
      })
    },
    { immediate: true, deep: true },
  )
}
