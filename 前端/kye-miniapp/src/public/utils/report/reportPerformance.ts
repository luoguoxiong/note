/**
 * 小程序请求追踪系统 - 前后端埋点串联
 *
 * 架构说明:
 * - sessionId: App启动时生成，运行期间保持不变
 * - moduleName: 模块名称，标识当前子包
 * - webTraceId: 点击事件/请求超限时更新，用于追踪单次操作链路
 * - requestCount: 记录当前 webTraceId 下的请求数，计数 > 20 时自动重置
 *
 * 追踪ID格式: sessionId-moduleName-webTraceId
 * 示例: app_xxx-kye-miniapp-xxx
 */

import Taro from '@tarojs/taro'
import { SESSION_ID, report_other_event } from '../reportUtil'
import { uuid } from '@public/utils'

// ==================== 常量定义 ====================
/** 单次操作最大请求数，超过后重置 webTraceId */
const MAX_REQUEST_COUNT = 20

// ==================== 状态存储 ====================

interface TraceStore {
  sessionId: string
  moduleName: string
  webTraceId: string
  requestCount: number
}

/** 追踪状态存储 */
const traceStore: TraceStore = {
  sessionId: SESSION_ID,
  moduleName: '',
  webTraceId: '',
  requestCount: 0,
}

/** 获取当前页面路径 */
const getCurrentPagePath = (): string => {
  try {
    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const pageName = currentPage?.$taroPath
    return pageName || 'unknown'
  } catch {
    return 'unknown'
  }
}

/** 获取模块名称 */
const getModuleName = (): string => {
  try {
    const pageName = getCurrentPagePath()
    return pageName?.match(/(\w+)-build/)[1] || 'kye-miniapp'
  } catch {
    return 'kye-miniapp'
  }
}

// ==================== 核心方法 ====================

/**
 * 初始化追踪系统
 * @description App.onLaunch 时调用，生成 sessionId + 重置 webTraceId
 */
export const initTrace = () => {
  traceStore.sessionId = SESSION_ID
  traceStore.moduleName = getModuleName()
  traceStore.webTraceId = uuid()
  traceStore.requestCount = 0
}

/**
 * 重置 webTraceId
 * @description 点击事件/请求超限时调用，生成新的追踪ID
 */
export const resetWebTraceId = () => {
  traceStore.webTraceId = uuid()
  traceStore.requestCount = 0
}

/**
 * 记录用户点击事件
 * @param eventName - 事件名称，用于标识操作类型
 * @description 全局点击监听触发，更新 webTraceId + 重置请求计数
 */
export const trackClick = () => {
  resetWebTraceId()
}

/**
 * 记录请求
 * @description HTTP 请求时调用，计数 +1，超过 MAX_REQUEST_COUNT 自动重置 webTraceId
 * @returns 当前 webTraceId 下请求的序号
 */
export const recordRequest = (): number => {
  traceStore.requestCount += 1

  // 超过最大请求数，重置追踪ID
  if (traceStore.requestCount > MAX_REQUEST_COUNT) {
    console.warn('[Trace] 请求数超限，重置追踪ID', {
      count: traceStore.requestCount,
      webTraceId: traceStore.webTraceId,
    })
    resetWebTraceId()
    traceStore.requestCount = 1
    return 1
  }

  return traceStore.requestCount
}

/**
 * 获取完整追踪ID
 * @returns 格式: sessionId-moduleName-webTraceId
 * @description 拼接完整追踪ID，用于携带在 x-web-trace-id 请求头
 */
export const getTraceId = (): string => {
  try {
    if (!traceStore.webTraceId) {
      return ''
    }
    return `${traceStore.sessionId}-${traceStore.moduleName}-${traceStore.webTraceId}`
  } catch (e) {
    console.log(e)
    return ''
  }
}

/**
 * 获取追踪信息对象
 * @returns 包含所有追踪状态的对象
 */
export const getTraceInfo = () => {
  return {
    sessionId: traceStore.sessionId,
    moduleName: traceStore.moduleName,
    webTraceId: traceStore.webTraceId,
    traceId: getTraceId(),
  }
}

// ==================== 全局点击监听 ====================

/**
 * 初始化全局点击监听
 * @description 通过 document.addEventListener('click', handler, true) 捕获阶段监听
 */
export const initGlobalClickListener = (params: { pageId: string }) => {
  const { pageId } = params
  if (!pageId) {
    return
  }
  try {
    const listenClickId = document.getElementById(pageId)
    if (!listenClickId) {
      return
    }
    const handleTouchStart = () => {
      trackClick()
    }
    listenClickId?.addEventListener('touchstart', handleTouchStart)
  } catch (e) {
    console.log(e)
  }
}

// ==================== 初始化入口 ====================

/**
 * 追踪系统完整初始化
 * @description 在 App.onLaunch 中调用此方法
 */
export const initTraceSystem = () => {
  try {
    initTrace()
    addApiInterceptor()
    console.log('[Trace] 追踪系统已启动')
  } catch (e) {
    console.log(e)
  }
}

// ==================== 性能上报 ====================

/**
 * 添加 API 拦截器以捕获请求性能数据
 * @description 拦截 Taro 网络请求，当响应包含 profile 数据时上报性能指标
 * @private 内部使用，通过 initTraceSystem 调用
 */
const matchList = [
  'web.query.waybill.searchMobile',
  'web.order.configOrder.single.v2.orderSave',
  'web.order.init.quickOrder.singlePageResultV3',
  'web.query.waybill.queryRouteMobile',
  'web.query.waybill.judgeIsVisitorRoute',
]
const hasUrl = (url: string) => {
  if (!url) {
    return
  }
  return matchList.find((i) => url?.indexOf(i) > -1)
}
const addApiInterceptor = () => {
  try {
    const profileInterceptor = (chain) => {
      const requestParams = chain.requestParams
      let startTime = Date.now()
      const { url } = requestParams
      if (hasUrl(url) && getTraceId()) {
        requestParams.header['web-trace-id'] = getTraceId()
      }
      return chain.proceed(chain.requestParams).then((res) => {
        if (res.profile && hasUrl(url)) {
          res.startTime = startTime
          reportPerformance(res)
        }
        return res
      })
    }
    Taro.addInterceptor(profileInterceptor)
  } catch (e) {
    consolel.log(e)
  }
}

/**
 * 上报请求性能数据
 * @param data
 */
export const reportPerformance = (data: any) => {
  try {
    const traceId = JSON.parse(data?.data)?.traceId
    const profile = data?.profile
    if (!profile) {
      return
    }
    const { responseEnd, fetchStart } = profile
    const perData = {
      ...profile,
      endTime: Date.now(),
      startTime: data?.startTime,
    }
    const duration = responseEnd - fetchStart
    if (duration > 50000) {
      return
    }
    report_other_event('other_express_event_performance_v1', {
      'web-trace-id': getTraceId(),
      duration,
      traceId,
      profile: JSON.stringify(perData),
    })
    recordRequest()
  } catch (e) {
    console.log(e)
  }
}
