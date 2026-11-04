export * from '@order-public-sub-public/utils/device'
export * from '@order-public-sub-public/utils/formatter'
export * from '@order-public-sub-public/utils/url'
export * from '@order-public-sub-public/utils/applicationUtil'
export * from '@order-public-sub-public/utils/user/index'
export * from '@order-public-sub-public/utils/platformApi'
export * from '@order-public-sub-public/utils/reportUtil'

import md5 from 'js-md5'
import {
  isAliPayClient,
  isAmapApp,
  isAppAndroid,
  isAppiOS,
  isWechat,
  isWxApplet,
  isWxPcApplet,
} from '@order-public-sub-public/utils/device'
import Native from '@order-public-sub-public/utils/native'
import { getVisitEnv } from './visit-env'
import { OrderInfo, PlainObject } from '@order-public-sub-public/types'
import { Channel, STATUS } from '@order-public-sub-public/constants'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { getOrderSearchUal } from '@order-public-sub-public/apis'
import { sleep } from '@order-public-sub-public/utils/sleep'
import { fileType } from '@order-public-sub-public/apis/pickup/type'
import Taro, { getCurrentInstance } from '@tarojs/taro'
import { localStorage } from '@order-public-sub-public/utils/storage'
import { getApplicationByApplicationCode } from '@/public/utils'
import plateform from '@kye-netc/plateform'

type DebouncedFunction<T extends (...args: any[]) => any> = (...args: Parameters<T>) => Promise<ReturnType<T>>

export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): DebouncedFunction<T> {
  let timeout
  // @ts-ignore
  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    const context = this

    clearTimeout(timeout)

    timeout = setTimeout(() => func.apply(context, args), wait)
  }
}

export const $native = new Native({ visitEnv: getVisitEnv() })

/**
 * 创建签名，用于网络请求
 * @param token
 * @param timestamp
 * @param body
 * @returns {string}
 */
export const createSign = (token: string, timestamp: number, body: PlainObject): string => {
  return md5(md5(token).toUpperCase() + timestamp + JSON.stringify(body || {})).toUpperCase()
}

/**
 * 获取 url 参数
 * @param url
 * @returns {{}}
 */
export const getQueryObject = (url = '') => {
  url = url ? url : window?.location?.href || ''
  if (!url) {
    // 获取当前页面实例
    const instance = getCurrentInstance()
    // 获取路由参数
    const routerParams = instance?.router?.params || {}
    return routerParams || {}
  } else {
    const search = url.substring(url.lastIndexOf('?') + 1)
    const obj: Record<string, any> = {}
    const reg = /([^?&=]+)=([^?&=]*)/g
    search.replace(reg, (rs, $1, $2) => {
      const name = decodeURIComponent($1)
      let val = decodeURIComponent($2)
      val = String(val)
      obj[name] = val
      return rs
    })
    return obj
  }
}

/**
 * 补零
 * @param num
 * @param targetLength
 * @returns {string}
 */
export const padZero = (num: number, targetLength = 2) => {
  let str = num + ''
  while (str.length < targetLength) {
    str = '0' + str
  }
  return str
}

// 查找父级组件
export function findParent(this: any, componentName: string) {
  let parent = this.$parent || this.$root
  let name = parent.$options.name
  while (parent && (!name || name !== componentName)) {
    parent = parent.$parent
    if (parent) {
      name = parent.$options.name
    }
  }
  return parent || null
}

// 查找子级组件
export function findChildren(this: any, componentName: string): any {
  const childrens = this.$children || []
  let children = null
  if (childrens.length) {
    for (const child of childrens) {
      const name = child.$options.name
      if (name === componentName) {
        children = child
      } else {
        children = findChildren?.call(child, componentName)
      }
      if (children) break
    }
  }
  return children
}

// 将对象元素转换成字符串以作比较
export const obj2key = (obj: Record<string, any>, keys: string[]) => {
  let n = keys.length
  const key = []
  while (n > 0) {
    n = n - 1
    key.push(obj[keys[n]])
  }
  return key.join('|')
}

