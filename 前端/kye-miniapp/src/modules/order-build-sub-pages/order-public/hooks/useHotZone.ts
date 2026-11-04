import { computed } from 'vue'
import { hotZoneDepend, HotZoneDependDesc } from '@order-public-sub-public/configs/hotZoneDepend'
import { ModuleType } from '@order-public-sub-public/constants'

import { localCheckResult } from '@order-public-sub-public/types'
import useEffect from '@order-public-sub-public/validate'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export const useHotZone = (componentName: ModuleType) => {
  const hotZoneData = computed(() => hotZoneDepend.value[componentName] as HotZoneDependDesc[])

  const hotZoneStore = computed(() => piniaStore.extend.hotZoneStore)

  const { effectBubble } = useEffect()

  const validateCallback = () => {
    if (hotZoneData.value && hotZoneData.value.length > 0) {
      const resultList: Promise<localCheckResult[]>[] = []
      hotZoneData.value.forEach(async (item) => {
        resultList.push(
          (async (item) => {
            const { dependComponents, dependCallback } = item
            const result: localCheckResult[] = await dependCallback()
            // 判断是否全部校验通过
            const validateResult = result.filter((secItem: localCheckResult) => !secItem.passed)
            if (validateResult.length <= 0) {
              // 校验通过
              piniaStore.extend.updateHotZoneStore({
                data: { [dependComponents]: true },
              })
            }
            return result
          })(item),
        )
      })

      Promise.all(resultList).then(async (res) => {
        const validateValue = res.flat().filter((item) => !item.passed)
        if (validateValue && validateValue.length > 0) {
          try {
            await effectBubble(validateValue)
          } catch (error) {
            console.error(error)
          }
        }
      })
    }
  }

  const hotZoneVisible = computed(() => {
    let checkResult = true
    if (hotZoneStore.value && hotZoneData.value && hotZoneData.value.length > 0) {
      const hotZoneStatus: boolean[] = []
      hotZoneData.value.forEach((item) => {
        const key = item.dependComponents
        hotZoneStatus.push(hotZoneStore.value[key] as boolean)
      })

      // 所有前置模块校验都通过了
      checkResult = hotZoneStatus.every((item) => item)
    }

    // 如果所有校验都通过了,则不显示热区遮罩
    return !checkResult
  })

  return {
    validateCallback,
    hotZoneVisible,
    hotZoneData,
    hotZoneStore,
  }
}
