/**
 * Taro 小程序按需调试页面过滤插件的类型定义
 * 仅用于构建期内存过滤，不涉及业务运行时状态
 */

/** 支持按需过滤的小程序平台 */
export type MiniPlatform = 'weapp' | 'alipay' | 'h5'

/** 插件配置项 */
export interface TaroDebugPageOptions {
  /** 每次调试构建固定加入的基础页面，无需开发者手动传入 */
  defaultPages?: string[]
  /** 需要扫描依赖的目录（相对 src），通常传首页目录 */
  scanDirs?: string[]
}

/** 解析后的调试参数 */
export interface DebugPageOptions {
  /** 是否启用过滤（仅当显式传入 --debug-pages 时为 true） */
  enabled: boolean
  /** 调试目标页面路径（已去除首尾空白、斜杠与重复项） */
  debugPages: string[]
  /** 每次调试构建固定加入的基础页面 */
  fixedPages: string[]
  /** 需要扫描依赖的目录 */
  scanDirs: string[]
  /** 当前构建平台 */
  platform: MiniPlatform
}

/** 页面来源：主包或分包 */
export type PageSource = 'main' | 'subpackage'

/** 从 appConfig 展开的页面节点 */
export interface PageNode {
  /** 完整页面路径，例如 modules/tools/message-center/home/index */
  path: string
  /** 分包根路径，主包页面为 null */
  packageRoot: string | null
  /** 分包内相对页面路径，主包页面为 null */
  packagePage: string | null
  /** 页面来源 */
  source: PageSource
}

/** 首页依赖扫描结果 */
export interface DependencyScanResult {
  /** 需要保守保留的模块根路径，例如 modules/order-build */
  keptModuleRoots: string[]
  /** 静态可识别的跳转页面路径 */
  routePages: string[]
  /** 无法静态确认的动态跳转风险说明（含文件路径） */
  warnings: string[]
}

/** 构建控制台过滤报告 */
export interface FilterReport {
  /** 开发者显式指定的目标页面 */
  targetPages: string[]
  /** 固定基础页面和因 tabBar/入口等规则自动保留的页面 */
  keptPages: string[]
  /** 被裁剪掉的分包根路径 */
  removedPackages: string[]
  /** 为首页组件依赖保守保留的模块根路径 */
  keptModuleRoots: string[]
  /** 静态识别到的关联跳转页面 */
  routePages: string[]
  /** 动态跳转等风险提示 */
  warnings: string[]
}
