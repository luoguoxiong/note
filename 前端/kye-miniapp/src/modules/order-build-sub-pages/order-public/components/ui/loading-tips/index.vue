<template>
  <div class="dialog-overlay" @click="handleclickMask"></div>
</template>
<script setup lang="ts">
import { onUnmounted } from 'vue'
import { showToast } from '@order-public-sub-public/hooks/useShowToast'
import { LoadingTipsOptions } from '@order-public-sub-public/components/ui/loading-tips/types'

const props = defineProps<LoadingTipsOptions>()
const handleclickMask = () => {
  console.log('点击了遮罩')
  showToast(props.text || '运单正在提交中')
}

onUnmounted(() => {
  console.log('组件销毁了')
  props.close()
})
</script>
<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
