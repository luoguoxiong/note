import { HistoryAddressResponse } from '@order-public-sub-public/apis/address/types'
import { joinAt } from '@order-public-sub-public/utils'
const fullAddress = (v: HistoryAddressResponse, i?: number) => {
  return `地址${i || i === 0 ? i + 1 : ''}：${joinAt(v, [
    'telephone',
    'telPhone',
    'mobile',
    'phone',
    'person',
    'province',
    'city',
    'county',
    'detailAddress',
    'companyName',
  ])}`
}
export const exp_express_single_recently_v1 = (title: string, list: HistoryAddressResponse[]) => {
  return {
    eventCode: 'exp_express_single_recently_v1',
    regionCode: 'sender_info',
    otherParams: () => {
      return {
        recognition_type: title === '最近寄件地址' ? '寄件' : '收件',
        Address_msg: list.map((v, i) => fullAddress(v, i)).join(','),
      }
    },
  }
}
export const clk_express_single_recently_v1 = (title: string, item: HistoryAddressResponse) => {
  return {
    eventCode: 'clk_express_single_recently_v1',
    regionCode: 'sender_info',
    otherParams: () => {
      return {
        recognition_type: title === '最近寄件地址' ? '寄件' : '收件',
        Address_msg: fullAddress(item),
      }
    },
  }
}
