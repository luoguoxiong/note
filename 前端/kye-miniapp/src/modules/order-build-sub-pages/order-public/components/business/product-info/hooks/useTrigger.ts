import { count, actualWeight, preWaybillGoodsSizeList } from './state'
import { useOverLengthAndWeight } from './useOverLengthAndWeigth'

export const useTrigger = () => {
  const onTriggerByProductInfo = async () => {
    await useOverLengthAndWeight(
      count.value,
      actualWeight.value,
      preWaybillGoodsSizeList.value.map((item, index) => ({ ...item, index }))
    )
  }

  return {
    onTriggerByProductInfo,
  }
}
