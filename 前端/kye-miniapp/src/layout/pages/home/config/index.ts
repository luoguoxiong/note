import { isWxMiniApp, isAliMiniApp, isAmapMiniApp } from '@/public/utils'
import { config as alipayConfig } from './alipay'
import { config as wxConfig } from './wx'
import { config as amapConfig } from './gd'

const getConfig = () => {
  let config = wxConfig

  if (isWxMiniApp) {
    config = wxConfig
  }

  if (isAliMiniApp) {
    config = alipayConfig
  }

  if (isAmapMiniApp) {
    config = amapConfig
  }

  return config
}

export const config = getConfig()
