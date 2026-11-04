/* eslint-disable */
import {DirectiveBinding, EventTypeId, ReportType} from '../type/types'
import { getBindKey, getEventParams, getParamsByBinding, push, uuid } from '../util/index'
import baseReportInstance from '@/reportUmp/base'

/**
 * 点击上报
 * @param {*} eventCode 事件ID 或 事件编码
 * @param {*} eventParams 事件中上报的事件参数
 */
export const clickReport = (eventCode: string, params = {}) => {
  if(!eventCode){
    return
  }
  baseReportInstance.add('click_id',uuid())
  const eventParams = getEventParams(params)
  push('aplus.record', [eventCode, ReportType.点击, { event_type_id: EventTypeId.CLK, ...eventParams }])
}

export default function (Vue: any) {
  const { bindKey, unbindKey } = getBindKey(Vue.version)
  const createClickListener = (binding:any) =>{
    return function(event:MouseEvent) {
      clickListen(event, binding);
    };
  }
  //监听点击事件
  const clickListen = (e:MouseEvent,binding:DirectiveBinding) => {
    const params = binding.value
    const modifiers = binding.modifiers
    const {eventCode='', workId='' } = params || {}
    //有workId添加到base数据中
    if (workId) {
      baseReportInstance.add('work_id', workId)
    }
    //有stop修饰符，则停止传播
    if(modifiers?.stop){
      e.stopPropagation()
    }
    clickReport(eventCode, getParamsByBinding(params || {}))
  }
  Vue.directive('click-report', {
    [bindKey](el: HTMLElement, binding: DirectiveBinding) {
      el.addEventListener('click', createClickListener(binding))
    },
    [unbindKey](el: HTMLElement) {
      el.removeEventListener('click',createClickListener)
    },
  })
}
/* eslint-disable */