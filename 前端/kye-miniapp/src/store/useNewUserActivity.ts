import { defineStore } from 'pinia'
import * as Apis from '@/layout/pages/home/apis/index'
interface ActivityInfo {
  hasLeadCapture: boolean
  hasShippingExpiredActivity: boolean
  hasLeadCaptureActivity: boolean
  newCustomerActivity: {
    receiveSource: number
    activityId: number
    couponCount: number
  }
  waybillActivity: {
    receiveSource: number
    activityId: number
    couponCount: number
  }
  kyStyleInfo: Array<{
    title: string
    subTitle: string
    videoCover: string
    videoUrl: string
  }>
}

const CACHE_TIME = 10 * 1000 * 60

const DEFAULT_DATA: ActivityInfo = {
  hasLeadCapture: false,
  hasShippingExpiredActivity: false,
  hasLeadCaptureActivity: false,

  newCustomerActivity: {
    receiveSource: 31,
    activityId: 0,
    couponCount: 0,
  },

  waybillActivity: {
    receiveSource: 32,
    activityId: 0,
    couponCount: 0,
  },
  kyStyleInfo: [
    {
      title: '实力领航',
      subTitle: '不负每份托付',
      videoCover: 'https://ic-img.ky-express.com/netc/20260601_57734_!!1780301671614_416_480.png',
      videoUrl:
        'https://ic-h5-uat.kye-erp.com/netc-h5-modules/kye-style/index.html#/video?mediaId=653&coverUrl=https://ic-img.ky-express.com/netc/20260601_57734_!!1780301671614_416_480.png',
    },
    {
      title: '时效领先',
      subTitle: '运力加码更准时',
      videoCover: 'https://ic-img.ky-express.com/netc/20260601_21070_!!1780301671620_416_480.png',
      videoUrl:
        'https://ic-h5-uat.kye-erp.com/netc-h5-modules/kye-style/index.html#/video?mediaId=653&coverUrl=https://static-inform-uat.kye-erp.com/2026-03-17/157404081397448083',
    },
    {
      title: '科技护航',
      subTitle: '全程可视更安全',
      videoCover: 'https://ic-img.ky-express.com/netc/20260601_78149_!!1780301671621_416_480.png',
      videoUrl:
        'https://ic-h5-uat.kye-erp.com/netc-h5-modules/kye-style/index.html#/video?mediaId=653&coverUrl=https://static-inform-uat.kye-erp.com/2026-03-17/157404081397448083',
    },
  ],
}

export const useNewUserActivity = defineStore('useNewUserActivity', {
  state: () => ({
    data: DEFAULT_DATA,

    /** 上次请求时间 */
    lastFetchTime: 0,

    /** 请求中的 Promise */
    pendingPromise: null as Promise<Boolean> | null,
  }),

  actions: {
    /**
     * 获取新客活动信息
     * @param forceRefresh 是否强制刷新
     */
    async getNewCustomerInfo(forceRefresh = false) {
      const hasCache = Date.now() - this.lastFetchTime < CACHE_TIME

      // 使用缓存
      if (!forceRefresh && hasCache) {
        return this.data.hasLeadCapture
      }

      // 请求复用
      if (this.pendingPromise) {
        return this.pendingPromise
      }

      this.pendingPromise = (async () => {
        try {
          // TODO: 替换真实接口
          const {
            hasLeadCapture,
            hasLeadCaptureActivity,
            hasShippingExpiredActivity,
            waybillActivity,
            newCustomerActivity,
            videoConfig,
          } = await Apis.getNewCustomerActivity({
            channel: 'wechatApplet',
            scene: '10',
            checkNewCustomer: '0',
          })

          this.data = {
            hasLeadCapture,
            hasLeadCaptureActivity,
            hasShippingExpiredActivity,
            waybillActivity,
            newCustomerActivity,
            kyStyleInfo: videoConfig,
          }
          this.lastFetchTime = Date.now()

          return hasLeadCapture
        } finally {
          this.pendingPromise = null
        }
      })()

      return this.pendingPromise
    },
  },
})
