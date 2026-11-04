import Taro from '@tarojs/taro'
import { PlainObject } from '@order-public-sub-public/utils/types'
import { getBridgeModule } from '@order-public-sub-public/utils/device'
type ReportTypeEnum = 'CLK' | 'EXP' | 'OTHER'

/* aplus埋点事件方法 */
export const report_fn = (eventCode: string, type: ReportTypeEnum, params: PlainObject) => {
  const bridge = getBridgeModule()
  bridge.aplus_queue.push({
    action: 'aplus.record',
    arguments: [eventCode, type, params],
  })
}

// QT页面埋点
export const report_EXP_event = (eventCode: string, params: PlainObject = {}) => {
  report_fn(eventCode, 'EXP', {
    event_code: eventCode,
    page_code: eventCode,
    page_name: eventCode,
    ...params,
    offsiteType: Taro.getLaunchOptionsSync().scene,
  })
}

// QT自定义埋点
export const report_other_event = (eventCode: string, params: PlainObject = {}) => {
  report_fn(eventCode, 'OTHER', {
    event_code: eventCode,
    page_name: params && params.page_code,
    ...params,
  })
}

// QT点击事件
export const report_CLK_event = (eventCode: string, params: PlainObject = {}) => {
  report_fn(eventCode, 'CLK', {
    event_code: eventCode,
    page_name: params && params.page_code,
    ...params,
  })
}
