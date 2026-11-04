<template>
  <div :style="cssVars" class="animation" v-if="showAnimation"></div>
</template>

<script setup lang="ts">
/**
 * 下载中心-新建下载任务飞入动画
 * 来源: netc-pc-web/src/views/download/download-animation.vue
 * (调用方通过 ref 调用 addDownloadTask(elementId, taskId))
 *
 * vuex -> Pinia 映射:
 *  - common/setDownloadCenterNeedUpdate    -> usePcWebCommonStore().setDownloadCenterNeedUpdate
 *  - common/setDownloadCenterTaskIdList    -> usePcWebCommonStore().setDownloadCenterTaskIdList
 */
import { computed, nextTick, ref } from 'vue'
import { usePcWebCommonStore } from '@/stores/pc-web/common'

defineOptions({ name: 'download-animation' })

const commonStore = usePcWebCommonStore()

const showAnimation = ref(false)
const left = ref('')
const top = ref('')
const targetLeft = ref('')
const targetTop = ref('')

const cssVars = computed(() => {
  return {
    '--left': left.value,
    '--top': top.value,
    '--target-left': targetLeft.value,
    '--target-top': targetTop.value,
  }
})

async function addDownloadTask(elementId: string, taskId: string | number) {
  const element = document.querySelector(`#${elementId}`)
  showAnimation.value = true
  await nextTick()
  const targetElement = document.querySelector('#download_animation')
  if (!element || !targetElement) return
  let { x, y, width } = element.getBoundingClientRect()
  x = x + Math.floor(width / 2)
  let { x: targetLeftX, y: targetTopY, width: targetWidth } = targetElement.getBoundingClientRect()
  targetLeftX = targetLeftX + Math.floor(targetWidth / 2)

  left.value = `${x}px`
  top.value = `${y}px`
  targetLeft.value = `${targetLeftX}px`
  targetTop.value = `${targetTopY}px`
  nextTick(() => {
    setTimeout(() => {
      commonStore.setDownloadCenterNeedUpdate(true)
      commonStore.setDownloadCenterTaskIdList([taskId, ...commonStore.downloadCenter.taskIdList])
    }, 850)
    setTimeout(() => {
      showAnimation.value = false
    }, 1000)
  })
}

defineExpose({ addDownloadTask })
</script>

<style scoped lang="scss">
.animation {
  width: 6px;
  height: 6px;
  background: #8365f6;
  border-radius: 50%;
  position: fixed;
  z-index: 100;
  animation: change 1s ease-in;
  animation-fill-mode: forwards;
}
@keyframes change {
  0% {
    top: var(--top);
    left: var(--left);
  }
  100% {
    top: var(--target-top);
    left: var(--target-left);
  }
}
</style>
