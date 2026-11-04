import { adminRouters } from './admin'
import { ExtendedRouteRecordRaw } from './types'

export const routes: ExtendedRouteRecordRaw[] = [
  {
    path: '',
    redirect: '/admin/home',
  },
  {
    path: '/',
    redirect: '/admin/home',
  },
  ...adminRouters,
  // 兜底 404：未匹配任何路由时跳转（name 已在 guard.ts 白名单中，免登录可见）
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    component: () => import(/* webpackChunkName: 'notFound' */ '@/views/not-found/index.vue'),
    meta: {
      name: '404',
    },
  },
  // {
  //   path: '/home',
  //   name: 'home',
  //   component: () => import(/* webpackChunkName: 'home' */ '@/views/home/index.vue'),
  //   meta: {
  //     name: '首页',
  //     pageCode: 'page_homepage_v1',
  //   },
  // },
]
