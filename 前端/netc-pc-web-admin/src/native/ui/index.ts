import { ElMessage, type MessageParams } from 'element-plus'

export type MessageType = 'success' | 'warning' | 'info' | 'error'

export interface ShowMessageOptions extends Omit<MessageParams, 'type'> {
  /** 消息类型 */
  type?: MessageType
  /** 消息内容 */
  message: string
}

/**
 * 全局消息提示
 */
export const showMessage = (data: ShowMessageOptions | string) => {
  const options: ShowMessageOptions =
    typeof data === 'string'
      ? {
          message: data,
          type: 'info',
        }
      : {
          type: 'info',
          ...data,
        }

  const { type, ...params } = options

  switch (type) {
    case 'success':
      ElMessage.success(params)
      break

    case 'warning':
      ElMessage.warning(params)
      break

    case 'error':
      ElMessage.error(params)
      break

    case 'info':
    default:
      ElMessage.info(params)
      break
  }
}