// 解析座机号
export const regroup = (obj: { phone?: string; extension?: string } = {}): { phone?: string; extension?: string } => {
  if (obj?.phone) {
    const str = obj.phone
    let arr: string[] = []
    arr = str.split('-')
    if (arr.length > 2) {
      obj = {
        ...obj,
        phone: `${arr[0]}-${arr[1]}`,
        extension: arr[2],
      }
    } else if (arr.length === 2 && (obj.phone.indexOf('-') === 4 || obj.phone.indexOf('-') === 3)) {
      obj = {
        ...obj,
        phone: `${arr[0]}-${arr[1]}`,
        extension: '',
      }
    } else if (arr.length === 2) {
      obj = {
        ...obj,
        phone: arr[0],
        extension: arr[1],
      }
    }
  }
  return obj || {}
}

// 时分对比大小
export const compareDate = (t1: string, t2: string) => {
  const date = new Date()
  const time1 = t1.split(':')
  const time2 = t2.split(':')
  return date.setHours(Number(time1[0]), Number(time1[1])) >= date.setHours(Number(time2[0]), Number(time2[1]))
}

export function getCleanAddress(addressObject: { province: string; city: string; dist: string; address: string }) {
  const { province, city, dist, address } = addressObject
  if (['北京', '上海', '天津', '重庆'].includes(province)) {
    return replaceTextList(address, [city, dist])
  } else {
    return replaceTextList(address, [province, city, dist])
  }
}

export function replaceTextList(text: string, textList: string[]) {
  function replaceText(text: string, rText: string): string {
    const replaceLength = rText.length
    if (text.length < replaceLength) return text
    const subText = text.substring(0, replaceLength)
    if (subText === rText) {
      return replaceText(text.substring(replaceLength), rText)
    } else {
      return text
    }
  }
  return textList.reduce((value, item) => {
    if (!item) return value
    return replaceText(value, item)
  }, text)
}

export function toCdb(str: string): string {
  let tmp = ''
  const dict: { [key: string]: string } = {
    '。': '.',
    '》': '>',
    '《': '<',
    '‘': "'",
    '’': "'",
    '、': '\\',
    '【': '[',
    '】': ']',
  }
  for (let i = 0; i < str.length; i++) {
    const item = dict[str[i]] as any
    if (item) {
      tmp += item
    } else if (str.charCodeAt(i) > 65248 && str.charCodeAt(i) < 65375) {
      tmp += String.fromCharCode(str.charCodeAt(i) - 65248)
    } else {
      tmp += String.fromCharCode(str.charCodeAt(i))
    }
  }
  return tmp
}

/**
 * 版本号比较，v1 是否大于 v2
 * @param v1
 * @param v2
 * @returns {boolean}
 */
export const compareVersion = (v1: string, v2: string) => {
  if (typeof v1 === 'string') {
    v1 = v1.replace(/v|V/, '')
  }
  const version1 = v1.split('.')
  const version2 = v2.split('.')
  const len = Math.max(v1.length, v2.length)

  // 调整两个版本号位数相同
  while (v1.length < len) {
    version1.push('0')
  }
  while (v2.length < len) {
    version2.push('0')
  }

  // 循环判断每位数的大小
  for (let i = 0; i < len; i++) {
    const num1 = parseInt(v1[i])
    const num2 = parseInt(v2[i])

    if (num1 > num2) {
      return true
    } else if (num1 < num2) {
      return false
    }
  }

  return true
}

/**
 * @description: 校验当前版本是否大于某个版本，例如app版本需要7.58.0才能是要某功能  需要需要传入7.57.0
 * @param {*} minVersion
 * @return {*}
 */
export const overVersionCheck = (minVersion = '7.57.0') => {
  let overVersion = false
  const userAgent = navigator?.userAgent || ''
  const version = isAppAndroid ? userAgent.match(/version=v(\S*)/)?.[1] : userAgent.match(/version=(\S*)/)?.[1]
  if (version && !isWxApplet) {
    //安卓和ios版本号是一致的
    overVersion = compareVersion(version, minVersion)
  }
  return overVersion
}

//判断app版本
export const judgeAppVersion = (targetVersion: string) => {
  let overVersion = false
  const userAgent = navigator?.userAgent || ''
  const version = isAppAndroid ? userAgent.match(/version=v(\S*)/)?.[1] : userAgent.match(/version=(\S*)/)?.[1]
  if (version && !isWxApplet) {
    //安卓和ios版本号是一致的
    overVersion = compareVersion(version, targetVersion)
  }
  return overVersion
}

