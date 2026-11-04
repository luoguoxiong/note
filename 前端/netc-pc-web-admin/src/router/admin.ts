import Admin from '@/views/admin/index.vue'
import { ExtendedRouteRecordRaw } from './types'
import { internalRouters } from './internal'
import { iframeRouters } from './iframe'
import { microAppRouters } from './micro-app'
export const adminRouters: Array<ExtendedRouteRecordRaw> = [
  {
    path: '/admin',
    component: Admin,
    name: 'Admin',
    redirect: '/admin/home',
    children: [
      // {
      //   name: 'home',
      //   path: 'home',
      //   component: () => import(/* webpackChunkName: 'home' */ '@/views/admin/index.vue'),
      //   meta: {
      //     name: '首页',
      //     pageCode: 'page_homepage_v1',
      //   },
      // },
      {
        name: 'industry',
        path: 'home/industry',
        component: () => import(/* webpackChunkName: 'industry' */ '@/views/admin/home/industry/index.vue'),
        meta: {
          name: '行业解决方案',
          tabParentPath: '/admin/home',
          pageCode: 'page_industry_info',
        },
      },
      ...internalRouters,
      ...iframeRouters,
      ...microAppRouters,
      // 下单老路由（业务历史逻辑，对齐老基座 configOrderRouterGuard#orderRouterCheck）：
      // 老基座下单页原本是本地页面 delivery（单票下单）/ batchDelivery（批量下单），下单配置化后
      // 由老守卫将命中「配置下单」的导航重定向到下单配置 iframe 路由（orderConfigSingle /
      // orderConfigBatch），query 透传给子应用。新基座老页面已下线，此处注册为真实 redirect 路由，
      // 兼容两类历史跳转：
      // - path 跳转（老书签/外链/子应用 URL）：未注册会落 404 兜底
      // - name 跳转（router.push({ name: 'delivery' })，老业务代码遗留写法）：name 不存在时
      //   vue-router 在 matcher 阶段直接抛 MATCHER_NOT_FOUND，守卫无法拦截，必须注册 name
      // redirect 在守卫管道之前执行，query 原样透传（子应用依赖 query 透传契约）；
      // 权限校验由 order-config 路由 meta（requireCustomerCode/requireOrderPermission）承接
      {
        name: 'delivery',
        path: 'delivery',
        redirect: (to) => ({ path: '/admin/order-config-single', query: to.query }),
      },
      {
        name: 'batchDelivery',
        path: 'batch-delivery',
        redirect: (to) => ({ path: '/admin/order-config-batch', query: to.query }),
      },
      {
        name: 'adminNotFound',
        path: '404',
        component: () => import(/* webpackChunkName: 'notFound' */ '@/views/not-found/index.vue'),
        meta: {
          name: '404',
        },
      },
      // 兜底：/admin 下未匹配的子路径统一跳 404（admin 布局内展示）
      {
        path: ':pathMatch(.*)*',
        redirect: '/admin/404',
      },
    ],
  },
]
