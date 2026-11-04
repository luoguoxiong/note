/**
 * 向主应用发送路由跳转消息。
 *
 * @param {Object} data - 需要发送的路由跳转数据。
 */
export const useBaseRouterPush = (data: any) => {
  window.parent.postMessage(
    {
      from: 'COMMON',
      type: 'routerPush',
      data: data,
    },
    '*'
  )
}

/**
 * 向主应用发送指定类型的消息。
 *
 * @param {string} targetService - 要发送消息的目标服务的名称。
 * @param {string} messageType - 消息类型。
 * @param {Object} data - 需要发送的数据。
 */
export const sendMessageToBase = (targetService: string, messageType: string, data: any) => {
  window.parent.postMessage(
    {
      from: targetService,
      type: messageType,
      data: data,
    },
    '*'
  )
}

/**
 * 捕获来自其他窗口的postMessage消息。
 *
 * @param {function} listner - 处理接收到的消息的回调函数。
 * @param {string} [target] - 可选的目标消息发送者，如果提供，只有匹配该发送者的消息才会被处理。
 * @returns {function} - 用于移除消息监听器的函数。
 */
export const catchPostMessage = (listner: (event: MessageEvent) => void, target?: string) => {
  const recieveMsg = (event: MessageEvent) => {
    if (target && event?.data?.from === target) {
      listner(event)
    }
  }
  window.addEventListener('message', recieveMsg)
  return function () {
    window.removeEventListener('message', recieveMsg)
  }
}

/**
 * 创建一个函数用于向主应用发送消息。
 *
 * @param {string} targetService - 要发送消息的目标服务的名称。
 * @returns {Function} - 一个接受消息类型和数据，并向基础服务发送消息的函数。
 */
export const createTargetSendMsgToBase = (targetService: string) => {
  return function (messageType: string, data: any) {
    sendMessageToBase(targetService, messageType, data)
  }
}

/**
 * 捕获路由变化事件并执行相应的回调函数。
 *
 * @param {Object} routeGuards - 包含路由守卫函数的对象。
 * @param {Function} routeGuards.beforeRouteEnter - 在进入路由之前调用的函数。
 * @param {Function} routeGuards.beforeRouteLeave - 在离开路由之前调用的函数。
 * @param {string} targetService - 要监听其消息的目标服务。
 * @returns {Function} - 用于移除消息监听器的函数。
 */
export const catchRouterChange = (
  {
    beforeRouteEnter,
    beforeRouteLeave,
  }: { beforeRouteEnter?: (data: any) => void; beforeRouteLeave?: (data: any) => void },
  targetService: string
) => {
  return catchPostMessage((event) => {
    switch (event.data.type) {
      case 'beforeRouteEnter':
        beforeRouteEnter && beforeRouteEnter(event.data.data)
        break
      case 'beforeRouteLeave':
        beforeRouteLeave && beforeRouteLeave(event.data.data)
        break
      default:
        break
    }
  }, targetService)
}