// 返回一个随机的自然数（大于等于 0 的整数）。
export const natural = (min: number, max: number) => {
  min = typeof min !== 'undefined' ? parseInt(min.toString(), 10) : 0
  max = typeof max !== 'undefined' ? parseInt(max.toString(), 10) : 9007199254740992 // 2^53
  return Math.round(Math.random() * (max - min)) + min
}

// uuid
export const uuid = (): string => {
  function b(a?: number) {
    return a
      ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
      : (([1e7] as any) + -[1e3] + -4e3 + -8e3 + -1e11).replace(/[018]/g, b)
  }
  return b()
}

/** 整数和小数
 * value 值
 * INTEGER_LENGTH 整数位长度
 * DECIMAL_LENGTH 小数位长度
 */
export const decimalFilter = (value: string, INTEGER_LENGTH = 4, DECIMAL_LENGTH = 3) => {
  const parseIntAndLimitLength = (value: string, length: number) => {
    value = String(parseInt(value))
    value = isNaN(Number(value)) ? '' : value
    return value.slice(0, length)
  }

  const dotIndex = value.indexOf('.')
  if (dotIndex === -1) {
    return parseIntAndLimitLength(value, INTEGER_LENGTH)
  } else {
    const [integer, decimal] = value.split('.')
    return `${parseIntAndLimitLength(integer, INTEGER_LENGTH) || '0'}.${decimal.slice(0, DECIMAL_LENGTH)}`
  }
}

// 获取字符长度-只计算中文
export const getCharCodeLength = (str: string): number => {
  const l = str.length
  let count = 0
  for (let i = 0; i < l; i++) {
    if ((str.charCodeAt(i) & 0xff00) !== 0) {
      count += 2
    }
  }
  return count
}

/** 格式化手机号码 4 3 3 */
export const formatterPhone = (v: string) => {
  return v.replace(/[^\d]/g, '').replace(/(^\d{3})(\d{0,4})(\d{0,4})/, (_value, ...rest) => {
    const [$1, $2, $3] = rest
    if ($3) {
      return `${$1} ${$2} ${$3}`
    } else {
      if ($2) {
        return `${$1} ${$2}`
      } else {
        return $1
      }
    }
  })
}

/** 超过文本省略号处理 */
export const handleCropText = (value: any, number: string) => {
  if (!value) return ''
  if (value.length <= number) {
    return value
  } else {
    return value.slice(0, number) + '...'
  }
}
/** 判断字符串英文字母长度 */
export const calculateEngStringLength = (str: string) => {
  if (typeof str !== 'string') {
    return 0
  }
  let len = 0
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) <= 127 && str.charCodeAt(i) !== 94) {
      len += 1
    }
  }
  return len
}
/**
 * 转换并上传performanceSource用于日志分析
 * @param url 可选参数，指定上传的url，为空就是默认所有请求
 * @param ignoreSourceTypes 可选参数，需要排除的上传类型数组
 */
// export const performanceSourceCollect = (url = '', ignoreSourceTypes = []) => {
//   let resourceEntries: any[] = []
//   try {
//     const typeJudge = (target: unknown, type: string) => {
//       return Object.prototype.toString.call(target) === `[object ${type}]`
//     }
//     if (!typeJudge(url, 'String') || !typeJudge(ignoreSourceTypes, 'Array')) {
//       return console.warn('performanceSourceCollect  函数参数类型错误！')
//     }
//     if (window.performance && typeJudge(performance.getEntriesByType, 'Function')) {
//       const entries = performance.getEntriesByType('resource')
//       performance.clearResourceTimings()
//       //剔除需要忽略的请求
//       const ignoreHttp = [
//         'https://ic-h5-uat.kye-erp.com/json/collector',
//         'https://ic-h5.kye-erp.com/json/collector',
//         'https://kye-log-sdk-uat.ky-express.com/m.gif',
//         'https://kye-log-sdk-uat.ky-express.com/web_logs',
//         'https://kye-log-sdk.ky-express.com/web_logs',
//       ]
//       //过滤类型
//       resourceEntries = entries.filter((entry: any) => {
//         return (
//           ['other', 'beacon', ...ignoreSourceTypes].indexOf(entry.initiatorType) === -1 &&
//           !ignoreHttp.includes(entry.name)
//         )
//       })
//       //有url就只上传最新的该url的performance
//       if (url) {
//         resourceEntries = [resourceEntries.filter((entry) => entry.name.indexOf(url) > -1).pop()]
//       }
//       //转成语义化数据
//       resourceEntries = resourceEntries.map((entry: any) => {
//         const {
//           name,
//           transferSize,
//           initiatorType,
//           duration,
//           domainLookupStart,
//           domainLookupEnd,
//           connectStart,
//           connectEnd,
//           requestStart,
//           responseStart,
//           responseEnd,
//           startTime,
//         } = entry
//         return {
//           name,
//           transferSize,
//           initiatorType,
//           duration: Math.round(duration),
//           dns: Math.round(domainLookupEnd - domainLookupStart),
//           tcp: Math.round(connectEnd - connectStart),
//           request: Math.round(responseStart - requestStart),
//           response: Math.round(responseEnd - (responseStart || startTime)),
//         }
//       })
//       if (resourceEntries.length) {
//         window.__KYE_ERROR_LOG?.CUSTOM_REPORT(resourceEntries)
//       }
//     }
//   } catch (e: any) {
//     window.__KYE_ERROR_LOG?.CUSTOM_REPORT({
//       type: 'performance error',
//       resourceEntries: JSON.stringify(resourceEntries),
//       message: e.message,
//     })
//   }
// }

