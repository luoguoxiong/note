import { AiItems, woodenFrameInfoListType } from '@order-public-sub-public/types'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
export const clk_express_single_insurance_content_v1 = (aiItem: AiItems, item: woodenFrameInfoListType) => {
  console.log(aiItem, item, 'xuwen')
  umpOtherReport(
    'CLK',
    { eventCode: 'clk_express_single_insurance_content_v1' },
    {
      button_name: item.name,
      ai_strategy: aiItem.value === item.value ? aiItem.strategyId : '',
    },
  )
}
export const exp_ai_packing_v1 = (aiItem: AiItems, item: woodenFrameInfoListType) => {
  const eventCode = aiItem.value + '' === item.value + '' ? 'exp_ai_packing_v1' : ''
  umpOtherReport(
    'EXP',
    {
      eventCode: eventCode,
    },
    {
      ai_packing_type: item.name,
      ai_strategy_code: aiItem.strategyId,
    },
  )
}
