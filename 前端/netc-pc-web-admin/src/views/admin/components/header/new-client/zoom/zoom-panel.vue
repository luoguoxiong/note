<template>
  <div class="zoom-container" v-if="zoomRatio">
    {{ zoomRatio }}
  </div>
</template>

<script setup lang="ts">
/**
 * 来源: netc-pc-web/src/views/new-client/zoom/zoom-panel.vue
 * 迁移说明:
 *  - Options API -> <script setup lang="ts">
 *  - this.$native.getZoom/switchZoom/isKuaShenClientMode -> @/native/electron 同名方法
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { getZoom, isKuaShenClientMode, switchZoom } from '@/native/electron'

defineOptions({ name: 'ZoomPanel' })

const props = withDefaults(defineProps<{ needWheel?: boolean }>(), {
  needWheel: false,
})

const zoomRatio = ref<string | null>('')
let timer: ReturnType<typeof setTimeout> | null = null

const showZoomPanel = (zoom: any) => {
  console.log('zoom-panel', zoom)
  if (isKuaShenClientMode() && typeof zoom === 'string') {
    zoom = JSON.parse(zoom).data
  }
  let base = 1
  if (isKuaShenClientMode()) {
    zoom = Math.abs(zoom)
    base = 0
  }
  zoomRatio.value = (base + zoom) * 100 + '%'
  if (timer) {
    clearTimeout(timer)
  }
  timer = setTimeout(() => {
    zoomRatio.value = null
  }, 2000)
}

// 监听鼠标和ctr
const wheelHandler = (event: WheelEvent) => {
  if (event?.ctrlKey) {
    if (event?.deltaY > 0) {
      controlZoom('decrease')
    } else {
      controlZoom('add')
    }
  }
}

const listenMouse = () => {
  if (!props.needWheel) {
    return
  }
  window.addEventListener('wheel', wheelHandler)
}

// 控制缩放
const controlZoom = async (operate: string) => {
  try {
    await switchZoom(operate)
    let res = await getZoom()
    if (res && typeof res === 'object') {
      res = JSON.stringify(res)
      showZoomPanel(res)
    }
  } catch (e) {
    console.warn(e)
  }
}

onMounted(() => {
  window.showZoomPanel = showZoomPanel
  listenMouse()
})

onBeforeUnmount(() => {
  window.removeEventListener('wheel', wheelHandler)
})
</script>

<style scoped>
.zoom-container {
  width: 116px;
  height: 54px;
  text-align: center;
  line-height: 54px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  box-shadow: 0px 9px 28px 8px rgba(0, 0, 0, 0.05), 0px 6px 16px 0px rgba(0, 0, 0, 0.08),
    0px 3px 6px -4px rgba(0, 0, 0, 0.12);
  color: #03050d;
  font-weight: 600;
  font-size: 20px;
  position: fixed;
  right: 20px;
  top: 56px;
  z-index: 99999;
}
</style>
