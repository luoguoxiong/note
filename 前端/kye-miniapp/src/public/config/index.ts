/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import { getMobileOS, isAmapMiniApp, isH5Env, isH5FSEnv, isPcFSEnv, isWxAppEnv, isWxPcAppletEnv } from '@/public/utils'
import { LoginFromType, LoginFromTypeValue } from '@public/constants'
import Taro, { ENV_TYPE } from '@tarojs/taro'

export enum XFormType {
  跨越速运_APP = '111',
  跨越寄件_微信小程序 = '114',
  跨越寄件_支付宝小程序 = '147',
  跨越寄件_高德小程序 = '149',
  跨越寄件_飞书H5 = '151',
  跨越寄件_飞书PC = '153',
}

interface EnvConfig {
  /** 平台名称 */
  name: string
  /** 平台环境 */
  env: TaroGeneral.ENV_TYPE
  /** 操作系统 */
  systemType: 'iOS' | 'Android' | 'Unknown'
  /** 微信默认操作系统 */
  platform: 'ios' | 'android' | 'ohos' | 'windows' | 'mac' | 'devtools' | string
  /** 是不是PC */
  isPc: boolean
  /** 请求头x-form */
  xForm: XFormType
  /** 是不是企微 */
  isCompanyWx: boolean
  /**来源，4 app;6 小程序 */
  from: LoginFromTypeValue
  // 支付宝特有 飞书: 95
  form?: 91 | 93 | 95
  /** 是不是跨端小程序App */
  isApp: boolean
  /** 是不是生产 */
  isProd: boolean
  /** 平台类型 */
  plateForm: 'alipay' | 'wxmini' | 'wxminiapp' | 'web' | 'amap' | 'lark_h5' | 'lark_pc'
  /** 平台input默认节流间隔 */
  platformInputDebounceTime?: number
}

let cachedEnvConfig: EnvConfig | null | undefined = null

const PLATFORM_PC = ['windows', 'mac', 'Windows', 'OS X', 'OS']

/* 获取平台对应input防抖默认间隔 */
const getPlatformInputDebounceTime = ({ isWxApp, platform, env }) => {
  let platformInputDebounceTime = 0
  // app端
  if (isWxApp || env === ENV_TYPE.WEAPP) {
    platformInputDebounceTime = 800
    // 微信-鸿蒙
    if (platform === 'ohos') {
      platformInputDebounceTime = 800
    }
    // pc端微信
    if (isWxPcAppletEnv) {
      platformInputDebounceTime = 100
    }
  } else if (isAmapMiniApp) {
    // 高德- iOS:0| android:800 (iOS性能,不需要使用防抖使用会造成无法输入)
    platformInputDebounceTime = ['iOS', 'iPadOS'].includes(platform) ? 500 : 800
  }
  return platformInputDebounceTime
}

export const getEnvConfig = (): EnvConfig => {
  if (cachedEnvConfig) return cachedEnvConfig

  return setEnvConfig()
}

