import Taro from '@tarojs/taro'
import applicationInfoDefault from '@order-public-sub-public/utils/application/applicationDefault'
import { urlContact } from '@order-public-sub-public/utils/url'
import { webviewParamsDefault } from '@order-public-sub-public/utils/webview'
import { getGrayHeaderLists } from '@order-public-sub-public/utils/request/grayHeader'
import useApplicationStorage from '@/public/utils/application/useApplicationStorage'

/* 获取所有轻应用列表 */
export const getApplicationInfoStorage = () => {
  return Taro.getStorageSync('applicationInfoList')
}
/* 重置轻应用数据 */
export const resetApplicationInfoStorage = () => {
  return useApplicationStorage().setApplicationStorage([])
}

/**
 * 获取单个轻应用信息(优先级:接口轻应用数据:dataLists > 本地兜底轻应用数据:defaultApplicationLists)
 * @param areaCode 区域编码
 * @param menuCode 菜单编码
 * @returns {any}
 */
export const getApplicationByCode = (areaCode: string, menuCode: string) => {
  // 接口轻应用数据
  const dataLists = getApplicationInfoStorage() || []
  // 本地兜底轻应用数据
  const defaultApplicationLists = applicationInfoDefault || []
  const areaInfo =
    dataLists?.find((item) => item.areaCode === areaCode) ||
    defaultApplicationLists?.find((item) => item.areaCode === areaCode) ||
    {}
  return areaInfo.lightApplicationInfos && areaInfo.lightApplicationInfos.find((item) => item.menuCode === menuCode)
}

/**
 * 轻应用拼接: 应用 + 菜单
 * @param loadAddress 应用地址
 * @param routePath 菜单路由
 * @returns {string}
 */
export const getApplicationAddressNoHtml = (loadAddress: string, routePath: string) => {
  if (!routePath) {
    return loadAddress
  } else {
    const separate = routePath.startsWith('/') ? '' : '/'
    return `${loadAddress}${separate}${routePath}`
  }
}

const getApplicationAddressAndGray = (loadAddress, routePath, applicationInfo) => {
  // TODO 补充灰度头信息
  console.log('getApplicationAddressAndGray applicationInfo', applicationInfo)
  return getApplicationAddressNoHtml(loadAddress, routePath)
}

/**
 * 获取完整轻应用拼接信息 如：https://ic-h5-uat.kye-erp.com/order-config/0.126.8/#/order
 * @param areaCode 区域编码
 * @param menuCode 菜单编码
 * @returns {Promise<string>}
 */
export const getApplicationFullUrlAsync = (areaCode: string, menuCode: string): string => {
  let result = ''
  const applicationInfo = getApplicationByCode(areaCode, menuCode) || {}
  result = getApplicationAddressAndGray(applicationInfo.loadAddress, applicationInfo.routePath, applicationInfo)
  if (result) {
    // 追加webview公共参数
    result = urlContact(result, { ...webviewParamsDefault })
  }
  return result
}

/**
 * 获取指定轻应用灰度头配置对象
 * @param areaCode 区域编码
 * @param menuCode 菜单编码
 * @returns {{}}
 */
export const getGrayHeaderWithApplication = (areaCode: string, menuCode: string): {} => {
  const grayMenuInfo = getApplicationByCode(areaCode, menuCode)
  const { grayHeader } = grayMenuInfo || {}
  return getGrayHeaderLists(grayHeader)
}
