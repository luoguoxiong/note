<template>
  <ky-popover v-if="visible" v-model:show="show" ref="popoverRef" listenClickId="order-page" animation="bounce">
    <template #content v-if="contentText">
      <view style="max-width: 300px"> {{ contentText }} </view>
    </template>
  </ky-popover>
</template>
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useGlobalPopover } from './hooks/useUpdate'
const { currentBubbleConfig, show, popoverRef } = useGlobalPopover()
const contentText = ref('')
const popoverRefOld = ref(null)

const props = withDefaults(defineProps<{ visible: boolean }>(), {
  visible: true,
})

watch(currentBubbleConfig, (newVal) => {
  showPopover(newVal)
})
const showPopover = (popoverConfig: any) => {
  if (!popoverConfig || !props.visible) {
    return
  }
  const { content } = popoverConfig
  contentText.value = content
  if (!popoverRef.value) {
    popoverRef.value = popoverRefOld.value
  }
  // console.log('气泡发生变化', contentText.value)
  // if (timer.value) {
  //   clearTimeout(timer.value)
  // }
  // show.value = true
  // console.log('测试数据123', test.value, popoverRef.value)
  // if (showPopover) {
  //   return
  // }
}
onMounted(() => {
  // 对于单票，每个页面的气泡，都缓存了2份ref
  // 当一层一层进入的再退出来的时候，都是使用的popoverRefOld.value这份去获取的气泡实例（页面退出会销毁最新的单例popoverRef)
  // 但是当在返程的时候，在返程单页面进入到其他页面时候，已经更新了popoverRef.value为去程单的实例。但是当回退的时候popoverRef.value并没有销毁。导致在返程获取的是去程单的实例。气泡展示不出来
  // popoverRef.value为什么没有销毁，可能在返程的下面已经有了一层去程单页面了
  popoverRefOld.value = popoverRef.value
})
</script>

<style scoped lang="scss"></style>
