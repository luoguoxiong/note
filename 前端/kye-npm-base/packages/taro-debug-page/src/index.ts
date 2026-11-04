import type { IPluginContext } from '@tarojs/service'
import { collectConfigPages, findMissingTargets, getSubPackages, type FilterableAppConfig } from './collectPages'
import { filterAppConfig } from './filterAppConfig'
import { isPlatformSupported, resolveDebugOptions } from './parseOptions'
import { printFilterError, printReport } from './report'
import { scanDependencies } from './scanDependencies'
import type { TaroDebugPageOptions } from './types'

export type { TaroDebugPageOptions, FilterReport, PageNode } from './types'

const PREFIX = '[taro-debug-page]'

/** 计算过滤后仍保留的全部页面（主包 + 分包） */
const collectKeptPages = (appConfig: FilterableAppConfig): Set<string> => {
  const main = appConfig.pages ?? []
  const subs = getSubPackages(appConfig).flatMap((sub) => sub.pages.map((page) => `${sub.root}/${page}`))
  return new Set([...main, ...subs])
}

/**
 * Taro 小程序按需调试页面过滤插件
 * 仅在显式传入 --debug-pages 时启用，未传参时完全沿用原始构建
 */
export default (ctx: IPluginContext, pluginOptions: TaroDebugPageOptions = {}): void => {
  ctx.modifyAppConfig(({ appConfig }) => {
    let options
    try {
      options = resolveDebugOptions(ctx, pluginOptions)
    } catch (error) {
      const message = (error as Error).message
      printFilterError(message)
      throw new Error(message)
    }
    if (!options.enabled) {
      return
    }
    if (!isPlatformSupported(options.platform)) {
      console.warn(`${PREFIX} 当前平台 ${options.platform} 暂不支持按需页面过滤，已跳过`)
      return
    }

    const config = appConfig as FilterableAppConfig
    const nodes = collectConfigPages(config)
    const missing = findMissingTargets(options.debugPages, nodes)
    if (missing.length > 0) {
      const message = `以下调试页面未在原始配置中注册，请修正路径或先放开注释：${missing.join(', ')}`
      printFilterError(message)
      // 直接中止构建：避免静默回退全量配置，导致误以为已过滤而编译大量无关模块
      throw new Error(message)
    }

    // 固定基础页面：当前端未注册时跳过并提示，不影响其余目标页面
    const fixedMissing = findMissingTargets(options.fixedPages, nodes)
    if (fixedMissing.length > 0) {
      console.warn(`${PREFIX} 当前端未注册固定页面，已跳过：${fixedMissing.join(', ')}`)
    }
    const fixedPages = options.fixedPages.filter((page) => !fixedMissing.includes(page))
    const targets = Array.from(new Set([...fixedPages, ...options.debugPages]))

    try {
      const result = filterAppConfig(config, targets)
      const keptPages = collectKeptPages(config)
      const dependencies = scanDependencies(ctx.paths.sourcePath, keptPages, options.scanDirs)
      printReport(options.platform, {
        targetPages: options.debugPages,
        // 固定基础页面虽参与过滤，但对开发者而言属于自动加入，归入保留页展示
        keptPages: [...fixedPages, ...result.keptPages],
        removedPackages: result.removedPackages,
        keptModuleRoots: dependencies.keptModuleRoots,
        routePages: dependencies.routePages,
        warnings: dependencies.warnings,
      })
    } catch (error) {
      const message = (error as Error).message
      printFilterError(message)
      throw new Error(message)
    }
  })
}
