/**
 * Proxy 沙箱:为每个子应用创建独立的 window 代理
 * - 全局隔离:写入记录在 fakeWindow,读取透传真实 window
 * - 副作用追踪:拦截定时器/事件监听,deactivate 时统一清理
 *
 * 已知局限:location 未代理;document 为轻量代理(仅拦截 createElement('style'));
 * 裸变量调用不经过代理;需 CSP 允许 unsafe-eval
 */

import { SHARED_COMPONENTS_REGISTRY_KEY } from '../shared-components'
import { scopeCss, SCOPED_ATTR, MICRO_APP_ATTR } from '../style-scope'

/** 共享 EventBus key，用于跨沙箱通信 */
const NATIVE_EB_KEY = '__NATIVE_EB__'

type AnyFn = (...args: any[]) => any
type TrackedListener = {
  type: string
  listener: EventListenerOrEventListenerObject
  options?: boolean | AddEventListenerOptions
}

// ===== 异步 chunk 沙箱化 =====
//
// webpack 异步 chunk 经 <script> 加载时运行在真实 window,绕过沙箱。
// 方案:拦截 appendChild/insertBefore,子应用入口域的 <script> 改用
// fetch + execInSandbox 执行(chunk 模块函数闭包捕获 proxy),加载后派发
// 'load' 事件让 webpack runtime 正常 resolve。按 name 路由到沙箱,
// 避免同 origin 多子应用互相覆盖;补丁全局只装一次,非子应用 script 直接放行。

/** name -> sandbox 路由表:按 entryBasePath 前缀路由,支持同 origin 多子应用 */
const sandboxByName = new Map<string, ProxySandbox>()

let ourAppendChild: typeof Node.prototype.appendChild | null = null
let ourInsertBefore: typeof Node.prototype.insertBefore | null = null

/**
 * 安装 appendChild/insertBefore 拦截,形成 [沙箱拦截] → [第三方拦截] → 原生 调用链。
 * 守卫:已是自家最新包装器则跳过,避免重复包裹导致回填文本被重复改写;
 * 被第三方覆盖后可通过 ensureSandboxInterceptor / setEntryBasePath 自愈重装。
 */
function installScriptInterceptor(): void {
  if (
    ourAppendChild !== null &&
    ourInsertBefore !== null &&
    Node.prototype.appendChild === ourAppendChild &&
    Node.prototype.insertBefore === ourInsertBefore
  ) {
    return
  }
  const origAppendChild = Node.prototype.appendChild
  const origInsertBefore = Node.prototype.insertBefore

  ourAppendChild = function <T extends Node>(this: Node, node: T): T {
    if (interceptSandboxNode(node)) return node
    const res = origAppendChild.call(this, node) as T
    scopeBackfilledStyle(this)
    return res
  } as typeof Node.prototype.appendChild

  ourInsertBefore = function <T extends Node>(
    this: Node,
    node: T,
    ref: Node | null,
  ): T {
    if (interceptSandboxNode(node)) return node
    const res = origInsertBefore.call(this, node, ref) as T
    scopeBackfilledStyle(this)
    return res
  } as typeof Node.prototype.insertBefore

  Node.prototype.appendChild = ourAppendChild
  Node.prototype.insertBefore = ourInsertBefore
}

/**
 * 确保沙箱 script 拦截器在位:仅在引用被第三方覆盖时重装,避免重复包裹。
 * 由 Vue 路由 beforeEach 调用(路由钩子在视图 chunk 加载前执行)。
 */
export function ensureSandboxInterceptor(): void {
  if (
    ourAppendChild !== null &&
    ourInsertBefore !== null &&
    Node.prototype.appendChild === ourAppendChild &&
    Node.prototype.insertBefore === ourInsertBefore
  ) {
    return
  }
  installScriptInterceptor()
}

/**
 * 若 node 是子应用入口域的 <script>,改走沙箱加载并返回 true。
 * 不限 active 状态:路由切换时序中新子应用的 chunk 加载先于 activate,
 * 若只拦截 active 沙箱,push 回调会路由到错误的 webpackChunk 数组导致
 * ChunkLoadError。未激活时 chunk 的 webpackChunk*.push 是数组方法调用,
 * 不走 set trap,不受影响。
 */
