// 发布事件
import { useTriggerEvents } from '@order-public-sub-public/hooks/useTriggerEvents'
import { ModuleType } from '@order-public-sub-public/constants'

const useEmit = () => {
  const { trigger } = useTriggerEvents()

  const emitServiceModel = (value: string) => {
    trigger(ModuleType['服务方式'], { serviceMode: value })
  }

  return { emitServiceModel }
}

export default useEmit
