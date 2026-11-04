/**
 * 客户端更新下载动画
 * 来源: netc-pc-web/src/components/create-download-task-animation/{commonManager.js,common-animation.vue}
 *
 * 老项目通过 Vue.extend 动态挂载动画组件; 此处用纯 DOM 复刻相同的
 * 容器结构/CSS/keyframes/时序(目标锚点 #download_animation 由入口 index.vue 渲染)
 */

interface PlayOptions {
  /** 动画终点(不传则取 #download_animation 元素中心) */
  targetPosition?: { top: number; left: number }
  /** 动画起点元素矩形(不传则屏幕中心) */
  eventTargetRect?: { top: number; left: number }
  scale?: number
  iconUrl?: string
  duration?: number
}

interface KeyframesOptions {
  startTop: string
  startRight: string
  targetTop: string
  targetRight: string
  scale: number
}

const DEFAULT_ICON_URL = 'https://ic-img.ky-express.com/netc/20230521_89263213439_!!1684660138184_291_220.png'

const CONTAINER_CSS = `.download-task-animation-container {
  width: 145px;
  height: 110px;
  background-size: contain;
  background-repeat: no-repeat;
  position: fixed;
  transform: translate(50%, -50%) scale(0);
  z-index: 99999;
  opacity: 0;
  display: none;
}
.download-task-animation-container.animation {
  display: block;
  animation: move 2s linear;
}`

// 旧壳不支持 css var()，需动态生成关键帧样式
const createKeyframesCss = ({ startTop, startRight, targetTop, targetRight, scale }: KeyframesOptions) => {
  return `@keyframes move {
    10% {
      -webkit-transform: translate(50%, -50%) scale(${scale});
      transform: translate(50%, -50%) scale(${scale});
      top: ${startTop};
      right: ${startRight};
      opacity: 1;
    }
    40% {
      -webkit-transform: translate(50%, -50%) scale(${scale});
      transform: translate(50%, -50%) scale(${scale});
      top: ${startTop};
      right: ${startRight};
      opacity: 1;
    }
    100% {
      top: ${targetTop};
      right: ${targetRight};
      -webkit-transform: translate(50%, -50%) scale(0.1);
      transform: translate(50%, -50%) scale(0.1);
      opacity: 0.1;
    }
  }`
}

/** 播放下载动画(等价旧 commonManager.play) */
export const play = async (data: PlayOptions = {}): Promise<void> => {
  const duration = data.duration ?? 1500
  const iconUrl = data.iconUrl ?? DEFAULT_ICON_URL

  const targetElement = document.querySelector('#download_animation')
  const { width: bodyWidth } = document.body.getBoundingClientRect()
  if (!targetElement) return

  let targetTop = ''
  let targetRight = ''
  if (data.targetPosition) {
    const { top, left } = data.targetPosition
    targetTop = `${top}px`
    targetRight = `${left}px`
  } else {
    const {
      left: targetLeftOrigin,
      top: rectTop,
      width: targetWidth,
      height: targetHeight,
    } = targetElement.getBoundingClientRect()
    const targetLeft = targetLeftOrigin + Math.floor(targetWidth / 2)
    targetTop = `${rectTop + targetHeight / 2}px`
    targetRight = `${bodyWidth - targetLeft}px`
  }

  let startPosition = { startTop: '50%', startRight: '50%' }
  let scale = 1
  if (data.eventTargetRect) {
    // 指定开始位置
    startPosition = {
      startTop: `${data.eventTargetRect.top}px`,
      startRight: `${bodyWidth - data.eventTargetRect.left}px`,
    }
    scale = data.scale || 0.3
  }

  const style = document.createElement('style')
  style.type = 'text/css'
  style.id = 'download-task-animation'
  style.innerHTML = `${CONTAINER_CSS}\n${createKeyframesCss({
    ...startPosition,
    targetTop,
    targetRight,
    scale,
  })}`
  document.head.appendChild(style)

  const container = document.createElement('div')
  container.className = 'download-task-animation-container'
  container.style.backgroundImage = `url('${iconUrl}')`
  container.style.animationDuration = `${duration}ms`
  document.body.appendChild(container)

  // 等待样式生效(旧实现 nextTick + 50ms)
  await new Promise((resolve) => setTimeout(resolve, 50))
  container.classList.add('animation')

  return new Promise((resolve) => {
    setTimeout(() => {
      container.classList.remove('animation')
      document.body.removeChild(container)
      document.head.removeChild(style)
      resolve()
    }, duration + 100)
  })
}
