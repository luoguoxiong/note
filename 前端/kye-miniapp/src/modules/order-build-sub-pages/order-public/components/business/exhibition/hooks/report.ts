import { ModulePageType } from './data-config'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

// 展馆号曝光
export const exp_express_sender_exhibition_v1 = () => {
  return {
    eventCode: 'exp_express_sender_exhibition_v1',
  }
}

// 展馆号点击
export const clk_express_sender_exhibition_v1 = (type: ModulePageType) => {
  umpOtherReport(
    'CLK',
    { eventCode: 'clk_express_sender_exhibition_v1' },
    {
      button_name: `${type === ModulePageType.寄方 ? '寄件' : '收件'}展馆号`,
    },
  )
}

// 展馆号选择
export const other_express_sender_exhibition_v1 = (type: ModulePageType, code: string) => {
  const key = type === ModulePageType.寄方 ? 'sender_pavilion' : 'receive_pavilion'
  umpOtherReport(
    'CLK',
    { eventCode: 'other_express_sender_exhibition_v1' },
    {
      [key]: code || '',
    },
  )
}

// 展位号曝光
export const exp_express_sender_booth_v1 = () => {
  return {
    eventCode: 'exp_express_sender_booth_v1',
  }
}

// 展位号点击
export const clk_express_sender_booth_v1 = (type: ModulePageType) => {
  umpOtherReport(
    'CLK',
    { eventCode: 'clk_express_sender_booth_v1' },
    {
      button_name: `${type === ModulePageType.寄方 ? '寄件' : '收件'}展位号`,
    },
  )
}

// 展位号选择
export const other_express_sender_booth_v1 = (type: ModulePageType, code: string) => {
  const key = type === ModulePageType.寄方 ? 'sender_booth' : 'receive_booth'
  umpOtherReport(
    'CLK',
    { eventCode: 'other_express_sender_booth_v1' },
    {
      [key]: code || '',
    },
  )
}
