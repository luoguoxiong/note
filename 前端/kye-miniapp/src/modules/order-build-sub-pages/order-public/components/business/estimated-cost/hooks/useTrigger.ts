export const useTrigger = () => {
  const onTriggerByEstimatedCost = ({ estimateFeeTaskId }: { estimateFeeTaskId: string }) => {
    console.log('useTrigger已废弃，请存储到store出发预估运费', estimateFeeTaskId)
    // usePollingApi(1000, 3, { triggerId: estimateFeeTaskId, isTrigger: true })
  }

  return {
    onTriggerByEstimatedCost,
  }
}
