import { ref } from 'vue'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
import { YesOrNoNumber } from '@order-public-sub-public/constants'
export const btnReportStatusMap = ref({})

// let umpOtherReport = (a: string,b:any,c:any) => {}
export const realAuthReportParams = (showGoRealNameFlag: boolean) => {
  umpOtherReport(
    'CLK',
    { eventCode: 'exp_express_result_kyc' },
    {
      button_name: showGoRealNameFlag ? '引导认证' : '认证提醒',
    },
  )
}
export const clkAuthReportParams = (realNameButtonType) => {
  umpOtherReport(
    'CLK',
    { eventCode: 'clk_express_result_kyc' },
    {
      button_name: realNameButtonType === YesOrNoNumber.YES ? '去认证' : '转发他人实名',
    },
  )
}

export const exp_express_result_default_setting_popup_v1 = () => {
  umpOtherReport('EXP', {
    eventCode: 'exp_express_result_default_setting_popup_v1',
  })
}

export const exp_express_print_v1 = () => {
  const key = 'exp_express_print_v1'
  if (btnReportStatusMap.value[key]) {
    return
  }
  btnReportStatusMap.value[key] = true
  umpOtherReport(
    'EXP',
    {
      eventCode: key,
    },
    { button_name: '打印面单' },
  )
}

export const clk_express_print_v1 = () => {
  umpOtherReport(
    'CLK',
    { eventCode: 'clk_express_print_v1' },
    {
      button_name: '打印面单',
    },
  )
}
export const clk_express_result_notify_recipient_v1 = () => {
  umpOtherReport('CLK', { eventCode: 'clk_express_result_notify_recipient_v1' })
}
export const clk_express_result_view_waybill_v1 = () => {
  umpOtherReport('CLK', { eventCode: 'clk_express_result_view_waybill_v1' })
}
export const clk_express_result_continue_placing_order_v1 = (params?: Record<string, string>) => {
  umpOtherReport(
    'CLK',
    { eventCode: 'clk_express_result_continue_placing_order_v1' },
    params,
  )
}
export const to_template_report = (banner = false) => {
  umpOtherReport(
    'CLK',
    { eventCode: banner ? 'clk_express_result_save_model_new_v1' : 'clk_express_result_save_model_v1' },
    {
      button_content: '保存模板',
    },
  )
}

// 费用审核确认页_页面按钮点击
// 联系商务、通知收件人、打印面单、查看运单、保存模板、继续下单
export const clickresultFeeConfirmDisagreeReport = (button_name: string) => {
  umpOtherReport(
    'CLK',
    { eventCode: 'clk_page_express_result_fee_confirm_v1' },
    {
      button_name,
    },
  )
}
