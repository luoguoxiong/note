import { Channel } from '@order-public-sub-public/constants'

/**
 * 寄件_运单审核_撤销申请_曝光
 * @returns
 */
export const exp_waybillaudit_revocation_v1 = () => {
  return {
    eventCode: 'exp_waybillaudit_revocation_v1',
  }
}

/**
 * 寄件_运单审核_撤销申请_点击
 */

export const clk_waybillaudit_revocation_v1 = (params: { name: string; type: string }) => {
  const { name = '撤销申请', type } = params
  const recognition_type = type === Channel.运单审核 ? '运单审核' : '调价审核'
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_waybillaudit_revocation_v1',
    },
    {
      button_name: name,
      recognition_type: recognition_type,
    },
  )
}

/**
 * 寄件_运单审核_再来一单_曝光
 * @returns
 */
export const exp_waybillaudit_again_v1 = () => {
  return {
    eventCode: 'exp_waybillaudit_again_v1',
  }
}

/**
 * 寄件_运单审核_撤销申请_点击
 */

export const clk_waybillaudit_again_v1 = (params: { name: string; type: string; waybillNumber: string }) => {
  const { name = '撤销申请', type, waybillNumber } = params
  const recognition_type = type === Channel.运单审核 ? '运单审核' : '调价审核'
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_waybillaudit_again_v1',
    },
    {
      button_name: name,
      recognition_type: recognition_type,
      waybill_number: waybillNumber,
    },
  )
}

/**
 * 寄件_运单审核_联系审批人_曝光
 * @returns
 */
export const exp_waybillaudit_contactapprover_v1 = () => {
  return {
    eventCode: 'exp_waybillaudit_contactapprover_v1',
  }
}

/**
 * 寄件_运单审核_联系审批人_点击
 */

export const clk_waybillaudit_contactapprover_v1 = (params: { name: string; type: string }) => {
  const { name = '撤销申请', type } = params
  const recognition_type = type === Channel.运单审核 ? '运单审核' : '调价审核'
  window.$umpOtherReport(
    'CLK',
    {
      eventCode: 'clk_waybillaudit_contactapprover_v1',
    },
    {
      button_name: name,
      recognition_type: recognition_type,
    },
  )
}
