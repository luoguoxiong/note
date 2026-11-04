<template>
  <!--
    time-select 聚合主组件：
    内部承载「精确时间选择」与「时间段选择」两个子组件，
    通过 ref 透传各自的 openDialog，并通过事件透传各自的 confirm / reload 结果。
    choosableTimes 中每项可同时包含 exactTimeRanges / matchPeriods / timeRanges，
    各子组件按需读取自身所需字段。
  -->
  <PreciseTimeSelect
    ref="preciseRef"
    :choosableTimes="preciseChoosableTimes"
    @confirm="onPreciseConfirm"
    @reload="onPreciseReload"
  />
  <TimeRangePicker
    ref="rangeRef"
    :choosableTimes="rangeChoosableTimes"
    @confirm="onRangeConfirm"
    @reload="onRangeReload"
  />
</template>

<script lang="ts" setup name="ky-time-select">
import { ref, computed } from 'vue'
import PreciseTimeSelect from './components/precise-time-select.vue'
import TimeRangePicker from './components/time-range-picker.vue'
import { TimeSelectProps } from './types'

const props = withDefaults(defineProps<TimeSelectProps>(), {
  choosableTimes: () => [],
})

const emit = defineEmits<{
  (e: 'preciseConfirm', time: Date): void
  (e: 'rangeConfirm', time: { startTime: Date; endTime: Date }): void
  (e: 'preciseReload', done: () => void): void
  (e: 'rangeReload', done: () => void): void
}>()

const preciseRef = ref()
const rangeRef = ref()

// 透传原始数据，由各子组件按需读取字段
const preciseChoosableTimes = computed(
  () => props.choosableTimes as Array<{
    date: string
    dayOfWeek: number
    exactTimeRanges: Array<{
      text: string
      hour: number
      children: Array<{ minute: number }>
    }>
  }>
)

const rangeChoosableTimes = computed(
  () => props.choosableTimes as Array<{
    date: string
    dayOfWeek: number
    matchPeriods: Array<{
      periodType: number
      startTime: string
      endTime: string
    }>
    timeRanges: Array<{
      text: string
      hour: number
      children: Array<{ minute: number }>
    }>
  }>
)

const onPreciseConfirm = (time: Date) => emit('preciseConfirm', time)
const onRangeConfirm = (time: { startTime: Date; endTime: Date }) => emit('rangeConfirm', time)
const onPreciseReload = (done: () => void) => emit('preciseReload', done)
const onRangeReload = (done: () => void) => emit('rangeReload', done)

/** 打开精确时间选择弹窗 */
const openPreciseDialog = (
  timeValue?: string | number | Date,
  exactTimeEarliestStartTime?: string | number | Date
) => {
  preciseRef.value?.openDialog(timeValue, exactTimeEarliestStartTime)
}

/** 打开时间段选择弹窗 */
const openRangeDialog = (params: {
  startTime: string | number | Date
  endTime: string | number | Date
}) => {
  rangeRef.value?.openDialog(params)
}

defineExpose({
  openPreciseDialog,
  openRangeDialog,
})
</script>
