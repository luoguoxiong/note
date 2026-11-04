import { useApplication } from '@/public/utils/application/useApplication'
import { ref } from 'vue'
import { useCommonDataHook } from '@/public/storage/hooks/useCommonHook'

export const useGetAreaLightApp = (pla: string) => {
  const { navigateApplication, getApplicationInfoByAreaCode, getApplicationAreaNameByAreaCode } = useApplication()

  const lightApps = ref(getApplicationInfoByAreaCode(pla) || [])

  const areaName = ref(getApplicationAreaNameByAreaCode(pla) || '')

  const { onApplicationChange } = useCommonDataHook()

  onApplicationChange(() => {
    lightApps.value = getApplicationInfoByAreaCode(pla) || []
    areaName.value = getApplicationAreaNameByAreaCode(pla) || ''
  })

  return { navigateApplication, lightApps, areaName }
}
