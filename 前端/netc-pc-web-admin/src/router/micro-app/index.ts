import { ExtendedRouteRecordRaw } from '../types'

/**
 * micro-app（京东微前端）子应用路由
 * 将 meta.microApp.url 替换为实际子应用入口地址即可
 */
export const microAppRouters: Array<ExtendedRouteRecordRaw> = [
  {
    name: 'order',
    path: '/admin/order',
    component: () => import(/* webpackChunkName: 'micro-app' */ '@/views-micro/order-config/index.vue'),
    meta: {
      name: '微应用',
      category: '微前端',
      microApp: {
        url: 'https://uc-uat.ky-express.com/web-order-config/0.252.10/#/order',
      },
    },
  },
]
