import { batchWaybillBubbleIndex } from './state'

export const useBatchWaybillBubbleIndex = () => {
  const setBatchWaybillBubbleIndex = (value: number) => {
    batchWaybillBubbleIndex.value = value
  }

  return { batchWaybillBubbleIndex, setBatchWaybillBubbleIndex }
}
