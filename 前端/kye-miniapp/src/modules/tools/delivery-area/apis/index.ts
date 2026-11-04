import { http } from '@/public/utils/request'
import {
  Delivery,
  imageAddressAnalysisRes,
  AiAddrAnalysisRes,
  areaSearchRes,
  hotCitysRes,
  QueryMarketingPersonnelV1Req,
  QueryMarketingPersonnelV1Res,
} from './types'

export const aiAddrAnalysis = (address: string) => {
  const params = {
    data: [address],
    source: 'WEI_XIN',
    needDistrictId: 10,
  }
  return http<AiAddrAnalysisRes[]>('web.basicBiz.address.aiAnalysis', params)
}

export const imageAddressAnalysis = (base64: string) => {
  const imgId = new Date().getTime() + '' + Math.floor(Math.random() * 1000000000)
  const params = {
    data: {
      img_id: imgId,
      base64_data: base64,
    },
  }
  return http<imageAddressAnalysisRes>('web.client.address.imageAddressAnalysis', params)
}

export const getDelevery = (params: { disId: string; level: number }) => {
  return http<Delivery>('web.basicBiz.address.deliverySearch', params)
}

export const areaSearch = (params: { keyWord: string }) => {
  return http<areaSearchRes[]>('web.BasicBiz.address.areaSearch', params)
}

export const hotCity = () => {
  return http<hotCitysRes>('web.basic.biz.generic.config.get')
}

export const queryMarketingPersonnelV1 = (params: QueryMarketingPersonnelV1Req) => {
  return http<QueryMarketingPersonnelV1Res>('web.user.customer.queryMarketingPersonnelV1', params, {
    fullData: true,
    hideToast: true,
  })
}
