import { isWxMiniApp, isAliMiniApp, isAmapMiniApp, isH5Env } from '@/public/utils'
import { AdvertismentConfig, AdvertismentConfigIn, AdvertismentType, PageName } from './type'
import alipayConfig from './alipay'
import wxConfig from './wx'
import amapConfig from './amap'
import fsConfig from './fs'

export const getConfig = (pageName: PageName): AdvertismentConfigIn => {
  let config = {}

  if (isWxMiniApp) {
    config = wxConfig
  }

  if (isAliMiniApp) {
    config = alipayConfig
  }

  if (isAmapMiniApp) {
    config = amapConfig
  }

  if (isH5Env) {
    config = fsConfig
  }

  return config?.[pageName] || {}
}

export { AdvertismentConfig, AdvertismentType, PageName }
