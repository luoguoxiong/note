import { ref } from 'vue'
import { getConfigBySource } from '../apis/user'
import { getEnvConfig } from '@/public/constants'
import { getQueryObject, urlContact } from '@/public/utils/url'
import { openURL } from '@/modules/webview/utils'
import { getToken } from '@/public/storage'

// H5路径模式定义 - 使用正则表达式匹配，支持可变的版本号
interface H5UrlPattern {
  matchKey: string // 正则表达式匹配模式
  targetPath: string // 对应的原生页面路径
  description: string // 模式描述
}
const { isProd } = getEnvConfig()
export const relaNameSwitch = ref(true)
const updateRelaNameSwitchPromise = ref<Promise<any> | null>(null)

const getRelaNameSwitch = async () => {
  try {
    const res = await getConfigBySource({ source: 20 })
    console.log('getConfigBySource', res)
    relaNameSwitch.value = res.data?.relaNameSwitch
    // relaNameSwitch.value = false
  } catch (e) {
    relaNameSwitch.value = true
  }
}

export const updateRelaNameSwitch = () => {
  updateRelaNameSwitchPromise.value = getRelaNameSwitch()
}

// H5 URL模式定义 - 支持带版本号和不带版本号的URL
export const h5UrlPatterns: H5UrlPattern[] = [
  // 1. 匹配实名认证个人认证页
  {
    matchKey: 'personal',
    targetPath: '/modules/user/pages/realname/personal/index',
    description: '实名认证个人认证',
  },
  // 2. 匹配实名认证中间页
  {
    matchKey: 'check',
    targetPath: '/modules/user/pages/realname/check/index',
    description: '实名认证中间页',
  },
  // 3. 匹配实名认证错误结果页
  {
    matchKey: 'qrcode-error',
    targetPath: '/modules/user/pages/realname/qrcode-error/index',
    description: '实名认证错误结果页',
  },
  // 4. 匹配实名认证首页 (作为兜底，放在最后)
  {
    matchKey: 'real-name-auth',
    targetPath: '/modules/user/pages/realname/home/index',
    description: '实名认证首页(兜底)',
  },
]

// 为了保持向后兼容，保留原有的枚举和映射（可选）
enum urlH5MapEnum {
  '实名认证中间页' = 'netc-h5-user-optimize/real-name-auth/index.html#/check',
  '实名认证个人认证' = 'netc-h5-user-optimize/real-name-auth/index.html#/personal',
}

// 涉及H5转原生获取目标路径 - 改进版本
export const getRedirectUrl = async (url: string, needDecode?: boolean) => {
  // 后端返参决定走H5还是原生路由
  if (!updateRelaNameSwitchPromise.value) {
    updateRelaNameSwitch()
  }
  if (updateRelaNameSwitchPromise.value) {
    try {
      await updateRelaNameSwitchPromise.value
    } catch (error) {
      console.error(error)
    }
  }
  if (!relaNameSwitch.value) {
    return ''
  }

  // 1.无逻辑判断的也收拢到该方法里面处理
  if (url.includes('modules/user/pages/realname/')) {
    return url
  }

  const decodeUrl = needDecode ? decodeURIComponent(url) : url

  // 2. 前置判断：如果不包含核心关键词，直接返回空
  if (!decodeUrl.includes('real-name-auth')) {
    return ''
  }
  const routeOnly = decodeUrl.split('?')[0]

  // 3. 匹配路由部分
  const matchedPattern = h5UrlPatterns.find((pattern) => routeOnly.includes(pattern.matchKey))

  // 4. 如果匹配成功，拼接返回目标路径
  if (matchedPattern) {
    // 提取查询参数
    const urlParts = decodeUrl.split('?')
    const queryString = urlParts.length > 1 ? urlParts[1] : ''

    // 构建查询参数，如果没有参数则使用默认值
    const params = queryString || 'isFromRedirect=true'

    return `${matchedPattern.targetPath}?${params}`
  }

  return ''
}

// 为了保持向后兼容，保留原有的映射
export const urlReddirectMap = {
  [urlH5MapEnum.实名认证中间页]: '/modules/user/pages/realname/check/index',
  [urlH5MapEnum.实名认证个人认证]: '/modules/user/pages/realname/personal/index',
}

// 辅助函数：提取URL中的版本号（如果需要的话）
export const extractVersionFromUrl = (url: string): string | null => {
  const versionMatch = url.match(/netc-h5-user-optimize\/real-name-auth\/(\d+\.\d+\.\d+)\//)
  return versionMatch ? versionMatch[1] : null
}

// 辅助函数：判断URL是否匹配实名认证相关路径
export const isRealNameAuthUrl = (url: string): boolean => {
  return url.includes('real-name-auth')
}

/**
 * @description 获取当前域名
 * @param notSubFolder 默认不包含当前下单配置二级域名
 */
export function getBaseUrl() {
  let base_url = ''
  if (isProd) {
    base_url = 'https://ic-h5.kye-erp.com'
  } else {
    base_url = 'https://ic-h5-uat.kye-erp.com'
  }
  return base_url
}

// 是否跳转H5
export const redirectToH5 = async (type: 'personal' | '', params?: any) => {
  if (updateRelaNameSwitchPromise.value) {
    try {
      await updateRelaNameSwitchPromise.value
    } catch (error) {
      console.error(error)
    }
  }
  console.log('redirectToH5', type, relaNameSwitch.value)
  if (relaNameSwitch.value) return false
  const { $taroTimestamp, ...contactParams } = params || getQueryObject() || {}
  const baseUrl = getBaseUrl()
  const token = getToken()
  contactParams.token = token
  const url = `${baseUrl}/netc-h5-user-optimize/real-name-auth/index.html#/${type}`
  openURL(urlContact(url, contactParams), { needLogin: true }, 'redirectTo')
  return true
}
