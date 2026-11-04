<template>
  <view
    class="exit-activity-drag-button"
    :style="{ right: position.x + 'px', top: position.y + 'px' }"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <div class="exit-container flex-center" :class="active ? '' : 'data-active'">
      <SvgIcon
        @click="toggleActive"
        class="icon-arrow mr-12"
        :name="'right-arrow'"
        :class="active ? '' : 'data-active'"
      />
      <view v-if="active" @click="exit" class="text-exit font-level5">退出活动</view>
    </div>
  </view>
</template>
<script setup lang="ts">
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { ref } from 'vue'
import { showDialog } from '@ky-miniui-lib/ky-miniui-lib'
import { isWxMiniApp } from '@/public/utils'
const active = ref(true)

const props = withDefaults(defineProps<{ themeName?: string }>(), { themeName: '当前下单页' })

const defaultTop = isWxMiniApp ? 100 : 26
// 初始位置（x 固定，y 可变）
const position = ref({ x: 0, y: defaultTop })
let startY = 0
let currentY = 0
let isDragging = false
const maxHeight = 1000

const handleTouchStart = (e) => {
  const touch = e.touches[0]
  startY = touch.clientY
  currentY = position.value.y
  isDragging = true
}

const handleTouchMove = (e) => {
  if (!isDragging) return

  const touch = e.touches[0]
  const deltaY = touch.clientY - startY
  let newY = currentY + deltaY

  // 限制按钮在屏幕内（只上下）
  const maxY = maxHeight - 60 // 按钮高度

  newY = Math.max(0, Math.min(newY, maxY))

  position.value = {
    x: position.value.x, // x 固定不变
    y: newY,
  }
}

const handleTouchEnd = () => {
  isDragging = false
}

const emit = defineEmits<{ (event: 'exit'): void }>()

const toggleActive = () => (active.value = !active.value)

/**
 * @description 退出活动弹窗。点残忍离开退出活动，点继续下单关闭dialog
 */
const exit = async () => {
  try {
    await showDialog({
      parentClassName: 'exit-activity-drag-button', // 就近的根节点class
      title: '温馨提示',
      message: `您确认要离开【${props.themeName}】吗？`,
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: '残忍离开',
      confirmButtonText: '继续下单',
      zIndex: 1000,
      cancel: () => {
        console.log(11)
      },
      confirm: () => {
        console.log(22)
      },
    })
  } catch (error) {
    emit('exit')
  }
}
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
