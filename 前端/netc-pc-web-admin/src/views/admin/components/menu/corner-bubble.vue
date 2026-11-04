<template>
  <!-- 锚点：菜单项右上角小红点（无角标数据时不渲染） -->
  <span v-if="corner" ref="anchorRef" class="menu-corner menu-corner--40"><span class="menu-corner__dot"></span></span>
  <!-- 气泡浮层：fixed 定位贴锚点右侧，挂 body 不被侧边栏裁剪 -->
  <Teleport to="body">
    <div v-if="corner && visible" class="menu-corner-bubble" :style="bubbleStyle">
      <span class="menu-corner-bubble__arrow"></span>
      <span class="menu-corner-bubble__text">{{ content }}</span>
      <el-icon class="menu-corner-bubble__close" @click="emit('close', corner)">
        <Close />
      </el-icon>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { Close } from '@element-plus/icons-vue'
import type { CornerItem } from '@/apis/corner/types'

const props = defineProps<{ corner?: CornerItem }>()
const emit = defineEmits<{ (e: 'close', corner: CornerItem): void }>()

const BUBBLE_HEIGHT = 38
const GAP = 10

const anchorRef = ref<HTMLElement>()
const visible = ref(false)
const pos = ref({ top: 0, left: 0 })

const content = computed(() => props.corner?.content || '')

const update = () => {
  const rect = anchorRef.value?.getBoundingClientRect()
  // 锚点不可见（所在子菜单收起 display:none / 折叠态）时隐藏气泡，避免落在 (0,0)
  if (!rect || rect.width === 0 || rect.height === 0) {
    visible.value = false
    return
  }
  pos.value = {
    top: rect.top + rect.height / 2 - BUBBLE_HEIGHT / 2,
    left: rect.right + GAP,
  }
  visible.value = true
}

let resizeObserver: ResizeObserver | null = null

const startObserve = async () => {
  await nextTick()
  if (anchorRef.value && typeof ResizeObserver !== 'undefined') {
    resizeObserver?.disconnect()
    resizeObserver = new ResizeObserver(update)
    resizeObserver.observe(anchorRef.value)
  }
  update()
}

onMounted(() => {
  startObserve()
  // 跟随侧边栏滚动与窗口尺寸变化（capture 捕获内部滚动容器）
  document.addEventListener('scroll', update, true)
  window.addEventListener('resize', update)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  document.removeEventListener('scroll', update, true)
  window.removeEventListener('resize', update)
})

const bubbleStyle = computed(() => ({ top: `${pos.value.top}px`, left: `${pos.value.left}px` }))
</script>
