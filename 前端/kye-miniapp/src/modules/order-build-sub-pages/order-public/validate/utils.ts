import {
  ChangeKeys,
  CheckDetail,
  localCheckResult,
  Module,
  popoverConfigType,
  Restrict,
  RestrictData,
} from '@order-public-sub-public/types'
import { addBatchExistValidationMap, existValidationMap, getChannel } from '@order-public-sub-public/configs'
import {
  CancelOrderSourceType,
  Channel,
  CheckShowType,
  ModuleStyle,
  ModuleType,
  OrderPageType,
  SOURCEC,
  validateType,
} from '@order-public-sub-public/constants'

import { aiAddrAnalysis } from '@order-public-sub-public/apis/address'
import { cloneDeep, isElement } from 'lodash-es'
import { capitalLize } from '@order-public-sub-public/utils/string'
import { applyOrder, updateSelectStatus } from '@order-public-sub-public/apis'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { isAliPayClient, isAmapApp, isAppiOS, isWechat } from '@order-public-sub-public/utils/device'
import { getEnvConfig } from '@/public/config'
import { localStorage, sessionStorage } from '@order-public-sub-public/utils/storage'

import { $native as native, getQueryObject } from '@order-public-sub-public/utils'
import { getBaseUrl, isPROD } from '@order-public-sub-public/utils/env'
import { BatchProcessResultResponse } from '@order-public-sub-public/apis/batch/types'
import { cancelWaybill } from '@order-public-sub-public/apis/waybill/orderSuccess'
import { nextTick, watch } from 'vue'
import { orderPreload } from '@order-public-sub-root-pages/order-single/report'
import Taro from '@tarojs/taro'
import {
  orderPageScrollTop,
  orderPageScrollTopHistory,
} from '@order-public-sub-root-pages/order-single/hooks/useScrollTop'
import { sleep } from '@order-public-sub-public/utils/sleep'
import { triggerWaybillSearch } from '@/public/storage'
import { openURL } from '@/modules/webview/utils'
import plateForm from '@kye-netc/plateform'
import { showDialog } from '@kye-netc/kye-miniui'
import {
  kaCustomerMapHistoryScroll,
  kaCustomerPageScrollTop,
} from '@order-public-sub-public/components/business/ka-customer-map/hooks/useScroll'
import {
  productPageScrollHistoryScroll,
  productPageScrollTop,
} from '@order-public-sub-public/components/business/product-info/page/hooks/useScroll'
import {
  goodsTypeUploadHistoryPageScroll,
  goodsTypeUploadScrollTop,
} from '@order-public-sub-public/components/business/product-info/components/goods-type-files/useScroll'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()
/**
 * 通过data-validate的key寻找对应的dom
 * @param validateKey data-validate的key
 * @param parentDom 非必传，指定根元素，默认document
 * @param option needCompatible是否兜底查找
 * @return dom或者undefined
 */
export const getFieldDomByKey: any = (
  validateKey: string,
  parentDom?: Element,
  option?: {
    needCompatible?: boolean
  },
) => {
  let target = validateKey?.split('.').join('_')
  let targetDom = document.getElementById(target)
  return targetDom
  // if (!isElement(parentDom)) {
  //   parentDom = undefined
  // }
  // const { needCompatible = false } = option || {}
  // const selector = `[data-validate='${validateKey}']`
  // const startDom = parentDom || document
  // // const selectorList = startDom.querySelectorAll(selector)
  // const selectorList = []
  // if (selectorList.length > 1) {
  //   console.warn(`校验id设置重复: ${validateKey}`)
  //   return selectorList[selectorList.length - 1]
  // }
  // const dom = startDom.querySelector(selector)
  // if (!dom && needCompatible) {
  //   // 兜底寻找上一级，比如：productInfo.goodsType找不到，就会去找比如productInfo.productInfo
  //   const validateKeyList = validateKey.split('.')
  //   const firstKey = validateKeyList[0]
  //   if (firstKey !== validateKeyList[1]) {
  //     // console.warn(`表单项dom的id未找到：${validateKey}`)
  //     return getFieldDomByKey(`${firstKey}.${firstKey}`)
  //   }
  //   console.warn(`表单项dom未设置校验id: ${validateKey}`)
  //   return undefined
  // }
  // return dom
}

/**
 * 远程校验气泡转换成本地校验结果
 * @param results 本地校验结果
 * @return 合并后的校验结果
 */
