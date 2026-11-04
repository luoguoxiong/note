import type { Router, RouteLocationNormalized } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getToken } from '@/utils/auth'
import { useUserStore } from '@/stores/user'
import { usePermissionStore } from '@/stores/permission'
import { pinia } from '@/stores'
import { consumeMainAppUpgrade } from '@/utils/updateCheck/versionCheck'
import { resolveLoginUrl } from '@/utils/updateCheck/loginApplication'

/**
 * 全局路由守卫（见《路由权限方案》五、全局守卫设计）
 *
 * 说明：
 * - 使用 vue-router 4 返回值式导航（return true / false / route），不使用 next() 回调
 * - 追加式注册，与 createMicroMainApp 内部守卫（子应用按需加载）按注册顺序先后执行
 * - 白名单/权限一律 name 或完整 path 精确匹配，禁用 startsWith 前缀匹配
 * - 首屏提速（按需阻塞 + 超时降级）：守卫只等待当前路由真正需要的用户/权限数据，
 *   无权限标记的路由零接口阻塞直接放行，其余数据后台预热；接口挂起时按 INIT_TIMEOUT
 *   上限降级放行（可用性优先，后端接口仍有鉴权兜底），守卫等待期间展示全局 loading
 * - 无权限/未绑码反馈为「当前页弹窗」：站内导航被拒时 return false 留在原页 + 弹窗；
 *   首次导航（直接 URL 进入）无原页可停留，落回首页 + 弹窗
 * - 首次导航补偿：vue-router 在 app.use(router) 时即同步触发初始导航并收集守卫快照，
 *   而 createMicroMainApp 内部已 app.use(router)（@kye-netc/micro-module），
 *   早于本模块注册，直接 URL 进入的首次导航不会经过 beforeEach，故 isReady 后再做一次校验兜底
 */

/** 免登录白名单：精确匹配 name 或 path */
const WHITE_LIST = new Set<string>(['notFound'])

/** 首次导航被拦截时的落点：无原页可停留，回首页 */
const FALLBACK_PATH = '/admin/home'

/** 守卫内接口等待上限（ms）：超时视为「数据不可用」，按降级策略放行（后端接口仍有鉴权兜底） */
const INIT_TIMEOUT = 3000

/**
 * 等待 promise 完成，超过 ms 后返回 undefined（不中断原请求，后续导航/页面仍可复用其结果）
 * 注意：用户 store init「成功返回 null」与「超时」语义不同——null 表示接口已响应但无数据，
 * 走原有拦截弹窗；undefined 表示数据不可用，走降级放行
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | undefined> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(undefined), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      () => {
        clearTimeout(timer)
        resolve(undefined)
      }
    )
  })
}

/** 登录地址：本基座无登录页，无 token 时跳统一登录（地址由 .env.* VUE_APP_LOGIN_URL 注入） */

/** 守卫管道所需的路由信息（兼容 RouteLocationNormalized / currentRoute） */
type GuardTarget = Pick<
  RouteLocationNormalized,
  'name' | 'path' | 'fullPath' | 'query' | 'meta' | 'matched' | 'params' | 'redirectedFrom'
>

/** 安全埋点：上报失败不影响导航 */
function reportGuard(eventCode: string, params: Record<string, string | number | boolean> = {}) {
  try {
    window.$umpOtherReport?.('OTHER', { eventCode, region_code: 'router_guard' }, params)
  } catch (error) {
    console.error('router guard report error:', error)
  }
}

function isWhiteListed(to: GuardTarget): boolean {
  if (WHITE_LIST.has(to.name as string) || WHITE_LIST.has(to.path)) return true
  // 声明式免登录路由（meta.anonymous）
  return to.meta?.anonymous === true
}

/**
 * 解析路由所需权限：
 * - meta.auth：静态权限码
 * - meta.authParam：从路由 param 动态取权限码（iframe-code 路由的 :code 即 menuCode，
 *   菜单接口按用户过滤，code 在授权集合中即视为有权限，防 URL 手输绕过）
 */
function resolveAuth(to: GuardTarget): string | string[] | undefined {
  const auth = to.meta?.auth
  if (auth) return auth
  const authParam = to.meta?.authParam
  if (authParam) {
    const code = to.params?.[authParam]
    if (typeof code === 'string' && code) return code
  }
  return undefined
}

