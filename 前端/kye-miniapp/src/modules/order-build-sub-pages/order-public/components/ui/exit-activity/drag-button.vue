<template>
  <view
    class="drag-button"
    :style="{ right: position.x + 'px', top: position.y + 'px' }"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <slot>
      <text>退出活动</text>
    </slot>
  </view>
</template>

<script setup>
import { ref } from 'vue'

// 初始位置（x 固定，y 可变）
const position = ref({ x: 10, y: 60 })
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
    y: newY
  }
}

const handleTouchEnd = () => {
  isDragging = false
}
</script>

<style>
.drag-button {
  position: fixed;
  z-index: 9999;
  width: 160px;
  height: 60px;
  background-color: #07c160;
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
</style>