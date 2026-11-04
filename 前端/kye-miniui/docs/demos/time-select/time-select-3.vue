<template>
  <view class="time-select-demo">
    <view class="desc">
      模拟首次进入数据为空，点击「重新加载」后延迟获取数据
    </view>

    <view class="item">
      <view class="label">精确时间选择（reload 示例）</view>
      <button @click="openPrecise">打开精确时间选择</button>
      <view v-if="preciseVal" class="result">已选：{{ preciseVal }}</view>
    </view>

    <view class="item">
      <view class="label">时间段选择（reload 示例）</view>
      <button @click="openRange">打开时间段选择</button>
      <view v-if="rangeVal" class="result">已选：{{ rangeVal }}</view>
    </view>

    <ky-time-select
      ref="timeSelectRef"
      :choosable-times="choosableTimes"
      @precise-confirm="onPreciseConfirm"
      @range-confirm="onRangeConfirm"
      @precise-reload="onPreciseReload"
      @range-reload="onRangeReload"
    />
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import timeData from './time.json'

/** 补零 */
const pad = (n: number) => String(n).padStart(2, '0')

/** 格式化 Date → YYYY-MM-DD */
const formatDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

/** 格式化 Date → HH:mm */
const formatTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`

const timeSelectRef = ref()

// 初始为空数据，模拟第一次进入接口异常的情况
const choosableTimes = ref<any[]>([])

const preciseVal = ref('')
const rangeVal = ref('')

const preciseSelectedTime = ref<Date | null>(null)
const rangeSelectedStartTime = ref<Date | null>(null)
const rangeSelectedEndTime = ref<Date | null>(null)

const openPrecise = () => {
  const time = preciseSelectedTime.value || '2026-07-10 10:00'
  timeSelectRef.value?.openPreciseDialog(time)
}

const openRange = () => {
  const startTime = rangeSelectedStartTime.value || ''
  const endTime = rangeSelectedEndTime.value || ''
  timeSelectRef.value?.openRangeDialog({ startTime, endTime })
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

/** 精确时间重新加载：模拟接口请求，1.5秒后返回数据 */
const onPreciseReload = (done: () => void) => {
  console.log('[demo] 精确时间重新加载中...')
  setTimeout(() => {
    choosableTimes.value = timeData.choosableTimes
    console.log('[demo] 精确时间数据加载完成')
    done()
  }, 1500)
}

/** 时间段重新加载：模拟接口请求，1.5秒后返回数据 */
const onRangeReload = (done: () => void) => {
  console.log('[demo] 时间段重新加载中...')
  setTimeout(() => {
    choosableTimes.value = timeData.choosableTimes
    console.log('[demo] 时间段数据加载完成')
    done()
  }, 1500)
}
</script>

<style scoped lang="scss">
.time-select-demo {
  padding: 16px;

  .desc {
    font-size: 13px;
    color: #999;
    margin-bottom: 16px;
    padding: 12px;
    background: #f5f7fa;
    border-radius: 8px;
    line-height: 1.6;
  }

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
