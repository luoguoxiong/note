import { EventTypeId, ReportTypeEnum, eventType } from '../type/types'
import { getEventParams, push, uuid } from '../util/index'
import baseReportInstance from '@/reportUmp/base'

export default function (type: ReportTypeEnum, event: eventType, params = {}) {
  if (type === 'CLK') {
    baseReportInstance.add('click_id', uuid())
  }
  const { eventCode, eventId = EventTypeId.OTHER, region_code } = event
  const eventParams = getEventParams(params)
  try {
    push('aplus.record', [
      eventCode,
      type,
      {
        event_type_id: EventTypeId[type] || eventId,
        region_code: region_code,
        ...eventParams,
      },
    ])
  } catch (e) {
    console.error(e)
  }
}
