import fs from 'fs'
import path from 'path'
import type { DependencyScanResult } from './types'

/** 参与扫描的源码文件后缀 */
const SCAN_EXTENSIONS = new Set(['.vue', '.ts', '.js'])

/** 匹配静态/动态导入中的业务模块：@modules/xxx、src/modules/xxx、modules/xxx */
const MODULE_IMPORT_REG = /(?:@modules|src\/modules|['"`](?:\.\.\/)*modules)\/([\w.-]+)/g

/** 匹配可静态识别的小程序跳转调用 */
const NAV_CALL_REG =
  /(?:Taro\.(?:navigateTo|redirectTo|reLaunch|switchTab)|kyeNavigate\.navigateBefore|navigateByOldPath)\s*\(([\s\S]*?)\)/g

/** 从跳转参数中提取字面量路径 */
const LITERAL_URL_REG = /(?:url|path)\s*:\s*['"`]([^'"`]+)['"`]/

/** 递归收集限定目录内的源码文件 */
const collectSourceFiles = (dir: string): string[] => {
  if (!fs.existsSync(dir)) {
    return []
  }
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      return entry.name === 'node_modules' ? [] : collectSourceFiles(full)
    }
    return SCAN_EXTENSIONS.has(path.extname(entry.name)) ? [full] : []
  })
}

/** 从单文件文本提取保留模块、静态路由与动态风险 */
const scanFileText = (file: string, text: string, result: DependencyScanResult): void => {
  const relFile = path.relative(path.resolve('src'), file).replace(/\\/g, '/')
  const moduleMatches = text.matchAll(MODULE_IMPORT_REG)
  for (const match of moduleMatches) {
    result.keptModuleRoots.push(`modules/${match[1]}`)
  }
  const calls = text.matchAll(NAV_CALL_REG)
  for (const call of calls) {
    const args = call[1]
    if (args.includes('${') || (!LITERAL_URL_REG.test(args) && !/['"`][\w/-]+['"`]/.test(args))) {
      result.warnings.push(`动态跳转无法静态确认: src/${relFile}`)
      continue
    }
    const literal = args.match(LITERAL_URL_REG) ?? args.match(/['"`]([\w/-]+)['"`]/)
    if (literal) {
      result.routePages.push(literal[1].replace(/^\/+/, '').split('?')[0])
    }
  }
}

/**
 * 扫描指定目录的静态导入、动态导入与跳转调用
 * @param sourcePath Taro 源码根目录（src 的绝对路径）
 * @param keepPages 过滤后保留的页面集合，用于判断首页是否被保留
 * @param scanDirs 需要扫描的目录（相对 src）
 */
export const scanDependencies = (
  sourcePath: string,
  keepPages: Set<string>,
  scanDirs: string[],
): DependencyScanResult => {
  const result: DependencyScanResult = { keptModuleRoots: [], routePages: [], warnings: [] }
  const keptScanDirs = scanDirs.filter((dir) => keepPages.has(`${dir}/index`))
  if (keptScanDirs.length === 0) {
    return result
  }
  const files = keptScanDirs.flatMap((dir) => collectSourceFiles(path.join(sourcePath, dir)))
  files.forEach((file) => scanFileText(file, fs.readFileSync(file, 'utf-8'), result))
  result.keptModuleRoots = Array.from(new Set(result.keptModuleRoots)).sort()
  result.routePages = Array.from(new Set(result.routePages)).sort()
  result.warnings = Array.from(new Set(result.warnings)).sort()
  return result
}
