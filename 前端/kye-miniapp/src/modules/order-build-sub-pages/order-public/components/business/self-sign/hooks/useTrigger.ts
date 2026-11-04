export const useTrigger = () => {
  // 处理来自寄方的变化
  const onTriggerBySelfSign = () => {
    // 取数据从store取
    console.log(`本人签收：接收到了来自XXX的变化`)
  }

  return {
    onTriggerBySelfSign,
  }
}
