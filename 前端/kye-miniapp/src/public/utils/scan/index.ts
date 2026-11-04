import {
  getApplicationByApplicationCode,
  getQueryObject,
  navigateByOldPath,
  urlContact,
  isH5FSEnv,
} from '@public/utils'
import { getAppletQrcodeParameter, getJumpPage, scanQrCode } from './api'
import { judgeIsVisitorRoute } from '@/modules/kye-miniapp-waybill/src/apis/waybill-search'
import { handleCommonScan } from './help'
import Taro from '@tarojs/taro'
import { openURL } from '@/modules/webview/utils'
import { getEnvConfig } from '@/public/config'
import { getToken } from '@/public/storage'
import kyeNavigate from '../native/navigate'
import { ScanFrom } from './type'
import plateform from '@kye-netc/plateform'
import { debounce } from 'lodash-es'

interface CommonScanCode {
  from?: ScanFrom
  navigateType?: 'navigateTo' | 'redirectTo' | 'switchTab' | 'reLaunch'
}

const RESULT_TYPES = {
  FAST_REPORT: 'fastReport',
  LM_CODE: 'lmCode',
  SEARCH: 'search',
  OTHER: 'other',
} as const

const JUMP_TYPES = {
  TOAST: 10,
  SEARCH_RESULT: 20,
  WAYBILL_ROUTE: 30,
  WAYBILL_DETAIL: 40,
  INTERNATIONAL_DETAIL: 50,
} as const

const PATH_PATTERNS = {
  MINI_PROGRAM: /^\//,
  COMMON_SCAN: /\/scan/,
  H5_PAGE: /\/p/,
  PC_LOGIN: /\/wechat-scanLogin/,
} as const

// 错误处理
const handleError = (error: string) => {
  // 这里可以添加错误上报逻辑
  Taro.showToast({
    icon: 'none',
    title: error,
  })
}

// 处理H5结果解析
const parseH5Result = (url: string) => {
  const { no, code } = getQueryObject(url)
  return {
    billNumber: no || code || url,
    type: no ? RESULT_TYPES.FAST_REPORT : code ? RESULT_TYPES.LM_CODE : RESULT_TYPES.OTHER,
  }
}

// 处理PC扫码登录
const handlePCLogin = (result: string) => {
  const { isProd } = getEnvConfig()
  if (isH5FSEnv) {
    const url = `https://ic-h5${isProd ? '' : '-uat'}.kye-erp.com/wx-scanLogin.html#/home`
    openURL(url, { needLogin: false })
  } else {
    Taro.navigateTo({
      url: urlContact('/modules/user/pages/scanLogin/index', {
        q: result,
      }),
    })
  }
}

// 处理普通网页跳转
const handleWebview = (url: string) => {
  openURL(url, { needLogin: true })
}

/**
 * 拼接应用地址和路由路径
 * @param loadAddress - 应用基础地址（可能是带或不带 .html 的）
 * @param routePath - 子路由路径（可能为空或包含 .html）
 * @returns 拼接后的完整地址
 */
const getApplicationAddress = (loadAddress: string = '', routePath: string = ''): string => {
  if (routePath) {
    const needsSlash = !routePath.includes('.html') && !loadAddress.endsWith('/')
    return `${loadAddress}${needsSlash ? '/' : ''}${routePath}`
  }

  if (loadAddress.includes('.html')) {
    return loadAddress
  }

  const suffix = loadAddress.endsWith('/') ? 'index.html' : '/index.html'
  return loadAddress + suffix
}

