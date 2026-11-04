import {
  getApplicationByApplicationCode,
  getAuthCode,
  navigateByOldPath,
  navigateByOldUrl,
  oldUrlHasNative,
  redirectToByOldUrl,
  urlContact,
  urlQueryStringAdd,
} from '@/public/utils'
import { getScanGraphicCode, ReportNode } from './api'
import Taro from '@tarojs/taro'
import { tabRouterMap } from '@/public/utils/router/route-mapping'
import { ScanFrom } from './type'
import { getRedirectUrl } from '@public/hooks/useRedirectH5ToNative'

interface CommonScan {
  /** 扫码信息 */
  scanResult: string
  /** 扫码来源页面 */
  origin: ReportNode
  /** 扫码类型，小程序扫码，设备扫码 */
  scanType: 'mini-scan' | 'wx'
  from?: ScanFrom
  urlParmas?: Partial<Record<string, string>>
  /* 跳转类型 */
  navigateType?: 'navigateTo' | 'redirectTo' | 'switchTab'
}

const isRoutePathDifferent = (a: string, b: string) => a.split('#')[1] !== b.split('#')[1]

/**跳转至轻应用 */
const buildAppJumpUrl = async (
  applicationCode: string,
  routePath: string,
  jumpUrl: string,
  urlParamStr: string,
): Promise<string> => {
  try {
    const appInfo = await getApplicationByApplicationCode(applicationCode)
    if (appInfo) {
      const baseUrl = isRoutePathDifferent(routePath, appInfo.loadAddress + appInfo.routePath)
        ? jumpUrl
        : appInfo.loadAddress + appInfo.routePath
      return encodeURIComponent(urlQueryStringAdd(baseUrl, urlParamStr))
    } else {
      return encodeURIComponent(urlQueryStringAdd(jumpUrl, urlParamStr))
    }
  } catch {
    return encodeURIComponent(urlQueryStringAdd(jumpUrl, urlParamStr))
  }
}

const buildDefaultH5Url = (jumpUrl: string, urlParmas?: Partial<Record<string, string>>): string =>
  encodeURIComponent(urlContact(jumpUrl, urlParmas))

const jumpToWebview = async (
  targetUrl: string,
  customParams: Record<string, any>,
  urlParamStr: string,
  scanType: 'mini-scan' | 'wx',
) => {
  const nativeJumpType = scanType === 'wx' ? 'redirectTo' : 'navigateTo'
  const url = urlContact('/modules/scan/pages/webview/index', {
    url: targetUrl,
    customParams: JSON.stringify(customParams || {}),
    urlParamStr: encodeURIComponent(urlParamStr),
    scanType,
  })

  // 实名认证跳原生
  if (targetUrl.includes('real-name-auth')) {
    const redectUrl = await getRedirectUrl(targetUrl, true)
    if (redectUrl) {
      Taro.navigateTo({
        url: `${redectUrl}&miniprogramType=scan`,
      })
      return
    }
  }

  Taro[nativeJumpType]({ url })
}

export const handleCommonScan = async ({ scanResult, origin, scanType, urlParmas, from, navigateType }: CommonScan) => {
  const code = await getAuthCode()

  const { data } = await getScanGraphicCode({
    scanResult,
    reportChannel: 10,
    platformCode: code,
    reportNode: origin || 30,
  })

  if (!data?.jumpType || !data?.jumpUrl) return
  const { jumpType, jumpUrl, urlParamStr = '', customParams = {}, errCode } = data
  let targetUrl = jumpUrl
  switch (jumpType) {
    case 1: {
      if (oldUrlHasNative(jumpUrl) && !jumpUrl.includes('/order-batch')) {
        const nativeJumpType = scanType === 'wx' ? redirectToByOldUrl : navigateByOldUrl
        // 改为原生title后使用navigateTo即可
        nativeJumpType(jumpUrl, {
          urlParamStr,
        })
        return
      }
      if (errCode === 0) {
        const { applicationCode, routePath } = customParams.applicationInfo || {}
        if (customParams.needApplication && applicationCode && routePath) {
          targetUrl = await buildAppJumpUrl(applicationCode, routePath, jumpUrl, urlParamStr)
        } else {
          targetUrl = buildDefaultH5Url(jumpUrl, urlParmas)
        }
      }
      jumpToWebview(targetUrl, customParams, urlParamStr, scanType)
      break
    }

    case 2: {
      const jumpArr = jumpUrl.split('?')
      const url = jumpArr[0]
      const queryStr = jumpArr[1]
      console.log('jumpUrl', url, queryStr)
      if (tabRouterMap[url]) {
        Taro.setStorageSync('scanCodeQuery', queryStr)
        return Taro.switchTab({ url: url })
      }
      return navigateByOldPath(jumpUrl, { type: tabRouterMap[jumpUrl] ? 'switchTab' : 'redirectTo' })
    }

    default:
      break
  }
}
