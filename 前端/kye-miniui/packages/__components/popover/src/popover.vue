<template>
  <view ref="targetRef" :class="['ky-popover-container', custClass]" v-if="$slots.reference" :id="targetId">
    <slot name="reference"></slot>
  </view>
  <root-portal>
    <view
      @touchstart.stop=""
      :class="[
        isShow ? enterAnimate : '',
        isLeave ? 'popover-leave-active' : '',
        'ky-popover-content',
        `ky-popover-thenme-${theme}`,
        custClass,
      ]"
      :id="popoverId"
      :style="{
        position: 'fixed',
        visibility: visible ? 'visible' : 'hidden',
        top: `${popoverPosition.top}px`,
        left: `${popoverPosition.left}px`,
      }"
    >
      <view v-if="showArrow" :class="`ky-popover-arrow ky-popover-arrow-${curLocation}`" :style="getArrowOffset"></view>
      <view :class="['ky-popover-box', custClass]">
        <slot name="content"></slot>
      </view>
    </view>
  </root-portal>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Taro from '@tarojs/taro'
import {
  PopoverProps,
  PopoverLocation,
  PopoverDirection,
  PopoverSkew,
  PopoverScreen,
  PopoverPosition,
  PopoverAnimation,
} from './types'
import { boundingClientRect, rpxToPx, miniuiConfig } from '@ky-miniui-lib/utils'
import './index.scss'

const props = withDefaults(defineProps<PopoverProps>(), {
  show: false,
  theme: 'light',
  location: 'bottom',
  offset: [0, 10],
  arrowOffset: 30,
  showArrow: true,
  listenClickId: 'ky-container',
  custClass: '',
  animation: 'fade',
})

const animationType = ref<PopoverAnimation>()

const enterAnimate = computed(() => {
  const type = animationType.value || props.animation
  return type === 'fade' ? 'popover-fadein-active' : 'popover-bounce-active '
})

const isShow = ref(false)

const isLeave = ref(false)

const curLocation = ref<PopoverLocation>() // 默认值为 'bottom'

const visible = ref(false)

const theme = ref('')

const refRandomId = Math.random().toString(36).slice(-8)

const popoverId = `popover-${refRandomId}`

const targetId = `target-${refRandomId}`

const emit = defineEmits(['update:show'])

const popoverPosition = ref({ top: 0, left: 0 })

const arrowOffset = ref(30)

const getNoOverFlowsDirction = (
  overflows: Record<PopoverDirection, boolean>,
  directions: PopoverDirection[],
  fallbackDirection: PopoverDirection,
) => {
  if (!overflows[fallbackDirection]) return fallbackDirection
  for (const dir of directions) {
    if (!overflows[dir]) {
      return dir
    }
  }
  return fallbackDirection
}

// 动态调整位置的边界检查函数
const adjustLocation = (
  direction: PopoverDirection,
  targetRect: PopoverPosition,
  popoverRect: PopoverPosition,
  screen: PopoverScreen,
  crossOffset: number,
) => {
  // 判断是否超出屏幕边界
  const overflows: Record<PopoverDirection, boolean> = {
    // 顶部是否溢出：目标元素距离顶部距离 - 气泡高度 < 0 则溢出
    top: targetRect.top - popoverRect.height - crossOffset < 0,
    // 底部是否溢出：目标元素底部距离窗口距离 + 气泡高度 > 屏幕高度，则溢出
    bottom: targetRect.bottom + popoverRect.height + crossOffset > screen.height,
    //  左侧是否溢出：目标元素距离左边距离 - 气泡宽度 < 0 则溢出
    left: targetRect.left - popoverRect.width - crossOffset < 0,
    //  右侧是否溢出： 目标元素右边距离窗口左侧距离 + 气泡宽度 > 屏幕宽度，则溢出
    right: targetRect.right + popoverRect.width + crossOffset > screen.width,
  }

  const directionMap: Record<PopoverDirection, PopoverDirection[]> = {
    top: ['bottom', 'left', 'right'],
    bottom: ['top', 'left', 'right'],
    left: ['right', 'top', 'bottom'],
    right: ['left', 'top', 'bottom'],
  }

  return getNoOverFlowsDirction(overflows, directionMap[direction], direction)
}