export const setEnvConfig = () => {
  const env = Taro.getEnv()
  const systemInfo = Taro.getSystemInfoSync()
  const isPc = PLATFORM_PC.includes(systemInfo.platform)
  const systemType = getMobileOS(systemInfo.system)
  const platform = systemInfo.platform

  let isCompanyWx = false
  let isWxApp = false

  if (env === ENV_TYPE.WEAPP) {
    const host = (systemInfo as any)?.host
    const appVersion = host?.appVersion || ''
    const hostEnv = host?.env || ''
    const environment = (systemInfo as any)?.environment || ''

    isWxApp = hostEnv === 'SAAASDK' || !!appVersion
    isCompanyWx = environment === 'wxwork'
  }

  /* 多端-不同端默认input节流默认值 */
  const platformInputDebounceTime = getPlatformInputDebounceTime({ isWxApp, platform, env })

  const baseConfig: Omit<EnvConfig, 'name' | 'bridge' | 'from' | 'isApp' | 'xForm' | 'plateForm'> = {
    env,
    isPc,
    systemType,
    platform,
    isCompanyWx,
    isProd: process.env.TARO_APP_ENV === 'prod',
  }

  const configMap: Partial<
    Record<TaroGeneral.ENV_TYPE | 'WXAPP_APP' | 'AMAP_APP' | 'H5_FS' | 'PC_FS', () => EnvConfig>
  > = {
    [ENV_TYPE.ALIPAY]: () => ({
      ...baseConfig,
      name: '支付宝小程序',
      from: '45',
      form: 91,
      isApp: false,
      xForm: XFormType.跨越寄件_支付宝小程序,
      plateForm: 'alipay',
      platformInputDebounceTime,
    }),
    [ENV_TYPE.WEAPP]: () => ({
      ...baseConfig,
      name: '微信小程序',
      from: '6',
      isApp: false,
      xForm: XFormType.跨越寄件_微信小程序,
      plateForm: 'wxmini',
      platformInputDebounceTime,
    }),
    [ENV_TYPE.WEB]: () => ({
      ...baseConfig,
      name: 'H5',
      from: '4',
      isApp: false,
      xForm: XFormType.跨越寄件_微信小程序,
      plateForm: 'web',
      platformInputDebounceTime,
    }),
    WXAPP_APP: () => {
      const appOs = getOS(systemInfo) || 'android_login'
      const from = LoginFromType[appOs].toString() as LoginFromTypeValue
      return {
        ...baseConfig,
        name: '微信小程序跨端App',
        from,
        isApp: true,
        xForm: XFormType.跨越速运_APP,
        plateForm: 'wxminiapp',
        platformInputDebounceTime,
      }
    },
    AMAP_APP: () => ({
      ...baseConfig,
      name: '高德小程序',
      from: '49',
      form: 93,
      isApp: false,
      xForm: XFormType.跨越寄件_高德小程序,
      plateForm: 'amap',
      platformInputDebounceTime,
    }),
    H5_FS: () => ({
      ...baseConfig,
      form: 95,
      name: '飞书',
      isApp: false,
      xForm: XFormType.跨越寄件_飞书H5,
      from: '51',
      plateForm: 'lark_h5',
      platformInputDebounceTime,
    }),
    PC_FS: () => ({
      ...baseConfig,
      form: 95,
      name: '飞书',
      isApp: false,
      xForm: XFormType.跨越寄件_飞书PC,
      from: '53',
      plateForm: 'lark_pc',
      platformInputDebounceTime,
    }),
  }

  if (isWxApp) {
    return (cachedEnvConfig = configMap.WXAPP_APP?.())!
  }

  if (isAmapMiniApp) {
    return (cachedEnvConfig = configMap.AMAP_APP?.())!
  }

  // 暂时屏蔽,等后端上了再放开
  if (isPcFSEnv) {
    return (cachedEnvConfig = configMap.PC_FS?.())!
  } else if (isH5FSEnv) {
    return (cachedEnvConfig = configMap.H5_FS?.())!
  }

  return (cachedEnvConfig = configMap[env]?.()!)
}

/* 区分App端 */
export function getOS(systemInfo: { system: string } | null = null) {
  const { system } = systemInfo || wx.getSystemInfoSync()

  if (/ios/i.test(system)) return 'ios_login'
  if (/android/i.test(system)) return 'android_login'
  return 'android_login'
}

/* 是否为微信多端app */
export const isWeixinAppSync = () => {
  let isWeixinApp = false
  try {
    const env = Taro.getEnv()
    if (env === ENV_TYPE.WEAPP) {
      isWeixinApp = isWxAppEnv
    }
    return isWeixinApp
  } catch (e) {
    console.warn('getSystemInfoSync 调用失败', e)
  }
}

export const getLoginFromType = () => {
  return getEnvConfig()?.from?.toString()
}

/**
 * 搜索接口渠道编码：ios / android / wechatApplet / alipayMini
 * 注意：高德小程序与支付宝小程序一致，均为 alipayMini
 */
export const getSearchChannelCode = (): 'ios' | 'android' | 'wechatApplet' | 'alipayMini' => {
  const { isApp, plateForm } = getEnvConfig()
  if (isApp) {
    // https://zentao.ky-tech.com.cn/platform-home/#/bug-detail/670009
    return 'wechatApplet'
    // return systemType === 'iOS' ? 'ios' : 'android'
  }
  if (plateForm === 'alipay' || plateForm === 'amap') {
    return 'alipayMini'
  }
  return 'wechatApplet'
}

// 登录来源
export let loginFromType = getLoginFromType()
