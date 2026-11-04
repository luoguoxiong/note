import useValidate from './useValidate'

import useEffect from '@order-public-sub-public/validate'
import { ModuleType } from '@order-public-sub-public/constants'

import { effectBubble } from '@order-public-sub-public/validate/effect/effectBubble'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const useServiceMode = () => {
  // 服务方式校验
  const { validateField } = useValidate()

  // 副作用
  const { remoteCheck } = useEffect()

  //更新服务方式
  const updateServiceMode = async (
    value: string,
    estimateArriveTime?: { arriveTime: string; prescriptionSource: string },
  ) => {
    piniaStore.order.updateOrderByType({
      type: ModuleType['服务方式'],
      data: {
        serviceMode: value,
        estimateArriveTime,
      },
    })
    if (value) {
      const isServiceModeValid = await validateField('serviceMode')
      await effectBubble([isServiceModeValid])
    }
  }
  //服务方式变更
  const serviceModeChange = async (
    value: string,
    estimateArriveTime: { arriveTime: string; prescriptionSource: string },
  ) => {
    await updateServiceMode(value, estimateArriveTime)
    try {
      // 触发副作用
      // await effectBubble([isServiceModeValid])

      // 远程校验,定时器是为了动态效果
      if (value) {
        setTimeout(async () => {
          await remoteCheck('serviceMode.serviceMode', { serviceMode: { serviceMode: value, estimateArriveTime } })
        }, 300)
      }
    } catch (error) {
      console.log('error', error)
    }
  }

  return {
    serviceModeChange,
    updateServiceMode,
  }
}
export default useServiceMode
