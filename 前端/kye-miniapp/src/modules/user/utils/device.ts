/**
 * @Desc: device
 * @Author: wu xingtao
 * @Date: 2024/11/14
 */
import Taro, { ENV_TYPE } from '@tarojs/taro'
import dayjs from 'dayjs'
import { getEnv, isH5FSEnv, isPcFSEnv } from '@public/utils/device'
import { AliIphoneModelMap } from '@modules/user/constants'

const formatPcDeviceStamp = (prefix = 'WECHAT') => {
  const date = new Date()
  const yearAndDate = dayjs(date).format('YYYYMMDD')
  const timestamp = String(date.getTime()).slice(-8)
  return `${prefix}-${yearAndDate}${timestamp}`
}
// /* 设备型号是否包含品牌 */
// const checkModelContainBrand = (model) => {
//   return ['iPhone', 'Huawei', 'Xiaomi', 'Meizu', 'OnePlus', 'Oppo'].find((f) =>
//     model.toUpperCase().includes(f.toUpperCase()),
//   )
// }
/** 获取操作系统类型 */
export const getOperatorSystem = () => {
  const getDeviceInfo = Taro.getSystemInfoSync()
  const platform = getDeviceInfo.platform

  if (platform === 'iOS') {
    return 'ios'
  } else if (platform === 'Android') {
    return 'android'
  } else {
    return 'pcClient'
  }
}
const getDeviceBrandFromUA = () => {
  const ua = navigator.userAgent
  if (/iPhone/i.test(ua)) return 'Apple'
  if (/Huawei/i.test(ua)) return 'Huawei'
  if (/Xiaomi|Mi/i.test(ua)) return 'Xiaomi'
  if (/OPPO/i.test(ua)) return 'OPPO'
  if (/vivo/i.test(ua)) return 'vivo'
  if (/Samsung/i.test(ua)) return 'Samsung'
  if (/Android/i.test(ua)) return 'Android' // 泛指安卓设备
  return 'unknown'
}

export const getDeviceType = () => {
  const systemInfo = Taro.getSystemInfoSync()
  let model = systemInfo.model
  /* 支付宝小程序-iphone model转换*/
  if (getEnv() === ENV_TYPE.ALIPAY && model.toLowerCase().includes('iphone')) {
    model = AliIphoneModelMap[model.toLowerCase()] || model
  }
  let deviceType = `${systemInfo.brand}-${model}`

  if (isH5FSEnv && `${systemInfo.brand}` === 'unknown') {
    deviceType = getDeviceBrandFromUA() + '-' + model
  }
  // if (systemInfo?.model) {
  //   if (checkModelContainBrand(systemInfo.model)) {
  //     deviceType = systemInfo.model
  //   }
  // }
  if (isPcFSEnv) {
    deviceType = Taro.getStorageSync('pc_fs_device_type')
    if (!deviceType) {
      deviceType = formatPcDeviceStamp('PCFS')
      Taro.setStorageSync('pc_fs_device_type', deviceType)
    }
  } else if (deviceType.includes('microsoft')) {
    /* PC端小程序*/
    deviceType = Taro.getStorageSync('pc_miniprogram_device_type')
    if (!deviceType) {
      deviceType = formatPcDeviceStamp()
      Taro.setStorageSync('pc_miniprogram_device_type', deviceType)
    }
  }

  return deviceType
}
