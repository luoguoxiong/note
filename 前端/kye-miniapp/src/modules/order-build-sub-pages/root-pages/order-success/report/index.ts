export const realAuthReportParams = (showGoRealNameFlag: boolean) => {
  return {
    eventCode: 'exp_express_result_kyc',
    otherParams: () => ({ kyc_type: showGoRealNameFlag ? '引导认证' : '认证提醒' }),
  }
}
export const clkAuthReportParams = () => {
  return {
    eventCode: 'clk_express_result_kyc',
    otherParams: () => ({ button_name: '去认证' }),
  }
}
