// 发布事件
import { useTriggerEvents } from '@order-public-sub-public/hooks/useTriggerEvents'
import { ModuleType } from '@order-public-sub-public/constants'
import { GoodsTime } from '@order-public-sub-public/types'

const useEmit = () => {
  const { trigger } = useTriggerEvents()

  const emitName = (data: GoodsTime) => {
    trigger(ModuleType['货好时间'], { goodsTime: data.goodsTime, goodsTimeFlag: data.goodsTimeFlag })
  }

  return { emitName }
}

export default useEmit
