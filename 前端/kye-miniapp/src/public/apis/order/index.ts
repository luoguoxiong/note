import { http } from '@public/utils/request'
import { getVersionAsHeader } from '@public/constants/version'
import { useOrderStore } from '@/store/order'
import { getEnvConfig } from '@/public/config'
import { isAliMiniApp, isAmapMiniApp, isWxMiniApp } from '@public/utils'
import { getOrderGrayHeader } from '@/public/utils/grayHeader/order'
import Taro from '@tarojs/taro'

// 时间间隔 30分钟
const DELAY = 30 * 60 * 1000

// 定时器实例
let INNERVAL: any = null

// 清除定时器
export const clearIntervalHandler = () => {
  if (INNERVAL) {
    clearInterval(INNERVAL)
    INNERVAL = null
  }
}

/**
 * 定时器任务,设置之前先清除上一次的定时器
 * useInnervalTask
 */
export const useSetPreloadInnervalTask = (delay = DELAY) => {
  let source = 'miniprogram'
  const { isApp, systemType } = getEnvConfig()
  if (isWxMiniApp) {
    source = 'miniprogram'
  } else if (isAliMiniApp && !isAmapMiniApp) {
    source = 'aliPay'
  } else if (isAmapMiniApp) {
    source = 'amap'
  } else if (isApp && systemType === 'iOS') {
    source = 'ios'
  } else if (isApp && systemType == 'Android') {
    source = 'android'
  }
  getPreloadOrderData({ source }).then((res) => {
    Taro.getApp().orderConfigCache = res.data
    const orderStore = useOrderStore()
    orderStore.updateOrderConfig(res.data)
  })
  // 清除上一次的定时器
  clearIntervalHandler()

  INNERVAL = setInterval(() => {
    try {
      getPreloadOrderData({ source }).then((res) => {
        const orderStore = useOrderStore()
        Taro.getApp().orderConfigCache = res.data
        orderStore.updateOrderConfig(res.data)
      })
    } catch (e) {
      console.log(e)
    }
  }, delay)
}

// 下单预加载接口
export const getPreloadOrderData = (params: { source: string }) => {
  const version = getVersionAsHeader()
  return http('web.order.init.quickOrder.singlePageV2', params, {
    hideToast: false,
    extraHeader: { version_flag: version, ...getOrderGrayHeader() },
  })
}

// 获取下单审核数量
export const getwaybillDraftStatistic = () => {
  return http<{ waybillAuditShow: boolean; desc: string; count: number }>(
    'web.query.waybillDraftStatisticNew',
    {},
    {
      extraHeader: { ...getOrderGrayHeader() },
    },
  )
}

// 获取微信分享图片
export const getWechatSharePicture = (params: { waybillNumber: string; source?: number }) => {
  return http('web.client.orderShare.getWechatSharePicture', params, {
    appkey: '55816',
    extraHeader: { ...getOrderGrayHeader() },
  })
}