/** 已告警过的逃逸 script URL(每 URL 只告警一次) */
const warnedEscapedScripts = new Set<string>()

function routeSandboxScript(node: Node): boolean {
  if (!(node instanceof HTMLScriptElement)) return false
  const src = node.src
  if (!src) return false

  // 第一层:entryBasePath 前缀精确匹配
  for (const [, sandbox] of sandboxByName) {
    // css-only 样式沙箱不路由 <script>,仅用于样式归属改写
    if (!sandbox.scriptSandbox) continue
    if (sandbox.matchesEntryUrl(src)) {
      sandbox.loadChunkInSandbox(src, node)
      return true
    }
  }

  // 第二层:origin 兜底(publicPath 指向 CDN/异目录场景),仅一个候选时确定性路由,
  // 并自动学习新前缀,后续同目录 chunk 走第一层匹配。
  // 关键:排除与宿主页面同源的沙箱 —— 子应用与宿主同源时,宿主自身的懒加载 chunk
  // 也在该 origin 下,仅靠 origin 无法区分,误劫持会导致宿主 chunk 进入沙箱、
  // webpackChunk push 丢失,宿主 runtime 报 ChunkLoadError。同源子应用由第一层
  // entryBasePath 前缀确定性路由,无需兜底。
  let origin = ''
  try {
    origin = new URL(src).origin
  } catch {
    return false
  }
  const pageOrigin = window.location.origin
  const candidates: ProxySandbox[] = []
  for (const [, sandbox] of sandboxByName) {
    if (
      sandbox.scriptSandbox &&
      sandbox.entryOrigin === origin &&
      sandbox.entryOrigin !== pageOrigin
    )
      candidates.push(sandbox)
  }
  if (candidates.length === 1) {
    const sandbox = candidates[0]
    sandbox.addEntryBasePath(new URL('./', src).href)
    sandbox.loadChunkInSandbox(src, node)
    return true
  }
  // 多沙箱同 origin 无法消歧:显式告警,不再静默去隔离
  if (candidates.length > 1 && !warnedEscapedScripts.has(src)) {
    warnedEscapedScripts.add(src)
    console.error(
      `[micro-module] chunk ${src} 未命中任何沙箱前缀,且同 origin(${origin})注册了多个子应用,` +
        `已回退原生加载(写隔离失效)。请在对应 MicroAppConfig.chunkBasePaths 中显式声明 chunk 目录`,
    )
  }
  return false
}

// ===== 动态样式隔离(scopedCSS) =====
//
// 子应用动态插入的 <style>/<link> 会污染主应用全局样式。双通道归属:
//  1. 创建时归因(主通道):sandboxDocument 代理 createElement('style'),
//     创建瞬间登记 styleOwners,append 时按归属改写,与注入时机无关;
//  2. 同步上下文归因(辅通道):execInSandbox 执行栈内按 currentExecuting 归属,
//     chunk 加载的归属窗口延伸到一个微任务。
// 改写:style-loader 先插空 <style> 再以文本节点回填 —— 空 <style> 打
// PENDING_STYLE_ATTR 标记,回填经过拦截链时由 scopeBackfilledStyle 改写
// (HMR 更新同理)。<link> 归属后改走 fetch + 改写 + <style> 替换。
// 已知限制:无法归属(非沙箱创建且异步注入)的 <style> 保持原样插入。

/** 当前正在沙箱内同步执行的沙箱实例(execInSandbox 执行期间设置,可重入) */
let currentExecuting: ProxySandbox | null = null

/** <style> 创建时归属表:append 时按创建归属改写,与注入时机解耦 */
const styleOwners = new WeakMap<HTMLStyleElement, ProxySandbox>()

/**
 * 沙箱专属 document 代理:createElement('style') 登记归属,
 * 其余成员转发真实 document。作为 new Function 参数替换子应用代码内的裸 document。
 */