/** 首次导航判定：from 缺失（补偿场景）或为初始路由（matched 为空） */
function isFirstNavigation(from?: GuardTarget): boolean {
  return !from || from.matched.length === 0
}

/** 守卫管道判定结果：true 放行 / false 中止（留原页）/ string 重定向目标 */
type NavResult = boolean | string

/**
 * ④⑤ 业务权限校验（独立于 menuCode 权限）：
 * - ④ 需绑码的路由：未绑客户编码 → 拉取绑码关系（4 场景数据源）后弹窗引导
 * - ⑤ 下单权限：requireOrderPermission → getOrderTips，blockedFlag → 弹「立即申请/审核中」弹窗
 *   （路由可只配 requireOrderPermission 不配 auth），接口失败不阻塞导航
 */
async function checkBusinessPermission(
  to: GuardTarget,
  from: GuardTarget | undefined,
  opts: { needCustomerCode: boolean; needOrderPermission: boolean }
): Promise<NavResult> {
  const userStore = useUserStore(pinia)
  const permissionStore = usePermissionStore(pinia)

  // ④ 未绑客户编码拦截
  if (opts.needCustomerCode && !userStore.currentCustomerCode) {
    reportGuard('other_router_guard_forbidden_v1', {
      path: to.fullPath,
      reason: 'customerCode',
    })
    await permissionStore.loadBindInfo()
    permissionStore.openPermissionDialog('customerCode', to.fullPath)
    return isFirstNavigation(from) ? FALLBACK_PATH : false
  }

  // ⑤ 下单权限拦截
  if (opts.needOrderPermission) {
    const blocked = await permissionStore.loadOrderTips()
    if (blocked) {
      reportGuard('other_router_guard_order_forbidden_v1', { path: to.fullPath })
      permissionStore.openPermissionDialog('order', to.fullPath)
      return isFirstNavigation(from) ? FALLBACK_PATH : false
    }
  }
  return true
}

/**
 * ⑦⑧ menuCode 权限校验：
 * - ⑦ 权限元数据不可用（菜单接口失败且无缓存）：放行 + 告警埋点
 *   可用性优先（菜单都打不开时阻断全部页面代价更高），后端接口仍有鉴权兜底
 * - ⑧ 权限校验不满足 → 弹窗提示（站内留在原页，首次导航落首页）
 */
function checkMenuAuth(to: GuardTarget, from: GuardTarget | undefined, auth: string | string[]): NavResult {
  const permissionStore = usePermissionStore(pinia)
  if (!permissionStore.isAuthDataReady) {
    reportGuard('other_router_guard_auth_unavailable_v1', { path: to.fullPath })
    return true
  }
  if (!permissionStore.hasAuth(auth)) {
    reportGuard('other_router_guard_forbidden_v1', {
      path: to.fullPath,
      auth: Array.isArray(auth) ? auth.join(',') : auth,
    })
    permissionStore.openPermissionDialog('auth', to.fullPath)
    return isFirstNavigation(from) ? FALLBACK_PATH : false
  }
  return true
}

/** 404 兜底页集合：顶层 notFound / admin 布局内 adminNotFound（/admin/404） */
const NOT_FOUND_TARGETS = new Set<string>(['notFound', 'adminNotFound', '/admin/404'])

/**
 * 未匹配路径 → 子应用容器路由映射（对齐老基座 microUserRouterGuard#getRedirectRoute）：
 * 原始路径 includes 命中 origins 即改跳 target 容器路由，容器内 iframe 子应用依据
 * query.realRoutePath + timeStamp 做二级路由导航（同 useLinkTo#linkToBindCode 的 query 约定）
 * 注意：老映射中的 company-manage-department / payment-authorization 容器在新基座尚未注册，
 * 加入会二次落 404 造成循环，待路由落地后再补
 */
const REDIRECT_PATH_LISTS: Array<{ target: string; origins: string[] }> = [
  { target: '/admin/user', origins: ['/admin/user', '/admin/real-name-verify'] },
  { target: '/admin/permission-manage', origins: ['/admin/permission-manage'] },
]

/**
 * 404 补偿跳转：未匹配路径落到 404 时，尝试映射回子应用容器路由
 * @param redirectedFrom 触发 404 的原始路径（无则不可映射）
 * @returns 重定向目标（透传原 query + timeStamp + realRoutePath），不可映射返回 undefined
 */
