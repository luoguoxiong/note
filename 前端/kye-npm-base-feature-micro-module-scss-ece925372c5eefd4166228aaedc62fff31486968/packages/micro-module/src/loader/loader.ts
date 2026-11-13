import { ProxySandbox, execInSandbox } from '../sandbox/ProxySandbox'
import { MICRO_APP_ATTR, isCssSandboxEnabled } from '../style-scope'
import type { MicroAppConfig, SubAppExports } from '../types'

// ===== 内部状态(模块级单例,主应用内共享)=====
/** activeRule -> 子应用配置 */
const microAppMap = new Map<string, MicroAppConfig>()
/** 已加载完成的 activeRule 集合 */
const loadedApps = new Set<string>()
/** 进行中的加载 Promise(防重复并发拉取同一子应用) */
const loadingPromises: Record<string, Promise<SubAppExports> | undefined> = {}
/** name -> 入口资源缓存(JS/CSS,支持 contenthash) */
const manifestCache: Record<string, EntryResources> = {}
/** activeRule -> 沙箱实例(加载后持久化,activate/deactivate 复用) */
const sandboxes: Record<string, ProxySandbox> = {}
/** activeRule -> 非沙箱模式子应用的导出对象(沙箱模式仍走 sandbox.fakeWindow) */
const nonSandboxExports: Record<string, SubAppExports> = {}

// ===== 配置注册 =====

/** 批量注册子应用配置;运行时注册在下一次路由切换时生效 */
export function registerMicroApps(configs: MicroAppConfig[]): void {
  configs.forEach((cfg) => {
    microAppMap.set(cfg.activeRule, cfg)
  })
}

/** 注册单个子应用(运行时动态注册便捷方法) */
export function registerMicroApp(config: MicroAppConfig): void {
  microAppMap.set(config.activeRule, config)
}

/** 按 activeRule 获取子应用配置 */
export function getMicroAppConfig(
  activeRule: string,
): MicroAppConfig | undefined {
  return microAppMap.get(activeRule)
}

/** 按路径匹配子应用的 activeRule(前缀匹配),无匹配返回 null */
export function findMicroAppByPath(path: string): string | null {
  for (const rule of microAppMap.keys()) {
    if (path.startsWith(rule)) return rule
  }
  return null
}

/** 按子应用 name 反查其 activeRule(供 useRemoteComponent 按 name 加载目标子应用) */
export function findMicroAppByName(name: string): string | null {
  for (const [rule, cfg] of microAppMap) {
    if (cfg.name === name) return rule
  }
  return null
}

/** 子应用是否已加载完成 */
export function isMicroAppLoaded(activeRule: string): boolean {
  return loadedApps.has(activeRule)
}

// ===== 脚本拉取 =====

interface FetchOptions {
  timeout?: number
  retries?: number
}

