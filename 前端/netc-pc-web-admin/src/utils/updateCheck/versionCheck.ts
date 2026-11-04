/**
 * 版本升级检查任务
 * 来源参考:
 *  - netc-pc-web/src/utils/updateCheck/applicationUpdateCheck.js (倒计时版本检查)
 *  - netc-pc-web/src/utils/commonUtil.js#checkMd5UrlUpdate (afterEach 消费升级跳转)
 *
 * 与老项目的差异:
 *  - 新基座为纯在线静态部署(URL 含版本目录, 如 /netc-pc-web-admin/0.0.71/),
 *    无离线包 md5 下载流程, 版本比对直接用接口下发 loadAddress 与当前运行地址
 *  - 主应用记录取 A3003 区域菜单接口: M3089(PC_WEB_MAIN_NEW) 的 loadAddress
 *    即基座自身部署地址; A3003 未匹配(灰度命中→未命中)时回退查 A3001/M3001 老版本
 *  - 检测到新版本不立即跳转, 先暂存 upgradeInfo, 由 router.afterEach 消费,
 *    对齐老项目 $checkMd5UrlUpdate 的跳转时机并保留当前 hash 路由
 */
import type { Router } from 'vue-router'
import applicationUpdateCheck from './applicationUpdateCheck'
import { useLightAppStore } from '@/stores/lightapp'
import { queryAreaMenuList } from '@/apis/lightapp'
import { pinia } from '@/stores'
import type { MenuItem } from '@/stores/mock'
import { clearLoginApplication } from '@/stores/pc-web/deps/storage'

/** 主应用在菜单接口中的菜单编码(新基座首页) */
const MAIN_APP_MENU_CODE = 'M3089'
/** 主应用(基座自身)应用编码 */
const MAIN_APP_CODE = 'PC_WEB_MAIN_NEW'

/** 旧版本主应用: A3001 区域下的 M3001(灰度未命中时的回退目标) */
const OLD_MAIN_APP_AREA_CODE = 'A3001'
const OLD_MAIN_APP_MENU_CODE = 'M3001'

/**
 * 调试开关 sessionStorage key, 值为 '1' 时无视环境限制强制执行主应用版本检查
 * 控制台执行: sessionStorage.setItem('APP_VERSION_CHECK_DEBUG', '1')
 */
const DEBUG_STORAGE_KEY = 'APP_VERSION_CHECK_DEBUG'

interface UpgradeInfo {
  loadAddress: string
  routePath: string
}

/** 待消费的主应用升级信息(afterEach 跳转后清空) */
let pendingUpgradeInfo: UpgradeInfo | null = null

/**
 * 是否允许主应用版本检查 <生产域名, 对齐老项目 applicationEnvValidate>
 * host 命中 uat/stg/dev 或本地 development 时跳过; 调试开关开启时无视环境限制
 */
function isMainAppVersionCheckEnabled(): boolean {
  if (sessionStorage.getItem(DEBUG_STORAGE_KEY) === '1') return true
  if (process.env.NODE_ENV === 'development') return false
  return !/uat|stg|dev/.test(window.location.host)
}

/**
 * 剥离 routePath 的 hash 部分('#/home' -> '')
 * 对齐老基座 adminMicroUtils.stripRoutePathHash, 避免拼出双 hash URL
 */
function stripRoutePathHash(routePath = '') {
  return routePath.split('#')[0]
}

/** 归一化去掉末尾 '/'，避免 'a/' 与 'a' 的误判 */
function normalizeUrl(url = '') {
  return url.replace(/\/+$/, '')
}

/**
 * 从 A3003 菜单列表中解析主应用(基座自身)记录
 * 优先 M3089 首页, 兜底第一条有效的 PC_WEB_MAIN_NEW 记录
 */
function resolveMainApp(list: MenuItem[]): MenuItem | undefined {
  return (
    list.find((item) => item.menuCode === MAIN_APP_MENU_CODE && !!item.loadAddress) ||
    list.find((item) => item.applicationCode === MAIN_APP_CODE && !!item.loadAddress)
  )
}

/**
 * 灰度从命中→未命中(A3003 已无新基座主应用记录)时,
 * 查 A3001/M3001 获取旧版本主应用记录作为回退目标
 */
