import { getQueryObject } from '@order-public-sub-public/utils'

export const sourceMap = {
  tms: 'TMS运单',
  web: '互联网',
  ccms: '在线客服',
  crm: 'CRM',
} as {
  [key: string]: string
}

export const sceneMap = {
  goodTimeconfirm: '查件-货好时间变更确认',
  driverEvaluation: '广告中心-司机评价',
  coupon: 'CRM-优惠券',
  routerShare: '快件查询-路由分享',
  kuaShengRouterShare: '快件查询-路由分享（跨声）',
  updateGoodTime: '在线客服-更改货好时间',
  updateDeliveryTime: '在线客服-更改派送时间',
  pickup: '在线客服-网点自提',
  updatePickup: '在线客服-更改收件人信息',
  tmsUpdateDeliveryTime: '跟单管理-派送时间变更确认',
  address: '电子运单-地址修正',
  goodTimeConfirm: '下单管理-货好时间变更确认',
  kfViewRoute: '在线客服-查看运单路由页',
  kfViewDetail: '在线客服-查看运单详情页',
  kfUpdateDelivery: '在线客服-修改寄件人',
  kfUpdatePickup: '在线客服-修改收件人',
  kfUpdateGoodTime: '在线客服-修改货好',
  kfUpdateDeliveryTime: '在线客服-更改派送',
  kfUpdateTimingTime: '在线客服-定时派送',
  kfNetworkPickup: '在线客服-网点自提',
  kfUpdatePay: '在线客服-支付开票',
} as {
  [key: string]: string
}

export const onGetExternalLinkQuery = () => {
  const { sourcePage, sourceAction } = getQueryObject()

  return {
    channel_source: sourceMap[sourcePage] || '',
    scene_source: sceneMap[sourceAction] || '',
  }
}

// 埋点触发执行固定函数
export const onExternalExecuteFn = (fns: any) => {
  if (!fns) return
  const { sourceAction } = getQueryObject()
  try {
    if (!sourceAction) return
    const fn = fns[sourceAction]
    fn && fn()
  } catch (error) {
    console.log('onExternalExecuteFn:', error)
  }
}

// 判断是否是在线客服过来修改运单
export const isCCmsUpdateWaybill = (query: any) => {
  const { sourcePage, sourceAction } = query || {}
  const cCmsSceneMap = ['kfUpdateDelivery', 'kfUpdatePickup', 'kfUpdateGoodTime']
  return sourcePage === 'ccms' && cCmsSceneMap.includes(sourceAction)
}
