import { useTriggerEvents } from '@order-public-sub-public/hooks/useTriggerEvents'
import { ModuleType } from '@order-public-sub-public/constants'
import { AddedService } from '@order-public-sub-public/types'
import { isEmpty } from 'lodash-es'

type params = Partial<AddedService> & { estimateFeeTaskId?: string }

const useEmit = () => {
  const { trigger } = useTriggerEvents()

  const emitName = (data: params) => {
    if (!isEmpty(data)) {
      trigger(ModuleType['增值服务'], data)
    }
  }

  return { emitName }
}

export default useEmit
