import { HistoryAddressResponse } from '../../../apis/address/types'
// TODO: umpOtherReport 依赖过深，暂注释，后续按需接入
// import umpOtherReport from '@order-public/reportUmp/sceneReport/umpotherReport'
import { joinAt } from '../../../utils/address'

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

export const getOtherParams = (title: string, list: HistoryAddressResponse[]) => {
  return {
    recognition_type: title === '最近寄件地址' ? '寄件' : '收件',
    Address_msg: list.map((v, i) => fullAddress(v, i)).join(','),
  }
}

export const getOtherParams2 = (title: string, item: HistoryAddressResponse) => {
  return {
    recognition_type: title === '最近寄件地址' ? '寄件' : '收件',
    Address_msg: fullAddress(item),
  }
}
