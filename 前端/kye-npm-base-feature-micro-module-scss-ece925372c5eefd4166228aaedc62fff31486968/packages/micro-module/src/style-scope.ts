/**
 * 样式隔离改写器(scopedCSS)
 *
 * 把子应用 CSS 的每条选择器加上 `.micro-module-xxx` class 前缀,
 * 使样式仅命中容器内的 DOM(与 @micro-zoe/micro-app 的 scopedCSS 思路一致)。
 * 用 class 而非属性选择器:Chromium 祖先匹配 bloom filter 只优化 tag/id/class,
 * 属性选择器每次样式重算都需遍历祖先链,大 DOM + 大 CSS 下开销显著。
 *
 * 改写规则:
 *  - 普通选择器:  `.button` → `.micro-module-xxx .button`
 *  - 根选择器:    `:root` / `html` / `body` → `.micro-module-xxx`(作用于容器自身)
 *  - 根前缀组合:  `body .foo` → `.micro-module-xxx .foo`
 *  - @media / @supports 等递归改写;@keyframes / @import 等原样保留
 *
 * 已知限制(与 micro-app 一致):CSS 嵌套内部规则不改写;CSSOM insertRule
 * 不改写;Teleport 到 body 的内容逃逸容器,需配合 teleported: false 使用。
 */

/** 已隔离标记属性:置于已改写的 <style>/<link> 上,防止重复改写 */
export const SCOPED_ATTR = 'data-micro-module-scoped'

/**
 * 子应用归属标记属性:置于入口 CSS(link 或替换后的 style)上,
 * 供卸载/回滚时定位清理(link 替换时继承)。
 */
export const MICRO_APP_ATTR = 'data-micro-app'

/** cssSandbox 未设置时默认开启,loader 与适配层统一用此函数判定 */
export function isCssSandboxEnabled(
  cfg?: Pick<import('./types').MicroAppConfig, 'cssSandbox'> | null,
): boolean {
  return cfg?.cssSandbox !== false
}

/**
 * 构造作用域前缀选择器,如 `.micro-module-order-utils`
 * (class 选择器可参与 Chromium 祖先 bloom filter,匹配成本近似为零)。
 */
export function scopePrefix(appName: string): string {
  return `.micro-module-${appName}`
}

/**
 * 将 CSS 文本整体改写为指定子应用的作用域版本
 *
 * @param appName 子应用唯一标识(与 MicroAppConfig.name 一致)
 */
export function scopeCss(cssText: string, appName: string): string {
  return scopeSheet(cssText, scopePrefix(appName))
}

/** 块级 @规则,其内部仍是规则列表,需递归改写 */
const RECURSIVE_AT_RULES = new Set([
  '@media',
  '@supports',
  '@container',
  '@document',
  '@layer',
  '@scope',
])

/** 根选择器前缀(:root/html/body,可能连续组合出现,如 `html body .x`) */
const ROOT_SELECTOR_RE = /^(?::root|html|body)(?=\s|$)/i

/**
 * 逐字符扫描 CSS 文本,按"选择器前奏 + {} 块"切分规则并逐条改写。
 * 选择器前奏中的注释原样保留;顶层语句(@import/@charset,以 ; 结尾)原样保留。
 */
function scopeSheet(css: string, prefix: string): string {
  let out = ''
  let sel = ''
  let i = 0
  const len = css.length

  while (i < len) {
    const ch = css[i]

    // 注释:原样保留在选择器前奏或输出中
    if (ch === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2)
      const stop = end === -1 ? len : end + 2
      sel += css.slice(i, stop)
      i = stop
      continue
    }

    // 规则块开始:提取匹配的花括号块并处理
    if (ch === '{') {
      const { body, next } = readBlock(css, i)
      out += processRule(sel, body, prefix)
      sel = ''
      i = next
      continue
    }

    // 顶层语句(如 @import url(...);):原样保留
    if (ch === ';') {
      out += sel + ';'
      sel = ''
      i++
      continue
    }

    sel += ch
    i++
  }

  return out + sel
}

/**
 * 从 '{' 位置提取匹配的块内容(到对应 '}' 为止),返回块体与扫描续接位置。
 * 正确跳过嵌套花括号、字符串(含转义)与注释中的花括号。
 */