function getRedirectRoute(redirectedFrom?: Pick<GuardTarget, 'path' | 'query'>): string | undefined {
  if (!redirectedFrom) return undefined
  const item = REDIRECT_PATH_LISTS.find(({ origins }) => origins.some((f) => redirectedFrom.path.includes(f)))
  if (!item) return undefined

  // realRoutePath 仅取路径部分（query 单独透传），timeStamp 字符串化与 useLinkTo 约定一致
  const realRoutePath = redirectedFrom.path.split('?')[0]
  const query = new URLSearchParams()
  // 透传原始 query（vue-router query 值可能为数组，取末位与 router 语义一致）
  Object.entries(redirectedFrom.query ?? {}).forEach(([key, value]) => {
    const last = Array.isArray(value) ? value[value.length - 1] : value
    if (typeof last === 'string') query.set(key, last)
  })
  // timeStamp / realRoutePath 后置，保证 realRoutePath 位于 query 末尾（其内嵌参数不被截断）
  query.set('timeStamp', String(Date.now()))
  query.set('realRoutePath', realRoutePath)
  return `${item.target}?${query.toString()}`
}

/** ⓪ 404 补偿跳转判定：未匹配路径落 404 且原始路径可映射时，返回容器路由重定向目标 */
function resolveNotFoundRedirect(to: GuardTarget): string | undefined {
  if (!NOT_FOUND_TARGETS.has(to.name as string) && !NOT_FOUND_TARGETS.has(to.path)) return undefined
  return getRedirectRoute(to.redirectedFrom)
}

/**
 * ② 登录校验：无 token 时
 * - 本地开发：不跳统一登录，提示手动获取 token（URL 携带 ?token=xxx 会自动写入 sessionStorage）；
 *   防重入标志避免多次导航重复提示
 * - 非本地开发：防抖拉取一次轻应用配置更新 APPLICATION_INFO（不阻塞跳转），
 *   跳登录页——优先取缓存 APPLICATION_INFO 中 M3001 配置，无配置回退当前环境全量版本登录页
 * @returns false 中止当前导航（留原页）
 */
function handleNoToken(): boolean {
  if (process.env.NODE_ENV === 'development') {
    ElMessage.warning('本地开发token为空，请获取')
    return false
  }
  // 回到登录页(命中的版本)
  window.location.href = resolveLoginUrl()
  return false
}

/** 守卫管道：返回 true 放行 / false 中止（留原页）/ 重定向目标（string path） */
async function resolveNavigation(to: GuardTarget, from?: GuardTarget) {
  // ⓪ 404 补偿跳转：未匹配路径落 404 时，若原始路径可映射到已注册的子应用容器路由，
  //    改跳容器路由并携带 realRoutePath 交由子应用二级导航（对齐老基座 microUserRouterGuard）
  const notFoundRedirect = resolveNotFoundRedirect(to)
  if (notFoundRedirect) return notFoundRedirect

  // ① 免登录路由直接放行
  if (isWhiteListed(to)) return true

  // ② 登录校验：无 token 跳统一登录，携带 redirect 供登录后回跳
  if (!getToken()) return handleNoToken()

  // ③ 按需阻塞：只等待当前路由真正需要的数据（首屏提速核心，方案「按需阻塞」），
  //    无任何权限标记的路由（如首页）零接口阻塞直接放行；超时降级见 withTimeout
  const userStore = useUserStore(pinia)
  const permissionStore = usePermissionStore(pinia)
  const needCustomerCode = !!to.meta?.requireCustomerCode
  const needOrderPermission = !!to.meta?.requireOrderPermission
  const auth = resolveAuth(to)
  const needUserData = needCustomerCode || needOrderPermission

  if (needUserData || auth) {
    await Promise.all([
      needUserData ? withTimeout(userStore.init(), INIT_TIMEOUT) : Promise.resolve(),
      auth ? withTimeout(permissionStore.init(), INIT_TIMEOUT) : Promise.resolve(),
    ])
  }

  // 未被当前路由依赖的数据后台预热（store 内有单例保护，不重复请求），供页面组件复用
  if (!needUserData) userStore.init().catch(() => undefined)
  if (!auth) permissionStore.init().catch(() => undefined)

  // ③' 用户数据不可用（接口超时/未就绪）：放行 + 告警埋点（可用性优先，后端有鉴权兜底），
  //     跳过 ④⑤ 的拦截判定，避免数据缺失导致的误拦
  if (needUserData && !userStore.isInitialized) {
    reportGuard('other_router_guard_auth_unavailable_v1', {
      path: to.fullPath,
      reason: 'userDataTimeout',
    })
    return true
  }

  // ④⑤ 业务权限校验（绑码 + 下单）：命中拦截即返回，其余继续走 menuCode 校验
  const business = await checkBusinessPermission(to, from, { needCustomerCode, needOrderPermission })
  if (business !== true) return business

  // ⑥ 未声明权限 → 登录即可访问（meta.auth 静态配置，或 meta.authParam 从 param 动态取）
  if (!auth) return true

  // ⑦⑧ menuCode 权限校验：数据不可用放行（埋点），无权限拦截弹窗
  return checkMenuAuth(to, from, auth)
}