// 处理运单扫码
const handleWaybill = async (billNumber: string, options: CommonScanCode) => {
  try {
    console.log('handleWaybill>>>', billNumber)
    const {
      data: { waybillInfo, beoverdue, companyNo, companyName },
    } = await scanQrCode({ scanCodeText: billNumber })

    if (beoverdue) {
      return Taro.showToast({
        icon: 'none',
        title: '无法识别数据，请重新扫描',
      })
    }

    const { systemType } = getEnvConfig()

    switch (waybillInfo.statusCode) {
      case 0:
        {
          Taro.reLaunch({ url: `/packages/other/qrcodeScan/index` })
        }
        break
      case 1:
        Taro.showToast({
          icon: 'none',
          title: '无法识别数据，请重新扫描',
        })
        break
      case 2:
        Taro[options.navigateType]({
          url: urlContact('/modules/order-build/pages/order/index', {
            waybillNo: billNumber,
            customerCode: companyNo,
            companyName: companyName,
            channel: 20,
            sourcePage: `${systemType}-home`,
            sourceAction: 'scan',
            textCode: billNumber,
            source: systemType,
          }),
        })
        break
      case 3:
        if (waybillInfo.receiveDate && !waybillInfo.visitorFlag) {
          navigateByOldPath(
            urlContact('/packages/webview/waybill-detail', {
              waybillNo: waybillInfo.waybillNumber,
            }),
            {
              type: options.navigateType,
            },
          )
        } else {
          navigateByOldPath(
            urlContact('/packages/waybill/route/index', {
              waybillNo: waybillInfo.waybillNumber,
              type: 'batchScan',
              visitorFlag: await getVisitorFlag(waybillInfo.waybillNumber),
            }),
            {
              type: options.navigateType,
            },
          )
        }
        break
      default:
    }
  } catch (error) {
    Taro.showToast({
      icon: 'none',
      title: '无法识别数据，请重新扫描',
    })
  }
}

// 子方法封装：根据 menuCode 匹配到 loadAddress 并拼接最终跳转地址
function getLoadAddressByMenuCode(menuCode: string, routePath, urlParmas) {
  const matched = getApplicationByApplicationCode(menuCode)
  return matched ? urlContact(getApplicationAddress(matched.loadAddress, routePath), urlParmas) : ''
}

export const handleH5Result = async (url: string, errorMsg?: string) => {
  url = url.replace(/&amp;/g, '&')
  const paramStr = url.includes('?') ? url.split('?')[1] : url
  const [appletId, appletMd5] = paramStr.split(',')
  const {
    data: { urlParameter, qrCodeUrl },
  } = await getAppletQrcodeParameter({
    appletId,
    appletMd5,
  }).catch((error) => {
    Taro.showToast({ icon: 'none', title: errorMsg ? errorMsg : error?.message })
  })
  if (urlParameter && urlParameter.length) {
    let menuCode = '',
      routeCode = '',
      otherParams = {}

    for (const item of urlParameter) {
      const { key, value } = item
      if (key === 'menuCode') menuCode = value
      else if (key === 'routeCode') routeCode = value
      else {
        otherParams[key] = value
      }
    }

    const baseUrl = menuCode
      ? getLoadAddressByMenuCode(menuCode, routeCode, otherParams)
      : urlContact(qrCodeUrl, otherParams)

    navigateByOldPath(
      urlContact('/packages/webview/webViewOrder', {
        url: encodeURIComponent(baseUrl),
        needLogin: true,
      }),
    )
  }
}

// 处理扫码结果分发
const handleScanResult = (result: string, options: CommonScanCode = { from: 'home', navigateType: 'navigateTo' }) => {
  // 扫码链路
  if (PATH_PATTERNS.COMMON_SCAN.test(result)) {
    return handleCommonScan({ scanResult: result, origin: 30, scanType: 'mini-scan', from: options.from })
  }
  // 单独处理H5跳转链接
  if (PATH_PATTERNS.H5_PAGE.test(result)) return handleH5Result(result)
  // PC扫码登录
  if (PATH_PATTERNS.PC_LOGIN.test(result)) return handlePCLogin(result)

  // 普通文本处理
  const isURL = /^https?:\/\//.test(result)
  const { billNumber, type } = isURL ? parseH5Result(result) : { billNumber: result, type: RESULT_TYPES.SEARCH }
  switch (type) {
    // 面单扫码
    case RESULT_TYPES.FAST_REPORT:
      return handleWaybill(billNumber as string, options)
    // 运单扫码
    case RESULT_TYPES.LM_CODE:
    case RESULT_TYPES.SEARCH:
      return handleCodeSearch(billNumber as string, type)
    default:
      // 判断内部链接，webview跳转
      if (result.indexOf('kye-erp.com') > -1) {
        return handleWebview(result)
      }
      Taro.showToast({
        icon: 'none',
        title: '无法识别数据，请重新扫描',
      })
  }
}

