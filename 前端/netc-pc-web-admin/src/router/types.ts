import { RouteComponent, RouteLocationRaw } from 'vue-router'

type Lazy<T> = () => Promise<T>

export type RawRouteComponent = RouteComponent | Lazy<RouteComponent>

export type RouteMetaAuth = {
  /** 路由名称（已有惯例） */
  name?: string
  /** 埋点页面编码（已有惯例） */
  pageCode?: string
  /** ===== 以下为权限方案新增 ===== */
  /** 所需权限：menuCode 或权限码；数组=任一满足；不配置=登录即可访问 */
  auth?: string | string[]
  /** 从路由 param 取权限码（如 iframe-code 动态路由的 :code 即 menuCode） */
  authParam?: string
  /** 免登录路由（如 403、登录中转页） */
  anonymous?: boolean
  /** 需绑码（客户编码）才能访问 */
  requireCustomerCode?: boolean
  /** 需下单权限（getOrderTips 校验，无权限弹「立即申请/审核中」弹窗） */
  requireOrderPermission?: boolean
} & Record<string | number | symbol, unknown>

export type ExtendedRouteRecordRaw = {
  path?: string
  component?: RawRouteComponent | null | undefined
  children?: ExtendedRouteRecordRaw[]
  meta?: RouteMetaAuth
  /** 重定向目标：字符串路径，或函数式（入参 to，常用于保留原 query，如下单老路由兼容跳转） */
  redirect?: string | ((to: RouteLocationRaw & { query?: Record<string, any> }) => RouteLocationRaw)
} & Record<string, unknown>

/** 让 vue-router 的 to.meta / from.meta 获得上述权限字段类型 */
declare module 'vue-router' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface RouteMeta extends RouteMetaAuth {}
}
