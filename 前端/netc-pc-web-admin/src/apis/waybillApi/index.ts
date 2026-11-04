import { http } from '@/utils/request/request'

/** 结算中心支付开票灰度地址（来源: netc-pc-web/src/services/api/admin.js newGetGrayMenus） */
export const newGetGrayMenus = (source: number, applicationCode: string) => {
  return http<{ gray: number; url: string }>('web.query.waybill.getSettlementCenterUrl', {
    source,
    type: 2,
    applicationCode,
  })
}

export const getMarketVirtualContact = (userInputMobile: string) => {
  return http(
    'web.market.contact.get',
    { userInputMobile, channel: 'pc' },
    {
      toast: false,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      ignore: true,
    }
  )
}
