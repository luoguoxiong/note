// 发布事件
import { useTriggerEvents } from '@order-public-sub-public/hooks/useTriggerEvents'
import { ModuleType } from '@order-public-sub-public/constants'

type WholeModule = {
  fieldKey: string
  value: string
}

const useEmit = () => {
  const { trigger } = useTriggerEvents()

  const emitName = (fieldKey: string, value: any) => {
    const eventData: Partial<WholeModule> = {}
    eventData[fieldKey as keyof Partial<WholeModule>] = value

    trigger(ModuleType['寄方信息'], eventData)
  }

  return { emitName }
}

export default useEmit
