import { defineAsyncComponent } from 'vue'
import { ExtendedRouteRecordRaw } from '../types'

/**
 * 通用 iframe 动态路由
 * 用法：router.push({ name: 'iframe-code', params: { code: '菜单编码' } })
 */
export const iframeCodeRoutes: ExtendedRouteRecordRaw[] = [
  {
    name: 'iframe-code',
    path: '/admin/iframe/:code',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'micro-iframe-code' */ '@/views-iframe/iframe/code-iframe.vue')
    ),
    meta: {
      // 动态 iframe 路由：:code 即菜单 menuCode，权限码从 param 取（菜单存在即有权限，防 URL 绕过）
      authParam: 'code',
    },
  },
]
