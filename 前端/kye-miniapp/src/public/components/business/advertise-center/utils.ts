import Taro from '@tarojs/taro'
import { openURL } from '@/modules/webview/utils'
import { getRoutePathByChannel, UrlCustomParam } from './api'
import {
  ensureWechatInstalled,
  getCurrentApplicationByMenuCustomParam,
  isAliMiniApp,
  isAmapMiniApp,
  isH5FSEnv,
  isWxMiniApp,
} from '@public/utils'
import { useApplication } from '@/public/utils/application/useApplication'
import { getEnvConfig } from '@/public/config'
import plateform from '@kye-netc/plateform'
import { getToken } from '@/public/storage'

const { navigateApplication } = useApplication()

const SearchStatusList = ['searchTab20', 'searchTab30', 'searchTab40', 'searchTab50']
const LevelPageList = ['minePage', 'homePage', 'orderPage', 'search']

export const getMessageRoutePath = async () => {
  try {
    const res = await getRoutePathByChannel({
      channelCode: 'nativeMini',
      appCode: isH5FSEnv ? 'KYE_FS' : isWxMiniApp ? 'KYE_KYSY' : isAmapMiniApp ? 'KYE_GD' : 'KYE_ZFB',
    })
    return res?.data ?? []
  } catch {
    return []
  }
}

export const buildUrlWithParams = (baseUrl: string, paramList?: any[], paramMap?: string | Record<string, string>) => {
  if (!paramList?.length || !paramMap) return baseUrl

  paramMap = typeof paramMap === 'string' ? JSON.stringify(paramMap) : paramMap

  const query = paramList.map((item) => `${item.pram}=${paramMap[item.pram] ?? ''}`).join('&')

  const separator = baseUrl.includes('?') ? '&' : '?'

  return `${baseUrl}${separator}${query}`
}

