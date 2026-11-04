import { report_other_event, report_CLK_event, report_EXP_event } from '@public/utils/reportUtil'

export const clk_express_goods_now_v1 = () => {
  report_CLK_event('clk_express_goods_now_v1', {
    goods_time: '货好时间',
  })
}

export const other_express_single_goods_times_v1 = () => {
  report_CLK_event('other_express_single_goods_times_v1', {
    goods_time: '货好时间',
    page_name: 'page_freight_query',
  })
}
