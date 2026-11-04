import { getAreasApplicationAndMarkers } from '../utils/application/applicationService'
import { useThrottleAsync } from './useThrottleAsync'

export const useThrottleFetchLightApp = (areaCodes: string[] = [], isNeedMarks: boolean = true) => {
  const { run: throttleRun, forceRun } = useThrottleAsync(() => {
    return getAreasApplicationAndMarkers(areaCodes, isNeedMarks)
  })

  return { throttleRun, forceRun }
}