export const remoteBubbleParam = async (param: CheckDetail): Promise<localCheckResult | undefined> => {
  const { key, content, blockedFlag = true, showType, waybillNumber, extraData } = param
  if (typeof key !== 'string') {
    return
  }
  const normalResultItem = {
    key,
    passed: true,
    content: '',
    blockedFlag: false,
    showType: CheckShowType.BUBBLE,
    bubbleConfig: {},
  }
  let type = key.split('.')[0]
  type = capitalLize(type)
  const currentExistValidationMap = getValidationMap()
  const checkFun = currentExistValidationMap[type]
  let resultItem: localCheckResult | undefined
  let checkResultList: localCheckResult[] = []
  if (typeof checkFun === 'function') {
    checkResultList = await checkFun()
    resultItem = checkResultList?.find((i) => i.key === key)
  } else {
    console.log('校验函数非函数类型', checkResultList, type, checkFun)
    resultItem = normalResultItem

    // 不在注册列表中的特殊样式处理
    if (specialComponentList[type as keyof typeof specialComponentList]) {
      resultItem.bubbleConfig = specialComponentList[type as keyof typeof specialComponentList]
    }
  }
  //兜底,找不到key,会找一级key，比如productInfo.goodsType找不到，就会去找比如productInfo.productInfo
  //兜底,还需要找不到Dom的情况下挂在父级避免，当有当前key的时候被设置到了上一级
  const targetDom: Element | null = getFieldDomByKey(key)
  if (!resultItem || !targetDom) {
    const keyList = key.split('.')
    const newKey = `${keyList[0]}.${keyList[0]}`
    resultItem = checkResultList?.find((i) => i.key === newKey)
    if (resultItem) {
      resultItem.key = newKey
    }
  }
  if (!resultItem) {
    console.warn('注册表未找到', key)
    resultItem = normalResultItem
  }
  const newBubbleConfig = {
    ...resultItem.bubbleConfig,
    waybillNumber,
  }
  resultItem = {
    ...resultItem,
    content,
    showType,
    blockedFlag,
    passed: false,
    extraData,
    bubbleConfig: newBubbleConfig,
  }
  return resultItem
}

/**
 * 将远程校验数组中所有气泡筛选出来并转本地校验结果
 * @param results 本地校验结果数组
 * @return 合并后的校验结果
 */
export const getBubbleTypeList = async (results: CheckDetail[]): Promise<localCheckResult[]> => {
  const bubbleTypeList = []
  for (const item of results) {
    const isBubble = item.showType === CheckShowType.BUBBLE
    if (!isBubble) {
      continue
    }
    const localCheckResult = await remoteBubbleParam(item)
    if (localCheckResult) {
      bubbleTypeList.push(localCheckResult)
    } else {
      //兜底提示
      console.warn('remoteBubbleParam', item)
      showToast(item.content)
    }
  }
  return bubbleTypeList
}

/**
 * 获取已经渲染的模块校验函数，来自注册表
 * @param componentList 组件数组，不传默认取注册表
 * @return 校验函数
 */
export const getCheckByComponentList = (componentList = piniaStore.globalData.componentList) => {
  const checkFunList: Array<() => Promise<any>> = []
  componentList.forEach((i) => {
    if (existValidationMap[i]) {
      checkFunList.push(existValidationMap[i])
    }
  })
  return checkFunList
}

/**
 * 每个单词首字母转大写
 * @param s 需要转换的字符
 * @return string
 */
export const titleCase = (s: string) => {
  let i
  const ss = s.toLowerCase().split(/\s+/)
  for (i = 0; i < ss.length; i++) {
    ss[i] = ss[i].slice(0, 1).toUpperCase() + ss[i].slice(1)
  }
  return ss.join(' ')
}

export const getClientRect = async (currentSelector: string) => {
  return new Promise((resolve) => {
    const query = Taro.createSelectorQuery()
    query
      .select(`#${currentSelector}`)
      .boundingClientRect()
      .exec((res) => {
        const dom = res[0]
        resolve(dom)
      })
  })
}
/**
 *获取元素到顶部的距离
 * @param selector 指定元素id的数组
 * @return number 默认取数组中距离最大的返回
 */
