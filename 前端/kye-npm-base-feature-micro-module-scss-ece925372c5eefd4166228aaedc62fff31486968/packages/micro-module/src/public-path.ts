/**
 * 动态计算 webpack publicPath
 *
 * 让异步 chunk / 静态资源从子应用自身所在域加载。三种来源(按优先级):
 *  1. 沙箱模式:window.__SANDBOX_ENTRY_URL__(主应用注入)
 *  2. 独立模式:document.currentScript.src
 *  3. 回退:页面最后一个 <script> 标签的 src
 *
 * 注意:返回值需由子应用在源码里赋值给 __webpack_public_path__,
 * webpack 才能在编译时识别(封装到 dist 里的直接赋值不一定被识别)。
 */

// webpack 注入的全局变量,用于运行时覆盖 publicPath(可读写)
declare let __webpack_public_path__: string

/**
 * 计算子应用 publicPath 根路径
 * @returns 形如 'http://localhost:8001/' 的 origin 根;无法确定时返回空串
 */
export function resolvePublicPath(): string {
  if (typeof document === 'undefined') return ''

  let src = ''

  // 1. 沙箱模式:主应用注入的入口 URL(new Function 执行时 currentScript 为 null)
  const sandboxEntry = (window as unknown as { __SANDBOX_ENTRY_URL__?: string })
    .__SANDBOX_ENTRY_URL__
  if (sandboxEntry) {
    src = sandboxEntry
  } else if (
    document.currentScript &&
    (document.currentScript as HTMLScriptElement).src
  ) {
    // 2. 独立模式
    src = (document.currentScript as HTMLScriptElement).src
  } else {
    // 3. 回退:取最后一个 <script> 标签
    const scripts = document.getElementsByTagName('script')
    const last = scripts[scripts.length - 1]
    if (last && last.src) src = last.src
  }

  if (src) {
    // 剥掉文件名 + js/ 目录得 origin 根,避免与 chunk 名中的 js/ 双重拼接
    return src.replace(/[^/]+\/[^/]*$/, '')
  }
  return ''
}

/**
 * 直接设置 __webpack_public_path__
 * 适用于源码被宿主 webpack 直接编译的场景;子应用(UMD 产物)应改用
 * resolvePublicPath() 并在自身源码赋值。
 */
export function setupPublicPath(): void {
  const p = resolvePublicPath()
  if (p) {
    __webpack_public_path__ = p
  }
}
