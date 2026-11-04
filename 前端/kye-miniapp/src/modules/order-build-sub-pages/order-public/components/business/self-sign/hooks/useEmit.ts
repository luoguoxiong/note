// 发布事件
import { useTriggerEvents } from '@order-public-sub-public/hooks/useTriggerEvents'
import { ModuleType } from '@order-public-sub-public/constants'

const useEmit = () => {
  const { trigger } = useTriggerEvents()
  const emitName = () => {
    console.log('emitName')
    trigger(ModuleType['本人签收'], {})
  }

  return { emitName }
}

export default useEmit
