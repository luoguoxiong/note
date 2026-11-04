import { ListItem } from '../../../types'
import { joinAt } from '@order-public-sub-public/utils'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

export function clkReport(item: ListItem, justAddedFlagId: string, addressType: string) {
  if (item.commonFlag) {
    const params = {
      ai_msg: `${joinAt(item, ['telephone', 'mobile', 'person', 'fullAddress'])}`,
      ai_label_status: '',
      ai_address_type: addressType === '20' ? '收件' : '寄件',
      ai_strategy_code: item.strategyId,
    }
    if (justAddedFlagId === item.id) {
      params.ai_label_status = '刚刚新增'
    } else if (item.commonFlag) {
      params.ai_label_status = '常用'
    }
    const reportParams = {
      eventCode: 'clk_express_single_choise_choise_v1',
      otherParams: () => {
        return params
      },
    }
    umpOtherReport(
      'CLK',
      {
        eventCode: reportParams.eventCode,
      },
      {
        otherParams: reportParams.otherParams(),
      },
    )
  }
}
export function expReport(item: ListItem, justAddedFlagId: string, addressType: string) {
  if (item.commonFlag) {
    const params = {
      ai_msg: `${joinAt(item, ['telephone', 'mobile', 'person', 'fullAddress'])}`,
      ai_label_status: '',
      ai_address_type: addressType === '20' ? '收件' : '寄件',
      ai_strategy_code: item.strategyId,
    }
    if (justAddedFlagId === item.id) {
      params.ai_label_status = '刚刚新增'
    } else if (item.commonFlag) {
      params.ai_label_status = '常用'
    }
    // const reportParams = {
    //   eventCode: 'exp_express_ai_label_v1',
    //   otherParams: () => {
    //     return params
    //   },
    // }
    return params
  } else {
    return {
    }
  }
}
export function otherReport() {
  const reportParams = {}

  return reportParams
}
