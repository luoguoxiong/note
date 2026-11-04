/* eslint-disable */
import {DirectiveBinding, EventTypeId, Indexable, ReportListType, ReportType} from '../type/types'
import {getBindKey, getEventParams, getParamsByBinding, pick, push, uuid} from '../util/index'
import baseReportInstance from '@/reportUmp/base'

/**
 * 曝光上报
 * @param {*} eventCode 事件ID 或 事件编码
 * @param {*} eventParams 事件中上报的事件参数
 */
function recordReport(eventCode: string, params = {}) {
  const eventParams = getEventParams(params)
  push('aplus.record', [eventCode, ReportType.曝光, { event_type_id: EventTypeId.EXP, ...eventParams }])
}


export default (Vue: any) => {
  let timer : null | number = null //定时器
  const reportList: ReportListType[] =[] // 待上报的数组
  const bindingObj: Indexable<any> = {} //参数对象,保存参数
  const storeParams = baseReportInstance.get('','storeParams')
  const options = pick(storeParams,['root', 'threshold', 'time', 'isAllowRepeait']) //曝光的参数
  if(typeof IntersectionObserver !== "function"){
    console.error('IntersectionObserver API is not supported')
    return
  }
  //启动定时器,上报数组的内容
  const startTimer = ()=>{
    if(timer){
      return
    }
    timer = setInterval(()=>{
      endTimer()
      reportList.forEach(i=>{
        const nowTime = Date.now()
        const overTime = nowTime - i.startTime >= Number(options.time)
        if(overTime){
          i && i.reportFun()
        }
      })
    },Number(options.time))
  }
  //结束定时器
  const endTimer = ()=>{
    if(reportList.length ||　!timer){
      return
    }
    clearInterval(timer)
    timer = null
  }
  //移除上报数组
  const removeReport = (uuid:string)=>{
    const index = reportList.findIndex(i=>i?.umpUuid === uuid);
    if (index !== -1) {
      reportList.splice(index, 1);
    }
  }
  //曝光的回调
  const callback = (entries:IntersectionObserverEntry[]) => {
    entries.forEach((entry:IntersectionObserverEntry) => {
      const uuid = entry.target.getAttribute('ump-uuid')
      if(!uuid){
        return
      }
      const visuallyData = bindingObj[uuid]
      const { eventCode, workId } = visuallyData
      if (typeof workId === 'string') {
        baseReportInstance.add('work_id', workId)
      }
      const reportItem:ReportListType = {
        umpUuid:uuid,
        startTime:Date.now(),
        reportFun:()=>{
          recordReport(eventCode, getParamsByBinding(visuallyData || {}))
          removeListener(entry.target as HTMLElement)
        }
      }
      if (entry.isIntersecting) {
        reportList.push(reportItem)
        startTimer()
      } else {
        removeReport(uuid)
      }
    })
  }
  //观察实例
  const observer = new IntersectionObserver(callback, options as IntersectionObserverInit)

  //添加监听
  const addListener = (ele: HTMLElement, binding: DirectiveBinding) => {
    observer.observe(ele)
    const _uuid = uuid()
    bindingObj[_uuid] = binding.value
    ele.setAttribute('ump-uuid', _uuid)
  }
  //移除监听
  const removeListener = (ele: HTMLElement) => {
    observer.unobserve(ele)
    const uuid = ele.getAttribute('ump-uuid')
    if(!uuid){
      return
    }
    delete bindingObj[uuid]
    removeReport(uuid)
    ele.removeAttribute('ump-uuid')
  }

  const { bindKey, unbindKey } = getBindKey(Vue.version)
  // 自定义曝光指令
  Vue.directive('exposure-report', {
    [bindKey](el: HTMLElement, binding: DirectiveBinding) {
      addListener(el, binding)
    },
    [unbindKey](el: HTMLElement) {
      removeListener(el)
    },
  })
}
/* eslint-disable */