export const getDomToTopHeight = async (selector?: string[]) => {
  let top = 0
  let ignorHeight = 0
  if (!selector || !Array.isArray(selector)) {
    return top
  }
  console.log('元素', selector)
  try {
    for (let i = 0; i < selector?.length; i++) {
      const currentSelector = selector[i]
      const dom = await getClientRect(currentSelector)
      console.log('出的速度速度速度速', dom)
      const currentTop = dom ? dom.bottom : 0
      if (selector.length > 1 && currentSelector === 'BindCustomerBar' && dom) {
        ignorHeight = currentTop
      }
      if (currentTop > top) {
        top = currentTop
      }
    }
    // selector.forEach( (currentSelector) => {
    //   const query = Taro.createSelectorQuery()
    //   query
    //     .select(`#${currentSelector}`)
    //     .boundingClientRect()
    //     .exec((res) => {
    //       console.log('测试数据124',res)
    //       const dom = res[0]
    //
    //     })
    //   // const dom = document.getElementById(`#${currentSelector}`)?.getBoundingClientRect()
    //   // console.log("测试数据124",dom)
    //   // const scrollTop = document.querySelector('.order-content')?.scrollTop || 0
    //   // const currentTop = dom ? dom.y + dom.height + scrollTop : 0
    //
    //   // 排除绑码提示条可关闭的高度
    //   // if (selector.length > 1 && currentSelector === 'BindCustomerBar' && dom) {
    //   //   ignorHeight = currentTop
    //   // }
    //   // if (currentTop > top) {
    //   //   top = currentTop
    //   // }
    // })
  } catch (e) {
    console.warn('不可点击区域遮罩层的高度元素为必传,或者检查格式')
    return 0
  }
  return top - ignorHeight
}

//获取元素到文档顶部的区域
export const getTop = (ele: Element) => {
  let result = {
    left: 0,
    top: 0,
  }
  try {
    if (!ele.getClientRects().length) {
      return result
    }
    if (window.getComputedStyle(ele)['display'] === 'none') {
      return result
    }
    result = ele.getBoundingClientRect()
    const docElement = ele.ownerDocument?.documentElement
    return {
      top: result.top + window.pageYOffset - docElement.clientTop,
      left: result.left + window.pageXOffset - docElement.clientLeft,
    }
  } catch (e) {
    return result
  }
}
/**
 *判断元素是否在可视区域
 */
export const isElementVisible = (el: Element) => {
  if (!isElement(el)) {
    return
  }
  const rect = el.getBoundingClientRect() || {}
  const vWidth = window.innerWidth || document.documentElement.clientWidth
  const vHeight = window.innerHeight || document.documentElement.clientHeight
  if (rect?.right < 0 || rect?.bottom < 0 || rect?.left > vWidth || rect?.top > vHeight - 80) {
    return false
  }
  return true
}

/**
 *滚动到指定元素
 * @param targetDom 目标元素dom
 */
export const scrollIntoView = (targetDom: Element) => {
  if (!isElement(targetDom)) {
    return
  }
  // targetDom.scrollIntoView({
  //   behavior: 'smooth',
  //   block: 'center',
  // })
}

/**
 *智能识别
 */
// eslint-disable-next-line complexity
export const getAiAddrAnalysis = async (keyword: string) => {
  try {
    const { data } = await aiAddrAnalysis({ text: keyword })
    console.log('地址解析===>', data?.addressInfos?.[0])
    const {
      name = '',
      mobilePhone,
      mobile,
      telephone,
      extension,
      province,
      city,
      county,
      district,
      address,
      detailAddress,
      company,
    } = data?.addressInfos?.[0] || {}
    const res = {
      person: name || '',
      mobile: mobile || mobilePhone || '',
      telephone: telephone || '',
      extension: extension || '',
      province: province || '',
      city: city || '',
      county: district || county || '',
      detailAddress: address || detailAddress || '',
      companyName: company || '',
    }
    return res || null
  } catch (error) {
    console.log('error', error)
    return null
  }
}
/**
 *发起审核
 */
export const applyOrderAuth = async () => {
  await applyOrder({
    operationSource: SOURCEC,
  })
}
/**
 *判断是否base64
 */
export const isBase64 = (str: string) => {
  const notBase64 = /[^A-Z0-9+/=]/i
  const len = str.length
  if (!len || len % 4 !== 0 || notBase64.test(str)) {
    return false
  }
  const firstPaddingChar = str.indexOf('=')
  return (
    firstPaddingChar === -1 || firstPaddingChar === len - 1 || (firstPaddingChar === len - 2 && str[len - 1] === '=')
  )
}
/**
 *判断是否首页
 */
