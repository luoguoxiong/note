<template>
  <view class="calendar-demo demo-container">
    <view class="demo-header">
      <view class="header-title">Calendar 日历</view>
      <view class="header-subtitle">多种日期选择模式示例</view>
    </view>

    <view class="demo-content">
      <view class="card">
        <view class="card-header">
          <view class="card-icon">📅</view>
          <view class="card-title">单选模式</view>
        </view>
        <view class="card-body">
          <view class="calendar-item">
            <view class="calendar-label">基础单选</view>
            <view class="calendar-value">选择日期: {{ singleDate }}</view>
            <ky-button type="primary" size="mini" @click="showSingle = true">选择</ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🔄</view>
          <view class="card-title">范围选择</view>
        </view>
        <view class="card-body">
          <view class="calendar-item">
            <view class="calendar-label">日期范围</view>
            <view class="calendar-value"> {{ rangeDate[0] || '开始日期' }} - {{ rangeDate[1] || '结束日期' }} </view>
            <ky-button type="primary" size="mini" @click="showRange = true">选择</ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">✨</view>
          <view class="card-title">快捷选项</view>
        </view>
        <view class="card-body">
          <view class="calendar-item">
            <view class="calendar-label">带快捷选项</view>
            <view class="calendar-value"> {{ quickDate[0] || '开始日期' }} - {{ quickDate[1] || '结束日期' }} </view>
            <ky-button type="primary" size="mini" @click="showQuick = true">选择</ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📆</view>
          <view class="card-title">多选模式</view>
        </view>
        <view class="card-body">
          <view class="calendar-item">
            <view class="calendar-label">多选日期</view>
            <view class="calendar-value">{{ multipleDates.join(', ') || '请选择日期' }}</view>
            <ky-button type="primary" size="mini" @click="showMultiple = true">选择</ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📊</view>
          <view class="card-title">周选择</view>
        </view>
        <view class="card-body">
          <view class="calendar-item">
            <view class="calendar-label">选择周</view>
            <view class="calendar-value"> {{ weekDate[0] || '周一' }} - {{ weekDate[1] || '周日' }} </view>
            <ky-button type="primary" size="mini" @click="showWeek = true">选择</ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🔒</view>
          <view class="card-title">禁用日期</view>
        </view>
        <view class="card-body">
          <view class="calendar-item">
            <view class="calendar-label">部分日期禁用</view>
            <view class="calendar-value">选择日期: {{ disabledDateValue }}</view>
            <ky-button type="primary" size="mini" @click="showDisabled = true">选择</ky-button>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎨</view>
          <view class="card-title">自定义配置</view>
        </view>
        <view class="card-body">
          <view class="calendar-item">
            <view class="calendar-label">自定义标题</view>
            <view class="calendar-value">选择日期: {{ customTitleDate }}</view>
            <ky-button type="primary" size="mini" @click="showCustom = true">选择</ky-button>
          </view>
        </view>
      </view>
    </view>

    <ky-calendar
      v-model:show="showSingle"
      type="single"
      :popupable="true"
      :is-auto-back-fill="false"
      @confirm="onSingleConfirm"
    ></ky-calendar>

    <ky-calendar
      v-model:show="showRange"
      type="range"
      :popupable="true"
      :allowSameDay="true"
      :is-auto-back-fill="false"
      @confirm="onRangeConfirm"
    ></ky-calendar>

    <ky-calendar
      v-model:show="showQuick"
      type="range"
      :popupable="true"
      :allowSameDay="true"
      :hideOptions="false"
      :options="quickOptions"
      :is-auto-back-fill="false"
      @confirm="onQuickConfirm"
    ></ky-calendar>

    <ky-calendar
      v-model:show="showMultiple"
      type="multiple"
      :popupable="true"
      :is-auto-back-fill="false"
      @confirm="onMultipleConfirm"
    ></ky-calendar>

    <ky-calendar
      v-model:show="showWeek"
      type="week"
      :popupable="true"
      :is-auto-back-fill="false"
      @confirm="onWeekConfirm"
    ></ky-calendar>

    <ky-calendar
      v-model:show="showDisabled"
      type="single"
      :popupable="true"
      :disabledDate="disabledDateFn"
      :is-auto-back-fill="false"
      @confirm="onDisabledConfirm"
    ></ky-calendar>

    <ky-calendar
      v-model:show="showCustom"
      type="single"
      title="自定义日历标题"
      :showTips="false"
      :showConfirm="false"
      :popupable="true"
      :is-auto-back-fill="false"
      @confirm="onCustomConfirm"
    ></ky-calendar>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import '../index.scss'

const formatDate = (date: Date | undefined, format = 'yyyy/mm/dd'): string => {
  if (!date) return ''
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  const formatMap: Record<string, string | number> = {
    yyyy: year,
    mm: month,
    dd: day,
  }

  return format.replace(/yyyy|mm|dd/g, (match) => String(formatMap[match]))
}

const getDateRange = (days: number): [number, number] => {
  const endDate = new Date()
  const startDate = new Date(endDate)
  startDate.setDate(endDate.getDate() - days + 1)
  return [startDate.getTime(), endDate.getTime()]
}

const showSingle = ref(false)
const singleDate = ref('')

const showRange = ref(false)
const rangeDate = ref<string[]>(['', ''])

const showQuick = ref(false)
const quickDate = ref<string[]>(['', ''])
const quickOptions = [
  { label: '近7天', value: getDateRange(7), key: 'last7' },
  { label: '近30天', value: getDateRange(30), key: 'last30' },
  { label: '近60天', value: getDateRange(60), key: 'last60' },
  { label: '近180天', value: getDateRange(180), key: 'last180' },
  { label: '近1年', value: getDateRange(365), key: 'last365' },
]

const showMultiple = ref(false)
const multipleDates = ref<string[]>([])

const showWeek = ref(false)
const weekDate = ref<string[]>(['', ''])

const showDisabled = ref(false)
const disabledDateValue = ref('')

const showCustom = ref(false)
const customTitleDate = ref('')

const onSingleConfirm = (value: Date) => {
  singleDate.value = formatDate(value)
}

const onRangeConfirm = (value: [Date, Date]) => {
  rangeDate.value = [formatDate(value[0]), formatDate(value[1])]
}

const onQuickConfirm = (value: [Date, Date]) => {
  quickDate.value = [formatDate(value[0]), formatDate(value[1])]
}

const onMultipleConfirm = (value: Date[]) => {
  multipleDates.value = value.map((v) => formatDate(v))
}

const onWeekConfirm = (value: [Date, Date]) => {
  weekDate.value = [formatDate(value[0]), formatDate(value[1])]
}

const onDisabledConfirm = (value: Date) => {
  disabledDateValue.value = formatDate(value)
}

const onCustomConfirm = (value: Date) => {
  customTitleDate.value = formatDate(value)
}

const disabledDateFn = (date: string) => {
  const disabledDates: Record<string, boolean> = {
    '2025-05-05': true,
    '2025-05-06': true,
    '2025-05-10': true,
    '2025-05-11': true,
    '2025-05-12': true,
    '2025-05-13': true,
    '2025-05-14': true,
  }
  return disabledDates[date]
}
</script>

<style lang="scss">
.calendar-demo .calendar-item {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.calendar-demo .calendar-label {
  font-size: 24rpx;
  color: #666;
  padding-left: 8rpx;
}

.calendar-demo .calendar-value {
  font-size: 26rpx;
  color: #333;
  padding: 16rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
  min-height: 60rpx;
  display: flex;
  align-items: center;
}
</style>
