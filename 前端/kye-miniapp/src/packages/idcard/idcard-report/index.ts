import { getEnvConfig } from '@/public/config'
import { getMobileOS, isAliMiniApp, isAmapMiniApp, isQwEnv, isWxMiniApp } from '@public/utils'
import { getBridgeModule } from '@public/utils/device'
import Taro from '@tarojs/taro'
import type { AppInstance, ChannelType, DeviceInfoReport } from './idcard-report_type'

const deviceInfo: DeviceInfoReport = Taro.getSystemInfoSync()
// 微信环境
export const isWxEnv = deviceInfo.host.env === 'WeChat'
// 是否是客户端
export const isWindow = deviceInfo.platform === 'windows' || deviceInfo.platform === 'mac'

/** 埋点功能开关 */
export const ENABLE_TRACKING = true // 改为true可启用埋点功能

/**
 * 安全获取应用实例
 * @returns 返回应用实例或null
 */
export const getSafeApp = (): AppInstance | any => {
  try {
    // return Taro.getApp<AppInstance>()
    const bridge = getBridgeModule<AppInstance | any>()
    return bridge
  } catch (error) {
    console.error('获取应用实例失败:', error)
    return null
  }
}

/**
 * 获取当前渠道
 * @returns 返回当前渠道类型
 */
export const getCurrentChannel = (): ChannelType => {
  return isWxMiniApp ? '微信' : '企微'
}

/**
 * 统一错误处理
 * @param error 错误对象
 * @param context 上下文信息
 */
export const handleError = (error: any, context: string): void => {
  console.error(`[埋点错误] ${context}:`, error)
}

/**
 * 获取当前环境的来源ID字符串
 * @returns {string} 拼接后的环境标识字符串
 */
export const getSourceID = (): string => {
  // 判断是否为微信环境（非企业微信）
  const sourcePlatform: string = isWxEnv ? '微信' : '企微'

  // 判断运行设备类型
  const deviceType: string = isWindow ? '桌面' : '手机'

  // 判断环境类型（小程序或普通端）
  const envType: string = isWxEnv ? '小程序' : '端'

  // 拼接所有环境信息
  return `${sourcePlatform}${deviceType}${envType}`
}

/**
 * 定义平台映射类型
 */
type PlatformType = 'alipay' | 'wx' | 'ios' | 'amap' | 'android' | 'Wxwork' | 'WxworkPc'

/**
 * 获取当前平台（内部业务定义）
 * @returns {PlatformType}
 */
export const getPlateForm = (): PlatformType | undefined => {
  try {
    const { isApp } = getEnvConfig()
    const systemInfo = Taro.getSystemInfoSync()
    const systemType = getMobileOS(systemInfo.system)
    console.log('🚀 ~ getPlateForm ~ isApp, systemType:', isApp, systemType)

    const PlateFormMap: Record<PlatformType, PlatformType> = {
      alipay: 'alipay',
      wx: 'wx',
      ios: 'ios',
      amap: 'amap',
      android: 'android',
      WxworkPc: 'WxworkPc',
      Wxwork: 'Wxwork',
    }

    if (isWxMiniApp) {
      return PlateFormMap['wx']
    } else if (isAliMiniApp && !isAmapMiniApp) {
      return PlateFormMap['alipay']
    } else if (isAmapMiniApp) {
      return PlateFormMap['amap']
    } else if (isApp && systemType === 'iOS') {
      return PlateFormMap['ios']
    } else if (isApp && systemType === 'Android') {
      return PlateFormMap['android']
    } else if (isQwEnv) {
      if (isWindow) {
        return PlateFormMap['WxworkPc']
      } else {
        return PlateFormMap['Wxwork']
      }
    }

    return undefined
  } catch (error) {
    console.error('获取平台类型报错:', error)
    return undefined
  }
}