function createSandboxDocument(sandbox: ProxySandbox): Document {
  const sandboxCreateElement = (
    tagName: string,
    options?: ElementCreationOptions,
  ): HTMLElement => {
    const el = document.createElement(tagName, options)
    if (tagName.toLowerCase() === 'style') {
      styleOwners.set(el as HTMLStyleElement, sandbox)
    }
    return el
  }
  return new Proxy(document, {
    get(target, prop) {
      if (prop === 'createElement') return sandboxCreateElement
      // defaultView 返回真实 window 的次级逃逸:改回沙箱代理,
      // 避免 window.document.defaultView 拿到真实全局
      if (prop === 'defaultView') return sandbox.proxy
      const value = Reflect.get(target, prop, target)
      return typeof value === 'function'
        ? (value as (...args: unknown[]) => unknown).bind(target)
        : value
    },
  }) as Document
}

/** <style> 待回填标记:append 时尚无内容,css 文本随后由 loader 以文本节点回填 */
const PENDING_STYLE_ATTR = 'data-micro-module-pending'

/**
 * 沙箱节点拦截统一入口。
 * 返回 true 表示节点已被接管(调用方跳过原生插入),false 表示继续原生插入
 * (样式节点改写后仍走原生插入)。
 */
function interceptSandboxNode(node: Node): boolean {
  if (node instanceof HTMLScriptElement) return routeSandboxScript(node)
  if (node instanceof HTMLStyleElement) {
    scopeStyleElement(node)
    return false
  }
  if (node instanceof HTMLLinkElement) {
    const rel = (node.rel || '').toLowerCase()
    if (rel === 'stylesheet') return routeScopedStylesheetLink(node)
  }
  return false
}

/** 改写沙箱执行上下文中插入的 <style> 文本(幂等:已标记的不重复改写) */
function scopeStyleElement(el: HTMLStyleElement): void {
  // 创建时归因优先,回退到同步执行上下文归因
  const owner = styleOwners.get(el) ?? currentExecuting
  if (!owner?.scopedCSS) return
  if (el.hasAttribute(SCOPED_ATTR)) return
  const text = el.textContent
  // 空 <style>:打待回填标记,回填文本经拦截链时由 scopeBackfilledStyle 改写
  if (!text || !text.trim()) {
    el.setAttribute(PENDING_STYLE_ATTR, owner.name)
    return
  }
  el.textContent = scopeCss(text, owner.name)
  el.setAttribute(SCOPED_ATTR, owner.name)
  el.removeAttribute(PENDING_STYLE_ATTR)
}

/**
 * <style> 内容回填改写:向待回填/已隔离(含 HMR 更新)的子应用 <style>
 * 插入文本节点时,整体重新改写文本。
 */
function scopeBackfilledStyle(parent: Node): void {
  if (!(parent instanceof HTMLStyleElement)) return
  const name =
    parent.getAttribute(PENDING_STYLE_ATTR) ??
    (parent.hasAttribute(SCOPED_ATTR) ? parent.getAttribute(SCOPED_ATTR) : null)
  if (!name) return
  const text = parent.textContent
  if (!text || !text.trim()) return
  parent.removeAttribute(PENDING_STYLE_ATTR)
  parent.textContent = scopeCss(text, name)
  parent.setAttribute(SCOPED_ATTR, name)
}

/**
 * 接管子应用 <link rel=stylesheet>:保留原生插入(维持渲染阻塞语义,无 FOUC),
 * 原生 load 后 fetch 源码(刚下载过,命中缓存)改写并以 <style> 原位替换。
 * 不拦截不插入,否则会有 FOUC 或额外网络往返延迟。fetch 失败保留原 link 并告警。
 */