export const isOrderPage = () => {
  console.log('isOrderPage', getCurrentPageName())
  return ['order', 'order-batch'].includes(getCurrentPageName())
}

/**
 * 获取当前页面路由名字
 */
export const getCurrentPageName = (isOrderBatchWaybill?: boolean) => {
  const pages = Taro.getCurrentPages()
  const currentPage = pages[pages.length - 1]
  let pageName = currentPage?.$taroPath || ''
  pageName = pageName.split('?')[0]
  if (pageName === 'modules/order-build/pages/order/index') {
    return 'order'
  }
  if (pageName?.indexOf('page/product-info-page/index') !== -1) {
    return 'product-info'
  }
  if (pageName?.indexOf('business/added-service/page/added-service-page/index') !== -1) {
    return 'added-service'
  }
  if (pageName?.indexOf('order-public/components/business/address-book/page/index') !== -1) {
    return 'address-book'
  }
  if (pageName?.indexOf('order-public/components/business/receive/page/address-page/index') !== -1) {
    return 'receive-page'
  }
  if (pageName?.indexOf('order-public/components/business/sender/page/address-page/index') !== -1) {
    return 'sender-page'
  }
  if (pageName?.indexOf('order-build/pages/order-back/index') !== -1) {
    return 'order-back'
  }
  if (typeof pageName === 'string') {
    return pageName
  }
  // 兜底逻辑
  return isOrderBatchWaybill ? 'order-batch-waybill' : ''
}
/**
 * 地址推荐选择更新
 */
export const updateSelect = async () => {
  await updateSelectStatus()
}

//获取具有attribute的父级
export const getAttributeRoot = (c: Element, attribute: string, value: string) => {
  if (!isElement(c)) {
    return
  }
  const achieve = (e: Element) => {
    return e.getAttribute(attribute) === value
  }
  try {
    while (c && c?.tagName?.toLowerCase() !== 'body' && !achieve(c)) {
      if (c) {
        c = <Element>c?.parentNode
      }
    }
    return c
  } catch (e) {
    return ''
  }
}

/**
 * 获取具有data-validate的父元素
 * @param c 开始寻找的元素
 */
export const getParent = (c: Element) => {
  if (!isElement(c)) {
    return
  }
  try {
    while (c && c?.tagName?.toLowerCase() !== 'body' && !c?.getAttribute('data-validate')) {
      if (c) {
        c = <Element>c?.parentNode
      }
    }
    return c
  } catch (e) {
    return ''
  }
}

const cliBoardKey = 'clipboard-permission'
/**
 * 获取粘贴板权限
 * @returns
 */
export const getClipboardPermission = () =>
  new Promise(async (resolve, reject) => {
    const cliBoardValue = Taro.getStorageSync(cliBoardKey)
    // 私有内容 _
    const _cliBoardContent = (await Taro.getClipboardData())?.data || ''
    if (cliBoardValue !== '') {
      resolve(cliBoardValue === true ? _cliBoardContent : '')
    } else {
      showDialog({
        parentClassName: 'order-page-container',
        zIndex: 1000,
        title: `“跨越速运” 需要剪贴板权限`,
        message: '需要获取您的剪贴板权限，用于智能填写寄件人、收件人、联系电话及地址信息，方便您快捷下单',
        confirmButtonText: '好',
        cancelButtonText: '不允许',
        showCancelButton: true,
      })
        .then(() => {
          Taro.setStorage({ key: cliBoardKey, data: true })
          resolve(_cliBoardContent)
        })
        .catch(() => {
          Taro.setStorage({ key: cliBoardKey, data: false })
          reject('')
        })
    }
  })

let cachedClipboardResult: Promise<string> | null = null

/**
 * @description 判断粘贴板是否满足条件
 * @return boolean
 */
export const tellClipBoardHasChange = async () => {
  // 避免多次调用触发多次系统剪贴板提示
  if (cachedClipboardResult) {
    return cachedClipboardResult
  }
  cachedClipboardResult = (async () => {
    try {
      const word = await getClipboardPermission()
      if (typeof word !== 'string') {
        return ''
      }
      const reg = /(省|市|区)/
      const noNeedAnalysis = !reg.test(word) || word.length < 11
      //剪切板内容发生变化
      const hasChange = (word?: string) => {
        const historyWord = localStorage?.getItem('clipboardData')
        return historyWord !== word
      }
      if (hasChange(word) && !noNeedAnalysis) {
        return word
      }
      return ''
    } catch (e) {
      return ''
    }
  })()
  return cachedClipboardResult
}
/**
 * @description 根据changeKey获取type
 * @param key
 */
