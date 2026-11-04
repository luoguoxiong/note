import { getSystemInfo } from '@public/utils/getSystemInfo'

/**
 * @Desc: device
 * @Date: 2025/8/18
 */
export const isWxAppIos = async () => {
  const { platform } = await getSystemInfo()
  return platform === 'ios'
}

export const isWxAppAndroid = async () => {
  const { platform } = await getSystemInfo()
  return platform === 'android'
}

export const isWxAppOhos = async () => {
  const { platform } = await getSystemInfo()
  return platform === 'ohos'
}