function routeScopedStylesheetLink(link: HTMLLinkElement): boolean {
  let owner: ProxySandbox | null = currentExecuting
  if (!owner?.scopedCSS) {
    owner = null
    for (const [, sandbox] of sandboxByName) {
      if (sandbox.scopedCSS && sandbox.matchesEntryUrl(link.href)) {
        owner = sandbox
        break
      }
    }
  }
  if (!owner) return false
  const sandbox = owner
  const href = link.href
  const replaceWithScopedStyle = () => {
    // force-cache:link 刚下载过同 URL,直接复用缓存(default 会因 no-cache 头重复 revalidate)
    fetch(href, { cache: 'force-cache' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${href}`)
        return res.text()
      })
      .then((css) => {
        // link 已被移除或 HMR 已换新 href(新 link 会走自己的拦截流程):跳过
        if (!link.isConnected || link.href !== href) return
        const style = document.createElement('style')
        style.setAttribute(SCOPED_ATTR, sandbox.name)
        style.setAttribute('data-micro-module-css-href', href)
        // 继承入口 CSS 归属标记,保证卸载/回滚时能清理到替换后的 style
        const appAttr = link.getAttribute(MICRO_APP_ATTR)
        if (appAttr) style.setAttribute(MICRO_APP_ATTR, appAttr)
        style.textContent = scopeCss(css, sandbox.name)
        link.replaceWith(style)
      })
      .catch((err) => {
        console.warn(
          `[micro-module] 子应用 CSS 隔离改写失败,保留原 link 直载(未隔离): ${href}`,
          err,
        )
      })
  }
  if (link.sheet) {
    // 已加载完成(如拦截时机晚于 load):直接替换
    replaceWithScopedStyle()
  } else {
    link.addEventListener('load', replaceWithScopedStyle, { once: true })
  }
  // 放行原生插入:渲染阻塞语义保留,webpack 原生事件流无需手动派发
  return false
}

export class ProxySandbox {
  name: string
  active = false
  fakeWindow: Record<PropertyKey, any> = Object.create(null)
  timers = new Set<number>()
  listeners: TrackedListener[] = []
  /** 代理后的 window,子应用代码内所有 window/self/globalThis 引用都指向它 */
  proxy: WindowProxy
  /** 入口基础路径(含目录),用于匹配异步 chunk 的 <script> src;含路径可区分同 origin 多子应用 */
  entryBasePath = ''
  /** 版本根目录:entryBasePath 剥掉尾部 js/ 后的结果。生产构建 JS/CSS 分目录输出,归属匹配统一走 matchesEntryUrl */
  private entryBaseRoot = ''
  /** 入口 origin:前缀未命中时按 origin 缩小候选(publicPath 指向 CDN/异目录场景) */
  entryOrigin = ''
  /** 已告警过的丢写 key(未激活期写入丢弃时防刷屏) */
  private droppedWriteKeys = new Set<PropertyKey>()
  /** 运行时学习到的扩展 chunk 目录前缀(chunkBasePaths 配置 + origin 兜底自学习) */
  private extraBasePaths = new Set<string>()
  /** 是否启用样式隔离(默认 true):拦截沙箱内插入的 <style>/<link> 改写为 .micro-module-xxx 前缀 */
  scopedCSS = true
  /** 是否启用 JS 脚本沙箱(默认 true)。css-only 样式沙箱置 false:仅做样式归属改写,<script> 原生加载 */
  scriptSandbox = true
  /** 沙箱专属 document 代理(execInSandbox 注入):createElement('style') 创建时归因,与注入时机无关 */
  sandboxDocument: Document = createSandboxDocument(this)

  constructor(name: string) {
    this.name = name
    this.proxy = this._createProxy()
  }

  private _createProxy(): WindowProxy {
    // Proxy 拦截器闭包需捕获 sandbox 引用,绕过 @typescript-eslint/no-this-alias
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const sandbox = this
    const fakeWindow = this.fakeWindow

    return new Proxy(fakeWindow, {
      get(target, key: PropertyKey) {
        // 拦截需追踪副作用的全局 API,返回包装函数
        if (key === 'setTimeout')
          return (...args: Parameters<typeof setTimeout>) =>
            sandbox._trackTimeout(...args)
        if (key === 'setInterval')
          return (...args: Parameters<typeof setInterval>) =>
            sandbox._trackInterval(...args)
        if (key === 'clearTimeout')
          return (id: unknown) => sandbox._clearTimer(id)
        if (key === 'clearInterval')
          return (id: unknown) => sandbox._clearTimer(id)
        if (key === 'addEventListener')
          return (...args: Parameters<typeof window.addEventListener>) =>
            sandbox._trackListener(...args)
        if (key === 'removeEventListener')
          return (...args: Parameters<typeof window.removeEventListener>) =>
            sandbox._untrackListener(...args)

        // 优先读 fakeWindow,不存在则透传真实 window
        if (key === 'document') {
          // 统一返回沙箱代理,避免子应用经 window.document 绕过 <style> 创建归因
          return sandbox.sandboxDocument
        }
        if (key in target) return target[key]

        // webpackChunk* 不回退真实 window:每个子应用独立 chunk 数组,避免互相覆盖(ChunkLoadError)
        if (typeof key === 'string' && key.startsWith('webpackChunk')) {
          return undefined
        }

        const value = (window as Record<PropertyKey, any>)[key]
        if (typeof value === 'function') {
          // 有 prototype 的构造函数直接返回原函数:bind 后无 prototype 会导致 core-js polyfill 报错
          if (value.prototype && typeof value.prototype === 'object')
            return value as AnyFn
          // 普通方法 bind 到真实 window,避免 'Illegal invocation'
          return (value as AnyFn).bind(window)
        }
        return value
      },

      set(target, key, value) {
        if (!sandbox.active) {
          // 未激活期写入丢弃,每 key 告警一次并附调用栈(webpackChunk*.push 是数组调用不走此 trap,不误报)
          if (!sandbox.droppedWriteKeys.has(key)) {
            sandbox.droppedWriteKeys.add(key)
            console.warn(
              `[micro-module] 沙箱 ${sandbox.name} 未激活,写入 window.${String(key)} 被丢弃` +
                `(通常来自 deactivate 后仍在运行的异步回调,属子应用未清理的副作用)`,
              new Error('[micro-module] 写入来源堆栈').stack,
            )
          }
          return true
        }
        target[key] = value
        // webpackChunk* 同步到真实 window:chunk 未被拦截直接在真实 window 执行时,
        // push 仍能路由到本沙箱的 webpack runtime(与 get 拦截的"不回退"策略配套)。
        // 已存在时不覆盖(如宿主 runtime 的同名数组),防止误劫持场景破坏宿主 runtime
        if (typeof key === 'string' && key.startsWith('webpackChunk')) {
          const w = window as Record<PropertyKey, any>
          if (!(key in w)) w[key] = value
        }
        // 共享组件注册表同步到真实 window,供跨沙箱共享
        if (key === SHARED_COMPONENTS_REGISTRY_KEY) {
          ;(window as Record<PropertyKey, any>)[key] = value
        }
        // micro-native 共享 EventBus 同步到真实 window,与主应用共享同一 EventBus
        if (key === NATIVE_EB_KEY) {
          ;(window as Record<PropertyKey, any>)[key] = value
        }
        return true
      },

      has(target, key) {
        return key in target || key in window
      },

      deleteProperty(target, key) {
        if (key in target) delete target[key]
        return true
      },
    }) as unknown as WindowProxy
  }

  private _trackTimeout(fn: TimerHandler, delay?: number, ...args: any[]) {
    const id = window.setTimeout(
      () => {
        this.timers.delete(id)
        if (typeof fn === 'function') fn(...args)
      },
      delay,
      ...args,
    )
    this.timers.add(id)
    return id
  }

  private _trackInterval(fn: TimerHandler, delay?: number, ...args: any[]) {
    const id = window.setInterval(fn, delay, ...args)
    this.timers.add(id)
    return id
  }

  private _clearTimer(id: unknown) {
    // id 可能来自 setTimeout 或 setInterval;浏览器 lib 与 @types/node 对 setTimeout 返回值
    // (number vs Timeout)及 clearTimeout 入参类型存在冲突,这里用 any 绕过
    window.clearTimeout(id as unknown as number)
    window.clearInterval(id as unknown as number)
    this.timers.delete(id as unknown as number)
  }

  private _trackListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions,
  ) {
    window.addEventListener(type, listener, options)
    this.listeners.push({ type, listener, options })
  }

  private _untrackListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions,
  ) {
    window.removeEventListener(type, listener, options)
    this.listeners = this.listeners.filter(
      (l) => !(l.type === type && l.listener === listener),
    )
  }

  /** 激活沙箱:允许子应用写入 fakeWindow */
  activate() {
    this.active = true
  }

  /** 停用沙箱:禁止写入 + 清理所有追踪的副作用(定时器/事件监听) */
  deactivate() {
    this.active = false
    this._cleanup()
  }

  /**
   * 设置入口基础路径并注册到全局路由表(传入入口 JS 的目录路径,含尾随斜杠)。
   * 每次调用都重装 script 拦截器,以应对第三方库覆盖 Node.prototype 的情况(self-healing)。
   */
  setEntryBasePath(basePath: string) {
    this.entryBasePath = basePath
    // 版本根兜底:剥掉尾部 js/ 后 CSS link 才能归属到本沙箱(见 matchesEntryUrl)
    this.entryBaseRoot = basePath.replace(/js\/?$/, '')
    try {
      this.entryOrigin = basePath ? new URL(basePath).origin : ''
    } catch {
      this.entryOrigin = ''
    }
    if (basePath) {
      installScriptInterceptor()
      sandboxByName.set(this.name, this)
    }
  }

  /** 注册扩展 chunk 目录前缀(去重):chunkBasePaths 配置或 origin 兜底自学习 */
  addEntryBasePath(basePath: string) {
    if (!basePath) return
    this.extraBasePaths.add(basePath)
  }

  /** 判断 URL(chunk script src / stylesheet href)是否属于本沙箱入口域 */
  matchesEntryUrl(url: string): boolean {
    for (const p of this.extraBasePaths) {
      const root = p.replace(/js\/?$/, '')
      if (url.startsWith(p) || (root && url.startsWith(root))) return true
    }
    if (!this.entryBasePath) return false
    if (url.startsWith(this.entryBasePath)) return true
    return !!this.entryBaseRoot && url.startsWith(this.entryBaseRoot)
  }

  /**
   * fetch chunk 源码并在沙箱内执行:模块函数闭包捕获 proxy,
   * 执行后派发 load/error 事件使 webpack runtime 回调正常触发。
   */
  loadChunkInSandbox(src: string, script: HTMLScriptElement) {
    fetch(src, { cache: 'no-cache' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${src}`)
        return res.text()
      })
      .then((code) => {
        // webpack 5 的 chunk 模块工厂在 load 事件后的微任务中执行,
        // 归属窗口延伸到微任务末尾恢复;时序之外的样式由创建时归因兜底
        const prev = currentExecuting
        if (prev !== this) currentExecuting = this
        try {
          execInSandbox(code, this)
          script.dispatchEvent(new Event('load'))
        } finally {
          Promise.resolve().then(() => {
            if (currentExecuting === this) currentExecuting = prev
          })
        }
      })
      .catch((err) => {
        console.error(`[micro-module] 沙箱内加载 chunk 失败: ${src}`, err)
        script.dispatchEvent(new Event('error'))
      })
  }

  /** 注销:从全局 name 路由表移除(unloadMicroApp 时调用,避免旧沙箱残留拦截) */
  dispose() {
    sandboxByName.delete(this.name)
  }

  private _cleanup() {
    // 清理定时器
    this.timers.forEach((id) => {
      window.clearTimeout(id)
      window.clearInterval(id)
    })
    this.timers.clear()

    // 移除事件监听
    this.listeners.forEach(({ type, listener, options }) => {
      window.removeEventListener(type, listener, options)
    })
    this.listeners = []
  }
}

/**
 * 在沙箱上下文中执行脚本:new Function 以 proxy 替换 window/self/globalThis,
 * fn.call(proxy) 覆盖非严格模式 this。执行期间设置 currentExecuting(可重入),
 * 供拦截链将同步插入的 <style>/<link> 归属到本沙箱。
 */
export function execInSandbox(code: string, sandbox: ProxySandbox): void {
  // document 参数:裸 document 指向沙箱代理(createElement('style') 创建时归因)
  // eslint-disable-next-line no-new-func
  const fn = new Function('window', 'self', 'globalThis', 'document', code)
  const prev = currentExecuting
  currentExecuting = sandbox
  try {
    fn.call(
      sandbox.proxy,
      sandbox.proxy,
      sandbox.proxy,
      sandbox.proxy,
      sandbox.sandboxDocument,
    )
  } finally {
    currentExecuting = prev
  }
}
