/* eslint-disable */
import { getEventParams, push } from '../util/index'
import baseReportInstance from '@order-public-sub-public/reportUmp/base'
import { EventTypeId } from '@order-public-sub-public/reportUmp/type/types'

/**
 * pv上报
 * @param {*} eventCode 事件ID 或 事件编码
 * @param {*} eventParams 事件中上报的事件参数
 */
export const pvReport = (eventCode: string, params = {}) => {
  const eventParams = getEventParams(params)
  if (!eventCode) {
    return
  }
  push('aplus.sendPV', [
    { is_auto: false },
    {
      event_type_id: EventTypeId.PV,
      eventCode,
      page_name: eventCode,
      title: document.title,
      ts: new Date().getTime(), //当前时间戳
      url: window.location.href, //当前page的url
      ...eventParams,
    },
  ])
}
export default function (router: any) {
  router.afterEach((to: any, from: any) => {
    const pageCode = to.meta?.pageCode
    const prePageCode = from.meta?.pageCode
    baseReportInstance.add('page_name', pageCode)
    baseReportInstance.add('pre_page_name', prePageCode)
    pvReport(pageCode)
  })
}
/* eslint-disable */
