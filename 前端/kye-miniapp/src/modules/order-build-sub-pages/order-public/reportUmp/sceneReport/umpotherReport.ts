import { getEventParams } from '../util/index'
import { eventType, EventTypeId, ReportTypeEnum } from '../type/types'
import { report_other_event, report_CLK_event, report_EXP_event } from '@public/utils/reportUtil'

export default function (type: ReportTypeEnum, event: eventType, params = {}) {
  const { eventCode, eventId = EventTypeId.OTHER, regionCode } = event
  const eventParams = getEventParams(params)
  const reportFunMap = {
    CLK: report_CLK_event,
    EXP: report_EXP_event,
    OTHER: report_other_event,
  }
  const reportParams = {
    event_type_id: EventTypeId[type] || eventId,
    regionCode: regionCode,
    ...eventParams,
  }
  const reportFun = reportFunMap[type] || report_other_event
  setTimeout(() => {
    reportFun?.call(null, eventCode, reportParams)
  })
  console.log('上报的参数', eventCode, eventParams)
}
