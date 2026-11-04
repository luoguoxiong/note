/**
 * 基座能力封装
 *
 * 背景：本应用已由 iframe 子应用升级为基座，原 `@/libs/kyeIframeBridge`
 * (子应用侧向老基座 netc-pc-web 通信的桥接) 已移除。
 * 原先经桥接请求父容器的能力，在此全部改为本地实现，方法名保持不变，
 * 调用方仅需调整 import 路径：
 *
 * - locationRouteV2            -> 本应用 vue-router
 * - parentMessageSend          -> element-plus ElMessage
 * - $parentMessageNavigation   -> 基座 header 消息中心(EE: FUNCTION_MESSAGE_CENTER_ITEM_NAVIGATION)
 * - $parentMessageListNavigation -> 基座 header 消息中心(EE: FUNCTION_MESSAGE_CENTER_LIST_OPEN)
 * - isClientMode               -> @/native/electron 壳环境检测
 * - parentLogOutConfirm        -> 基座本地退登确认框(@/utils/iframeBridge/interaction)
 */
import type { LocationQuery, RouteLocationRaw } from 'vue-router'
import { ElMessage } from 'element-plus'
import { router } from '@/main'
import { isClientMode } from '@/native/electron'
import EE from '@/utils/eventemitter'
import { getQueryObject } from '@/utils'
import { handleLogOutConfirm } from '@/utils/iframeBridge/interaction'

/** 消息中心页面交互事件名(与基座 header/index.vue EE 监听对齐) */
const MESSAGE_CENTER_EVENTS = {
  消息单条触发: 'FUNCTION_MESSAGE_CENTER_ITEM_NAVIGATION',
  打开消息中心: 'FUNCTION_MESSAGE_CENTER_LIST_OPEN',
} as const

interface LocationBridge {
  push: (location: RouteLocationRaw) => ReturnType<typeof router.push>
  replace: (location: RouteLocationRaw) => ReturnType<typeof router.replace>
  back: () => void
}

/**
 * 路由跳转 path 内嵌 query 归一化
 *
 * vue-router 对象式跳转({ path, query })会用 parseURL 剥离 path 中的
 * `?a=1` 且不并入 query，导致后端下发带参 URL(如 /admin/waybill/list?tab=notifyPickup)
 * 跳转时参数丢失。此处统一拆出 path 内嵌 query 并入显式 query(显式 query 优先)。
 */
export const normalizeRouteLocation = (location: RouteLocationRaw): RouteLocationRaw => {
  if (typeof location !== 'object' || location === null || !('path' in location)) {
    return location
  }
  const { path } = location as { path?: string }
  if (!path || !path.includes('?')) {
    return location
  }
  const explicitQuery = (('query' in location ? (location as { query?: LocationQuery }).query : undefined) ??
    {}) as LocationQuery
  return {
    ...location,
    path: path.slice(0, path.indexOf('?')),
    query: {
      ...getQueryObject(path),
      ...explicitQuery,
    },
  }
}

/** 路由跳转(原经父容器代理，现直接走本应用 router) */
export const locationRouteV2: LocationBridge = {
  push: (location) => router.push(normalizeRouteLocation(location)),
  replace: (location) => router.replace(normalizeRouteLocation(location)),
  back: () => router.back(),
}

/** 消息提示(原父容器 ElMessage 代理，现本地 ElMessage) */
export const parentMessageSend: typeof ElMessage = ElMessage

/** 触发基座消息中心单条消息跳转 */
export const $parentMessageNavigation = (params: Record<string, any>) => {
  EE.emit(MESSAGE_CENTER_EVENTS['消息单条触发'], JSON.parse(JSON.stringify(params)))
}

/** 触发基座打开消息中心列表 */
export const $parentMessageListNavigation = () => {
  EE.emit(MESSAGE_CENTER_EVENTS['打开消息中心'])
}

/**
 * 触发用户手机失效重新登录确认框及退登逻辑
 * @param data { code?: number; msg?: string }
 */
export const parentLogOutConfirm = (data: { code?: number; msg?: string }) => {
  handleLogOutConfirm({ msg: data?.msg, code: data?.code } as { msg?: string; code?: string })
}

export { isClientMode }
