/**
 * 退登登录页解析（APPLICATION_INFO 缓存 + 接口刷新）
 * 参考旧基座:
 *  - netc-pc-web/src/utils/envSdk.js#getApplicationInfo / update_applicationInfoList
 *  - netc-pc-web/src/utils/storage.js#getApplication / setApplication
 *
 * 说明:
 *  - 登录页路径优先取缓存 sessionStorage.APPLICATION_INFO 中 M3001(主菜单) 的
 *    loadAddress + routePath; 无缓存/无 M3001 时按当前环境(host)回退全量版本登录页
 *  - handleNoToken 触发时防抖只发一次接口刷新 APPLICATION_INFO(不阻塞当次退登跳转,
 *    仅更新缓存供后续使用), 对齐旧基座 update_applicationInfoList -> setApplication
 */
import { queryAreaMenuList } from '@/apis/lightapp'
import { getLoginApplication, setLoginApplication } from '@/stores/pc-web/deps/storage'
import type { MenuItem } from '@/stores/mock'

/** 主菜单(旧全量版本登录页所在轻应用)菜单编码 */
const LOGIN_AREA_CODE = 'A3001'
const LOGIN_MENU_CODE = 'M3001'

/** 无缓存/异常时按环境回退的全量版本登录页 */
const FALLBACK_LOGIN_URL: Record<'uat' | 'stg' | 'prod', string> = {
  uat: 'https://uc-uat.ky-express.com/#/login/password',
  stg: 'https://uc-stg.ky-express.com/#/login/password',
  prod: 'https://uc.ky-express.com/#/login/password',
}

/** 按当前 host 判定环境: uat / stg, 其余(含生产域名)一律按生产处理 */
function resolveEnvByHost(): 'uat' | 'stg' | 'prod' {
  const host = window.location.host
  if (host.includes('uat')) return 'uat'
  if (host.includes('stg')) return 'stg'
  return 'prod'
}

/** APPLICATION_INFO 缓存结构(兼容旧缓存 vos[].lightApplicationInfos 与新接口 vos[].menus) */
interface LoginApplicationCache {
  vos?: Array<{ menus?: MenuItem[]; lightApplicationInfos?: MenuItem[] }>
}

/**
 * 从 APPLICATION_INFO 缓存解析 M3001 登录页地址(loadAddress + routePath)
 * @returns 登录页地址; 无缓存/无 M3001 配置时返回空串
 */
function resolveLoginUrlFromCache(): string {
  const appInfo = getLoginApplication() as LoginApplicationCache
  const groups = appInfo?.vos || []
  const target = groups
    .flatMap((group) => group.menus || group.lightApplicationInfos || [])
    .find((item) => item.menuCode === LOGIN_MENU_CODE && !!item.loadAddress)
  if (!target) return ''
  return `${target.loadAddress}${target.routePath || ''}`
}

/**
 * 解析退登登录页地址:
 * 优先 APPLICATION_INFO 缓存中的 M3001 配置, 无配置回退当前环境全量版本登录页
 * 本地开发调试：不执行resolveLoginUrl
 */
export function resolveLoginUrl(): string {
  return resolveLoginUrlFromCache() || FALLBACK_LOGIN_URL[resolveEnvByHost()]
}

/** 接口刷新进行中标志: 退登场景多个守卫并发触发时防抖, 只发一次请求 */
let refreshing = false

/**
 * 防抖刷新 APPLICATION_INFO(不阻塞退登跳转):
 * 拉取登录模块轻应用列表写入 sessionStorage/localStorage 的 APPLICATION_INFO,
 * 无 token 场景不带 token 且静默(不弹错误提示)
 */
export function refreshLoginApplication(): void {
  if (refreshing) return
  refreshing = true
  queryAreaMenuList({ areaCodes: [LOGIN_AREA_CODE], channelCode: 'pc', menuCodes: [LOGIN_MENU_CODE] }, { toast: false })
    .then(({ data }) => {
      if (data) setLoginApplication(data)
    })
    .catch((error) => {
      console.error('退登: 刷新 APPLICATION_INFO 失败', error)
    })
    .finally(() => {
      refreshing = false
    })
}
