/* eslint-disable */
import { getEventParams, push } from '../util/index'
import baseReportInstance from '@/reportUmp/base'
import {EventTypeId} from "@/reportUmp/type/types";
import { getQueryObject } from '@/utils';

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
      pre_click_id: getQueryObject()?.pre_click_id || '', // 从登录页面跳转过来的click_id
      ...eventParams,
    },
  ])
}
export default function (router: any) {
  router.afterEach((to: any,from:any) => {
    const pageCode = to.meta?.pageCode
    const prePageCode = from.meta?.pageCode
    baseReportInstance.add('page_name', pageCode)
    baseReportInstance.add('pre_page_name', prePageCode)
    pvReport(pageCode)
  })
}
/* eslint-disable */
