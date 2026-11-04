import { getEnvConfig } from '@/public/config'
import { isWxAppIosEnv, isWxAppEnv, isH5FSEnv } from '@/public/utils'
import dayjs from 'dayjs'

/**
 * 获取平台 source 标识（对齐 H5 native.getSource()）
 * 用于单票下单预加载接口 web.order.init.quickOrder.singlePageV2 等场景
 */
export function getPlatformSource() {
  const env = getEnvConfig()

  if (isWxAppIosEnv) return 'ios'
  else if (isWxAppEnv) return 'android'
  else if (env.plateForm === 'wxmini') return 'miniprogram'
  else if (env.plateForm === 'amap') return 'amap'
  else if (env.plateForm === 'alipay') return 'aliPay'
  else if (isH5FSEnv) return 'feishu'
  return 'miniprogram'
}

interface GoodsTimeConfig {
  interval: number
  intervalMinuteOffset?: number
}

/**
 * 计算最近可用的货好时间（对齐 goods-time 组件初始化逻辑）
 * 根据当前时间 + 偏移量，向上取整到最近的时间间隔
 */
export function getCurrentTimeOption(config: GoodsTimeConfig): string {
  const { interval, intervalMinuteOffset = 0 } = config
  const targetTime = dayjs().add(intervalMinuteOffset, 'minute')
  const minute = targetTime.minute()
  const nextMinute = Math.ceil(minute / interval) * interval
  return targetTime.startOf('hour').add(nextMinute, 'minute').format('YYYY-MM-DD HH:mm')
}