export const getTypeByChangeKey = (key: ChangeKeys) => {
  if (typeof key !== 'string') {
    return
  }
  const type = key.split('.')[0]
  return capitalLize(type)
}

/**
 * @description 获取moduleStyle
 */
export const getModuleStyle = (key?: ChangeKeys, orderPageType?: OrderPageType) => {
  if (!key) {
    return ''
  }

  // 批量寄公共部分场景，moduleStyle需要固定
  if (orderPageType === OrderPageType.批量寄) {
    // 货物信息相关固定为page
    if (key.includes('productInfo')) {
      return ModuleStyle.跳转
      // 增值服务相关固定为弹窗
    } else if (key.includes('addedService')) {
      return ModuleStyle.弹窗
    }
  }

  // 地址簿调用过程中接口，不走缓存，需要传other入参
  const href = location.hash
  if (href.includes('address-book-sender') || href.includes('address-book-receive')) {
    return 'other'
  }

  const type = getTypeByChangeKey(key) as ModuleType
  const configData = piniaStore.schema.moduleConfigData(type, true)
  return configData.moduleStyle ?? ''
}

/**
 * @description 查询并剔除处理符合defer
 */

function findDefer(list: Restrict[]): undefined | Restrict
function findDefer(list: CheckDetail[]): undefined | CheckDetail
function findDefer(list: Restrict[] | CheckDetail[]) {
  if (!Array.isArray(list)) {
    return undefined
  }
  const hasOrderInOrderPageIndex = list.findIndex((i) => i.defer)
  const needCache = hasOrderInOrderPageIndex > -1 && !isOrderPage()
  if (!needCache) {
    return undefined
  }
  const item = list[hasOrderInOrderPageIndex]
  list.splice(hasOrderInOrderPageIndex, 1)
  return item
}
function findAccessDefer(list: CheckDetail[]) {
  if (!Array.isArray(list)) {
    return undefined
  }
  const deferList = []
  const deferIndexList = []
  for (let i = 0; i < list.length; i++) {
    const item = list[i]

    if (item.defer && !isOrderPage()) {
      deferList.push(item)

      // 收集defer的index
      deferIndexList.push(i)
    }
  }

  // 删除包含defer的数据
  removeIndices(list, deferIndexList)
  return deferList
}

/**
 * 删除数组中指定 index列表 中的数据 且 改变源数据
 * @param list 数组
 * @param indices 需要删除的index 列表
 */
export const removeIndices = <T>(list: Array<T>, indicesToRemove: number[]) => {
  indicesToRemove.sort((a, b) => b - a)
  for (const index of indicesToRemove) {
    list.splice(index, 1)
  }
}

/**
 * @description 校验数据过滤defer字段
 */
export const filterAccessDefer = (list: CheckDetail[]) => {
  const item = findAccessDefer(list)
  if (!item || !item?.length) {
    return undefined
  }
  return {
    type: validateType.校验,
    accessData: item,
  }
}
/**
 * @description 管控数据过滤defer字段
 */

export const filterLimitDefer = (list: Restrict[], restrictData: RestrictData) => {
  const item = findDefer(list)
  if (!item || !restrictData) {
    return undefined
  }
  const key = item.flag
  return {
    type: validateType.管控,
    limitData: {
      flag: key,
      limitResult: restrictData[key],
    },
  }
}

/**
 * @description 更新需要通过page触发清空副作用
 * @param pageName 页面名称
 * @param componentEffect 模块名字，就是组件注册表名字
 */

export const updateEffectPage = (pageName: string, componentEffect: string) => {
  if (!pageName || !componentEffect) {
    return
  }
  piniaStore.extend.updateEffectPage({
    data: {
      pageName,
      effect: componentEffect,
    },
  })
}

//跳转整车
export const skipVehicleOrder = async () => {
  // const { isApp } = await getEnvConfig()
  const appId = 'wx7dfdbaaa00ca7246'
  const path = 'pages/index/index'
  // 判断环境 确认地址
  // const url = isPROD
  //   ? 'https://kuasheng-h5-cdn.kye-erp.com/ecs-zc-app?hideNav=true'
  //   : 'http://erp-kuasheng-h5-uat.kye-erp.com/ecs-zc-app?hideNav=true'
  plateForm.openMiniProgram({
    userName: 'gh_d340a0e2461d',
    path,
    miniprogramType: 0,
    appId,
    envVersion: 'release',
  })
}

