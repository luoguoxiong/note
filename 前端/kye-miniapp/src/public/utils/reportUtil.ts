/* eslint-disable no-unused-vars */
import { getEnvConfig } from '@/public/config'
import { isAliMiniApp, isAmapMiniApp, isQwEnv, isWindow, isWxMiniApp } from '@public/utils'
import {
  getBridgeModule,
  isH5FSEnv,
  isPcFSEnv,
  isWxAppAndroidEnv,
  isWxAppIosEnv,
  isWxAppOhosEnv,
} from '@public/utils/device'
import { PlainObject } from '@public/utils/types'
import Taro from '@tarojs/taro'
import aPlus from './aplusConfig'
import { getTraceId } from '@public/utils/report/reportPerformance'
import { MINI_APP_VERSION, shellVersion } from '@public/constants'

const uuid = () => {
  return Math.random().toString(36).substring(2)
}

export const SESSION_ID = uuid()
let click_id = ''

export enum EventTypeId {
  CLK = 2101,
  EXP = 2201,
  OTHER = 19999,
  PV = 2001,
}

type ReportTypeEnum = 'CLK' | 'EXP' | 'OTHER'
//  type plateform = {
//    'alipay' | 'wx' | 'app'
// }

/**
 * 定义设备信息类型（根据 Taro.getSystemInfoSync 返回值）
 * 部分字段在 Taro 类型声明中已存在，这里补充一些 host/env 场景
 */
interface DeviceInfo extends Taro.getSystemInfoSync.Result {
  host?: {
    env?: string
  }
}

/**
 * 获取当前环境的来源ID字符串
 * @returns {string} 拼接后的环境标识字符串
 */
export const getSourceID = (): string => {
  try {
    const { plateForm, isCompanyWx, systemType } = getEnvConfig()

    const sourceMap = {
      alipay: '支付宝',
      wxmini: '微信小程序',
      wxminiapp: systemType === 'iOS' ? 'ios' : 'android',
      web: 'web',
      amap: '高德小程序',
    }

    let sourcePlatform = sourceMap[plateForm]

    if (isCompanyWx) {
      sourcePlatform = '企业微信'
    }

    if (isH5FSEnv) {
      sourcePlatform = '飞书H5'
    }

    if (isPcFSEnv) {
      sourcePlatform = '飞书PC'
    }

    return `${sourcePlatform}`
  } catch (error) {
    console.error('获取当前环境的来源错误:', error)
    return '未知环境'
  }
}

/**
 * 定义平台映射类型
 */
type PlatformType = 'alipay' | 'wx' | 'ios' | 'amap' | 'android' | 'Wxwork' | 'WxworkPc' | 'web' | 'fs'

/**
 * 获取当前平台（内部业务定义）
 * @returns {PlatformType}
 */
export const getPlateForm = (): PlatformType | undefined => {
  try {
    const { isApp, systemType } = getEnvConfig()

    const PlateFormMap: Record<PlatformType, PlatformType> = {
      alipay: 'alipay',
      wx: 'wx',
      ios: 'ios',
      amap: 'amap',
      android: 'android',
      WxworkPc: 'WxworkPc',
      Wxwork: 'Wxwork',
      web: 'web',
      fs: 'fs',
    }

    if (isAliMiniApp && !isAmapMiniApp) {
      return PlateFormMap['alipay']
    } else if (isAmapMiniApp) {
      return PlateFormMap['amap']
    } else if (isApp && systemType === 'iOS') {
      return PlateFormMap['ios']
    } else if (isApp && systemType === 'Android') {
      return PlateFormMap['android']
    } else if (isQwEnv) {
      return isWindow ? PlateFormMap['WxworkPc'] : PlateFormMap['Wxwork']
    } else if (isWxMiniApp) {
      return PlateFormMap['wx']
    } else if (isH5FSEnv) {
      return PlateFormMap['fs']
    }

    return PlateFormMap['web']
  } catch (error) {
    console.error('获取平台类型报错:', error)
    return undefined
  }
}

