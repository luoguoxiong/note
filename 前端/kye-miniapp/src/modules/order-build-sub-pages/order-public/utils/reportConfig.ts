import { getUserProfileInfo } from '@order-public-sub-public/apis'
import { getToken } from '@order-public-sub-public/utils/auth'
import { getEnv, isPROD } from '@order-public-sub-public/utils/env'
import { $native, getQueryObject, uuid, judgeAppVersion, overVersionCheck } from '@order-public-sub-public/utils'
import router from '@order-public-sub-public/router'
import { sourceActionReportMap, sourcePageReportMap } from '@order-public-sub-public/configs/report'
import { isWxApplet, isClient, isAliPayClient } from '@order-public-sub-public/utils/device'

import { pick } from 'lodash-es'
import { performanceSourceCollect } from '@order-public-sub-public/reportUmp/performance'
import { timeTypeItem } from '@order-public-sub-public/types/report'
import { filterTimeObj, extractVersion, getResourcePerformance } from '@order-public-sub-public/utils/report'
import { EReportRenderTime } from '@order-public-sub-public/reportUmp/constants/renderTime'
import { getChannel } from '@order-public-sub-public/configs'
import { sessionStorage } from '@order-public-sub-public/utils/storage'

export let apiList: any = [] //接口数据收集
let timeDetailList: timeTypeItem[] = [] //初始化渲染详细节点数据
let resourceList: any = []

//apiPerformance接口上报收集
export const apiPerformance = (config: any, data: any) => {
  try {
    const customParams = pick(data, ['traceId', 'code'])
    let performanceResult: any = performanceSourceCollect(config.url, {
      customParams,
    })
    if (performanceResult && typeof performanceResult === 'string') {
      performanceResult = JSON.parse(performanceResult)
    }
    if (!apiList || !performanceResult) {
      return
    }
    apiList.push({
      name: performanceResult.name,
      duration: Math.floor(performanceResult.duration),
      ...customParams,
    })
    apiList = apiList.slice(-10)
  } catch (e) {
    console.error(e)
  }
}
//性能时间详细间隔统计收集
export const addDetailPerformance = (type: string) => {
  try {
    const time = window?.performance?.now() || 0
    const dateNow = Date.now()
    timeDetailList.push({
      performanceNow: Math.floor(time),
      dateNow: dateNow,
      hook: type,
    })
  } catch (e) {
    console.error(e)
  }
}
//性能打点
export const performanceMark = (markName: string) => {
  try {
    window?.performance?.mark(markName)
  } catch (e) {
    console.error(e)
  }
}
//页面性能分析汇总数据
export const initPagePerformance = () => {
  try {
    const renderTime = Math.floor(window?.performance?.now() || 0)
    const navigatorCurrent: any = navigator
    const performanceCurrent: any = window?.performance || {}

    const marks = window?.performance?.getEntriesByType('mark') || []

    //接口相关数据
    let extend1 = apiList
    if (Array.isArray(extend1)) {
      extend1 = extend1.concat(resourceList).concat(marks)
    }
    //性能整体概况
    const extend2 = {
      memory: performanceCurrent.memory,
      navigation: performanceCurrent.navigation,
      channel: getChannel(),
    }
    const mobile = sessionStorage.getItem('encryptPhone') || ''
    const normalData = {
      employee_number: mobile,
      name: mobile,
      net_type: navigatorCurrent.connection?.effectiveType,
      device_model: navigatorCurrent.userAgent,
      module_version: extractVersion(location.href) || '',
      module_name: '下单配置H5',
      renderTime,
      extend1: JSON.stringify(extend1),
      extend2: JSON.stringify(extend2),
      extend3: filterTimeObj(timeDetailList),
    }

    window.$umpOtherReport(
      'OTHER',
      {
        eventCode: 'ks_app_user_render_time',
      },
      normalData,
    )
    timeDetailList = []
  } catch (e) {
    console.error(e)
  }
}

//通过接口获取埋点参数
const getConfig = async () => {
  try {
    const { encryptPhone, customerCode, userId, xcxOpenId } = getQueryObject()
    //先取url上，小程序会从url传值
    if (encryptPhone && xcxOpenId) {
      return {
        encryptPhone,
        customerCode,
        userId,
        xcxOpenId,
      }
    }
    //从app通过原生方法获取
    if (isClient && judgeAppVersion('7.60.0')) {
      const res = await $native.getSystemInfo()
      if (res) {
        return res
      }
    }

    const token = await getToken()
    if (!token) {
      return {}
    }
    const res = await getUserProfileInfo({
      accessToken: token,
    })
    const data = res?.data || {}
    localStorage?.setItem('reportUserInfo', JSON.stringify(res.data))
    return data
  } catch (e) {
    return undefined
  }
}

export enum AppKeyProdType {
  支付宝小程序 = 'p26rsqxwbqk7b51fn2baq1ti',
  微信小程序 = 'ufmifnjwqqwzykt6bun4nk1f',
  APP = '0dnngfkbj0hmiglrjelujz3h',
}

