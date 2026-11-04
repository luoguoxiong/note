import { defineAsyncComponent } from 'vue'
import { ExtendedRouteRecordRaw } from '../types'

export const toolsRoutes: ExtendedRouteRecordRaw[] = [
  {
    name: 'site-query',
    path: '/admin/site-query',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'micro-query' */ '@/views-iframe/tools/site-query.vue')
    ),
  },
  {
    name: 'kye-style',
    path: '/admin/kye-style',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'micro-kye-style' */ '@/views-iframe/tools/kye-style.vue')
    ),
  },
  {
    name: 'contraband',
    path: '/admin/contraband',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'micro-contraband' */ '@/views-iframe/tools/contraband.vue')
    ),
  },
  {
    name: 'preference-config',
    path: '/admin/preference-config',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'micro-preference-config' */ '@/views-iframe/tools/preference-config.vue')
    ),
  },
  {
    name: 'preference-message',
    path: '/admin/preference-message',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'micro-preference-message' */ '@/views-iframe/tools/preference-message.vue')
    ),
  },
  {
    name: 'phone-no-disturb',
    path: '/admin/phone-no-disturb',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'micro-phone-no-disturb' */ '@/views-iframe/tools/phone-no-disturb.vue')
    ),
  },
  {
    name: 'wikipedia',
    path: '/admin/wikipedia',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'wikipedia' */ '@/views-iframe/tools/wikipedia.vue')
    ),
  },
  {
    path: '/admin/function-feedback',
    name: 'function-feedback',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'function-feedback' */ '@/views-iframe/tools/function-feedback.vue')
    ),
  },
  {
    path: '/admin/realname',
    name: 'realname',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'realname' */ '@/views-iframe/tools/realname.vue')
    ),
  },
  {
    path: '/admin/crm-electronic-sign',
    name: 'crm-electronic-sign',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'realname' */ '@/views-iframe/tools/electronicContract.vue')
    ),
  },
  {
    path: '/admin/product-introduction',
    name: 'product-introduction',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'realname' */ '@/views-iframe/tools/productIntroduction.vue')
    ),
  },
  {
    path: '/admin/survey-list',
    name: 'survey-list',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'survey-list' */ '@/views-iframe/tools/surveyList.vue')
    ),
  },
  {
    path: '/admin/online-compensate',
    name: 'online-compensate',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'online-compensate' */ '@/views-iframe/tools/online-compensate.vue')
    ),
  },
  {
    path: '/admin/delivery-area',
    name: 'delivery-area',
    iframeComponent: defineAsyncComponent(
      () => import(/* webpackChunkName: 'delivery-area' */ '@/views-iframe/tools/delivery-area.vue')
    ),
  },
]
