import { modalContentType } from '@order-public-sub-public/components/business/waybill-remark/components/modalContentHook'
import { SlideTagDetail } from '@order-public-sub-public/components/ui/slide-tag/types'

export function expReport(item: SlideTagDetail, type?: string) {
  let reportParams = {}
  switch (type) {
    case modalContentType['运单备注']:
      reportParams = {
        eventCode: 'exp_ai_remarks_tips_v1',
        regionCode: 'pop',
        otherParams: () => {
          return { remark_label_msg: item.tagName, ai_strategy_code: item.strategyId || '' }
        },
      }
      break
    case modalContentType['给司机捎句话']:
      reportParams = {
        eventCode: 'exp_ai_single_tips_v1',
        regionCode: 'pop',
        otherParams: () => {
          return { driver_label_msg: item.tagName, ai_strategy_code: item.strategyId || '' }
        },
      }
      break
    default:
      break
  }

  return reportParams
}

// 删除icon的点击埋点
export const deleteManageReport = (type: string) => {
  const eventCode =
    modalContentType['运单备注'] === type
      ? 'clk_express_remarks_tag_management_v1'
      : 'clk_express_driver_tag_management_v1'
  window.$umpOtherReport(
    'CLK',
    {
      eventCode,
    },
    {
      button_name: '标签管理',
    },
  )

  const eventCodeExp =
    modalContentType['运单备注'] === type
      ? 'exp_express_remarks_tag_management_v1'
      : 'exp_express_driver_tag_management_v1'

  window.$umpOtherReport(
    'EXP',
    {
      eventCode: eventCodeExp,
    },
    {
      button_name: '标签管理',
    },
  )
}

// 删除icon的 曝光埋点
export const deleteManageExpReport = (type: string) => {
  const eventCodeExp =
    modalContentType['运单备注'] === type
      ? 'exp_express_remarks_tag_management_v1'
      : 'exp_express_driver_tag_management_v1'

  window.$umpOtherReport(
    'EXP',
    {
      eventCode: eventCodeExp,
    },
    {
      button_name: '标签管理',
    },
  )
}

// 点击每个tag后面的删除icon
export const deleteItemReport = (type: string) => {
  const eventCode =
    modalContentType['运单备注'] === type ? 'clk_express_remarks_tag_delete_v1' : 'clk_express_driver_tag_delete_v1'
  window.$umpOtherReport(
    'CLK',
    {
      eventCode,
    },
    {
      button_name: '删除标签',
    },
  )
}

// 点击清空按钮
export const clearTagReport = (type: string) => {
  const eventCode =
    modalContentType['运单备注'] === type ? 'clk_express_remarks_tag_clear_v1' : 'clk_express_driver_tag_clear_v1'
  window.$umpOtherReport(
    'CLK',
    {
      eventCode,
    },
    {
      button_name: '清空标签',
    },
  )
}

// 点击完成按钮
export const finishTagReport = (type: string) => {
  const eventCode =
    modalContentType['运单备注'] === type ? 'clk_express_remarks_tag_done_v1' : 'clk_express_driver_tag_done_v1'
  window.$umpOtherReport(
    'CLK',
    {
      eventCode,
    },
    {
      button_name: '完成',
    },
  )
}
