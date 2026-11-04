import { AiItems, ReceiptService, goodsControlOption } from '@order-public-sub-public/types'
import { DismantlingWoodenFrameEnum } from '../types'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
// umpOtherReport = umpOtherReport
// 增值服务

export const exp_express_single_insurance_v1 = () => {
  return {
    eventCode: 'exp_express_single_insurance_v1',
    regionCode: 'send_info',
  }
}

// <!-- 回单服务 -->@order-public-sub-public/components/business/added-service/hooks/report

export const clk_express_single_insurance_content_v1 = (aiItem: AiItems, item: ReceiptService) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_single_insurance_content_v1',
    },
    {
      button_name: item.typeName,
      ai_strategy: aiItem.value === item.type.toString() ? aiItem.strategyId : '',
    },
  )
}
export const exp_ai_receipt_v1 = (aiItem: AiItems, item: ReceiptService) => {
  umpOtherReport(
    'EXP',
    {
      eventCode: aiItem.value === item.type.toString() ? 'exp_ai_receipt_v1' : '',
    },
    {
      ai_packing_type: item.typeName,
      ai_strategy_code: aiItem.strategyId,
    },
  )
}
export const exp_express_single_receipt_requirement_v1 = (page_type: string) => {
  return {
    eventCode: 'exp_express_single_receipt_requirement_v1',
    otherParams: () => {
      return {
        page_type: page_type,
        page_style: '弹框',
      }
    },
  }
}
export const clk_express_single_receipt_requirement_v1 = (
  page_type: string,
  button_name: string,
  select_status: string,
) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_single_receipt_requirement_v1',
    },
    {
      button_name,
      select_status,
      page_type: page_type,
      page_style: '弹框',
    },
  )
}
export const exp_express_single_urgent_return_v1 = (page_type: string) => {
  return {
    eventCode: 'exp_express_single_urgent_return_v1',
    otherParams: () => {
      return {
        page_type: page_type,
        page_style: '弹框',
      }
    },
  }
}

export const exp_express_receipt_v1 = () => {
  return {
    eventCode: 'exp_express_receipt_v1',
  }
}

export const clk_express_single_urgent_return_v1 = (page_type: string, button_name: string) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_single_urgent_return_v1',
    },
    {
      page_type: page_type,
      button_name,
      page_style: '弹框',
    },
  )
}

// <!-- 回单提供方 -->
export const exp_express_receipt_provider_v1 = () => {
  return {
    eventCode: 'exp_express_receipt_provider_v1',
  }
}

// 回单张数
export const clk_express_receipt_number_v1 = () => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_receipt_number_v1',
    },
    {
      button_name: '回单张数',
    },
  )
}

export const other_express_receipt_number_v1 = (number: number | null) => {
  umpOtherReport(
    'OTHER',
    {
      eventCode: 'other_express_receipt_number_v1',
    },
    {
      number_receipt: number,
    },
  )
}

export const clk_express_receipt_number_reduce_v1 = (number: number | null) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_receipt_number_reduce_v1',
    },
    {
      number_receipt: number,
    },
  )
}

export const clk_express_receipt_number_add_v1 = (number: number | null) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_receipt_number_add_v1',
    },
    {
      number_receipt: number,
    },
  )
}

// 回单资料
export const clk_express_receipt_v1 = (name?: string) => {
  // umpOtherReport(
  //   'CLK',
  //   {
  //     eventCode: 'clk_express_receipt_v1',
  //   },
  //   {
  //     button_name: name || '回单资料',
  //   }
  // )
}

export const clk_express_receipt_button_v1 = (name: string, type?: 'bind' | 'methods') => {
  if (type !== 'methods') {
    return {
      eventCode: 'clk_express_receipt_button_v1',
      otherParams: () => {
        return {
          button_name: name,
        }
      },
    }
  } else {
    umpOtherReport(
      'CLK',
      {
        eventCode: 'clk_express_receipt_button_v1',
      },
      {
        button_name: name,
      },
    )
  }
}

// 代收货款
export const clk_express_collection_v1 = () => {
  umpOtherReport('CLK', {
    eventCode: 'clk_express_collection_v1',
  })
}

export const other_express_collection_v1 = (num: number | string) => {
  umpOtherReport(
    'OTHER',
    {
      eventCode: 'other_express_collection_v1',
    },
    {
      payment_collection: num,
    },
  )
}

export const clk_express_increment_serviceintro_v1 = () => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_increment_serviceintro_v1',
    },
    {
      button_name: '服务介绍',
    },
  )
}

// 拆木架

export const clk_express_single_insurance_wooden_v1 = (value: DismantlingWoodenFrameEnum) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_single_insurance_wooden_v1',
    },
    {
      button_name: value === DismantlingWoodenFrameEnum.选中 ? '需要拆木架' : '不需要拆木架',
    },
  )
}

// 定时派送
export const exp_express_informdelivery_v1 = () => {
  return {
    eventCode: 'exp_express_informdelivery_v1',
    regionCode: 'send_info',
    otherParams: () => {
      return { button_name: '定时派送' }
    },
  }
}

export const clk_express_informdelivery_desc_v1 = () => {
  return {
    eventCode: 'clk_express_informdelivery_desc_v1',
    otherParams: () => {
      return {
        button_name: '定时派送说明',
      }
    },
  }
}

export const clk_express_informdelivery_despatch_v1 = (item: goodsControlOption, goodsControl: string) => {
  umpOtherReport(
    'CLK',
    { eventCode: 'clk_express_informdelivery_despatch_v1' },
    {
      button_name: item.type === goodsControl ? '需要等通知发运' : '不需要等通知发运',
    },
  )
}
export const clk_express_informdelivery_delivery_v1 = (item: goodsControlOption, goodsControl: string) => {
  umpOtherReport(
    'CLK',
    { eventCode: 'clk_express_informdelivery_delivery_v1' },
    {
      button_name: item.type === goodsControl ? '需要等通知派送' : '不需要等通知派送',
    },
  )
}

// 增值服务-底部费用
// clk_express_single_insurance_cost_v1
export const clk_express_single_insurance_cost_v1 = (pageType: string | undefined) => {
  return {
    eventCode: 'clk_express_single_insurance_cost_v1',
    otherParams: () => {
      return {
        page_type: pageType || '',
      }
    },
  }
}

export const clk_express_increment_desc_v1 = () => {
  umpOtherReport(
    'CLK',
    { eventCode: 'clk_express_increment_desc_v1' },
    {
      button_name: '增值服务说明',
    },
  )
}

export const clk_express_increment_control_v1 = (name: string) => {
  umpOtherReport(
    'CLK',
    { eventCode: 'clk_express_increment_control_v1' },
    {
      button_name: name,
    },
  )
}

// 下单_寄件页_增值服务_弹窗消失
let flag = false
export const incrementPopupClosedReport = () => {
  if (flag) return
  console.log('kkkkkkkkkkk')
  umpOtherReport('OTHER', { eventCode: 'other_express_increment_popup_disappear_v1' })
  flag = true
  setTimeout(() => {
    flag = false
  }, 600)
}