export enum AppKeyUatType {
  支付宝小程序 = 'a0idxwqrcizkzfihz3zosjkh',
  微信小程序 = '5f2utt1k5v6i2vid0ug5gdne',
  APP = 'dhcqc6pn8pefuwq0v7mqnnnf',
}

//获取appkey
const getAppKey = async () => {
  if (getEnv() === 'PROD') {
    let curAppKey = AppKeyProdType.APP
    if (isWxApplet) {
      curAppKey = AppKeyProdType.微信小程序
    } else if (isAliPayClient) {
      curAppKey = AppKeyProdType.支付宝小程序
    }
    return curAppKey
  } else {
    let curAppKey = AppKeyUatType.APP
    if (isWxApplet) {
      curAppKey = AppKeyUatType.微信小程序
    } else if (isAliPayClient) {
      curAppKey = AppKeyUatType.支付宝小程序
    }
    return curAppKey
  }
}
//上报的接口url
const getRhost = () => {
  return getEnv() === 'PROD' ? 'kye-log-sdk.ky-express.com' : 'kye-log-sdk-uat.ky-express.com'
}
//获取sessionId
const getSessionId = async () => {
  const querySessionId = handleGlobalSourceReport().sessionId
  try {
    const overVersion = overVersionCheck()
    if (!overVersion) {
      return querySessionId
    }
    const { sessionId = '' } = (await $native.getSessionId()) as any
    return sessionId || querySessionId
  } catch (e) {
    console.error(e)
    return querySessionId
  }
}
const getInitPageName = () => {
  try {
    const routes = router.getRoutes()
    const path = location.hash?.split('?')[0] || ''
    const currentRoute = routes.find((i) => {
      return path?.indexOf(i.path) > -1 && i.path !== '/'
    })
    return currentRoute?.meta?.pageCode
  } catch (e) {
    return location.href
  }
}
//获取url上的来源
export const handleGlobalSourceReport = () => {
  const queryObject = getQueryObject()
  return {
    sourcePage: queryObject.sourcePage as string,
    sourceAction: queryObject.sourceAction as string,
    sessionId: queryObject.sessionId as string,
  }
}

//埋点配置
export const getReportConfig = () => {
  const isBatch = location.href?.indexOf('order-batch') > -1
  const { sourcePage, sourceAction = isBatch ? '' : 'entry' } = handleGlobalSourceReport()

  const ref_page_name = sourcePageReportMap[sourcePage as keyof typeof sourcePageReportMap]
  const ref_action = sourceActionReportMap[sourceAction as keyof typeof sourceActionReportMap]
  const env_server = getEnv()

  const host = isPROD ? 'https://ic-h5.kye-erp.com' : 'https://ic-h5-uat.kye-erp.com'

  // startMonitoring()
  resourceList = getResourcePerformance()
  const orderId = uuid()
  // 缓存orderId
  window.orderId = orderId
  return {
    baseConfig: {
      sdkSrc: `${host}/netc-static/qt_web.umd.20240724.js`,
      appKey: isClient ? '' : getAppKey(), //app传空，是为了让埋点通过native sdk上传，不通过H5
      rhost: getRhost(),
      DEBUG: false,
      aplusAutotrack: false,
      heatmap: true, //开启热力图
      rateAhot: '0.1', //热力图采样率
      aplusJsbridgeOnly: isClient, //给native sdk,由native上报，需要配置为true
    },
    vueRouter: router,
    exposureConfig: {
      threshold: 0.9, // 在视窗中暴露比例
      isAllowRepeait: false, // 是否不允许反复曝光
      root: null, // 默认浏览器视窗
    },
    commonConfig: {
      ref_page_name,
      ref_action,
      orderId,
      session_id: getSessionId(),
      page_name: getInitPageName(),
    },
    encryption: {
      key: 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAPdQKxK3s54YhNNatEjPsdFEdCBDF+aXPNyEgbLK7JzLQf7jvJH1sb5l5H0wPmMLz4w//Z3bSfQgmOX2IJ6jllMCAwEAAQ==',
      // encryptionString: '',
      encryptionString:
        'sender_name,sender_iPhone,sender_tel,sender_address,sender_company,receiver_name,receiver_iPhone,receiver_tel,receiver_address,receiver_company,ai_recommend,trust_name,trust_tel,trust_number',
    },
    asyncConfig: async () => {
      const res: any = await getConfig()
      const { customerCode, encryptPhone = '', userId, xcxOpenId } = res || {}
      if (typeof encryptPhone === 'string') {
        sessionStorage?.setItem('encryptPhone', encryptPhone)
      }
      return {
        //需要设置的id
        ids: {
          _user_id: userId,
          _dev_id: xcxOpenId,
          _anony_id: userId,
        },
        //全局属性
        globalproperty: {
          env_server,
          userid: userId,
          customer_code: customerCode,
          mobile_number: encryptPhone,
          customer_code_mobile: `${customerCode}+${encryptPhone}`,
        },
        //用户属性
        userProfile: {
          env_server,
          userid: userId,
          customer_code: customerCode,
          mobile_number: encryptPhone,
          customer_code_mobile: `${customerCode}+${encryptPhone}`,
          wx_openid: xcxOpenId,
        },
      }
    },
  }
}

// 导出枚举
export { EReportRenderTime }
