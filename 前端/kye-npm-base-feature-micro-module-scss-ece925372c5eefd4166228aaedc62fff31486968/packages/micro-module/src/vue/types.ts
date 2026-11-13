import type { RouteRecordRaw } from 'vue-router'
import type {
  SubAppExports as CoreSubAppExports,
  SubAppRegisterOptions as CoreSubAppRegisterOptions,
  MicroAppRecord as CoreMicroAppRecord,
} from '../types'

export const MACRO_MODULE_VUEAPP = '__MACRO_MODULE_VUEAPP__'

/**
 * Vue 专属类型:将核心层框架无关的泛型类型用 RouteRecordRaw 实例化
 */
export type {
  MicroAppConfig,
  MicroAppLifecycle,
  SharedComponentFactory,
  MicroAppLoadError,
} from '../types'

/** 子应用暴露给主应用的对象(routes 为 vue-router 路由记录) */
export type SubAppExports = CoreSubAppExports<RouteRecordRaw>

/** registerSubApp 入参(routes 为 vue-router 路由记录) */
export type SubAppRegisterOptions = CoreSubAppRegisterOptions<RouteRecordRaw>

/** 已加载的子应用运行时记录 */
export type MicroAppRecord = CoreMicroAppRecord<RouteRecordRaw>
