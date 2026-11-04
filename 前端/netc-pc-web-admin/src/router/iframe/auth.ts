import { defineAsyncComponent } from 'vue'
import type { RouteLocationNormalized, RouteLocationRaw } from 'vue-router'
import { ExtendedRouteRecordRaw } from '../types'

/**
 * 账号权限-前置守卫(对齐老基座 netc-pc-web/src/router/micro/auth.js permissionPageTabEnter)
 *
 * query 带 pageTab 时补一个 timeStamp, 保证"已在该路由再跳一次同样的地址"
 * (广告 modelRoute 固定不变, 如 /admin/permission-manage?pageTab=104&microForceUpdate=10)
 * 也能构成一次真实导航 —— 否则 vue-router 在重复导航判定处直接返回 failure,
 * 守卫和路由变化都不会发生, microForceUpdate 的强刷逻辑(useRoutePrefetch)随之失效。
 *
 * 注: vue-router 4 的 fullPath 是 resolve 时的快照, 守卫里就地改 to.query 不会写进 URL
 * (还会造成 URL 与 currentRoute.query 不一致), 所以这里返回 redirect 目标
 */
const permissionPageTabEnter = (to: RouteLocationNormalized): RouteLocationRaw | void => {
  // 已有 timeStamp 说明这次导航本来就是为刷新构造的, 不再重定向(避免守卫自循环)
  if (to.query.pageTab && !to.query.timeStamp) {
    return {
      path: to.path,
      query: {
        ...to.query,
        timeStamp: String(Date.now()),
      },
    }
  }
}

export const authRoutes: ExtendedRouteRecordRaw[] = [
  {
    name: 'permission-manage',
    path: '/admin/permission-manage',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'micro-permission-manage' */ '@/views-iframe/auth/permission-manage.vue')
    ),
    beforeEnter: permissionPageTabEnter,
  },
]
