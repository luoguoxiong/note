import type { IPluginContext } from '@tarojs/service'
import type {
  DebugPageOptions,
  MiniPlatform,
  TaroDebugPageOptions,
} from './types'

/** 支持按需过滤的平台 */
const SUPPORTED_PLATFORMS: MiniPlatform[] = ['weapp', 'alipay', 'h5']

/**
 * 标准化单个页面路径：去除首尾空白、首尾斜杠以及 src/ 前缀
 */
const normalizePage = (raw: string): string => {
  const trimmed = raw.trim().replace(/^\/+/, '').replace(/\/+$/, '')
  return trimmed.replace(/^src\//, '')
}

/**
 * 解析逗号分隔的 --debug-pages 字符串
 * @throws 当参数存在但没有任何有效页面路径时抛出错误
 */
export const parseDebugPages = (raw: unknown): string[] => {
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    throw new Error('--debug-pages 已传入但未提供有效页面路径，已中止过滤')
  }
  const pages = raw
    .split(',')
    .map(normalizePage)
    .filter((page) => page.length > 0)
  if (pages.length === 0) {
    throw new Error('--debug-pages 解析后为空，请至少指定一个页面路径')
  }
  return Array.from(new Set(pages))
}

/** 从 process.argv 兜底读取 --debug-pages（兼容 --flag=value 与 --flag value 两种形式） */
const readFromArgv = (): unknown => {
  const eqFlag = process.argv.find((arg) => arg.startsWith('--debug-pages='))
  if (eqFlag) {
    return eqFlag.slice('--debug-pages='.length)
  }
  const index = process.argv.indexOf('--debug-pages')
  if (index === -1) {
    return undefined
  }
  return process.argv[index + 1] ?? ''
}

/**
 * 从 Taro 插件上下文读取调试参数
 * Taro CLI 用 minimist 解析（保留 kebab-case 键 args['debug-pages']），同时兼容驼峰键与 argv 直传
 */
const readRawDebugPages = (ctx: IPluginContext): unknown => {
  const options = ctx.runOpts?.options ?? {}
  const fromArgs = (options as Record<string, unknown>).args
  if (fromArgs && typeof fromArgs === 'object') {
    const args = fromArgs as Record<string, unknown>
    if (args['debug-pages'] !== undefined) {
      return args['debug-pages']
    }
    if (args.debugPages !== undefined) {
      return args.debugPages
    }
  }
  const optionRecord = options as Record<string, unknown>
  if (optionRecord['debug-pages'] !== undefined) {
    return optionRecord['debug-pages']
  }
  if (optionRecord.debugPages !== undefined) {
    return optionRecord.debugPages
  }
  return readFromArgv()
}

/**
 * 解析本次构建的调试选项；未传入参数时返回 enabled=false
 */
export const resolveDebugOptions = (
  ctx: IPluginContext,
  pluginOptions: TaroDebugPageOptions = {},
): DebugPageOptions => {
  const platform = process.env.TARO_ENV as MiniPlatform
  const fixedPages = (pluginOptions.defaultPages ?? [])
    .map(normalizePage)
    .filter((page) => page.length > 0)
  const scanDirs = (pluginOptions.scanDirs ?? [])
    .map(normalizePage)
    .filter((dir) => dir.length > 0)
  const raw = readRawDebugPages(ctx)
  if (raw === undefined) {
    return { enabled: false, debugPages: [], fixedPages, scanDirs, platform }
  }
  const debugPages = parseDebugPages(raw)
  return { enabled: true, debugPages, fixedPages, scanDirs, platform }
}

/** 当前平台是否支持按需页面过滤 */
export const isPlatformSupported = (platform: MiniPlatform): boolean =>
  SUPPORTED_PLATFORMS.includes(platform)