// 获取是否为游客
const getVisitorFlag = (waybillNumber) => {
  return new Promise((reslove, reject) => {
    judgeIsVisitorRoute({ clientType: '20', waybillNumber })
      .then((res) => {
        reslove(+res?.data?.visitorFlag === 1)
      })
      .catch((e) => {
        reject(e)
      })
  })
}

// 处理编码查询
const handleCodeSearch = async (code: string, searchType: string) => {
  try {
    const response = await getJumpPage({
      type: searchType === 'lmCode' ? 1 : '',
      keyword: code,
    })
    const { jumpPage, tips, paramType, waybillNumber, waybillNumbers, type } = response.data
    switch (jumpPage) {
      case JUMP_TYPES.TOAST:
        return showToast(tips)
      case JUMP_TYPES.SEARCH_RESULT:
        // return navigateByOldPath(
        //   urlContact('/packages/webview/search-result', {
        //     keyword: paramType ? waybillNumber : code,
        //   }),
        // )
        return kyeNavigate.navigateBefore('navigateTo', {
          url: urlContact('/modules/search/pages/search/index', {
            keyword: !paramType || waybillNumbers ? code : waybillNumber,
          }),
          needLogin: true,
        })
      case JUMP_TYPES.WAYBILL_ROUTE:
        if (type === 0) {
          return navigateByOldPath(
            urlContact('/packages/webview/waybill-route', {
              waybillNo: waybillNumber,
              visitorFlag: await getVisitorFlag(waybillNumber),
            }),
          )
        }
        return navigateByOldPath(
          urlContact('/packages/waybill/route/index', {
            waybillNo: waybillNumber,
            lmCode: searchType === 'lmCode' ? '1' : '',
            type: 'batchScan',
            visitorFlag: await getVisitorFlag(waybillNumber),
          }),
        )
      case JUMP_TYPES.WAYBILL_DETAIL:
        return navigateByOldPath(
          urlContact('/packages/webview/waybill-detail', {
            waybillNo: waybillNumber,
            lmCode: searchType === 'lmCode' ? '1' : '',
            type: 'batchScan',
            visitorFlag: await getVisitorFlag(waybillNumber),
          }),
        )
      case JUMP_TYPES.INTERNATIONAL_DETAIL:
        // todo 跳转轻应用路径
        //   Taro.navigateTo({
        //     url: `/packages/webview/openWebview?url=${encodeURIComponent(`${urlOrderList().internationWaybillNoDetail.url}?waybillNo=${res.waybillNumber}`)}&needLogin=true`
        // })
        // return openURL(code)
        return Taro.navigateTo({
          url: `/modules/waybill-build/pages/waybill-detail/index?waybillNumber=${waybillNumber}&fromExternal=0`,
        })
      default:
        return Taro.showToast({
          icon: 'none',
          title: '无法识别数据，请重新扫描',
        })
    }
  } catch (error) {
    handleError(error)
  }
}

// 显示提示
const showToast = (message: string) => {
  Taro.showToast({ icon: 'none', title: message })
}

export const _scanQrcode = async (options?: CommonScanCode) => {
  try {
    const scanResult = await plateform.scanCode()
    // 处理小程序路径
    if (scanResult?.path) return navigateByOldPath(scanResult.path)

    // 处理扫描结果
    if (scanResult?.result) return handleScanResult(scanResult.result, options)
  } catch (error) {
    console.error(error)
  }
}

export const scanQrcode = debounce((opitions?: CommonScanCode) => {
  const finalOptions: CommonScanCode = {
    from: 'home',
    navigateType: 'navigateTo',
    ...opitions,
  }

  const token = getToken()
  if (token) {
    _scanQrcode(finalOptions)
  } else {
    kyeNavigate.checkLogin(() => {
      Taro.navigateBack({
        success: () => {
          _scanQrcode(finalOptions)
        },
      })
    })
  }
}, 100)