/**
 * 处理精度问题
 * @param num
 * @param len
 * @returns {number}
 */
export const handlePrecision = (num: number, len: number) => {
  const division = Math.pow(10, len)
  return Math.floor(division * +num) / division
}

/** 整数且第一位数不为零 */
export const integerNotZero = (value: string) => {
  const res = value.replace(/[^\d]/g, '')
  return res.length === 1 ? res : res.replace(/^0+/g, '')
}

/** 整数且首位不能输入零 */
export const firstNotZeroInteger = (value: string) => {
  const res = value.replace(/[^\d]/g, '')
  return res?.replace(/^0+/g, '') || ''
}

/** 对象转url参数 */
export const objectToUrlParams = (obj: Record<string, any> = {}) => {
  const tempArray = []
  for (const item in obj) {
    if (item) {
      tempArray.push(`${item}=${obj[item]}`)
    }
  }
  return tempArray?.join('&')
}

// Storage是否存满
export const isQuotaExceededError = (err: Error) => {
  return (
    err instanceof DOMException &&
    // everything except Firefox
    (err.code === 22 ||
      // Firefox
      err.code === 1014 ||
      // test name field too, because code might not be present
      // everything except Firefox
      err.name === 'QuotaExceededError' ||
      // Firefox
      err.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  )
}

export enum WaybillSourceType {
  微信小程序 = '270',
  APP = '10',
  扫二维码下单 = '240',
  支付宝小程序 = '410',
  高德小程序 = '420',
}
/**
 * @description 获取运单来源 270 小程序 10 APP快速寄件 240 扫码
 */
export const getWaybillSource = () => {
  const queryObj = getQueryObject()
  let waybillSource
  if (isWechat) {
    // 小程序
    waybillSource = WaybillSourceType.微信小程序
  } else if (isAmapApp) {
    waybillSource = WaybillSourceType.高德小程序
  } else if (isAliPayClient) {
    waybillSource = WaybillSourceType.支付宝小程序
  } else {
    // APP 快速寄件
    waybillSource = WaybillSourceType.APP
  }
  if (queryObj?.type === 'scan' || queryObj?.channel === Channel.扫二维码下单) {
    // 扫码下单
    waybillSource = WaybillSourceType.扫二维码下单
  }
  return waybillSource
}

export const compareArrays = (arr1: any[], arr2: any[], key: string) => {
  // 如果数组长度不同，说明发生变化
  if (arr1.length !== arr2.length) {
    return true
  }

  // 遍历arr1中的每个对象
  for (let i = 0; i < arr1.length; i++) {
    const params = arr1[i][key]

    // 判断arr2中是否存在相同id的对象
    const matchObj = arr2.find((obj) => obj[key] === params)

    if (!matchObj) {
      // 如果在arr2中找不到相同id的对象，说明发生变化
      return true
    }

    // 如果在arr2中找到了相同id的对象，继续比较属性是否相同
    if (JSON.stringify(matchObj) !== JSON.stringify(arr1[i])) {
      // 如果属性不相同，说明发生变化
      return true
    }
  }

  // 如果上面的所有条件都没有触发，说明数组未发生变化
  return false
}

/** 去除所有空格 */
export const filterAllSpace = (str: string): string => str?.replace(/\s+/g, '')

// 文字转unicode
export const convertToUnicode = (text: string) => {
  return text
    ?.split('')
    .map((char) => {
      return '\\u' + char.charCodeAt(0).toString(16).toUpperCase()
    })
    .join('')
}

/**
 * 去除所有空格的Unicode：
 *    - 零宽度空格 (\u200B)
 *    - 窄空格 (\u2009)
 *    - 不换行空格 (\u00A0, \xa0)
 *    - 全角空格 (\u3000)
 *    - 软连字符 (\u00AD)
 *    - 零宽度非连接连字符 (\u2060)
 *    - 零宽度连接符 (\u2060)
 */
export const filterUnicodeSpecialSpace = (str: string): string => {
  return str?.replace(/(\u200B)+|(\u2009)+|(\u3000)+|(\u00A0)+|(\u00AD)+|(\u2060)+|(\\xa0)+(\s+)/g, '')
}

// unicode转文字
export const stringFromUnicode = (unicodeString: string) => {
  return unicodeString
    .match(/\\u([0-9A-Fa-f]{4})/g)
    ?.map((hex) => String.fromCharCode(parseInt(hex.replace(/\\u/g, ''), 16)))
    .join('')
}

export const isDesktopWechatMiniprogram = () => {
  const userAgent = navigator.userAgent
  return isWxPcApplet || /WindowsWechat/i.test(userAgent) // WindowWechat是桌面版微信小程序的用户代理的一部分
}

/** 拉起打电话功能 */
export const callThePhone = (phone: string) => {
  if (isDesktopWechatMiniprogram()) {
    showToast('当前登录设备，暂不支持拨打功能')
    return
  }
  // const ele = document.createElement('a')
  // ele.setAttribute('href', `tel:${phone}`)
  // ele.setAttribute('display', 'none')
  // document.body.appendChild(ele)
  // ele.click()
  // document.body.removeChild(ele)
  plateform.makePhoneCall({
    phoneNumber: phone,
  })
}

/**
 * 唯品会入库号
 * @param v 输入的值
 * @returns
 */
export const formatterProductCode = (val: string) => {
  return val.replace(/[^0-9]/g, '').replace(/(^[A-Za-z0-9]{10})([A-Za-z0-9]+)/, '$1-$2')
}

/**
 * 手机号校验，支持 123 1234 1234 或 123 1234 1234-
 * @param v 输入的值
 * @param maxlength
 * @returns{string} 最大位数
 */
export const formatMobile = (v: string, maxlength: number) => {
  // 非数字变成空字符串
  v = v.replace(/[^\d]/g, '')
  let str1 = v.substring(0, 11)
  let str2 = v.substring(11, 15)
  return str2 ? `${str1}-${str2}` : str1
}

/**
 * 区号匹配，带出-，如：输入0755转0755-
 * @param value  输入的值
 * @param areaCode '0755|010|020'
 * @returns
 */
export const areaCodeMatch = (value: string, areaCode: string): string => {
  const sanitizedValue = value.replace(/\D/g, '')
  let maxRemainSize = 8
  if (sanitizedValue.startsWith('400') || sanitizedValue.startsWith('800')) {
    maxRemainSize = 10
    areaCode = '400|800'
  }

  const match = new RegExp(`^(${areaCode})`, 'i').exec(sanitizedValue)
  if (match) {
    const matchedAreaCode = match[0]
    let remainingInput = sanitizedValue.substring(matchedAreaCode.length)

    // 固定电话最大长度为8位
    if (remainingInput.length > maxRemainSize) {
      remainingInput = remainingInput.substring(0, maxRemainSize)
    }

    let formattedValue = matchedAreaCode

    if (remainingInput) {
      let post = `-${remainingInput}`
      post = post.replace(/^-+/, '-')

      formattedValue += post
    }

    return formattedValue
  }

  return sanitizedValue
}

/**
 * 分机号
 * @param data
 * @returns
 */
export const formatExtension = (value: string): string => value.replace(/\D/g, '')

/**
 * 过滤对象存在值的数据
 * @param data
 * @returns
 */
export const filterObjectHaveValue = (data: Record<string, any>) => {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== ''))
}

