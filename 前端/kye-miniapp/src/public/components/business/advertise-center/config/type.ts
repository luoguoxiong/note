/* eslint-disable no-unused-vars */
export type PageName = 'home' | 'order' | 'mine'

export type AdvertismentType = 'banner' | 'notice' | 'popup'

export type AdvertismentConfigIn = {
  pageCode: string
  appCode: string
  banner?: {
    areaStyleCode: string
    default: string
  }
  floatAdBanner?: {
    areaStyleCode: string
  }
}

export type AdvertismentConfig = {
  [page in PageName]?: AdvertismentConfigIn
}