function readBlock(css: string, open: number): { body: string; next: number } {
  let depth = 0
  let i = open
  const len = css.length
  while (i < len) {
    const ch = css[i]
    if (ch === '/' && css[i + 1] === '*') {
      const end = css.indexOf('*/', i + 2)
      i = end === -1 ? len : end + 2
      continue
    }
    if (ch === '"' || ch === "'") {
      i = skipString(css, i)
      continue
    }
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return { body: css.slice(open + 1, i), next: i + 1 }
    }
    i++
  }
  // 未闭合(异常 CSS):按剩余全部处理,避免死循环
  return { body: css.slice(open + 1), next: len }
}

/** 跳过一个字符串字面量(从引号字符开始),返回闭合引号后的位置 */
function skipString(css: string, start: number): number {
  const quote = css[start]
  let i = start + 1
  const len = css.length
  while (i < len) {
    if (css[i] === '\\') {
      i += 2
      continue
    }
    if (css[i] === quote) return i + 1
    i++
  }
  return len
}

/** 处理单条规则:按选择器前奏类型分发(样式规则 / 递归 @规则 / 保留 @规则) */
function processRule(selRaw: string, body: string, prefix: string): string {
  const sel = selRaw.trim()

  // @规则
  if (sel.startsWith('@')) {
    const atName = /^@[\w-]+/.exec(sel)?.[0]?.toLowerCase()
    if (atName && RECURSIVE_AT_RULES.has(atName)) {
      return `${selRaw}{${scopeSheet(body, prefix)}}`
    }
    // @keyframes/@font-face 等:内部不是选择器,原样保留
    return `${selRaw}{${body}}`
  }

  // 样式规则:按顶层逗号拆分选择器列表,逐条加前缀
  const scoped = splitSelectorList(sel)
    .map((part) => scopeSelector(part, prefix))
    .filter(Boolean)
  if (!scoped.length) return ''
  return `${scoped.join(',')}{${body}}`
}

/**
 * 按顶层逗号拆分选择器列表(不拆分 :not(a, b) / [data-x="a,b"] 内部的逗号)
 */
function splitSelectorList(sel: string): string[] {
  const parts: string[] = []
  let depth = 0
  let cur = ''
  for (let i = 0; i < sel.length; i++) {
    const ch = sel[i]
    if (ch === '"' || ch === "'") {
      const end = skipString(sel, i)
      cur += sel.slice(i, end)
      i = end - 1
      continue
    }
    if (ch === '(' || ch === '[') depth++
    else if (ch === ')' || ch === ']') depth = Math.max(0, depth - 1)
    if (ch === ',' && depth === 0) {
      parts.push(cur)
      cur = ''
    } else {
      cur += ch
    }
  }
  parts.push(cur)
  return parts
}

/**
 * 改写单条选择器:
 *  - 空 / 纯注释 → 返回 ''(丢弃)
 *  - `:root` / `html` / `body`(可带前导组合,如 `html body .x`)→ 前缀 + 剩余部分
 *  - 其他 → `prefix + ' ' + selector`
 */
function scopeSelector(sel: string, prefix: string): string {
  let s = sel.trim()
  // 去掉选择器内部注释后再判空(纯注释片段丢弃)
  if (!s.replace(/\/\*[\s\S]*?\*\//g, '').trim()) return ''

  // 幂等保护:已带当前前缀的选择器不再重复加前缀
  // (拦截链多层包装时会对同一段文本重复触发改写,不幂等会产生双前缀导致无法命中)
  if (s === prefix) return s
  if (s.startsWith(prefix)) {
    const next = s[prefix.length]
    if (
      next === ' ' ||
      next === '>' ||
      next === '~' ||
      next === '+' ||
      next === ':'
    ) {
      return s
    }
  }

  let hadRoot = false
  while (ROOT_SELECTOR_RE.test(s)) {
    hadRoot = true
    s = s.replace(ROOT_SELECTOR_RE, '')
    // 去掉根选择器残留的前导组合子与空白(如 `body > .x` → `.x`)
    s = s.replace(/^[\s>+~]+/, '')
  }
  // 整条选择器就是根选择器本身 → 容器自身
  if (!s) return hadRoot ? prefix : ''
  return `${prefix} ${s}`
}
