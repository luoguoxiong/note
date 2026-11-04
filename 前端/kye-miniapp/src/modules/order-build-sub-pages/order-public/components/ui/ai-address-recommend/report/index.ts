import { ListItem } from '@order-public-sub-public/types'
import { joinAt } from '@order-public-sub-public/utils'
export function clickReport(item: ListItem) {
  const reportParams = {
    eventCode: 'clk_express_single_recommend_popup_button_v1',
    regionCode: 'AI',
    otherParams: () => {
      return {
        ai_strategy: item.id,
        button_name: '使用',
        neirong_address_information: `${joinAt(item, [
          'telephone',
          'mobile',
          'person',
          'province',
          'city',
          'county',
          'item.area',
          'detailAddress',
        ])}`,
      }
    },
  }

  return reportParams
}
export function expReport(receiveAiInfoVoList: ListItem[]) {
  const reportParams = {
    eventCode: 'exp_express_ai_receiver_v1',
    regionCode: 'receiver_info',
    otherParams: () => {
      return {
        ai_strategy_code: receiveAiInfoVoList[0]?.id,
        ai_history: receiveAiInfoVoList
          .map((item) => {
            return `${joinAt(item, [
              'telephone',
              'mobile',
              'person',
              'province',
              'city',
              'county',
              'item.area',
              'detailAddress',
            ])}`
          })
          .join(','),
      }
    },
  }

  return reportParams
}
export function otherReport() {
  const reportParams = {}

  return reportParams
}
