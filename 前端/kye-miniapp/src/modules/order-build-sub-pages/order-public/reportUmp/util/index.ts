/* eslint-disable */
import baseReportInstance from '@order-public-sub-public/reportUmp/base'
import { Indexable } from '../type/types'
import { localSttorage } from '@order-public-sub-public/utils/storage'
import Taro, { ENV_TYPE } from '@tarojs/taro'
import { report_other_event } from '@public/utils/reportUtil'
import { getCurrentPageName } from '@order-public-sub-public/validate/utils'
export const getBindKey = (version: string) => {
  const isVueNext = version.split('.')[0] === '3'
  const bindKey = isVueNext ? 'beforeMount' : 'bind'
  const unbindKey = isVueNext ? 'beforeUnmount' : 'unbind'
  return {
    bindKey,
    unbindKey,
  }
}

const window: {
  $umpOtherReport: any
} = {
  $umpOtherReport: () => {},
}
export const getEnv = () => {
  return Taro.getEnv()
}
/* 获取平台环境变量控件 */
export const getBridgeModule = () => {
  const env = getEnv()
  let bridge = {
    aplus_queue: {} as any,
    $umapm: {} as any,
  }
  switch (env) {
    case ENV_TYPE.ALIPAY:
      bridge = my
      break
    case ENV_TYPE.WEAPP:
      bridge = wx
      break
  }
  return bridge
}
const whitelist = [
  'other_express_single_perception_v1',
  'other_express_single_perception_module_v1',
  'clk_single_sub_v1',
]
export const push = (action: string, args: any[]) => {
  const key = args[0] || ''
  if (!whitelist.includes(key)) {
    return
  }
  report_other_event(key, args)
  // const sessionId_log = localStorage?.getItem('sessionId_log')
  // if (sessionId_log) {
  //   baseReportInstance.add('sessionId_log', sessionId_log)
  //   localStorage.removeItem('sessionId_log')
  // }
  // const bridge = getBridgeModule()
  // // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // // @ts-ignore
  // bridge.aplus_queue.push({
  //   action,
  //   arguments: args,
  // })
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
export const getParamsByBinding = (binding: any) => {
  const { regionCode, otherParams } = binding
  const businessParams = typeof otherParams === 'function' ? otherParams() : otherParams
  const params = {
    regionCode,
    ...businessParams,
  }
  return params
}

//获取上报参数
export const getEventParams = (params = {}) => {
  getPageCode()
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
      if (isObject(value)) {
        eventParams[prop] = JSON.stringify(value)
      }
      if (encryptionString.includes(prop) && typeof value === 'string') {
        // eventParams[prop] = rsaEncrypt(value)
      }
    }
  } catch (e) {
    console.error(e)
  }
  const routePageCode = getPageCode()
  // 显式传入的 page_code 优先（如取货资料页内捎句话事件上报 page_express_pickup_v1）
  eventParams.page_name = eventParams.page_code || routePageCode
  eventParams.page_code = eventParams.page_code || routePageCode
  // console.table(eventParams)
  return eventParams
}
//深拷贝
export const cloneDeep = (obj: Indexable<any>) => {
  let newObj: any

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
export const typeJudge = (target: any, type: string) => {
  return Object.prototype.toString?.call(target) === `[object ${type}]`
}
//是否是对象类型
export const isObject = (obj: any) => {
  return typeJudge(obj, 'Object') && obj
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
    value = (value as any) instanceof Promise ? await value : value
    newObj[key as keyof typeof newObj] = value
  }
  return newObj
}

//挑选对象部分属性
export const pick = (obj: Indexable<string>, arr: string[]) => {
  if (!isObject(obj) || !Array.isArray(arr)) {
    return obj
  }
  return arr.reduce((iter, val) => (val in obj && (iter[val] = obj[val]), iter), {} as Indexable<string>)
}
/* eslint-disable */

export const reportPerception = (eventCode: string, otherParams?: any) => {
  // const waybillNumber = piniaStore.order.waybillNumber
  // baseReportInstance.add('waybill_number', waybillNumber)
  window.$umpOtherReport(
    'EXP',
    {
      eventCode,
    },
    {
      ...otherParams,
    },
  )
}

export const getPageCode = () => {
  const pageName = getCurrentPageName()
  const pageCodeMap = {
    order: 'page_express_single_v1',
    'modules/order-build-sub-pages/pages/order-exhibition/index': 'page_express_exhibition_v1',
    'product-info': 'page_express_single_goods_message_goods_v1',
    'address-book': 'page_express_single_address_book_v1',
    'receive-page': 'page_express_single_fill_receiver_info_v1',
    'sender-page': 'page_express_single_fill_sender_info_v1',
    'order-back': 'page_express_single_return_msg_v1',
    'modules/order-build-sub-pages/order-public/components/business/pickup-information/page/index':
      'page_express_single_entrusted_pickup_v1',
    'modules/order-build-sub-pages/order-public/components/business/dispatch-information/page/index':
      'page_express_single_delivery_v1',
    'modules/order-build/order-public/components/business/ka-customer-map/page/custom-encode/index':
      'page_express_custom_encode_v1',
    'modules/order-build-sub-pages/pages/order-success/index': 'page_express_result_v1',
    'modules/order-build/order-public/components/business/address-book/sender/index':
      'page_express_single_sender_address_book_v1',
    'modules/order-build/order-public/components/business/address-book/receive/index':
      'page_express_single_receive_address_book_v1',
    'modules/order-build/order-public/components/business/address-book/clear-addr/index':
      'page_express_single_clear_address_book_v1',
    'modules/order-build-sub-pages/order-public/components/business/address-book/share-page/index':
      'page_express_single_fill_invite_v1',
    'modules/order-build-sub-pages/pages/share-send/invited-success/index': 'page_express_single_receive_invite_v1',
    'modules/order-build-sub-pages/pages/share-send/share/index': 'page_express_single_send_invite_v1',
    'modules/order-build-sub-pages/pages/share-send/invite-list/index': 'page_express_single_send_invite_list_v1',
    'modules/order-build-sub-pages/order-public/components/business/added-service/receipter-info/index':
      'page_express_receipt_return_v1',
    'modules/order-build-sub-pages/pages/receipt-page/ky-receipt-page/index': 'page_express_receipt_v1',
  }
  return pageCodeMap[pageName] || 'page_express_single_v1'
}
