import { ref, reactive, onMounted, Ref } from 'vue'
import { DragTypes } from './types'

// touch状态
const touching = ref(false)

// 垂直方向
const vertical = ref(false)

// 是否可以超出
const exceed = ref(true)

// 限制高度
const maxHeight = ref(0)

// 初始化的left、top
const initX = ref<number>(0)
const initY = ref<number>(0)

// 过程中的left、top
const currentX = ref<number>(0)
const currentY = ref<number>(0)

// 最终要修改的left、top
const elementLeft = ref<number>(0)
const elementTop = ref<number>(0)

// 坐标
const position = reactive({ x: 0, y: 0 })

// const touchMoveListener = (event: MouseEvent | TouchEvent) => {
//   event.preventDefault()
// }

/**
 * @description 拖拽移动事件
 * @param element
 * @param event
 */
const handleMouseMove = (element: Ref<HTMLElement | null>, event: MouseEvent | TouchEvent) => {
  if (!element.value) {
    return
  }
  let touch: Touch | MouseEvent
  if ('touches' in event) {
    touch = event.touches[0]
  } else {
    touch = event
  }

  // 此时添加事件禁用默认全局滚动
  // document.addEventListener('touchmove', touchMoveListener, { passive: false })

  if (!vertical.value) {
    currentX.value = touch.clientX - position.x
  }

  currentY.value = touch.clientY - position.y

  if (!vertical.value) {
    elementLeft.value = initX.value + currentX.value
  }

  elementTop.value = initY.value + currentY.value

  // 不能超出屏幕
  if (!exceed.value) {
    const { clientHeight, clientWidth } = document.documentElement

    if (elementLeft.value < 0) {
      elementLeft.value = 0
    }

    if (elementTop.value < 0) {
      elementTop.value = 0
    }

    const currentDom = element.value.children[0]

    if (elementLeft.value > clientWidth - currentDom?.clientWidth) {
      elementLeft.value = clientWidth - currentDom?.clientWidth
    }

    if (elementTop.value >= clientHeight - currentDom?.clientHeight) {
      elementTop.value = clientHeight - currentDom?.clientHeight
    }
  }

  // 限制高度
  if (elementTop.value !== 0 && elementTop.value > maxHeight.value) {
    elementTop.value = maxHeight.value
  }

  if (!vertical.value) {
    element.value.style.left = `${elementLeft.value}px`
  }

  element.value.style.top = `${elementTop.value}px`
}

/**
 * @description 拖拽hook，同时支持网页和移动端
 * @param selector
 */
export const useDrag = (selector: string, props: DragTypes) => {
  const element = ref<HTMLElement | null>(null)

  vertical.value = props.vertical ?? false
  exceed.value = props.exceed ?? true
  maxHeight.value = props.maxHeight ?? 0

  onMounted(() => (element.value = document.querySelector(selector)))

  /**
   * @description 按下鼠标或者手指
   * @param event
   */
  const down = (event: MouseEvent | TouchEvent) => {
    if (!element.value) {
      return
    }
    touching.value = true
    let touch: Touch | MouseEvent
    if ('touches' in event) {
      touch = event.touches[0]
    } else {
      touch = event
    }

    position.x = touch.clientX
    position.y = touch.clientY

    initX.value = element.value.offsetLeft
    initY.value = element.value.offsetTop
  }

  /**
   * @description 移动或者拖拽
   * @param event
   */
  const move = (event: MouseEvent | TouchEvent) => {
    if (!touching.value) {
      return
    }

    // 优化动画性能
    requestAnimationFrame(() => {
      handleMouseMove(element, event)
    })
  }

  /**
   * @description 结束移动或者拖拽
   */
  const end = () => {
    touching.value = false
    // 恢复全局滚动
    // document.removeEventListener('touchmove', touchMoveListener)
  }

  return {
    move,
    down,
    end,
  }
}
