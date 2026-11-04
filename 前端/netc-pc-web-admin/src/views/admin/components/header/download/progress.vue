<template>
  <div class="progress-td">
    <el-progress
      class="progress"
      :show-text="false"
      :color="getElProgressColor"
      :percentage="currentPercentage"
      :class="{ 'my-progress': taskStatus === 3 }"
    ></el-progress>
    <p class="intro intro-8C8F99" v-if="isShowInitText">等待压缩中</p>
    <p class="intro intro-2AB002" v-else-if="isShowCompressingText">压缩中，已完成{{ currentPercentage }}%</p>
    <p class="intro intro-f73f31" v-else>
      压缩失败，
      <span class="intro-retry" @click="emit('onRetry')">点击重试</span>
    </p>
  </div>
</template>

<script setup lang="ts">
/**
 * 下载中心-压缩进度条(卡片列表内使用)
 * 来源: netc-pc-web/src/views/download/progress.vue (2026-09 同步最新版)
 * 变化: 文案/颜色对齐最新版, 失败态提供「点击重试」(emit onRetry, 由宿主调用重试接口)
 * (inject timeDuration 由入口 index.vue provide)
 */
import { computed, inject, ref, watch } from 'vue'
import { TASK_STATUS_VAL } from './consts'

const props = withDefaults(
  defineProps<{
    percentage?: number
    taskStatus?: number
  }>(),
  {
    percentage: 0,
    taskStatus: TASK_STATUS_VAL.INIT,
  }
)

const emit = defineEmits<{
  (e: 'onRetry'): void
}>()

const timeDuration = inject<number>('timeDuration', 0)

const currentPercentage = ref(0)
const targetPercentage = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

// 进度条颜色: 失败红 / 压缩中绿 / 初始灰(轨道色由样式控制)
const getElProgressColor = computed(() => {
  if (props.taskStatus === TASK_STATUS_VAL.COMPRESS_FAIL) {
    return '#F73F31'
  }
  if (props.taskStatus === TASK_STATUS_VAL.COMPRESSING) {
    return '#3AC203'
  }
  return '#F2F3F7'
})

const isShowInitText = computed(() => {
  return [TASK_STATUS_VAL.INIT].includes(props.taskStatus) ? true : false
})

const isShowCompressingText = computed(() => {
  return [TASK_STATUS_VAL.COMPRESSING].includes(props.taskStatus) ? true : false
})

watch(
  () => props.percentage,
  (newVal, oldVal) => {
    if (newVal !== oldVal) {
      percentageHandle(newVal)
    }
  }
)

function percentageHandle(percentage: number) {
  targetPercentage.value = percentage
  const diff = percentage - currentPercentage.value
  const duration = timeDuration
  const minDuration = 100
  let step = 1
  let t = Math.ceil((duration / diff) * step)
  if (t < minDuration) {
    t = minDuration
    step = Math.ceil(t / (duration / diff))
  }
  timer = setInterval(() => {
    if (currentPercentage.value + step > targetPercentage.value) {
      return clearInterval(timer)
    }
    if (currentPercentage.value + step >= 100) {
      currentPercentage.value = 100
      return clearInterval(timer)
    }
    currentPercentage.value += step
  }, t)
}

percentageHandle(props.percentage)
</script>

<style scoped lang="scss">
.intro {
  font-size: 12px;
  line-height: 16px;
  letter-spacing: 0em;
  font-weight: 600;
}
.intro-8C8F99 {
  color: #8c8f99;
}
.intro-f73f31 {
  color: #f73f31;
}
.intro-2AB002 {
  color: #2ab002;
}
.intro-retry {
  font-size: 12px;
  color: #7143f0;
  padding: 2px 1px;
  cursor: pointer;
  &:hover {
    background: rgba(36, 38, 43, 0.06);
  }
  &:focus {
    background: rgba(36, 38, 43, 0.08);
  }
}
.progress {
  width: 60px;
  margin-right: 8px;
}
.progress-td {
  display: flex;
  align-items: center;
  height: 44px;
  box-sizing: border-box;
  :deep(.el-progress.is-success .el-progress-bar__inner) {
    background-color: #41c381;
  }
}
.my-progress {
  :deep(.el-progress-bar__outer) {
    background: #feeeec !important; /* 失败态轨道背景色 */
  }
}
</style>