export const miniProgramJump = async (
  jumpInfo: InAdvertisementJump,
  navigateFn: 'navigateTo' | 'redirectTo' | 'switchTab' = 'navigateTo',
) => {
  const { modelRoute, customeParam, urlCustomParam } = jumpInfo
  const routeList = await getMessageRoutePath()

  if (!routeList.length) {
    // 没有配置内部路由回到首页
    Taro.switchTab({ url: '/layout/pages/home/index' })
    return
  }

  const pathObj = routeList.find((item) => item.pageName === modelRoute)

  if (!pathObj) {
    // 没有找到匹配路由回首页
    Taro.switchTab({ url: '/layout/pages/home/index' })
    return
  }

  const { type: routeType, url, customParams } = pathObj

  if (routeType === 'h5') {
    // 跳转类型是H5
    const httpsUrl = url.replace(/^http:\/\//, 'https://')
    const finalUrl = buildUrlWithParams(httpsUrl, urlCustomParam, customeParam)
    openURL(encodeURIComponent(finalUrl), customParams, navigateFn)
    return
  }

  if (routeType === 'miniProgram') {
    let params = ''
    let path = url
    urlCustomParam?.forEach((item) => {
      if (item.pram) {
        params += `${item.pram}=${item.value}&`
      }
    })
    if (params) {
      path += `?${params}`
      // 移除末尾的 '&'
      path = path.replace(/&$/, '')
    }
    // 跳转跨越领鲜小程序且为登录状态：需要带上token和fromId参数
    const token = getToken()
    if (customParams.appId === 'wxb1503f29025cc7aa' && token) {
      const fromId = getEnvConfig().xForm
      path = `${path}${path.indexOf('?') > 0 ? '&' : '?'}token=${token}&fromId=${fromId}`
    }
    console.log('path', {
      path: path,
      appId: customParams.appId,
      ...customParams,
      envVersion: getEnvConfig().isProd ? 'release' : 'trial',
    })
    // 跳转类型是小程序
    plateform.openMiniProgram({
      path: path,
      appId: customParams.appId,
      ...customParams,
      envVersion: getEnvConfig().isProd ? 'release' : 'trial',
    } as any)
    return pathObj
  }

  // 普通页面跳转逻辑
  if (SearchStatusList.includes(pathObj.pageName)) {
    // 跳转到老的查件页
    // Taro.getApp().globalData.searchTabIndex = pathObj.pageName.split('searchTab')[1]
    Taro.switchTab({ url: '/layout/pages/waybill/index' })
    return
  }

  if (LevelPageList.includes(pathObj.pageName)) {
    // 消息跳转至tab页
    Taro.switchTab({ url })
    return
  }

  // 是否存在轻应用信息
  const currentApplication = getCurrentApplicationByMenuCustomParam(url)
  // 跳转至轻易可能工或者外部url
  currentApplication ? navigateApplication(currentApplication) : Taro.navigateTo({ url })
}

interface InAdvertisementJump {
  jumpMode: 0 | 1 | 2 | 3 | 4
  h5Link: string
  modelRoute: string
  urlCustomParam?: UrlCustomParam[]
  customeParam?: string
}

const advertisementJump = (jumpInfo: InAdvertisementJump) => {
  const { jumpMode, h5Link, modelRoute, customeParam } = jumpInfo
  if (jumpMode === 1) {
    // 外部路由
    openURL(h5Link, { needLogin: true })
  } else if (jumpMode === 2) {
    // 内部路由模块
    miniProgramJump(jumpInfo)
  } else if (jumpMode === 3) {
    // 外部小程序
    let { appId } = customeParam ? JSON.parse(customeParam) : { appId: '' }
    Taro.navigateToMiniProgram({
      appId: appId,
      path: modelRoute,
    })
  }
}

function addClassToTag(html: string, tag: string, className: string): string {
  const tagRegex = new RegExp(`<${tag}\\b([^>]*)>`, 'gi')
  return html.replace(tagRegex, (match, p1) => {
    if (p1.includes('class=')) {
      // 已有 class，追加类名
      return match.replace(/class\s*=\s*(['"])([^']*)\1/, (m, quote, classes) => {
        return `class=${quote}${classes.trim()} ${className}${quote}`
      })
    } else {
      // 没有 class，直接添加
      return `<${tag} class="${className}"${p1}>`
    }
  })
}

/**
 * 将标签文本内容中的前导空格替换为 &nbsp;，以保留前导空格渲染
 */
function preserveLeadingSpaces(html: string): string {
  return html.replace(/>[ \t]+(?=\S)/g, (match) => {
    return match.replace(/ /g, '\u00A0').replace(/\t/g, '\u3000')
  })
}

/**
 * 格式化 HTML，批量添加多个标签的 class
 */
export function formatHtml(html: string): string {
  let result = html
  // 保留前导空格
  result = preserveLeadingSpaces(result)
  // 依次添加 class
  result = addClassToTag(result, 'p', 'text-content__p')
  result = addClassToTag(result, 'ol', 'text-content__ol')
  result = addClassToTag(result, 'ul', 'text-content__ul')

  return result
}

export { SearchStatusList, advertisementJump }

const getOperatePort = () => {
  const { isApp } = getEnvConfig()
  if (isApp) {
    return 'APP'
  } else if (isWxMiniApp) {
    return 'MINIPROGRAM'
  } else if (isH5FSEnv) {
    return 'LARKMINIPROGRAM'
  } else {
    return 'MINIPROGTAM'
  }
}

export const getReportSorce = () => {
  const { systemType, isApp } = getEnvConfig()
  const operatorSystem = systemType === 'iOS' ? 'ios' : 'android'
  return {
    channelSource: isApp ? operatorSystem : 'miniprogram',
    operatePort: getOperatePort(),
    operatorSystem: systemType === 'iOS' ? 'ios' : 'android',
  }
}

export const getChannelCode = () => {
  const { systemType, isApp, plateForm } = getEnvConfig()
  if (isApp) {
    return systemType === 'iOS' ? 'iOS' : 'android'
  } else {
    return plateForm === 'alipay' ? 'miniprogram' : 'miniprogram'
    // return plateForm === 'alipay' ? 'aliPay' : 'miniprogram'
  }
}
