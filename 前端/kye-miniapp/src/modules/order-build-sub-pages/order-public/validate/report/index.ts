import { ReportType } from '@order-public-sub-public/reportUmp/type/types'
import {
  CheckAfterSubmitType,
  LimitResult,
  GoodsDangerType,
  AgreementSignFlagType,
} from '@order-public-sub-public/constants'
import {
  orderWarehouseIn,
  orderWarehouseOut,
} from '@order-public-sub-public/components/business/added-service/hooks/useOrderWarehouseState'
import { realNameData } from '@order-public-sub-public/types'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

//弹框的曝光
export const reportEvent = (preLimitType: string, params?: Indexable<string>) => {
  const limitTypeCode = {
    internalEmployee: 'exp_express_single_inside_v1',
    tellClipBoard: 'exp_paste_tips_v1',
    noPay: 'exp_pay_tips_v1',
    mobileScrap: 'exp_express_precheck_v1',
  }
  const eventCode = limitTypeCode[preLimitType as keyof typeof limitTypeCode]
  if (!eventCode) {
    return
  }
  umpOtherReport(
    'EXP',
    {
      eventCode,
      regionCode: 'pop',
    },
    params,
  )
}

//弹框的点击
export const reportClickEvent = (preLimitType: string, params?: Indexable<string>) => {
  const limitTypeCode = {
    mobileScrap: 'clk_express_precheck_v1',
    noPay: 'clk_pay_tips_control_v1',
  }
  const eventCode = limitTypeCode[preLimitType as keyof typeof limitTypeCode]
  if (!eventCode) {
    return
  }
  umpOtherReport(
    'CLK',
    {
      eventCode,
      regionCode: 'pop',
    },
    params,
  )
}

export const reportTellClipBoardResult = (result: string) => {
  umpOtherReport(
    'OTHER',
    {
      eventCode: 'other_paste_tips_v1',
      regionCode: 'pop',
    },
    {
      Clipboard_result: result,
    },
  )
}
export const reportNoPayResult = () => {
  umpOtherReport('CLK', {
    eventCode: 'clk_pay_tips_v1',
    regionCode: 'pop',
  })
}

/**
 * @description 地址推荐相关埋点
 * @param type
 * @param params
 */
export const reportAddressRecommend = (type: 'show' | 'close' | 'click', params: Record<string, unknown>) => {
  const code = {
    show: 'exp_express_addressrecommendation_v1',
    close: 'clk_express_addressrecommendation_off_v1',
    click: 'clk_express_addressrecommendation_v1',
  }

  const reportType = {
    show: ReportType.曝光,
    close: ReportType.点击,
    click: ReportType.点击,
  }

  umpOtherReport(
    reportType[type],
    {
      eventCode: code[type],
      regionCode: 'pop',
    },
    params,
  )
}

export const reportPopoverClick = (key: string) => {
  const popoverCode = {
    'protectPrice.declarativeValue': 'clk_express_single_value_tips_cancel_v1',
  }
  const eventCode = popoverCode[key as keyof typeof popoverCode]
  if (!eventCode) {
    return
  }
  umpOtherReport('CLK', {
    eventCode,
    regionCode: 'pop',
  })
}
export const reportPopoverExp = (key: string) => {
  const popoverCode = {
    'protectPrice.declarativeValue': 'exp_express_single_value_tips_v1',
  }
  const eventCode = popoverCode[key as keyof typeof popoverCode]
  if (!eventCode) {
    return
  }
  umpOtherReport('EXP', {
    eventCode,
    regionCode: 'pop',
  })
}

export const reportBubbleExp = (content: string) => {
  umpOtherReport(
    'EXP',
    {
      eventCode: 'page_express_single_failure_reason_v1',
    },
    {
      failure_reason: content || '',
    },
  )
}
export const expDangerReport = (type: string) => {
  umpOtherReport('EXP', {
    eventCode:
      type === GoodsDangerType.危险品未签协议弹窗
        ? 'exp_express_single_dangerous_control_popup_unqualified_v1'
        : 'exp_express_single_dangerous_control_popup_qualified_v1',
  })
}

export const clkDangerReport = (type: string, result: string) => {
  umpOtherReport(
    'CLK',
    {
      eventCode:
        type === GoodsDangerType.危险品未签协议弹窗
          ? 'clk_express_single_dangerous_control_popup_unqualified_v1'
          : 'clk_express_single_dangerous_control_popup_qualified_v1',
    },
    {
      button_name: result,
    },
  )
}

export const expRiskOneSelfReport = () => {
  umpOtherReport('EXP', {
    eventCode: 'exp_express_single_truthfully_declare_popup_v1',
  })
}

export const clkRiskOneSelfReport = (result: string) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_single_truthfully_declare_popup_v1',
    },
    {
      button_name: result,
    },
  )
}