//临时处理existValidationMap
export const initBatchExistValidationMap = () => {
  // const componentList = getRanderModuleList()
  const componentList: string[] = []
  console.log(componentList)
  componentList.forEach((i) => {
    addBatchExistValidationMap(i as unknown as ModuleType)
  })
}
/**
 * @description 获取组件对应的函数表
 * @param orderPageType 类型
 */
export const getValidationMap = () => {
  // return getCurrentPageName() === 'order-batch' ? batchExistValidationMap : existValidationMap
  return existValidationMap
}

/**
 * @description 批量校验、管控数据转成单票格式
 * @param data 批量返回的数据
 */
export const bathValidateToSingle = (data: BatchProcessResultResponse) => {
  const waybillInfoList = data.waybillInfoList
  const commonCheckResultList = data?.commonWaybillInfo?.checkResultList || []
  let batchRestrictData = data?.commonWaybillInfo?.restrictData
  const batchCheckResultList: CheckDetail[] = [...commonCheckResultList]
  if (!Array.isArray(waybillInfoList)) {
    return {
      checkResultList: batchCheckResultList,
      restrictData: batchRestrictData,
    }
  }
  waybillInfoList.forEach((i) => {
    const { waybillNumber, checkResultList, restrictData } = i
    if (!Array.isArray(checkResultList)) {
      return
    }
    checkResultList.forEach((c) => {
      const localResult: CheckDetail = {
        ...c,
        waybillNumber,
      }
      batchCheckResultList.push(localResult)
    })
    if (!batchRestrictData && restrictData?.restrictFlagList?.length) {
      batchRestrictData = restrictData
    }
  })
  return {
    checkResultList: batchCheckResultList,
    restrictData: batchRestrictData,
  }
}

/**
 * 排序组件列表，有些情况下需要动态调整组件校验顺序
 * @param componentList
 */
export const sortComponentList = (componentList: string[]) => {
  // 将"OverAreaDelivery"放到"PayMode"后面
  const newComponentList = cloneDeep(componentList)
  const index = newComponentList.findIndex((item) => item === 'OverAreaDelivery')
  if (index > -1) {
    newComponentList.splice(index, 1)
    newComponentList.splice(newComponentList.indexOf('ProductInfo') + 1, 0, 'OverAreaDelivery')
  }

  const orderPageType = piniaStore.root.getOrderPageType
  const ignoreList = orderPageType === OrderPageType.批量寄 ? ['Receive', 'PayMode', 'ProductInfo', 'AddedService'] : []

  // 从组件列表中排除忽略的组件
  ignoreList.forEach((item) => {
    const index = newComponentList.indexOf(item)
    if (index > -1) {
      newComponentList.splice(index, 1)
    }
  })

  return newComponentList
}

// 特殊场景组件配置
export const specialComponentList = {
  KaCustomerMap: {
    placement: 'bottom-start',
    offset: [10, -74],
  } as popoverConfigType,
}
/**
 * 更新url参数
 * @param newConfigId
 * @param newConfigVersion
 * @returns
 */
export function updateHashQueryParams(newConfigId: string, newConfigVersion: string) {
  const currentUrl = window.location.href
  const hashIndex = currentUrl.indexOf('#')
  if (hashIndex === -1) return // 如果没有哈希，则不更新

  const baseUrl = currentUrl.substring(0, hashIndex)
  const hashPart = currentUrl.substring(hashIndex + 1)

  // 分析hash部分的URL，这里不需要添加额外的斜杠
  const hashUrl = new URL('http://example.com/' + hashPart)

  // 更新参数
  hashUrl.searchParams.set('configId', newConfigId)
  hashUrl.searchParams.set('configVersion', newConfigVersion)

  // 重建哈希部分，确保不会在order前多加'/'
  let newHashPart = hashUrl.pathname.substring(1) + hashUrl.search

  // 确保不会在路径和查询字符串之间添加额外的斜杠
  if (newHashPart.startsWith('/')) {
    newHashPart = newHashPart.substring(1)
  }

  const newUrl = baseUrl + '#/' + newHashPart

  window.history.pushState({ path: newUrl }, '', newUrl)
}

