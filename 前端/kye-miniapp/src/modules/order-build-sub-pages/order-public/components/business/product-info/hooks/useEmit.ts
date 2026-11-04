import { useTriggerEvents } from '@order-public-sub-public/hooks/useTriggerEvents'
import { ModuleType } from '@order-public-sub-public/constants'
import { ProductInfo } from '@order-public-sub-public/types'
import { isEmpty } from 'lodash-es'

const useEmit = () => {
  const { trigger } = useTriggerEvents()

  const emitName = (data: Partial<ProductInfo>) => {
    if (!isEmpty(data)) {
      trigger(ModuleType['货物信息'], data)
    }
  }

  return { emitName }
}

export default useEmit