// 计算位置的逻辑
const calculatePosition = (
  buttonRect: PopoverPosition,
  popoverRect: PopoverPosition,
  screen: PopoverScreen,
  config: PopoverProps,
) => {
  const location = config.location
  const direction = location.split('-')[0] as PopoverDirection

  const skew = (location.split('-')[1] || '') as PopoverSkew

  let crossOffset = 0 // 垂直或水平方向的偏移量

  let parallelOffset = 0 // 平行方向的偏移量

  const offset = config.offset

  // 解构偏移量
  if (Array.isArray(offset) && offset.length === 2) {
    crossOffset = Number(offset[1]) || 0
    parallelOffset = Number(offset[0]) || 0
  }

  const adjustedLocation = adjustLocation(direction, buttonRect, popoverRect, screen, crossOffset)

  curLocation.value = [adjustedLocation, ...(skew ? [skew] : [])].join('-') as PopoverLocation

  theme.value = config.theme

  let top, left, clippedLeft

  switch (adjustedLocation) {
    case 'top':
      // 如果是 top，popover 在按钮的上方
      top = buttonRect.top - popoverRect.height - crossOffset
      if (skew === 'start') {
        // 向左偏移，使 Popover 对齐按钮的左边
        const leftCurrent = buttonRect.left + parallelOffset
        // 修正右侧安全距离
        // clippedLeft = Math.min(
        //   leftCurrent,
        //   buttonRect.left > buttonRect.width && popoverRect.width > buttonRect.width
        //     ? leftCurrent - (popoverRect.width - buttonRect.width - 10)
        //     : leftCurrent,
        // )
        left = leftCurrent
      } else if (skew === 'end') {
        // 向右偏移，使 Popover 对齐按钮的右边
        left = buttonRect.right - popoverRect.width - parallelOffset
      } else {
        // 默认居中
        left = buttonRect.left + (buttonRect.width - popoverRect.width) / 2
      }
      break

    case 'bottom':
      // 如果是 bottom，popover 在按钮的下方
      top = buttonRect.bottom + crossOffset
      if (skew === 'start') {
        // 向左偏移，使 Popover 对齐按钮的左边
        console.log('buttonRect', buttonRect, buttonRect.left, parallelOffset)
        const leftCurrent = buttonRect.left + parallelOffset
        console.log('bottom', leftCurrent)
        // 修正右侧安全距离
        // clippedLeft = Math.min(
        //   leftCurrent,
        //   buttonRect.left > buttonRect.width && popoverRect.width > buttonRect.width
        //     ? leftCurrent - (popoverRect.width - buttonRect.width - 10)
        //     : leftCurrent,
        // )
        left = leftCurrent
      } else if (skew === 'end') {
        // 向右偏移，使 Popover 对齐按钮的右边
        left = buttonRect.right - popoverRect.width - parallelOffset
      } else {
        // 默认居中
        left = buttonRect.left + (buttonRect.width - popoverRect.width) / 2
      }
      break

    case 'left':
      // 如果是 left，popover 在按钮的左侧
      left = buttonRect.left - popoverRect.width - crossOffset
      if (skew === 'start') {
        // 向上偏移，使 Popover 对齐按钮的上边
        top = buttonRect.top + parallelOffset
      } else if (skew === 'end') {
        // 向下偏移，使 Popover 对齐按钮的下边
        top = buttonRect.bottom - popoverRect.height - parallelOffset
      } else {
        top = buttonRect.top + (buttonRect.height - popoverRect.height) / 2
      }
      break

    case 'right':
      // 如果是 right，popover 在按钮的右侧
      left = buttonRect.right + crossOffset
      if (skew === 'start') {
        // 向上偏移，使 Popover 对齐按钮的上边
        top = buttonRect.top + parallelOffset
      } else if (skew === 'end') {
        // 向下偏移，使 Popover 对齐按钮的下边
        top = buttonRect.bottom - popoverRect.height - parallelOffset
      } else {
        top = buttonRect.top + (buttonRect.height - popoverRect.height) / 2
      }
      break

    default:
      // 默认 'bottom'
      top = buttonRect.bottom
      left = buttonRect.left + (buttonRect.width - popoverRect.width) / 2
  }

  // 边界修正
  if (top < 0) top = 0

  if (top + popoverRect.height > screen.height) top = screen.height - popoverRect.height

  return { top, left }
}

const getMediaInfoAndTargetPosi = (
  target: string | Taro.NodesRef,
): Promise<{
  screen: PopoverScreen | null
  targetRect: PopoverPosition | null
}> => {
  return new Promise((resolve) => {
    const query = Taro.createSelectorQuery()
    query.selectViewport().boundingClientRect()
    const isId = typeof target === 'string'
    if (isId) {
      query.select(`#${target}`).boundingClientRect()
    } else {
      target.boundingClientRect()
    }
    query.exec((res) => {
      const screen = res?.[0] || null // 屏幕信息
      const targetRect = res?.[1] || null // 按钮位置，节点未就绪时为 null
      resolve({
        screen,
        targetRect,
      })
    })
  })
}

