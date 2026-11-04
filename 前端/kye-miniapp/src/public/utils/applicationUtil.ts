import Taro from '@tarojs/taro'
import { urlContact } from '@public/utils/url'
import { webviewParamsDefault } from '@public/utils/webview'
import { getGrayHeaderLists } from '@public/utils/request/grayHeader'
import { ApplicationGrayType } from '@public/utils/application/constants'
import { openURL } from '@modules/webview/utils'
import { AreaItem } from './application/applicationType'
import { getDefaultApplicationSync } from '@/public/utils/application/applicationDefault'
import useApplicationStorage from './application/useApplicationStorage'
import { getEnvConfig } from '../constants'

export const parseCustomParam = (applicationInfo: { customParam: string }) => {
  try {
    return JSON.parse(applicationInfo.customParam || '{}')
  } catch (error) {
    console.log('parseCustomParam error', error)
    return {}
  }
}

/* 获取所有轻应用列表 */
export const getApplicationInfoStorage = (): AreaItem[] => {
  return Taro.getStorageSync('applicationInfoList') || []
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
  const defaultApplicationLists = getDefaultApplicationSync() || []
  const areaInfo =
    dataLists?.find((item) => item.areaCode === areaCode) ||
    defaultApplicationLists?.find((item) => item.areaCode === areaCode)
  return areaInfo?.lightApplicationInfos && areaInfo?.lightApplicationInfos.find((item) => item.menuCode === menuCode)
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
    const separate = routePath.startsWith('/') || loadAddress.includes('.html') ? '' : '/'
    return `${loadAddress}${separate}${routePath}`
  }
}

const getApplicationAddressAndGray = (loadAddress, routePath, applicationInfo) => {
  // TODO 补充灰度头信息
  console.log('getApplicationAddressAndGray applicationInfo', applicationInfo)
  return getApplicationAddressNoHtml(loadAddress, routePath)
}

/* 获取webview公共参数 */
const getWebviewCommonParamString = () => {
  // TODO 仅用于调试 - xFormParamsDebug
  const xFormParamsDebug = {
    xForm: getEnvConfig().xForm,
  }
  // 追加webview公共参数
  // const globalData = getGeneralData() || {}
  // const globalDataStr = JSON.stringify(globalData)
  return {
    ...webviewParamsDefault,
    ...xFormParamsDebug,
    pageFromNative: 1,
    // isMiniApp: 1, // 跨越寄件多端标识
    source: 20, // 绑码组件互联网标识
    workId: 'undefined',
  }
}

/**
 * 根据轻应用编码-获取完整轻应用拼接信息 如：https://ic-h5-uat.kye-erp.com/order-config/0.126.8/#/order
 * @param areaCode 区域编码
 * @param menuCode 菜单编码
 * @param queryParams
 * @returns {Promise<string>}
 */
export const getApplicationFullUrlAsync = (
  areaCode: string,
  menuCode: string,
  queryParams: Record<string, any> = {},
): string => {
  const applicationInfo = getApplicationByCode(areaCode, menuCode) || {}
  return getSingleApplicationUrl(applicationInfo, queryParams)
}

/**
 * 根据轻应用对象-获取单个轻应用访问链接
 * @param applicationInfo
 * @param queryParams
 * @returns {string}
 */
export const getSingleApplicationUrl = (applicationInfo, queryParams: Record<string, any> = {}): string => {
  console.log('getSingleApplicationUrl', queryParams)
  let result = ''
  result = getApplicationAddressAndGray(applicationInfo?.loadAddress, applicationInfo?.routePath, applicationInfo)
  if (result) {
    // 追加webview公共参数
    // const globalData = getGeneralData() || {}
    // const globalDataStr = JSON.stringify(globalData)
    // 追加灰度头
    const grayheader = getSingleApplicationGrayHeader(applicationInfo)
    result = urlContact(result, {
      ...(queryParams || {}),

      ...(parseCustomParam(applicationInfo).userOpenIdEncrypt
        ? { userOpenIdEncrypt: parseCustomParam(applicationInfo).userOpenIdEncrypt }
        : {}),

      ...(getWebviewCommonParamString() || {}),
      grayheader,
    })
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

/**
 * 获取单个应用灰度头grayheader
 * @param applicationInfo
 */
export const getSingleApplicationGrayHeader = (applicationInfo) => {
  let result = ''
  const { needGray, grayHeader } = applicationInfo || {}
  if (needGray && Number(needGray) === ApplicationGrayType['是'] && grayHeader && grayHeader.length > 0) {
    result = JSON.stringify(grayHeader)
  }
  return result
}

/** 根据menuCustomParam获取当前轻应用 */
export const getCurrentApplicationByMenuCustomParam = (menuCustomParam: string) => {
  // 接口轻应用数据
  const dataLists = getApplicationInfoStorage() || []
  const allApplication = []
  dataLists.forEach((v) => {
    if (v.lightApplicationInfos && v.lightApplicationInfos.length) {
      allApplication.push(...v.lightApplicationInfos)
    }
  })

  const currentApplication = allApplication.filter((v) => {
    if (!v.menuCustomParam) return false
    const routePath = JSON.parse(v.menuCustomParam)?.routePath
    return routePath === menuCustomParam
  })?.[0]

  return currentApplication
}

export const getApplicationByApplicationCode = (code: string) => {
  const dataLists = getApplicationInfoStorage() || []

  for (const app of dataLists) {
    for (const lightApp of app.lightApplicationInfos || []) {
      if (lightApp.applicationCode === code) {
        return lightApp
      }
    }
  }
  return undefined
}

/**
 * 公共webview-打开h5
 * @param url 打开h5 url
 * @param params {} 追加参数
 */
export const openWebviewH5 = (url: string, params: Record<string, any> = {}) => {
  if (url) {
    const urlWithCommon = urlContact(url, getWebviewCommonParamString())
    openURL(urlWithCommon, params)
  }
}
