/* eslint-disable */

import { Any } from '@/types'
import { Indexable } from '../type/types'
import baseReportInstance from '@/reportUmp/base'
import { rsaEncrypt} from '@/reportUmp/encryption'

export const getBindKey = (version: string) => {
  const isVueNext = version.split('.')[0] === '3'
  const bindKey = isVueNext ? 'beforeMount' : 'bind'
  const unbindKey = isVueNext ? 'beforeUnmount' : 'unbind'
  return {
    bindKey,
    unbindKey,
  }
}

export const push = (action: string, args: Any[]) => {
  // console.log('上报的参数', action, args)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if(!window.aplus_queue){
    // @ts-ignore
    window.aplus_queue=[]
  }
  // @ts-ignore
  window.aplus_queue.push({
    action,
    arguments: args,
  })
}
//生成uuid
export const uuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
// 将指令参数转换成公用参数
export const getParamsByBinding = (binding: Any) => {
  const { region_code, otherParams } = binding
  const businessParams = typeof otherParams === 'function' ? otherParams() : otherParams
  const params = {
    region_code,
    ...businessParams,
  }
  return params
}

//获取上报参数
export const getEventParams = (params = {}) => {
  // console.log(
  //   '现在的参数',
  //   params,
  //   baseReportInstance.get(),
  //   Object.assign(cloneDeep(baseReportInstance.get()), params)
  // )
  const encryptionString = baseReportInstance.get('encryptionString', 'storeParams')?.split(',')
  const baseParams = cloneDeep(baseReportInstance.get())
  let eventParams = Object.assign(baseParams, params)
  try {
    eventParams = cloneDeep(eventParams)
    for (const prop in eventParams) {
      const value = eventParams[prop]
      if (value === undefined) {
        delete eventParams[prop]
      }
      if(isObject(value)){
        eventParams[prop] = JSON.stringify(value)
      }
      if (encryptionString.includes(prop) && typeof value === 'string') {
        eventParams[prop] = rsaEncrypt(value)
      }
    }
  } catch (e) {
    console.error(e)
  }
  return eventParams
}
//深拷贝
export const cloneDeep = (obj: Indexable<Any>) => {
  let newObj: Any

  if (typeof obj === 'object' && obj !== null) {
    newObj = obj instanceof Array ? [] : {}
    for (const key in obj) {
      newObj[key as keyof typeof newObj] = cloneDeep(obj[key as keyof typeof obj])
    }
  } else {
    newObj = obj
  }
  return newObj
}
//判断类型
export const typeJudge = (target:any, type:string) => {
  return Object.prototype.toString.call(target) === `[object ${type}]`
}
//是否是对象类型
export const isObject = (obj:any) => {
  return typeJudge(obj,'Object') && obj
}
//将对象value转换成字符串
export const getStringParams = async (obj = {}) => {
  const newObj = {}
  if (!isObject(obj)) {
    return obj
  }
  const keys = Object.keys(obj)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    let value = obj[key as keyof typeof obj]
    value = value as any instanceof Promise ? await value : value
    newObj[key as keyof typeof newObj] = value
  }
  return newObj
}

//挑选对象部分属性
export const pick = (obj:Indexable<string>,arr:string[]) => {
  if(!isObject(obj) || !Array.isArray(arr)){
    return obj
  }
  return arr.reduce((iter, val) => (val in obj && (iter[val] = obj[val]), iter), {} as Indexable<string>);
}
/* eslint-disable */

