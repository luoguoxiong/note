<template>
  <view class="time-select-demo">
    <view class="item">
      <view class="label">精确时间选择</view>
      <button @click="openPrecise">打开精确时间选择</button>
      <view v-if="preciseVal" class="result">已选：{{ preciseVal }}</view>
    </view>

    <view class="item">
      <view class="label">时间段选择</view>
      <button @click="openRange">打开时间段选择</button>
      <view v-if="rangeVal" class="result">已选：{{ rangeVal }}</view>
    </view>

    <ky-precise-time-select ref="preciseRef" :choosable-times="choosableTimes" @confirm="onPreciseConfirm" />
    <ky-time-range-picker ref="rangeRef" :choosable-times="choosableTimes" @confirm="onRangeConfirm" />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { PreciseTimeSelect, TimeRangePicker } from '@ky-miniui-lib/time-select'
import timeData from './time.json'

/** 补零 */
const pad = (n: number) => String(n).padStart(2, '0')

/** 格式化 Date → YYYY-MM-DD */
const formatDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

/** 格式化 Date → HH:mm */
const formatTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`

const preciseRef = ref()
const rangeRef = ref()
const choosableTimes = timeData.choosableTimes

const preciseVal = ref('')
const rangeVal = ref('')

const preciseSelectedTime = ref<Date | null>(null)
const rangeSelectedStartTime = ref<Date | null>(null)
const rangeSelectedEndTime = ref<Date | null>(null)

const openPrecise = () => {
  const time = preciseSelectedTime.value || '2026-07-10 10:00'
  preciseRef.value?.openDialog(time)
}

const openRange = () => {
  const startTime = rangeSelectedStartTime.value || ''
  const endTime = rangeSelectedEndTime.value || ''
  rangeRef.value?.openDialog({ startTime, endTime })
}

const onPreciseConfirm = (time: Date) => {
  preciseSelectedTime.value = time
  preciseVal.value = `${formatDate(time)} ${formatTime(time)}`
}

const onRangeConfirm = ({ startTime, endTime }: { startTime: Date; endTime: Date }) => {
  rangeSelectedStartTime.value = startTime
  rangeSelectedEndTime.value = endTime
  rangeVal.value = `${formatTime(startTime)} - ${formatTime(endTime)}`
}
</script>

<style scoped lang="scss">
.time-select-demo {
  padding: 16px;

  .item {
    margin-bottom: 24px;
  }

  .label {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
  }

  .result {
    margin-top: 8px;
    font-size: 14px;
    color: #333;
  }
}
</style>
