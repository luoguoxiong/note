import { getEnvConfig } from '../constants'

export const getSocketSource = () => {
  const { plateForm, systemType } = getEnvConfig()
  switch (plateForm) {
    case 'wxminiapp':
      return systemType === 'iOS' ? 'ios' : 'android'
    default:
      return 'wechatApplet'
  }
}

export function safeParse(data: unknown) {
  if (typeof data !== 'string') return data

  try {
    return JSON.parse(data)
  } catch {
    return data
  }
}

type LogType = 'info' | 'warn' | 'success' | 'error'

const LOG_ICON_MAP: Record<LogType, string> = {
  info: 'ℹ️',
  warn: '⚠️',
  success: '✅',
  error: '❌',
}

export function socketLog(type: LogType, msg: string, extra?: any) {
  const icon = LOG_ICON_MAP[type]
  const prefix = `${icon} [websocket:${type.toUpperCase()}]`

  switch (type) {
    case 'success':
      console.log(prefix, msg, extra ?? '')
      break
    case 'info':
      console.info(prefix, msg, extra ?? '')
      break
    case 'warn':
      console.warn(prefix, msg, extra ?? '')
      break
    case 'error':
      console.error(prefix, msg, extra ?? '')
      break
  }
}
