<template>
  <view :class="[transitionClass, ...(customerClass || [])]" :style="transitionStyle">
    <slot v-if="realVisible || !hideNode" />
  </view>
</template>

<script setup lang="ts">
import { ref, defineProps, watch, onBeforeUnmount, onMounted, computed } from 'vue'
import { TransitionProps } from './types'

const props = withDefaults(defineProps<TransitionProps>(), {
  show: false,
  hideNode: true,
  duration: 300,
})

const activeDuation = ref(0)

const transitionClass = ref('')

const transitionT = ref<number>(0)

const status = ref('')

const realVisible = ref(false)

const customDuration = ref(false)

const transitionClassMap = {
  enter: `${props.name}-enter`,
  enterTo: `${props.name}-enter-to`,
  leave: `${props.name}-leave`,
  leaveTo: `${props.name}-leave-to`,
}

const transitionStyle = computed(() => {
  return [
    realVisible.value ? {} : { display: 'none' },
    { transition: `all ${(activeDuation.value / 1000).toFixed(1)}s ease` },
    props.customerStyle,
  ]
})

// 监听属性变化，动画逻辑处理
watch(
  () => props.show,
  (newVal: boolean) => {
    clearTimeout(transitionT.value)
    if (newVal) {
      enter()
    } else {
      leave()
    }
  },
)

// 初始化动画执行
onMounted(() => {
  if (props.show) {
    enter()
  }
})

onBeforeUnmount(() => {
  clearTimeout(transitionT.value)
})

// 获取动画周期
function getDurations() {
  const { duration } = props
  if (Array.isArray(duration)) {
    return duration.map((item) => Number(item))
  }
  return [Number(duration), Number(duration)]
}

// 进入后
function entered() {
  customDuration.value = false
  clearTimeout(transitionT.value)
  status.value = 'entered'
  transitionClass.value = ''
}

// 进入动画
function enter() {
  const [duration] = getDurations()
  if (duration === 0) {
    transitionClass.value = transitionClassMap.enterTo
    realVisible.value = true
    return
  }
  activeDuation.value = duration
  status.value = 'entering'
  realVisible.value = true
  transitionClass.value = transitionClassMap.enter

  setTimeout(() => {
    transitionClass.value = transitionClassMap.enterTo
    if (typeof duration === 'number' && duration > 0) {
      transitionT.value = setTimeout(entered, duration)
    }
  }, 60)
}

// 离开后逻辑处理
function leaved() {
  customDuration.value = false
  clearTimeout(transitionT.value)
  status.value = transitionClassMap.leave
  transitionClass.value = ''
  realVisible.value = false
}

// 离开时逻辑处理
function leave() {
  const [, duration] = getDurations()

  if (duration === 0) {
    transitionClass.value = transitionClassMap.leaveTo
    realVisible.value = false
    return
  }

  status.value = 'leaving'

  transitionClass.value = transitionClassMap.leave

  activeDuation.value = duration
  clearTimeout(transitionT.value)
  setTimeout(() => {
    transitionClass.value = transitionClassMap.leaveTo
    if (typeof duration === 'number' && duration > 0) {
      customDuration.value = true
      transitionT.value = setTimeout(leaved, duration)
    }
  }, 60)
}
</script>
