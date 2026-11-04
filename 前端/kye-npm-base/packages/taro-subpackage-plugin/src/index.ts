import path from 'path'
import fs from 'fs/promises'
import { cwd } from 'process'
import chokidar from 'chokidar'
import { build } from 'esbuild'
import type webpack from 'webpack'

/** ---------- 常量定义 ---------- **/

const ROOT = cwd()
const resolvePath = (...p: string[]) => path.resolve(ROOT, ...p)
const isDev = process.env.NODE_ENV === 'development'
const platform = process.env.TARO_ENV || 'weapp'
const libsRoot = resolvePath('src/libs')
const distRoot = resolvePath(`dist/${platform}`)

const LOG_PREFIX = '[AsyncPackagePlugin]'

/** ---------- 工具函数 ---------- **/

function logInfo(...msg: any[]) {
  console.log(`\x1b[36m${LOG_PREFIX}\x1b[0m`, ...msg)
}

function logSuccess(...msg: any[]) {
  console.log(`\x1b[32m${LOG_PREFIX}\x1b[0m`, ...msg)
}

function logError(...msg: any[]) {
  console.log(`\x1b[31m${LOG_PREFIX}\x1b[0m`, ...msg)
}

/** 检查路径是否存在 */
async function exists(p: string): Promise<boolean> {
  try {
    await fs.access(p)
    return true
  } catch {
    return false
  }
}

/** ---------- 核心构建逻辑 ---------- **/

async function buildPackage(packageName: string) {
  const entry = path.join(libsRoot, packageName, 'index.ts')
  const outFile = path.join(distRoot, `libs/${packageName}/index.js`)

  if (!(await exists(entry))) {
    logError(`跳过 ${packageName}：入口文件不存在 -> ${entry}`)
    return
  }

  const platformPlugin = {
    name: 'platform-plugin',
    setup(build: {
      onResolve: (
        arg0: { filter: RegExp },
        arg1: (args: any) => { path: string; namespace: string },
      ) => void
    }) {
      build.onResolve({ filter: /^@platform\.esm\.js$/ }, (args) => {
        return {
          path: path.join(args.resolveDir, `${platform}.esm.js`),
          namespace: 'file', // 保证使用常规文件加载
        }
      })
    },
  }

  try {
    await build({
      entryPoints: [entry],
      bundle: true,
      outfile: outFile,
      format: 'esm',
      minify: !isDev,
      drop: isDev ? [] : ['console', 'debugger'],
      plugins: [platformPlugin],
      logLevel: 'silent',
      charset: 'utf8',
    })
    logSuccess(`构建完成：${packageName}`)
  } catch (err) {
    logError(`构建失败：${packageName}`, err)
  }
}

/** 并行构建所有分包 */
async function buildAllPackages() {
  try {
    const packages = await fs.readdir(libsRoot)
    await Promise.all(packages.map(buildPackage))
  } catch (err) {
    logError('构建分包时发生错误：', err)
  }
}

/** 更新 app.json 中的分包配置 */
async function updateAppJson() {
  const asyncPackages = await fs.readdir(libsRoot)
  const appJsonPath = path.join(distRoot, 'app.json')
  if (!(await exists(appJsonPath))) {
    logError('未找到 app.json 文件，跳过更新')
    return
  }

  try {
    const jsonText = await fs.readFile(appJsonPath, 'utf-8')
    const config = JSON.parse(jsonText)

    // 统一 subPackages 字段
    if (config.subpackages && !config.subPackages) {
      config.subPackages = config.subpackages
      delete config.subpackages
    } else if (config.subpackages && config.subPackages) {
      const merged = new Map()
      for (const pkg of [...config.subpackages, ...config.subPackages]) {
        merged.set(pkg.root, pkg)
      }
      config.subPackages = Array.from(merged.values())
      delete config.subpackages
    }

    // alias 兼容
    config.resolveAlias = {
      ...config.resolveAlias,
      '~/*': '/*',
    }

    // 注入分包
    const subPkgs: any[] = config.subPackages || []
    const existingRoots = new Set(subPkgs.map((s) => s.root))

    const newSubPkgs = asyncPackages
      .filter(Boolean)
      .map((name) => ({ root: `libs/${name}`, pages: [] }))
      .filter((pkg) => !existingRoots.has(pkg.root))

    if (newSubPkgs.length > 0) {
      config.subPackages.push(...newSubPkgs)
      await fs.writeFile(appJsonPath, JSON.stringify(config, null, 2))
      logSuccess(`app.json 已更新： ${newSubPkgs.length} 个异步分包`)
    } else {
      logInfo('app.json 无需更新')
    }
  } catch (err) {
    logError('更新 app.json 失败：', err)
  }
}

/** 主流程 */
async function bootstrap(isNeedBuildPackages: boolean) {
  if (isNeedBuildPackages) {
    logInfo('开始构建异步分包...')
    await buildAllPackages()
    logSuccess('全部异步分包构建完成\n')
  }
  await updateAppJson()
}

/** ---------- 文件监听逻辑 ---------- **/

function createRebuilder(fn: () => void, delay = 400) {
  let timer: NodeJS.Timeout | null = null
  return () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(fn, delay)
  }
}

function watchAndRebuild() {
  logInfo('监听 src/libs 目录变化中...')
  const watcher = chokidar.watch('src/libs/**/*.{ts,js}', { persistent: true })
  const rebuild = createRebuilder(() => {
    logInfo('检测到文件变化，重新构建...')
    bootstrap(true)
  })
  watcher.on('add', rebuild).on('change', rebuild).on('unlink', rebuild)
}

/** ---------- Webpack 插件 ---------- **/

export interface BuildAsyncPackageOptions {
  /** 启用的平台 */
  envs?: string[]
  /** 是否启用监听 */
  watch?: boolean
}

export class BuildAsyncPackagePlugin {
  private readonly options: Required<BuildAsyncPackageOptions>
  private isWatch = false

  constructor(options: BuildAsyncPackageOptions = {}) {
    this.options = {
      envs: options.envs || ['weapp', 'alipay'],
      watch: options.watch ?? true,
    }
  }

  apply(compiler: webpack.Compiler): void {
    compiler.hooks.done.tapPromise('BuildAsyncPackagePlugin', async () => {
      const platform = process.env.TARO_ENV || 'weapp'

      if (!this.options.envs.includes(platform)) {
        logInfo(`跳过执行：当前平台 ${platform}`)
        return
      }

      await bootstrap(!this.isWatch)

      if (isDev && this.options.watch && !this.isWatch) {
        watchAndRebuild()
        this.isWatch = true
      }
    })
  }
}
