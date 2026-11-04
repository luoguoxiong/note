/**
 * 弹窗退场缩放动画
 *
 * 旧实现：netc-pc-web/src/components/ky-message-popup/animation.js
 * 适配 element-plus：`.v-modal` → `.el-overlay`；移除 activeMenuHandle 外部菜单展开回调。
 *
 * 用途：精准通知场景下，关闭弹窗时缩放退场并定位到锚点菜单（`.kystyle-pointer`）。
 */

const ANIMATION_DURATION = 800 // ms

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** 向上查找遮罩层（element-plus 用 .el-overlay；旧 element-ui 用 .v-modal） */
function findOverlay(container: any): any {
  let parent = container?.parentElement
  while (parent) {
    const overlay = parent.querySelector('.el-overlay') || parent.querySelector('.v-modal')
    if (overlay) return overlay
    parent = parent.parentElement
  }
  return null
}

/** 获取锚点 rect，若不在视口则滚动到可视区域后再取 */
async function getAnchorRectInViewport(): Promise<DOMRect | null> {
  const anchor = document.querySelector<HTMLElement>('.kystyle-pointer')
  if (!anchor) return null

  const windowHeight = window.innerHeight || document.documentElement.clientHeight
  const windowWidth = window.innerWidth || document.documentElement.clientWidth
  let rect = anchor.getBoundingClientRect()
  const inViewport = rect.top > 0 && rect.left > 0 && rect.bottom < windowHeight && rect.right < windowWidth

  if (!inViewport) {
    anchor.scrollIntoView({ behavior: 'smooth' })
    await delay(80)
    rect = anchor.getBoundingClientRect()
  }
  return rect
}

/** 应用退场动画：位移 + 缩放 + 透明度 */
async function applyExitTransform(dialog: HTMLElement, rect: DOMRect): Promise<void> {
  dialog.style.transition = `all ${ANIMATION_DURATION}ms ease`
  dialog.style.left = `${rect.left + 80}px`
  dialog.style.top = `${rect.top}px`
  dialog.style.transform = 'translate(-50%, -50%) scale(0)'
  dialog.style.opacity = '0.1'
  await delay(200)

  // 二次校准位置
  const anchor = document.querySelector<HTMLElement>('.kystyle-pointer')
  const newRect = anchor?.getBoundingClientRect()
  if (newRect) {
    dialog.style.left = `${newRect.left + 80}px`
    dialog.style.top = `${newRect.top}px`
  }
  await delay(400)
}

/**
 * 对弹窗执行缩放退场动画
 * @param container 弹窗内部容器 DOM（即子弹窗 ref="container" 元素）
 */
// 参数类型用 any 绕过项目 lib.dom 重复加载导致的 HTMLElement/Element 类型冲突
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function runExitAnimation(container: any): Promise<void> {
  if (!container) return

  const overlay = findOverlay(container)
  if (!overlay) return

  const rect = await getAnchorRectInViewport()
  if (!rect) return

  const dialog = container.parentElement?.parentElement as HTMLElement | null
  if (!dialog) return

  // 隐藏遮罩，避免动画期间遮罩残留
  overlay.style.display = 'none'
  await applyExitTransform(dialog, rect)
}
