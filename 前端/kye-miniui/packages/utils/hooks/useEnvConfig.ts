import Taro, { ENV_TYPE } from '@tarojs/taro'
import { getSystemInfo } from '../src/getSystemInfo'
import { isWxPcAppletEnv } from '@packages/utils/src/device'

/**
 * 获取端配置
 * @returns {{env: any, isWxApp: boolean}}
 * @params.env 构建环境
 * @params.isWxApp 是否是APP端
 */
const useEnvConfig = () => {
  const env = Taro.getEnv()
  let isWxApp = false
  let isWxPcApplet = false
  const systemInfo = getSystemInfo()
  if (env === ENV_TYPE.WEAPP) {
    const host = (systemInfo as any)?.host
    const appVersion = host?.appVersion || ''
    const hostEnv = host?.env || ''
    // const environment = (systemInfo as any)?.environment || ''
    isWxApp = hostEnv === 'SAAASDK' || !!appVersion
    isWxPcApplet = isWxPcAppletEnv(systemInfo)
  }
  return {
    env,
    isWxApp,
    isWxPcApplet
  }
}

export default useEnvConfig
