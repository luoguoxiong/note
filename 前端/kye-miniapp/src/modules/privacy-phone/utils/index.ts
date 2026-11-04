import { getEnvConfig } from '@/public/constants'
import { isH5FSEnv, isWxAppEnv, isWxAppIosEnv } from '@/public/utils'

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

export function phoneDisplayFormatter(phone?: string) {
  if (phone && /(\d{3})([\d*]{4})(\d{4})/.test(phone)) {
    return phone.replace(/(\d{3})([\d*]{4})(\d{4})/, '$1 $2 $3')
  }
  return phone
}
