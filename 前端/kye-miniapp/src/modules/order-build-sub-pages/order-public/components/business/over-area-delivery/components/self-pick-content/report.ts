import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

/**
 * @description 点击协议
 */
export const onAgreementClick = () => {
  umpOtherReport('CLK', { eventCode: 'clk_express_self_pickup_readagmt_v1' }, { button_name: '阅读协议' })
}

/**
 * @description 取消、关闭协议
 */
export const onCancelAgreement = () => {
  umpOtherReport('CLK', { eventCode: 'clk_express_self_pickup_cancelagmt_v1' }, { button_name: '取消阅读协议' })
}

/**
 * @description 手机号失焦
 */
export const onPhoneBlur = (e: FocusEvent) => {
  umpOtherReport(
    'OTHER',
    { eventCode: 'other_express_self_pickup_phone_v1' },
    { button_name: '自提手机', pickup_IPhone: (e.target as HTMLInputElement).value },
  )
}