//等待预加载页面的展示
export const awaitPageShow = async () => {
  const { preload } = getQueryObject()
  return new Promise((resolve) => {
    const prePageFun = () => {
      if (document.visibilityState === 'visible') {
        sessionStorage?.setItem('hasShowRemoteCheckDataHandOut', '1')
        document.removeEventListener('visibilitychange', prePageFun)
        resolve(true)
      }
    }
    console.log('preload', preload, orderPreload.value)
    if (preload && !isAppiOS) {
      if (orderPreload.value) {
        return resolve(true)
      }
      watch(
        () => orderPreload.value,
        (value) => {
          if (value) {
            resolve(true)
          }
        },
      )
      return
    }
    if (document.visibilityState === 'visible') {
      return resolve(true)
    }
    if (sessionStorage.getItem('hasShowRemoteCheckDataHandOut')) {
      return resolve(true)
    }
    document.addEventListener('visibilitychange', prePageFun)
  })
}

export const awaitOrderPageShow = async () => {
  return new Promise((resolve) => {
    let attempts = 0
    const maxAttempts = 4
    const interval = setInterval(() => {
      attempts++
      if (isOrderPage()) {
        clearInterval(interval)
        resolve(true)
      } else if (attempts >= maxAttempts) {
        clearInterval(interval)
        resolve(true)
      }
    }, 500)
  })
}

//等待初始化完成
export const awaitInitDone = () => {
  return new Promise((resolve, reject) => {
    const initDataPromise = piniaStore.globalData.initDataPromise
    if (initDataPromise) {
      try {
        initDataPromise
          .then(() => {
            resolve(true)
          })
          .catch(() => {
            reject(false)
          })
      } catch (e) {
        resolve(e)
      }
    } else {
      resolve(true)
    }
  })
}

//取消运单并等待返回后直接跳转查件列表
export const cancelOrderAndGoWaybillSearch = async (waybillNumber: string, immediate = false, signed: boolean) => {
  let cancelSource = CancelOrderSourceType.APP
  if (isWechat) {
    cancelSource = CancelOrderSourceType.小程序
  } else if (isAmapApp) {
    cancelSource = CancelOrderSourceType.高德小程序
  } else if (isAliPayClient) {
    cancelSource = CancelOrderSourceType.支付宝小程序
  }

  const cancelReason = signed
    ? '托寄物为危险品且已签订协议，系统自动取消运单'
    : '托寄物为危险品且未签订协议，系统自动取消运单'
  await cancelWaybill({
    waybillNumbers: [waybillNumber],
    cancelReason,
    cancelCode: '250',
    cancelSource: cancelSource,
  })
  const goSearch = () => {
    native?.refreshSearch()
    triggerWaybillSearch()
    Taro.switchTab({
      url: '/layout/pages/waybill/index',
    })
  }
  if (immediate) {
    goSearch()
    return
  }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      goSearch()
    }
  })
}

export const getRealNameUrl = (params?: { waybillNumber?: string; isFromShare?: boolean }) => {
  const { waybillNumber = '', isFromShare = false } = params || {}
  const orderPageSource = piniaStore.root.getOrderPageType === OrderPageType.单票 ? 'single' : 'batch'
  return `/modules/user/pages/realname/personal/index?orderPageSource=${orderPageSource}&forceFlag=10&origin=order_submit&waybillNumber=${waybillNumber}&isFromShare=${isFromShare}`
}
//跳转实名认证首页,非强制
export const goRealNameHome = (waybillNumber?: string) => {
  // openURL(getRealNameUrl({ waybillNumber }), {
  //   needLogin: true,
  // })
  Taro.navigateTo({
    url: getRealNameUrl({ waybillNumber }),
  })
}
let systemInfo: any = null

