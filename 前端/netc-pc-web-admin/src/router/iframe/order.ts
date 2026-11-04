import { defineAsyncComponent } from 'vue'
import { ExtendedRouteRecordRaw } from '../types'

export const defaultConfigRoutes: ExtendedRouteRecordRaw[] = [
  {
    name: 'order-config-single',
    path: '/admin/order-config-single',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'orderDefaultConfig' */ '@/views-iframe/order/single-order.vue')
    ),
    meta: {
      preload: true,
      // 寄件路由：需绑码 + 下单权限（守卫管道 ④绑码 → ⑤下单权限）
      requireCustomerCode: true,
      requireOrderPermission: true,
    },
  },
  {
    // 批量寄件（M3003，对应菜单 /admin/order-config-batch）
    name: 'order-config-batch',
    path: '/admin/order-config-batch',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'order-config-batch' */ '@/views-iframe/order/batch-order.vue')
    ),
    meta: {
      preload: true,
      requireCustomerCode: true,
      requireOrderPermission: true,
    },
  },
  {
    // 寄件模板（M3066，对应菜单 /admin/order-default-config）
    name: 'order-default-config',
    path: '/admin/order-default-config',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'order-default-config' */ '@/views-iframe/order/order-default-config.vue')
    ),
    meta: {
      requireCustomerCode: true,
      requireOrderPermission: true,
    },
  },
]
