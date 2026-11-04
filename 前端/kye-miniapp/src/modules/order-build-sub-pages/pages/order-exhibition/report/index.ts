import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

// 页面浏览（事件编码 page_express_exhibition_browse_v1，页面编码 page_express_exhibition_v1）
export const page_express_exhibition_browse_v1 = () => {
  umpOtherReport('EXP', { eventCode: 'page_express_exhibition_browse_v1' })
}

// 展会下单感知（入口卡片展示）
export const other_express_exhibition_perception_v1 = () => {
  umpOtherReport('OTHER', { eventCode: 'other_express_exhibition_perception_v1' })
}

// 点击撤展下单按钮
export const clk_express_exhibition_dismantling_v1 = () => {
  umpOtherReport('CLK', { eventCode: 'clk_express_exhibition_dismantling_v1' })
}

// 点击来展下单按钮
export const clk_express_exhibition_arrival_v1 = () => {
  umpOtherReport('CLK', { eventCode: 'clk_express_exhibition_arrival_v1' })
}

// 实名横幅曝光
export const exp_express_result_kyc = () => {
  umpOtherReport('EXP', { eventCode: 'exp_express_result_kyc' })
}

// 去实名点击
export const clk_express_result_kyc = () => {
  umpOtherReport('CLK', { eventCode: 'clk_express_result_kyc' }, { button_name: '去实名' })
}
