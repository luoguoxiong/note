import { collectConfigPages, getSubPackages, type FilterableAppConfig } from './collectPages'
import type { PageNode } from './types'

/** preloadRule 中非具体分包根路径的特殊包名（如网络预下载主包） */
const SPECIAL_PACKAGE_TOKENS = new Set(['__APP__'])

/** 过滤产生的结构化结果，供报告使用 */
export interface FilterResult {
  /** 除目标页面外，因 tabBar/入口规则自动保留的页面 */
  keptPages: string[]
  /** 被整体裁剪的分包根路径 */
  removedPackages: string[]
  /** 过滤后仍保留的分包根路径 */
  keptRoots: string[]
}

/** 计算需要保留的页面集合：目标页面 + tabBar 主包页 + 入口页 */
const buildKeepSet = (appConfig: FilterableAppConfig, targets: Set<string>, nodes: PageNode[]): Set<string> => {
  const keep = new Set<string>(targets)
  const mainPaths = new Set(nodes.filter((node) => node.source === 'main').map((node) => node.path))
  const tabList = appConfig.tabBar?.list ?? []
  tabList.forEach((tab) => {
    const pagePath = tab.pagePath.replace(/^\/+/, '')
    if (mainPaths.has(pagePath)) {
      keep.add(pagePath)
    }
  })
  if (appConfig.entryPagePath && mainPaths.has(appConfig.entryPagePath.replace(/^\/+/, ''))) {
    keep.add(appConfig.entryPagePath.replace(/^\/+/, ''))
  }
  return keep
}

/** 修正入口页：原入口页被裁剪时指向保留的第一个主包页面 */
const ensureEntryPage = (appConfig: FilterableAppConfig, keptMain: Set<string>): void => {
  const current = appConfig.entryPagePath?.replace(/^\/+/, '')
  if (current && keptMain.has(current)) {
    appConfig.entryPagePath = current
    return
  }
  const fallback = appConfig.pages?.find((page) => keptMain.has(page))
  if (fallback) {
    appConfig.entryPagePath = fallback
  } else {
    delete appConfig.entryPagePath
  }
}

/** 清理 preloadRule：删除失效页面键与被裁剪分包，规则包名为空时删除整条 */
const cleanPreloadRule = (appConfig: FilterableAppConfig, keptAll: Set<string>, keptRoots: Set<string>): void => {
  const rule = appConfig.preloadRule
  if (!rule) {
    return
  }
  Object.keys(rule).forEach((key) => {
    if (!keptAll.has(key.replace(/^\/+/, ''))) {
      delete rule[key]
      return
    }
    const packages = (rule[key].packages ?? []).filter(
      (pkg) => SPECIAL_PACKAGE_TOKENS.has(pkg) || keptRoots.has(pkg.replace(/^\/+/, '')),
    )
    if (packages.length === 0) {
      delete rule[key]
    } else {
      rule[key].packages = packages
    }
  })
}

/**
 * 在内存中过滤 appConfig 的 pages / subpackages / tabBar / preloadRule
 * @throws 当过滤后主包页面为空时抛出错误
 */
export const filterAppConfig = (appConfig: FilterableAppConfig, targets: string[]): FilterResult => {
  const nodes = collectConfigPages(appConfig)
  const targetSet = new Set(targets)
  const keep = buildKeepSet(appConfig, targetSet, nodes)

  // 写入前先完成全部计算，确保校验失败时不会留下半过滤的 appConfig
  const nextMainPages = (appConfig.pages ?? []).filter((page) => keep.has(page.replace(/^\/+/, '')))
  if (nextMainPages.length === 0) {
    throw new Error('过滤后主包 pages 为空，已中止过滤')
  }

  const originalSubs = getSubPackages(appConfig)
  appConfig.pages = nextMainPages
  const keptMain = new Set(appConfig.pages)

  const keptSubs = originalSubs
    .map((sub) => {
      const root = sub.root.replace(/^\/+/, '').replace(/\/+$/, '')
      const pages = sub.pages.filter((page) => keep.has(`${root}/${page.replace(/^\/+/, '')}`))
      return { ...sub, root, pages }
    })
    .filter((sub) => sub.pages.length > 0)

  const keptRoots = keptSubs.map((sub) => sub.root)
  const keptRootSet = new Set(keptRoots)
  const removedPackages = originalSubs
    .map((sub) => sub.root.replace(/^\/+/, '').replace(/\/+$/, ''))
    .filter((root) => !keptRootSet.has(root))

  // 保持项目当前使用的字段形态（默认小写 subpackages）
  if (appConfig.subpackages !== undefined || appConfig.subPackages === undefined) {
    appConfig.subpackages = keptSubs
    delete appConfig.subPackages
  } else {
    appConfig.subPackages = keptSubs
  }

  if (appConfig.tabBar?.list) {
    appConfig.tabBar.list = appConfig.tabBar.list.filter((tab) => keptMain.has(tab.pagePath.replace(/^\/+/, '')))
  }
  ensureEntryPage(appConfig, keptMain)

  const keptSubPaths = new Set(keptSubs.flatMap((sub) => sub.pages.map((page) => `${sub.root}/${page}`)))
  const keptAll = new Set<string>([...keptMain, ...keptSubPaths])
  cleanPreloadRule(appConfig, keptAll, keptRootSet)

  const keptPages = nodes
    .filter((node) => keep.has(node.path) && !targetSet.has(node.path))
    .map((node) => node.path)

  return { keptPages, removedPackages, keptRoots }
}
