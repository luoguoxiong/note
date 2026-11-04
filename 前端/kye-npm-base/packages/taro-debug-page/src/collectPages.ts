import type { PageNode } from './types'

/** 分包配置的最小结构（兼容 subpackages / subPackages 两种字段形态） */
interface SubPackageConfig {
  root: string
  pages: string[]
}

/** appConfig 的最小结构，仅包含过滤所需字段 */
export interface FilterableAppConfig {
  pages?: string[]
  subpackages?: SubPackageConfig[]
  subPackages?: SubPackageConfig[]
  entryPagePath?: string
  tabBar?: { list?: Array<{ pagePath: string }> }
  preloadRule?: Record<string, { network?: string; packages?: string[] }>
  [key: string]: unknown
}

/** 去除页面路径首尾斜杠 */
const trimSlash = (value: string): string => value.replace(/^\/+/, '').replace(/\/+$/, '')

/** 读取项目当前使用的分包字段（优先小写 subpackages） */
export const getSubPackages = (appConfig: FilterableAppConfig): SubPackageConfig[] =>
  appConfig.subpackages ?? appConfig.subPackages ?? []

/**
 * 将主包 pages 与各分包 pages 展开为统一的页面节点列表
 */
export const collectConfigPages = (appConfig: FilterableAppConfig): PageNode[] => {
  const mainNodes: PageNode[] = (appConfig.pages ?? []).map((page) => ({
    path: trimSlash(page),
    packageRoot: null,
    packagePage: null,
    source: 'main',
  }))

  const subNodes: PageNode[] = getSubPackages(appConfig).flatMap((sub) => {
    const root = trimSlash(sub.root)
    return (sub.pages ?? []).map((page) => {
      const packagePage = trimSlash(page)
      return {
        path: `${root}/${packagePage}`,
        packageRoot: root,
        packagePage,
        source: 'subpackage' as const,
      }
    })
  })

  return [...mainNodes, ...subNodes]
}

/**
 * 校验所有调试目标页面均能在原始配置中命中
 * @returns 未命中的目标页面路径列表（为空表示全部命中）
 */
export const findMissingTargets = (targets: string[], nodes: PageNode[]): string[] => {
  const registered = new Set(nodes.map((node) => node.path))
  return targets.filter((target) => !registered.has(target))
}
