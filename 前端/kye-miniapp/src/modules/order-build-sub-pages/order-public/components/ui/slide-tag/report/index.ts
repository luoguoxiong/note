import { modalContentType } from '@order-public-sub-public/components/business/waybill-remark/components/modalContentHook'
import { SlideTagDetail } from '@order-public-sub-public/components/ui/slide-tag/types'
import { GOODS_INFO_SOURCE_MAP } from '@order-public-sub-public/constants/product'

export function clickReport(item: SlideTagDetail, type?: string, msg?: string | number) {
  let reportParams = {}
  switch (type) {
    case modalContentType['运单备注']:
      reportParams = {
        eventCode: 'clk_express_remarks_content_v1',
        regionCode: 'pop',
        otherParams: () => {
          return { content: item.tagName, ai_strategy_code: item.strategyId || '', remark_msg: msg || '' }
        },
      }

      break
    case modalContentType['给司机捎句话']:
      reportParams = {
        eventCode: 'clk_express_driver_content_v1',
        regionCode: 'pop',
        otherParams: () => {
          return { content: item.tagName, ai_strategy_code: item.strategyId || '', driver_msg: msg || '' }
        },
      }
      break
    case modalContentType['托寄物']:
      reportParams = {
        eventCode: 'clk_express_goods_tag_v1',
        regionCode: 'pop',
        otherParams: () => {
          return {
            driver_label_msg: item.tagName,
            ai_strategy_code: item.strategyId || '',
            content: item.tagName,
            fill_goodsname: item.tagName,
            source: Reflect.get(GOODS_INFO_SOURCE_MAP, item.type!),
          }
        },
      }

      break

    default:
      break
  }
  return reportParams
}
export function expReport(item: SlideTagDetail, type?: string) {
  let reportParams = {}
  switch (type) {
    case modalContentType['运单备注']:
      reportParams = {
        eventCode: 'exp_ai_remarks_tips_v1',
        regionCode: 'pop',
        otherParams: () => {
          return { remark_label_msg: item.tagName, ai_strategy_code: item.strategyId || '' }
        },
      }
      break
    case modalContentType['给司机捎句话']:
      reportParams = {
        eventCode: 'exp_ai_single_tips_v1',
        regionCode: 'pop',
        otherParams: () => {
          return { driver_label_msg: item.tagName, ai_strategy_code: item.strategyId || '' }
        },
      }
      break
    case modalContentType['托寄物']:
      reportParams = {
        eventCode: 'exp_express_goods_tag_v1',
        regionCode: Number(item.type) === 2 ? 'AI' : 'pop',
        otherParams: () => {
          return {
            ai_label_name: item.tagName,
            ai_strategy_code: item.strategyId || '',
            content: item.tagName,
            source: Reflect.get(GOODS_INFO_SOURCE_MAP, item.type!),
          }
        },
      }
      break
    default:
      break
  }

  return reportParams
}
export function otherReport(item: SlideTagDetail, type?: string) {
  let reportParams = {}
  switch (type) {
    case modalContentType['运单备注']:
      reportParams = {
        eventCode: 'other_express_single_remarks_confirm_v1',
        regionCode: 'pop',
        otherParams: () => {
          return { remark_msg: item.tagName }
        },
      }
      break
    case modalContentType['给司机捎句话']:
      reportParams = {
        eventCode: 'other_express_single_todriver_v1',
        otherParams: () => {
          return { driver_msg: item.tagName }
        },
      }
      break

    default:
      break
  }
  return reportParams
}

export const reportClickTag = (params: { item: SlideTagDetail; type?: string }, inputValue?: string | number) => {
  const { item, type } = params
  const { eventCode, regionCode, otherParams } = clickReport(item, type, inputValue) as {
    eventCode: string
    regionCode: string
    otherParams: () => Record<string, unknown>
  }
  window.$umpOtherReport('CLK', { eventCode, regionCode }, otherParams())
}
