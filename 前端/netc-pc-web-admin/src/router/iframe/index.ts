import { ExtendedRouteRecordRaw } from '../types'
import { toolsRoutes } from './tools'
import { defaultConfigRoutes } from './order'
import { orderUtilsRoutes } from './order-utils'
import { biRoutes } from './bi'
import { markettingRoutes } from './marketting'
import { vtsRoutes } from './vts'
import { globalRoutes } from './global'
import { authRoutes } from './auth'
import { settlementRoutes } from './settlement'
import { userCenterRoutes } from './user'
import { settingRoutes } from './setting'
import { waybillRoutes } from './waybill'
import { iframeCodeRoutes } from './code'
import { couponRoutes } from './coupon'
import { extraRoutes } from './extra'

export const iframeRouters: Array<ExtendedRouteRecordRaw> = [
  ...toolsRoutes,
  ...defaultConfigRoutes,
  ...orderUtilsRoutes,
  ...biRoutes,
  ...markettingRoutes,
  ...vtsRoutes,
  ...globalRoutes,
  ...authRoutes,
  ...settlementRoutes,
  ...userCenterRoutes,
  ...settingRoutes,
  ...waybillRoutes,
  ...iframeCodeRoutes,
  ...couponRoutes,
  ...extraRoutes,
]