/**
 * 格式化带区号的固定电话。如：075528689956 转 0755-28689956
 * @param value
 * @returns
 */
export const telephoneFormat = (value: string) => {
  return value?.replace(/^(\d{4})(\d{4})(\d{2})(\d{2})$/, '$1-$2$3$4')
}

/**
 * 过滤手机号、固定电话空格
 * @param orderInfo
 * @returns
 */
export const filterFiledSpace = (data: OrderInfo) => {
  if (!data) {
    return data
  }
  const info = { ...data }

  // 寄件信息
  if (info.sender) {
    info.sender = {
      ...data.sender,
      mobile: filterAllSpace(data.sender?.mobile || ''),
      telephone: filterAllSpace(data.sender?.telephone || ''),
      person: filterUnicodeSpecialSpace(data.sender?.person || ''),
    }
  }

  // 收件信息
  if (data.receive) {
    info.receive = {
      ...data.receive,
      mobile: filterAllSpace(data.receive?.mobile || ''),
      telephone: filterAllSpace(data.receive?.telephone || ''),
      person: filterUnicodeSpecialSpace(data.receive?.person || ''),
    }
  }
  return info
}

/**
 * 图片转base64
 * @param url string
 * @param callback function
 */
export const getImageBase64 = (url: string, callback: (base64Data: string) => void): void => {
  const img = new Image()
  img.crossOrigin = 'Anonymous'
  img.src = url

  img.onload = function () {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height

    const ctx = canvas.getContext('2d')
    ctx && ctx.drawImage(img, 0, 0, img.width, img.height)

    const base64Data = canvas.toDataURL('image/png')
    callback(base64Data)
  }
}

