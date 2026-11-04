import { ListItem } from '@order-public-sub-public/types'
import { joinAt } from '@order-public-sub-public/utils'
import { Address } from '@order-public-sub-public/constants/address'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
const fullAddress = (v: ListItem, i?: number) => {
  return `地址${i || i === 0 ? i + 1 : ''}：${joinAt(v, [
    'telephone',
    'mobile',
    'person',
    'province',
    'city',
    'county',
    'area',
    'detailAddress',
    'companyName',
  ])}`
}
export function clickReport(item: ListItem, source: string) {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_association_apply_v1',
    },
    {
      recognition_type: source === Address.SENDER_PAGE ? '寄件' : '收件',
      recognition_msg: `${fullAddress(item)}`,
    },
  )
}
export function expReport(receiveAiInfoVoList: ListItem[], source: string) {
  return {
    recognition_type: source === Address.SENDER_PAGE ? '寄件' : '收件',
    Address_msg: receiveAiInfoVoList
      .map((item) => {
        return `${fullAddress(item)}`
      })
      .join(','),
  }
}