export const expAdjust = () => {
  // umpOtherReport('EXP', {
  //   eventCode: 'exp_express_single_resource_price_adjustment_v1',
  // })
}

export const clkAdjust = (type: string, result: LimitResult) => {
  const buttonMap = {
    [LimitResult.确认]: '同意',
    [LimitResult.拒绝]: '不同意',
    [LimitResult.取消]: '关闭',
  }
  umpOtherReport(
    'CLK',
    {
      eventCode:
        type === CheckAfterSubmitType.调价
          ? 'clk_express_single_resource_price_adjustment_v1'
          : 'clk_express_single_cut_off_special_vehicle_v1',
    },
    {
      button_name: buttonMap[result],
    },
  )
}

export const expCutoffCar = () => {
  umpOtherReport('EXP', {
    eventCode: 'exp_express_single_cut_off_special_vehicle_v1',
  })
}

export const expClearanceWarehouse = () => {
  umpOtherReport('EXP', {
    eventCode: 'exp_express_express_declaration_v1',
  })
}

export const clkClearanceWarehouse = (
  result: boolean | string,
  source: string,
  showWarehouseOut: boolean,
  showWarehouseIn: boolean,
  // eslint-disable-next-line max-params
) => {
  let type = '出仓'
  if (showWarehouseOut) {
    type = '出仓'
  }
  if (showWarehouseIn) {
    type = '入仓'
  }
  if (showWarehouseOut && showWarehouseIn) {
    type = '出入仓'
  }
  if (typeof result === 'boolean') {
    result = result ? '同意' : '不同意'
  }
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_single_declaration_v1',
    },
    {
      button_name: result,
      button_source: source,
      mention_type: type,
    },
  )
}

export const submitClearanceWarehouse = (showWarehouseOut: boolean, showWarehouseIn: boolean) => {
  const result = []
  if (showWarehouseOut) {
    result.push({
      service_type: '出仓',
      service_content: orderWarehouseOut.value ? '同意' : '不同意',
    })
  }
  if (showWarehouseIn) {
    result.push({
      service_type: '入仓',
      service_content: orderWarehouseIn.value ? '同意' : '不同意',
    })
  }
  umpOtherReport(
    'OTHER',
    {
      eventCode: 'other_express_single_declaration_v1',
    },
    {
      result: JSON.stringify(result),
    },
  )
}

export const clkPickerLimit = (result: string) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_single_Dispatch_v1',
    },
    {
      button_name: result,
    },
  )
}

/**
 * @description: 代客下单曝光埋点
 */
export const expAgreementSignFlag = (type: AgreementSignFlagType) => {
  umpOtherReport('EXP', {
    eventCode:
      type === AgreementSignFlagType.未签署
        ? 'exp_express_single_inside_unsigned_agreement_v1'
        : 'exp_express_single_inside_unupdated_agreement_v1',
  })
}
/**
 * @description: 代客下单点击埋点
 */
export const clkAgreementSignFlag = (type: AgreementSignFlagType, result: string) => {
  umpOtherReport(
    'CLK',
    {
      eventCode:
        type === AgreementSignFlagType.未签署
          ? 'clk_express_single_inside_unsigned_agreement_v1'
          : 'clk_express_single_inside_unupdated_agreement_v1',
    },
    {
      button_name: result,
    },
  )
}
/**
 * @description: 代客下单请求结果埋点
 */
export const submitAgreementSignFlag = (type: AgreementSignFlagType, errMsg?: string) => {
  let params = {}
  if (errMsg) {
    params = {
      request_result: '失败',
      failure_reason: errMsg,
    }
  } else {
    params = {
      request_result: '成功',
      failure_reason: '',
    }
  }
  umpOtherReport(
    'OTHER',
    {
      eventCode:
        type === AgreementSignFlagType.未签署
          ? 'other_express_single_inside_unsigned_agreement_v1'
          : 'other_express_single_inside_unupdated_agreement_v1',
    },
    {
      ...params,
    },
  )
}

/**
 * @description: 实名认证弹框曝光
 */

const getRealNameStatus = (params: realNameData | undefined) => {
  const { showGoRealName, forceRealName } = params || {}
  if (forceRealName) {
    return '强制认证'
  }
  if (showGoRealName) {
    return '引导认证'
  }
  return '认证提醒'
}
export const expRealName = (realNmeRsp: realNameData | undefined) => {
  umpOtherReport(
    'EXP',
    {
      eventCode: 'exp_express_single_kyc_v1',
    },
    {
      kyc_type: getRealNameStatus(realNmeRsp),
    },
  )
}

export const clkExpRealNameDialog = (realNmeRsp: realNameData | undefined, button: string) => {
  umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_express_single_kyc_v1',
    },
    {
      kyc_type: getRealNameStatus(realNmeRsp),
      button_name: button,
    },
  )
}