/**
 * 子容器二级路径兜底重写（对齐老基座 microUserRouterGuard「匹配404路由」分支 + routerGuard.js 首步调用）
 *
 * 直接访问未注册的子应用二级路径（如 /admin/user/cusCode）时命中 admin 下 catch-all 兜底到
 * /admin/404，此处按 redirectedFrom 前缀识别所属子容器，重写为该容器 iframe 路由并附加
 * realRoutePath（编码，与老守卫一致） timeStamp（大写S，子应用
 * web-netc-user 监听该字段变化做二级路由导航）；重写目标未注册时不重写（维持 404），防止重定向死循环
 */
const MICRO_CONTAINER_REDIRECT_MAP: Array<{ path: string; prefixes: string[] }> = [
  { path: '/admin/user', prefixes: ['/admin/user', '/admin/real-name-verify'] },
  // 老基座付款授权/权限审批/运单审批路径统一归并到 permission-manage 容器
  {
    path: '/admin/permission-manage',
    prefixes: ['/admin/permission-manage', '/admin/company-manage-permission-audit', '/admin/payment-authorization'],
  },
  { path: '/admin/company-manage-department', prefixes: ['/admin/company-manage-department'] },
]

function resolveMicroContainerRedirect(router: Router, to: RouteLocationNormalized) {
  if (to.path !== '/admin/404' || !to.redirectedFrom) return true
  const redirectedFrom = to.redirectedFrom.path
  const target = MICRO_CONTAINER_REDIRECT_MAP.find((item) =>
    item.prefixes.some((prefix) => redirectedFrom === prefix || redirectedFrom.startsWith(`${prefix}/`))
  )
  if (!target) return true
  // 目标容器路由未注册（如 real-name-verify 新基座暂无）时不重写，维持 404，避免重定向死循环
  if (!router.resolve({ path: target.path }).name) return true
  return {
    path: target.path,
    query: {
      ...(to.redirectedFrom.query || {}),
      // 对齐老基座首页入口跳转契约: 子应用解绑成功后发 ACTION_BROWSER_RELOAD{isEnvReload},
      // 父容器按 needQuerySave==='false' 剥掉 URL query(realRoutePath 随之消失)再整页刷新,
      // 刷新后落在个人中心首页; 缺少该参数刷新后会带着 realRoutePath 重新落回绑码页
      timeStamp: String(Date.now()),
      realRoutePath: redirectedFrom,
    },
  }
}

export function setupRouterGuard(router: Router) {
  // 前置重写（对齐老基座 routerGuard.js 首步 await microUserRouterGuard）：
  // 必须先于权限校验注册——未注册二级路径直接重写到对应 iframe 容器，不走权限管道
  router.beforeEach((to) => resolveMicroContainerRedirect(router, to))

  router.beforeEach(async (to, from) => {
    // 守卫等待接口期间的全屏 loading（延迟展示避免闪现；finally 统一关闭，含 return false 中止场景）
    return await resolveNavigation(to, from)
  })

  // 后置钩子：消费倒计时任务暂存的主应用升级信息，跳转新版本地址（对齐老项目 $checkMd5UrlUpdate）
  router.afterEach(() => {
    consumeMainAppUpgrade(router)
  })

  // 首次导航补偿：若初始导航早于守卫注册（见文件头说明），对其结果再校验一次；
  // 幂等——若 beforeEach 已放行，此处重复执行管道结论不变，无副作用
  router.isReady().then(() => {
    const current = router.currentRoute.value
    resolveNavigation(current).then((result) => {
      // true：合规放行；false：已跳转登录页，无需处理
      if (result === true || result === false) return
      router.replace(result)
    })
  })
}