/**
 * 处理值异常问题
 * @param value string
 * @returns string
 */
export const getValueOrEmpty = (value: string | undefined | null) => {
  return value && value !== '[]' ? value : ''
}
/**
 * 判断一个字符串是否为数字字符串
 * @param str
 * @returns
 */
export function isNumericString(str: string) {
  return /^\d+$/.test(str) && isFinite(Number(str))
}
// 四舍五入保留两位小数点
export const handleMoneyAmountShow = (v: any) => {
  if (typeof v === 'number' || (typeof v === 'string' && isNumericString(v))) {
    const value = Number(v || 0)?.toFixed(2)
    return numberSplit(value, 2)
  }
  return v
}

// 添加千元分隔符
export const addThousandsSeparator = (value: number | string) => {
  if (Number(value) >= 0) {
    return Number(value).toLocaleString('en-US')
  } else {
    return value
  }
}
// 判空
export const isEmptyText = (val: unknown) => {
  return val === '' || val === null || val === undefined
}

// 数字千位分割，带小数
export const numberSplit = (str: number | string, n: number) => {
  if (isNaN(str as number)) return str
  // str = setZero(str, n)
  n = !n && n !== 0 ? 2 : n
  str = Number(str).toFixed(n)
  return String(str).replace(/(\d)(?=(\d{3})+\.)/g, (_$0, $1) => $1 + ',')
}

// 增加分割符号
export const joinAt = (val: PlainObject, keys: string[], joinKey = '/') => {
  let str = ''
  keys.forEach((v, i) => {
    if (val[v]) {
      str = str + val[v]
      if (i < keys.length - 1) {
        str = str + joinKey
      }
    }
  })
  return str
}

export const isJSON = (str = '') => {
  if (typeof str === 'string') {
    try {
      const obj = JSON.parse(str)
      if (typeof obj === 'object' && obj) {
        return true
      } else {
        return false
      }
    } catch (e) {
      console.log('error：' + str + '!!!' + e)
      return false
    }
  } else {
    return false
  }
}

export const setUserUUid = () => {
  try {
    const locaUuid = localStorage?.getItem('userUuid')
    if (!locaUuid) {
      const uuidstr = uuid()
      localStorage?.setItem('userUuid', uuidstr)
    }
  } catch (error) {
    console.error(error)
  }
}