async function resolveOldMainApp(): Promise<MenuItem | undefined> {
  try {
    const { data } = await queryAreaMenuList({
      channelCode: 'pc',
      areaCodes: [OLD_MAIN_APP_AREA_CODE],
      menuCodes: [OLD_MAIN_APP_MENU_CODE],
    })
    return data?.vos?.[0]?.menus?.find((item) => item.menuCode === OLD_MAIN_APP_MENU_CODE && !!item.loadAddress)
  } catch (error) {
    console.error('版本检查: 获取旧版本主应用失败', error)
    return undefined
  }
}

/**
 * 版本检查队列任务(每 15 分钟一次, 一次 A3003 请求同时完成两件事):
 * 1. 轻应用静态更新: 强刷 lightAppList 及缓存, 仅影响后续打开的 iframe,
 *    已打开的页面不刷新(需求约定 lightAppList 更新即可)
 * 2. 主应用升级: 比对 PC_WEB_MAIN_NEW 的 loadAddress 与当前运行地址,
 *    不一致则暂存 upgradeInfo, 等待路由切换后跳转
 *    (仅生产域名执行, uat/stg/dev 可通过调试开关放开)
 *    灰度回退: A3003 未匹配到新基座主应用(命中→未命中)时,
 *    改查 A3001/M3001 旧版本主应用, 跳转回老版本
 */
async function applicationVersionCheck() {
  const lightAppStore = useLightAppStore(pinia)
  // 接口失败时 store 会落本地 mock 兜底, 兜底数据不能作为版本依据, 失败跳过本次检查
  try {
    await lightAppStore.microApplicationListGet()
  } catch (error) {
    console.error('版本检查: 轻应用列表刷新失败', error)
    return
  }

  // 环境限制: uat/stg/dev 跳过主应用版本检查(调试模式除外);
  // 轻应用列表刷新不受环境限制, 上方请求照常完成
  if (!isMainAppVersionCheckEnabled()) return

  // A3003 匹配新基座主应用; 未匹配说明灰度从命中→未命中, 查 A3001/M3001 回退老版本
  let mainApp = resolveMainApp(lightAppStore.lightAppList)
  if (!mainApp?.loadAddress) {
    mainApp = await resolveOldMainApp()
  }
  if (!mainApp?.loadAddress) {
    console.error('版本检查:未获取到主应用版本')
    return
  }

  const target = normalizeUrl(mainApp.loadAddress + stripRoutePathHash(mainApp.routePath))
  const current = normalizeUrl(window.location.origin + window.location.pathname)
  if (target !== current) {
    pendingUpgradeInfo = { loadAddress: mainApp.loadAddress, routePath: mainApp.routePath }
    console.log('检测到主应用新版本, 等待路由切换后跳转:', target)
  }
}

/**
 * checkMd5UrlUpdate 等价: 消费暂存的主应用升级信息
 * 在 router.afterEach 中调用, location.replace 到新版本地址并保留当前 hash 路由
 */
export function consumeMainAppUpgrade(router: Router) {
  if (!pendingUpgradeInfo) return
  const { loadAddress, routePath } = pendingUpgradeInfo
  const fullPath = router?.currentRoute?.value?.fullPath
  const prefix = stripRoutePathHash(routePath)
  const targetUrl = `${loadAddress}${prefix}#${fullPath}`

  // 误配置防御: 目标地址即当前地址时不跳转, 清空暂存避免重复判定
  if (normalizeUrl(`${loadAddress}${prefix}`) === normalizeUrl(window.location.origin + window.location.pathname)) {
    pendingUpgradeInfo = null
    return
  }
  // 版本升级移除本地多余旧登录轻应用缓存(避免版本回退)
  clearLoginApplication()

  pendingUpgradeInfo = null
  window.location.replace(targetUrl)
}

/** 注册版本检查任务到轮询队列(按 name 幂等, 首个任务入队时自动启动定时器) */
export function setupApplicationVersionCheck() {
  applicationUpdateCheck.queueAdd({
    name: 'application_version_check',
    fn: applicationVersionCheck,
  })
}