/** 带重试 + 超时的脚本源码拉取(fetch,返回代码文本供沙箱执行) */
const fetchWithRetry = async (
  url: string,
  { timeout = 10000, retries = 2 }: FetchOptions = {},
): Promise<string> => {
  const attempt = () =>
    new Promise<string>((resolve, reject) => {
      const controller = new AbortController()
      const timer = setTimeout(() => {
        controller.abort()
        reject(new Error(`加载超时: ${url}`))
      }, timeout)
      fetch(url, { cache: 'no-cache', signal: controller.signal })
        .then((res) => {
          clearTimeout(timer)
          if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`)
          return res.text()
        })
        .then(resolve)
        .catch((e) => {
          clearTimeout(timer)
          reject(e)
        })
    })

  let lastErr: unknown
  for (let i = 0; i <= retries; i++) {
    try {
      return await attempt()
    } catch (e) {
      lastErr = e
      if (i < retries) {
        await new Promise((r) => setTimeout(r, 300 * (i + 1)))
      }
    }
  }
  throw lastErr
}

/** 入口资源:JS 主入口 + 可选 CSS(vue-cli/webpack 抽出的独立 .css) */
interface EntryResources {
  jsUrl: string
  cssUrl?: string
}

/**
 * 注入子应用入口 CSS 到 <head>(幂等:同 name 不重复注入)。
 * 统一 <link> 原生插入:不阻塞 JS 加载,保留渲染阻塞语义(无 FOUC);
 * 样式沙箱开启时由拦截链在 link 原生 load 后改写替换。
 */
const injectEntryCss = (cfg: MicroAppConfig, cssUrl: string): void => {
  if (document.head.querySelector(`[${MICRO_APP_ATTR}="${cfg.name}"]`)) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = cssUrl
  link.setAttribute(MICRO_APP_ATTR, cfg.name)
  document.head.appendChild(link)
}

/** 移除子应用入口 CSS(卸载或加载失败回滚时调用,兼容 link 与 scoped style) */
const removeEntryCss = (name: string): void => {
  document.head
    .querySelectorAll(`[${MICRO_APP_ATTR}="${name}"]`)
    .forEach((el) => el.remove())
}

/**
 * 拉取 manifest 并解析入口资源(JS + 可选 CSS,支持 contenthash)。
 * loader 绕过了子应用 index.html,其中 <link rel=stylesheet> 不会生效,
 * CSS 需在此解析后由 loadMicroApp 注入主应用 <head>;
 * dev 模式 style-loader 经 JS 注入 <style>,manifest 无 CSS 字段。
 */
const resolveEntry = async (cfg: MicroAppConfig): Promise<EntryResources> => {
  if (manifestCache[cfg.name]) return manifestCache[cfg.name]
  // entry 可为 string 或 Promise<string>(如从配置中心异步拉取),统一 await 解析
  const entryOrigin = await cfg.entry
  // 规范化:剥掉末尾斜杠,避免与 manifest 路径双斜杠拼接
  const base = entryOrigin.replace(/\/$/, '')
  const res = await fetch(`${base}/manifest.json`, { cache: 'no-cache' })
  if (!res.ok)
    throw new Error(`manifest 拉取失败 (${res.status}): ${base}/manifest.json`)
  const manifest = await res.json()
  const main: string | undefined =
    manifest.main || manifest['app.js'] || manifest['main.js']
  if (!main) throw new Error('manifest 缺少入口字段')
  const jsUrl = main.startsWith('http')
    ? main
    : `${base}${main.startsWith('/') ? '' : '/'}${main}`
  // CSS 入口:vue-cli/webpack manifest 中的 app.css(部分构建为 main.css)
  const cssKey: string | undefined = manifest['app.css'] || manifest['main.css']
  const cssUrl = cssKey
    ? cssKey.startsWith('http')
      ? cssKey
      : `${base}${cssKey.startsWith('/') ? '' : '/'}${cssKey}`
    : undefined
  const result: EntryResources = { jsUrl, cssUrl }
  manifestCache[cfg.name] = result
  return result
}

// ===== 加载主流程 =====

/**
 * 按需加载子应用:解析入口(manifest) -> 创建并激活 ProxySandbox ->
 * fetch 脚本源码(重试 + 超时) -> 注入 __SANDBOX_ENTRY_URL__ ->
 * 沙箱内执行 -> 读取导出 -> 调用 bootstrap。
 * 泛型 R 为路由记录类型(Vue 适配层传 RouteRecordRaw)。
 */
export async function loadMicroApp<R = unknown>(
  activeRule: string,
): Promise<SubAppExports<R>> {
  if (loadedApps.has(activeRule)) {
    return getMicroAppExports(activeRule) as SubAppExports<R>
  }
  if (loadingPromises[activeRule]) {
    return loadingPromises[activeRule] as Promise<SubAppExports<R>>
  }

  const cfg = microAppMap.get(activeRule)
  if (!cfg) throw new Error(`未注册的子应用: ${activeRule}`)

  loadingPromises[activeRule] = (async () => {
    let sandbox: ProxySandbox | undefined
    let cssInjected = false
    try {
      const entry = await resolveEntry(cfg)

      const cssScoped = isCssSandboxEnabled(cfg)

      // 非沙箱模式:<script src> 由浏览器原生加载
      if (cfg.jsSandbox === false) {
        // 样式沙箱独立于 JS 沙箱:jsSandbox: false 但 cssSandbox 开启时,
        // 创建仅用于样式归属的 css-only 沙箱(scriptSandbox = false)。
        // 已知限制:子应用 JS 动态创建的 <style> 无法归属,仅覆盖 stylesheet link。
        if (cssScoped) {
          const cssOnly = new ProxySandbox(cfg.name)
          cssOnly.scriptSandbox = false
          cssOnly.scopedCSS = true
          cssOnly.setEntryBasePath(new URL('./', entry.jsUrl).href)
          // 复用本地 sandbox 变量:加载失败时统一走 catch 的回滚清理
          sandbox = cssOnly
          sandboxes[activeRule] = cssOnly
        }
        ;(window as Record<string, any>)['__MICRO_MODULE_ENVIRONMENT__'] = true
        if (entry.cssUrl) {
          // link 原生插入不阻塞 JS,沙箱拦截链在 load 后替换为 scoped style
          injectEntryCss(cfg, entry.cssUrl)
          cssInjected = true
        }
        const obj = await new Promise<SubAppExports>((resolve, reject) => {
          const script = document.createElement('script')
          script.src = entry.jsUrl
          script.onload = () => {
            const exports = (window as Record<string, any>)[cfg.name] as
              | SubAppExports
              | undefined
            if (exports?.routes) {
              resolve(exports)
            } else {
              reject(new Error(`${cfg.name} 未暴露 routes`))
            }
          }
          script.onerror = () =>
            reject(new Error(`脚本加载失败: ${entry.jsUrl}`))
          document.head.appendChild(script)
        })
        await obj.bootstrap?.()
        nonSandboxExports[activeRule] = obj
        loadedApps.add(activeRule)
        console.log(
          `[micro-module] 已加载子应用 ${cfg.name} (无 JS 沙箱${cssScoped ? ', 样式沙箱隔离' : ''})`,
        )
        return obj
      }

      // 沙箱模式(默认):fetch 源码文本后在沙箱 Function 内执行
      const code = await fetchWithRetry(entry.jsUrl)
      sandbox = new ProxySandbox(cfg.name)
      sandbox.scopedCSS = cssScoped
      sandbox.activate()
      sandbox.fakeWindow.__SANDBOX_ENTRY_URL__ = entry.jsUrl
      ;(window as Record<string, any>)['__MICRO_MODULE_ENVIRONMENT__'] = true
      // 注册入口基础路径:异步 chunk 命中该前缀时改走 fetch + execInSandbox;
      // 含路径部分可区分同 origin 部署的多个子应用
      sandbox.setEntryBasePath(new URL('./', entry.jsUrl).href)
      // 扩展 chunk 目录:子应用 publicPath 指向 CDN/异目录时显式注册前缀
      for (const p of cfg.chunkBasePaths ?? []) {
        sandbox.addEntryBasePath(new URL('./', p).href)
      }
      // 入口 CSS:生产构建(mini-css-extract)抽成独立 .css,需手动补载;
      // dev 模式 style-loader 经 JS 注入 <style>,manifest 无 cssUrl 不触发
      if (entry.cssUrl) {
        // link 原生插入不阻塞 JS,沙箱拦截链在 load 后替换为 scoped style
        injectEntryCss(cfg, entry.cssUrl)
        cssInjected = true
      }
      execInSandbox(code, sandbox)
      const obj = sandbox.fakeWindow[cfg.name] as SubAppExports | undefined
      if (!obj || !obj.routes) throw new Error(`${cfg.name} 未暴露 routes`)
      await obj.bootstrap?.()
      sandboxes[activeRule] = sandbox
      loadedApps.add(activeRule)
      console.log(`[micro-module] 已加载子应用 ${cfg.name} (Proxy 沙箱隔离)`)
      return obj
    } catch (e) {
      // 回滚已注入的 CSS,避免子应用加载失败后样式残留(下次加载会重新注入)
      if (cssInjected) removeEntryCss(cfg.name)
      sandbox?.deactivate()
      // 从 name 路由表移除,避免失败沙箱残留拦截后续动态样式/script
      sandbox?.dispose()
      delete sandboxes[activeRule]
      throw e
    } finally {
      delete loadingPromises[activeRule]
    }
  })()

  return loadingPromises[activeRule] as Promise<SubAppExports<R>>
}

/** 读取子应用导出对象(沙箱模式从 fakeWindow,非沙箱模式从 real window) */
export function getMicroAppExports<R = unknown>(
  activeRule: string,
): SubAppExports<R> | null {
  const cfg = microAppMap.get(activeRule)
  if (!cfg) return null
  // 非沙箱模式:从 nonSandboxExports 读取(由 loadMicroApp 在无沙箱分支写入)
  if (nonSandboxExports[activeRule]) {
    return nonSandboxExports[activeRule] as SubAppExports<R>
  }
  return (
    (sandboxes[activeRule]?.fakeWindow[cfg.name] as SubAppExports<R>) || null
  )
}

/** 获取子应用对应的沙箱实例(用于手动 activate/deactivate) */
export function getMicroAppSandbox(
  activeRule: string,
): ProxySandbox | undefined {
  return sandboxes[activeRule]
}

/** 卸载子应用:调用 unmount + 清理沙箱/状态(下次访问会重新加载) */
export function unloadMicroApp(activeRule: string): void {
  try {
    getMicroAppExports(activeRule)?.unmount?.()
  } catch (e) {
    console.warn(
      `[micro-module] unloadMicroApp unmount 失败 [${activeRule}]:`,
      e,
    )
  }
  // 非沙箱导出与沙箱实例(css-only 也存放在 sandboxes)统一清理,
  // 避免卸载后残留 name 路由表拦截后续动态样式
  delete nonSandboxExports[activeRule]
  sandboxes[activeRule]?.deactivate()
  sandboxes[activeRule]?.dispose()
  delete sandboxes[activeRule]
  loadedApps.delete(activeRule)
  const cfg = microAppMap.get(activeRule)
  if (cfg) {
    delete manifestCache[cfg.name]
    removeEntryCss(cfg.name)
  }
}