/* aplus埋点事件方法 */
export const report_fn = async (
  eventCode: string,
  type: ReportTypeEnum,
  params: { page_code?: string; region_code?: string } & PlainObject,
) => {
  aPlus.init()
  const pre_click_id = click_id

  if (type === 'CLK') {
    click_id = uuid()
  }
  const bridge = getBridgeModule()

  const commonParams = type === 'CLK' ? { click_id } : { pre_click_id }

  const event_type_id = {
    CLK: EventTypeId.CLK,
    EXP: EventTypeId.EXP,
    OTHER: EventTypeId.OTHER,
  }

  const versionInfo: { resourcePackVersion?: string; appVersion?: string } = {
    resourcePackVersion: shellVersion || '', // 资源包版本
  }
  if (isWxAppIosEnv || isWxAppAndroidEnv || isWxAppOhosEnv) {
    versionInfo.appVersion = MINI_APP_VERSION // 安装包版本
  }

  console.log('埋点上报:', eventCode, { ...commonParams, ...params, ...versionInfo })

  bridge.aplus_queue.push({
    action: 'aplus.record',
    arguments: [
      eventCode,
      type,
      {
        event_code: eventCode,
        event_type_id: event_type_id[type] || '',
        isMiniApp: 1,
        session_id: SESSION_ID,
        'web-trace-id': getTraceId(),
        platform: getPlateForm(),
        page_name: params && (params.page_name || params.page_code),
        ...commonParams,
        ...params,
        ...versionInfo,
      },
    ],
  })
}

// QT页面埋点
export const report_EXP_event = (eventCode: string, params: PlainObject = {}) => {
  try {
    report_fn(eventCode, 'EXP', {
      event_type_id: EventTypeId.EXP,
      event_code: eventCode,
      page_code: params?.page_code || '',
      page_name: params?.page_name || '',
      ...params,
      source_id: getSourceID(),
      offsiteType: Taro.getLaunchOptionsSync().scene,
    })
  } catch (error) {
    console.log('QT页面埋点 错误', error)
  }
}

// QT自定义埋点
export const report_other_event = (eventCode: string, params: PlainObject = {}) => {
  try {
    report_fn(eventCode, 'OTHER', {
      event_type_id: EventTypeId.OTHER,
      event_code: eventCode,
      page_name: params && params.page_code,
      source_id: getSourceID(),
      ...params,
    })
  } catch (error) {
    console.log('QT自定义埋点 错误', error)
  }
}

// QT点击事件
export const report_CLK_event = (eventCode: string, params: PlainObject = {}) => {
  try {
    report_fn(eventCode, 'CLK', {
      event_type_id: EventTypeId.CLK,
      event_code: eventCode,
      page_name: params && params.page_code,
      source_id: getSourceID(),
      ...params,
    })
  } catch (error) {
    console.log('QT点击事件 错误', error)
  }
}

// QTPV埋点
export const report_pv_event = async (page_code: string, params: PlainObject = {}) => {
  console.log('pv埋点:', page_code, params)
  const bridge = getBridgeModule()
  if (!bridge) {
    return
  }
  const versionInfo: { resourcePackVersion?: string; appVersion?: string } = {
    resourcePackVersion: shellVersion || '', // 资源包版本
  }
  if (isWxAppIosEnv || isWxAppAndroidEnv || isWxAppOhosEnv) {
    versionInfo.appVersion = MINI_APP_VERSION // 安装包版本
  }
  bridge.aplus_queue.push({
    action: 'aplus.sendPV',
    arguments: [
      { is_auto: false },
      {
        event_type_id: EventTypeId.PV,
        page_code: page_code,
        page_name: page_code,
        event_code: '',
        platform: getPlateForm(),
        work_id: uuid(),
        source_id: getSourceID(),
        pre_click_id: getClickId(),
        ...params,
        ...versionInfo,
      },
    ],
  })
}

export function getClickId() {
  return click_id
}

export function report_wrapper<T extends (..._args: any[]) => any>(fn: T, qt_params: Parameters<typeof report_fn>) {
  return (...args: Parameters<T>): ReturnType<T> => {
    const result = fn(...args)

    if (qt_params[2]) {
      qt_params[2].event_code = qt_params[0]
    }

    report_fn(...qt_params)
    return result
  }
}