const isRectValid = (rect: PopoverPosition | null | undefined): rect is PopoverPosition => {
  return !!rect && typeof rect.top === 'number' && typeof rect.left === 'number'
}

// 显示 Popover 的方法
const $showPopover = async (target: string | Taro.NodesRef, options: PopoverProps) => {
  if (isShow.value) return
  animationType.value = options.animation
  isShow.value = false
  isLeave.value = false

  arrowOffset.value = options.arrowOffset || 30
  options.offset = options.offset || [0, 10]

  const [{ screen, targetRect }, popoverRect] = await Promise.all([
    getMediaInfoAndTargetPosi(target),
    boundingClientRect(popoverId),
  ])

  // 节点未就绪（查询结果为 null）或参数无效时直接返回，避免解引用报错
  if (!screen || !isRectValid(targetRect) || !isRectValid(popoverRect)) return

  console.log('popover>>adjustedLocation', targetRect, popoverRect)
  popoverPosition.value = calculatePosition(targetRect, popoverRect, screen, options)
  console.log('popover>>popoverPosition', popoverPosition.value)
  visible.value = true
  isShow.value = true
}

const showPopover = (selfTargetId: string, options: PopoverProps) => {
  animationType.value = options.animation
  $showPopover(selfTargetId || props.targetId || targetId, {
    ...props,
    ...options,
  })
}

const closeTimer: number | null = null
// 关闭 Popover 的方法
const closePopover = () => {
  isLeave.value = true
  isShow.value = false
  closeTimer && clearTimeout(closeTimer)
  // closeTimer = setTimeout(() => {
  emit('update:show', false)
  visible.value = false
  isLeave.value = false
  // }, 150) as any
}

const getArrowOffset = computed(() => {
  const { isH5Pc } = miniuiConfig.config
  const offset = isH5Pc ? arrowOffset.value / 2 : rpxToPx(arrowOffset.value)
  if (curLocation.value === 'top-start' || curLocation.value === 'bottom-start') {
    return {
      left: offset + 'px',
    }
  }
  if (curLocation.value === 'top-end' || curLocation.value === 'bottom-end') {
    return {
      right: offset + 'px',
    }
  }
  if (curLocation.value === 'left-start' || curLocation.value === 'right-start') {
    return {
      top: offset + 'px',
    }
  }
  if (curLocation.value === 'left-end' || curLocation.value === 'right-end') {
    return {
      bottom: offset + 'px',
    }
  }
  return {}
})

const clickIsInside = (event: any, eleIds: string[]) => {
  const { clientX, clientY } = event.touches ? event.touches[0] : event
  for (let i = 0; i < eleIds.length; i++) {
    const element = Taro.createSelectorQuery().select(`#${eleIds[i]}`)
    element.boundingClientRect().exec((rect: any) => {
      const { left, top, right, bottom } = rect
      // 判断点击位置是否在元素的范围内
      if (clientX >= left && clientX <= right && clientY >= top && clientY <= bottom) {
        return true
      } else {
        closePopover()
      }
    })
  }

  return false // 点击不在任何元素范围内
}

// 触摸开始事件处理
const handleTouchStart = (event: any) => {
  if (!isShow.value) return
  const eles = [popoverId]
  clickIsInside(event, eles)
}

const listenGloablClick = () => {
  const listenClickId = document.getElementById(props.listenClickId)
  if (!listenClickId) {
    console.error('请设置有效的listenClickId属性')
    return
  }
  listenClickId?.addEventListener('touchstart', handleTouchStart)
}

// let timer: number | null = null
// 监听show，展示则计算位置，设置容器位置
watch(
  () => props.show,
  async () => {
    // timer && clearTimeout(timer)
    if (props.show) {
      isLeave.value = false
      showPopover(props.targetId || targetId, {
        ...props,
      })
    } else {
      isShow.value = false
      isLeave.value = true
      // timer = setTimeout(() => {
      visible.value = false
      // }, 150) as any
    }
  },
)

onMounted(() => {
  Taro.nextTick(async () => {
    listenGloablClick()
    if (props.show) {
      $showPopover(props.targetId || targetId, {
        ...props,
      })
    }
  })
})

onBeforeUnmount(() => {
  const listenClickId = document.getElementById(props.listenClickId)
  listenClickId?.removeEventListener('touchstart', handleTouchStart)
})

defineExpose({
  showPopover,
  closePopover,
})
</script>
