export const exp_express_single_goods_message_goods_ai_weight_v1 = (strategyId: string) => {
  window.$umpOtherReport(
    'EXP',
    {
      eventCode: 'exp_express_single_goods_message_goods_ai_weight_v1',
    },
    {
      ai_strategy_code: strategyId || '',
    }
  )
}
export const page_express_single_goods_message_goods_v1 = (strategyId: string) => {
  window.$umpOtherReport(
    'EXP',
    {
      eventCode: 'page_express_single_goods_message_goods_v1',
    },
    {
      ai_strategy_code: strategyId || '',
    }
  )
}
