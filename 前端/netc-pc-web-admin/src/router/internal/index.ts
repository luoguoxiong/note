import { ExtendedRouteRecordRaw } from '../types'

/**
 * 基座内部路由
 */
export const internalRouters: Array<ExtendedRouteRecordRaw> = [
  {
    name: 'homePage',
    path: '/admin/home',
    component: () => import(/* webpackChunkName: 'home' */ '@/views/home/index2.vue'),
    meta: {
      name: '首页',
      pageCode: 'page_homepage_v1',
      category: '基础页面',
    },
  },
  {
    name: 'componentLibrary',
    path: '/admin/components',
    component: () => import(/* webpackChunkName: 'components' */ '@/views/component-library/index.vue'),
    meta: {
      name: '组件库',
      pageCode: 'page_component_library_v1',
      category: '基础页面',
    },
  },
  {
    name: 'electronTest',
    path: '/admin/electron-test',
    component: () => import(/* webpackChunkName: 'electronTest' */ '@/views/electron-test/index.vue'),
    meta: {
      name: '壳能力测试',
      pageCode: 'page_electron_test_v1',
      category: '基础页面',
    },
  },
  // ===== 消息中心（来源: netc-pc-web/src/router/admin.js message-center / message-center-detail）=====
  {
    name: 'message-center',
    path: '/admin/message-center',
    component: () =>
      import(/* webpackChunkName: 'ky-message-popup' */ '@/views/admin/components/header/message-center/h5-popup.vue'),
    meta: {
      name: '消息中心',
      category: '基础页面',
    },
  },
  {
    name: 'message-center-detail',
    path: '/admin/message-center-detail',
    component: () =>
      import(
        /* webpackChunkName: 'ky-message-popup' */ '@/views/admin/components/header/message-center/message-center-detail.vue'
      ),
    meta: {
      name: '消息详情',
      category: '基础页面',
    },
  },
  // ===== 关于跨越（来源: netc-pc-web/src/router/admin.js about-kye，mock 菜单编码 M3845，loadAddress 指向本应用，故为基座内部路由）=====
  {
    name: 'about-kye',
    path: '/admin/about-kye',
    component: () => import(/* webpackChunkName: 'about-kye' */ '@/views/about-kye/index.vue'),
    meta: {
      name: '关于跨越',
      category: '基础页面',
    },
  },
  // ===== 国际会展运单（来源: netc-pc-web/src/router/admin.js exhibition-waybills，mock 菜单编码 M3827，loadAddress 指向本应用，故为基座内部路由）=====
  {
    name: 'exhibition-waybills',
    path: '/admin/exhibition-waybills',
    component: () => import(/* webpackChunkName: 'exhibition-waybills' */ '@/views/exhibition-waybills/index.vue'),
    meta: {
      name: '国际会展运单',
      category: '基础页面',
    },
  },
  // ===== 权限验证路由（配合 mock/web.basicBiz.menu.queryAreaMenuList.js「权限测试」分组）=====
  {
    name: 'permissionDeny',
    path: '/admin/permission-deny',
    component: () => import(/* webpackChunkName: 'components' */ '@/views/component-library/index.vue'),
    meta: {
      name: '权限拦截测试',
      category: '基础页面',
      // M9999 不存在于任何菜单配置：模拟"后端未下发该菜单权限的用户"，访问必被拦截弹窗
      auth: 'M9999',
    },
  },
  {
    name: 'permissionBindCode',
    path: '/admin/permission-bindcode',
    component: () => import(/* webpackChunkName: 'components' */ '@/views/component-library/index.vue'),
    meta: {
      name: '未绑码拦截测试',
      category: '基础页面',
      // 需绑码路由：未绑定客户编码的用户访问触发未绑码引导弹窗（4 场景）
      requireCustomerCode: true,
    },
  },
  {
    name: 'orderPermissionTest',
    path: '/admin/order-permission-test',
    component: () => import(/* webpackChunkName: 'components' */ '@/views/component-library/index.vue'),
    meta: {
      name: '下单权限拦截测试',
      category: '基础页面',
      // 需下单权限路由：getOrderTips 校验，blockedFlag 时弹「立即申请/审核中」弹窗
      requireOrderPermission: true,
    },
  },
]
