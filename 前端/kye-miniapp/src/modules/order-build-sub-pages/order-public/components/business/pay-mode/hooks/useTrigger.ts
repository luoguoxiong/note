export const useTrigger = () => {
  // 处理来自寄方的变化
  const onTriggerByPayMode = () => {
    // 取数据从store取
    console.log(`接收到来自寄方的变化的变化`)
  }

  return {
    onTriggerByPayMode,
  }
}