export const getH5OrderUrl = async () => {
  const enum MenulCodeEnum {
    // 使用新菜单编码
    安卓 = 'M1008',
    IOS = 'M0008',
    小程序 = 'M2008',
    支付宝小程序 = 'M5010',
  }

  const enum ChannelCodeEnum {
    安卓 = 'android',
    IOS = 'ios',
    小程序 = 'wechatApplet',
    支付宝小程序 = 'alipayMini',
  }
  try {
    let channelCode = ChannelCodeEnum.安卓
    let menuCode = MenulCodeEnum.安卓
    if (isAppiOS) {
      channelCode = ChannelCodeEnum.IOS
      menuCode = MenulCodeEnum.IOS
    } else if (isAliPayClient) {
      channelCode = ChannelCodeEnum.支付宝小程序
      menuCode = MenulCodeEnum.支付宝小程序
    }
    const { data } = (await getOrderSearchUal({ menuCodes: [menuCode], channelCode })) || {}
    const { vos } = data
    if (!vos?.length) return ''

    let H5_ORDER__ALIPAY = {}
    let H5_ORDER = {}
    vos[0].lightApplicationInfos?.forEach((item: any) => {
      if (item.applicationCode === 'H5_ORDER__ALIPAY') {
        H5_ORDER__ALIPAY = item
      } else if (item.applicationCode === 'H5_ORDER') {
        H5_ORDER = item
      }
    })
    // const curItem = vos[0].lightApplicationInfos?.find((item: any) =>
    //   ['H5_ORDER__ALIPAY', 'H5_ORDER'].includes(item.applicationCode),
    // )
    // return curItem?.loadAddress || ''
    if (isAliPayClient) {
      // bug#591947 解决版本存在不一致问题，优先使用 H5_ORDER__ALIPAY
      return H5_ORDER__ALIPAY?.loadAddress || H5_ORDER?.loadAddress || ''
    } else {
      return H5_ORDER?.loadAddress || ''
    }
  } catch (error) {
    console.log('getH5OrderUrl', error)
    return ''
  }
}

export const getH5OrderDefaultUrl = async () => {
  const enum MenulCodeEnum {
    安卓 = 'M1067',
    IOS = 'M1067',
    小程序 = 'M1067',
  }

  const enum ChannelCodeEnum {
    安卓 = 'android',
    IOS = 'ios',
    小程序 = 'wechatApplet',
  }
  try {
    const channelCode = ChannelCodeEnum.安卓
    const menuCode = MenulCodeEnum.安卓
    const { data } = (await getOrderSearchUal({ menuCodes: [menuCode], channelCode })) || {}
    const { vos } = data
    if (!vos?.length) return ''
    const curItem = vos[0].lightApplicationInfos?.find((item: any) => item.applicationCode === 'H5_ORDER_DEFAULT')
    return curItem?.loadAddress || ''
  } catch (error) {
    console.log('getH5OrderDefaultUrl', error)
    return ''
  }
}

/**
 * @Description: 请求轮询方法
 * @param {func} requestFn 需要轮询的请求，返回一个promise
 * @param {time} number resultCallBack 会将请求的返回传入到这个回调方法中，判断是否需要继续轮询
 * @param {endTime} awaitTime 两个请求之间间隔的时间
 */
export function reqPollingFunction<T>(
  requestFn: () => Promise<T>,
  resultCallBack: (data: T) => boolean,
  awaitTime = 300,
) {
  let isActive = true // 轮询状态控制

  const execute = async (): Promise<void> => {
    if (!isActive) return

    try {
      const data = await requestFn()
      const shouldContinue = resultCallBack(data)

      if (shouldContinue) {
        scheduleNext()
      } else {
        stop()
      }
    } catch (error) {
      console.error('轮询请求失败:', error)
      scheduleNext() // 错误后继续轮询
    }
  }

  const scheduleNext = () => {
    if (isActive) {
      setTimeout(execute, awaitTime)
    }
  }

  // 立即执行第一次请求
  execute()

  // 返回停止函数
  const stop = () => {
    isActive = false
  }

  return stop
}

// 循环检查上传状态
export const pollingCheckStatus = async (index: number, list: fileType[], maxTimes?: number) => {
  if (!list?.length) {
    return
  }
  const curmMaxTimes = maxTimes || 400
  if (index >= curmMaxTimes) {
    return
  }
  const hasUploading = list?.find((file) => file.status === STATUS.UPLOADING || file.status === STATUS.WAIT)
  const uploadingFail = list?.find((file) => file.status === STATUS.FAIL)
  if (uploadingFail) {
    return Promise.reject('文件上传失败')
  }
  if (hasUploading) {
    await sleep(300)
    await pollingCheckStatus(index + 1, list)
  }
}

/**
 * 获取预付运费url
 */
export const getPrepaidFreightUrl = () => {
  const res = getApplicationByApplicationCode('H5_PREPAID_FREIGHT')
  return res.loadAddress
}
