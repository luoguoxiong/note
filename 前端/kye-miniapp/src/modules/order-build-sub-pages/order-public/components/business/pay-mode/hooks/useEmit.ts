// 发布事件
import { useTriggerEvents } from '@order-public-sub-public/hooks/useTriggerEvents'
import { ModuleType, PayMode } from '@order-public-sub-public/constants'

const useEmit = () => {
  const { trigger } = useTriggerEvents()

  const emitName = (payMode: PayMode) => {
    trigger(ModuleType['付款方式'], { payMode: payMode })
  }

  return { emitName }
}

export default useEmit