const getScrollValue = () => {
  const routeName = getCurrentPageName()
  let normalValue = orderPageScrollTop
  if (routeName?.indexOf('page/custom-encode/index') > -1) {
    normalValue = kaCustomerPageScrollTop
  }
  if (routeName?.indexOf('product-info') > -1) {
    normalValue = productPageScrollTop
  }
  if (routeName?.indexOf('goods-type-files') > -1) {
    normalValue = goodsTypeUploadScrollTop
  }
  return normalValue
}
export const taroScrollToPosition = async (id: string) => {
  const dom = await getClientRect(id)
  const { plateForm } = getEnvConfig()
  if (!dom) {
    return
  }
  //获取屏幕高度
  const getScreenHeight = (systemInfo: any) => {
    let screenHeight = plateForm === 'alipay' ? systemInfo?.screen?.height : systemInfo?.safeArea?.screenHeight
    screenHeight = screenHeight || systemInfo.windowHeight
    return screenHeight
  }
  //获取历史滚动距离
  const getScrollHistory = () => {
    const routeName = getCurrentPageName()
    let history = orderPageScrollTopHistory.value
    if (routeName?.indexOf('page/custom-encode/index') > -1) {
      history = kaCustomerMapHistoryScroll.value
    }
    if (routeName?.indexOf('product-info') > -1) {
      history = productPageScrollHistoryScroll.value
    }
    if (routeName?.indexOf('goods-type-files') > -1) {
      history = goodsTypeUploadHistoryPageScroll.value
    }
    return history
  }
  try {
    systemInfo = systemInfo ?? Taro.getSystemInfoSync()
    const screenHeight = getScreenHeight(systemInfo)
    const midHeight = Math.floor(screenHeight / 2)
    const navHeight = document.getElementsByClassName('ky-navbar--full')[0] ? 80 : 20
    let scrollDiff = 0
    const domTop = dom.top - navHeight
    const domBottom = dom.bottom - navHeight
    await nextTick()
    const historyScrollTop = getScrollHistory()
    //如果在顶部超出
    if (domTop < 0) {
      scrollDiff = historyScrollTop + domTop - midHeight
    }
    const footerDom = await getClientRect('order-footer-id')
    console.log(domTop, screenHeight, footerDom?.top, 'screenHeightscreenHeight')
    //底部超出
    if (domTop > footerDom?.top - 100) {
      scrollDiff = domBottom - screenHeight + historyScrollTop + midHeight
    }
    console.log('判断滚动1', domTop, screenHeight, scrollDiff)
    //在可视区域
    if (scrollDiff === 0) {
      const needLongTime =
        getChannel() === Channel.调价审核 || getChannel() === Channel.运单审核 || getChannel() === Channel.托寄物审核
      await sleep(needLongTime ? 400 : 100)
      return
    }

    getScrollValue().value = scrollDiff
    //主要为了解决安卓偶先设置了滚动位置不生效
    if (plateForm === 'wxminiapp') {
      setTimeout(() => {
        getScrollValue().value = scrollDiff - 1
      })
    }
    //滚动动画的延迟
    await sleep(300)
  } catch (e) {
    console.error(e)
  }
}

/**
 * 滚动到指定元素位置，确保其距离屏幕底部不小于 500px
 * @param id - 元素的 id
 */
export const taroAutoScrollToPosition = async (id: string, offset?: number) => {
  const needDistanceToBottom = offset || 550
  const dom = await getClientRect(id)
  if (!dom) return

  try {
    const systemInfo = Taro.getSystemInfoSync()
    const { plateForm } = getEnvConfig()

    // 获取安全区域内的屏幕高度（优先使用 safeArea）
    let screenHeight = 0
    if (plateForm === 'alipay' && systemInfo.screen?.height) {
      screenHeight = systemInfo.screen.height
    } else if (systemInfo.safeArea?.screenHeight) {
      screenHeight = systemInfo.safeArea.screenHeight
    } else {
      screenHeight = systemInfo.windowHeight
    }

    // 导航栏高度（用于修正位置）
    const navHeight = plateForm === 'alipay' ? 0 : 70

    // 元素底部距离屏幕顶部的距离（已减去导航栏偏移）
    const domBottom = dom.bottom - navHeight

    // 元素距离屏幕底部的距离
    const distanceToBottom = screenHeight - domBottom

    // 如果距离底部小于 500px，则需要滚动
    if (distanceToBottom >= needDistanceToBottom) {
      return // 不需要滚动
    }

    // 计算需要向上滚动的差值
    const needScrollUp = needDistanceToBottom - distanceToBottom

    // 当前页面已滚动的距离
    const currentScrollTop = orderPageScrollTopHistory.value

    // 新的 scrollTop：当前位置 + 需要上移的距离
    const newScrollTop = currentScrollTop + needScrollUp

    // 更新滚动状态（由页面 scroll-view 监听并生效）
    orderPageScrollTop.value = newScrollTop

    // 给滚动动画留出时间
    await sleep(300)

    console.log('[滚动调整] 元素距离底部:', distanceToBottom, '需上移:', needScrollUp, '新 scrollTop:', newScrollTop)
  } catch (e) {
    console.error('[taroScrollToPosition] 滚动失败:', e)
  }
}
