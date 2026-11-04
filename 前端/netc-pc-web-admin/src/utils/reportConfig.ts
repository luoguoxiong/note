import { getUserProfileInfo } from '@/apis'
import { isClientMode } from '@/utils/appBridge'
import { performanceSourceCollect } from '@/reportUmp/performance'
import { router } from '@/main'
import { Any } from '@/types'
import { timeTypeItem } from '@/types/report'
import { getQueryObject, uuid } from '@/utils'
import { getToken } from '@/utils/auth'
import { getEnv } from '@/utils/env'
import { extractVersion } from '@/utils/href'
import native from '@/utils/native'
import { filterTimeObj, startMonitoring } from '@/utils/report'
import { pick } from 'lodash-es'

export let apiList: Any = [] //接口数据收集
let timeDetailList: timeTypeItem[] = [] //初始化渲染详细节点数据

//apiPerformance接口上报收集
export const apiPerformance = (config: Any, data: Any) => {
  try {
    const customParams = pick(data, ['traceId', 'code'])
    let performanceResult: Any = performanceSourceCollect(config.url, {
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
    const time = performance.now()
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

//页面性能分析汇总数据
export const initPagePerformance = () => {
  try {
    const renderTime = Math.floor(performance.now())
    const navigatorCurrent: Any = navigator
    const performanceCurrent: Any = window.performance || {}

    //接口相关数据
    const extend1 = apiList
    //性能整体概况
    const extend2 = {
      memory: performanceCurrent.memory,
      navigation: performanceCurrent.navigation,
    }
    const normalData = {
      employee_number: sessionStorage.getItem('encryptPhone') || '',
      net_type: navigatorCurrent.connection?.effectiveType,
      device_model: navigatorCurrent.userAgent,
      module_version: extractVersion(location.href) || '',
      module_name: '客户端首页',
      renderTime,
      extend1: JSON.stringify(extend1),
      extend2: JSON.stringify(extend2),
      extend3: filterTimeObj(timeDetailList),
    }
    console.log('性能埋点数据', normalData)
    window.$umpOtherReport(
      'OTHER',
      {
        eventCode: 'ks_app_user_render_time',
      },
      normalData
    )
    timeDetailList = []
  } catch (e) {
    console.error(e)
  }
}

//通过接口获取埋点参数
const getConfig = async () => {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const electronClient = await native.isElectronClientMode()
    let parentIframeData: Any
    if (!electronClient) {
      parentIframeData = window?.parent?.localStorage.getItem('userProfileInfo')
    }
    if (parentIframeData && typeof parentIframeData === 'string') {
      return JSON.parse(parentIframeData)
    }
    const token = await getToken()
    const res = await getUserProfileInfo({
      accessToken: token,
    })
    return res?.data
  } catch (e) {
    return undefined
  }
}
//获取appkey
const getAppKey = async () => {
  let isClient
  try {
    isClient = await isClientMode()
  } catch (e) {
    isClient = false
  }
  if (getEnv() === 'PROD') {
    return isClient ? '3hr24vntx0wi8i79j6kp4izp' : '488rrhfkm3p7v9uwkmoy6g80'
  } else {
    return isClient ? 'tbdvrfsd9v26t3e7eprq9xnh' : '5l4bt39ctiu2f0eiw1390if0'
  }
}
//上报的接口url
const getRhost = () => {
  return getEnv() === 'PROD' ? 'kye-log-sdk.ky-express.com' : 'kye-log-sdk-uat.ky-express.com'
}
//获取url上的来源
export const handleGlobalSourceReport = () => {
  const queryObject = getQueryObject()
  return {
    // TODO 首页项目暂无source
    // sourcePage: queryObject.sourcePage as string,
    // sourceAction: queryObject.sourceAction as string,
    sessionId: queryObject.sessionId as string,
    initPageId: queryObject.initPageId as string,
  }
}

//埋点配置
export const getReportConfig = () => {
  const { sessionId } = handleGlobalSourceReport()
  let initPageId
  try {
    //2.0壳子有跨域
    if (navigator.userAgent.indexOf('Electron/') === -1) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      initPageId = window?.parent?.initPageId
    }
  } catch (e) {
    console.error(e)
  }
  // const ref_page_name = sourcePageReportMap[sourcePage as keyof typeof sourcePageReportMap]
  // const ref_action = sourceActionReportMap[sourceAction as keyof typeof sourceActionReportMap]
  const env_server = getEnv()
  startMonitoring()
  return {
    baseConfig: {
      sdkSrc: 'lib/aplus_web_v8_md5_d387.js',
      appKey: getAppKey(),
      rhost: getRhost(),
      DEBUG: false,
      aplusAutotrack: false,
      heatmap: true, //开启热力图
      rateAhot: '0.1', //热力图采样率
    },
    vueRouter: router,
    exposureConfig: {
      threshold: 1, // 在视窗中暴露比例
      isAllowRepeait: false, // 是否不允许反复曝光
      root: null, // 默认浏览器视窗
    },
    commonConfig: {
      // ref_page_name,
      // ref_action,
      orderId: uuid(),
      session_id: sessionId,
      initPageId,
    },
    encryption: {
      encryptionKey:
        'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAPdQKxK3s54YhNNatEjPsdFEdCBDF+aXPNyEgbLK7JzLQf7jvJH1sb5l5H0wPmMLz4w//Z3bSfQgmOX2IJ6jllMCAwEAAQ==',
      // encryptionString: '',
      encryptionString:
        'sender_name,sender_iPhone,sender_tel,sender_address,sender_company,receiver_name,receiver_iPhone,receiver_tel,receiver_address,receiver_company,trust_name,trust_tel,trust_number,ai_recommend',
    },
    asyncConfig: async () => {
      const res = await getConfig()
      const { customerCode, encryptPhone, userId, xcxOpenId } = res || {}
      sessionStorage.setItem('encryptPhone', encryptPhone)
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
