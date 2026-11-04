import { useExposureReport } from '@/public/hooks/useExposureReport'

import { getEventParams } from '@order-public-sub-public/reportUmp/util'
export const useOrderExposureReport = (ids: string[]) => {
  const publicParams = getEventParams()
  return useExposureReport(ids, publicParams)
}
