<template>
  <view class="timepicker-demo demo-container">
    <view class="demo-header">
      <view class="header-title">TimePicker 时间选择器</view>
      <view class="header-subtitle">时间选择器用法示例</view>
    </view>

    <view class="demo-content">
      <view class="card">
        <view class="card-header">
          <view class="card-icon">📅</view>
          <view class="card-title">基本使用</view>
        </view>
        <view class="card-body">
          <view class="picker-item">
            <view class="picker-label">年月日选择（默认）</view>
            <ky-button type="primary" size="mini" @click="showPicker1 = !showPicker1">
              {{ formatDate(val1) || '点击选择' }}
            </ky-button>
            <ky-timepicker
              v-model:show="showPicker1"
              v-model="val1"
              :min-date="minDate"
              :max-date="maxDate"
              :three-dimensional="false"
              :show-close="true"
              @confirm="confirm1"
            ></ky-timepicker>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">📊</view>
          <view class="card-title">列类型配置</view>
        </view>
        <view class="card-body">
          <view class="picker-item">
            <view class="picker-label">年月选择</view>
            <ky-button type="primary" size="mini" @click="showPicker2 = !showPicker2">
              {{ formatMonth(val2) || '点击选择' }}
            </ky-button>
            <ky-timepicker
              v-model:show="showPicker2"
              v-model="val2"
              :min-date="minDate"
              :max-date="maxDate"
              :columns-type="['year', 'month']"
              :three-dimensional="false"
              @confirm="confirm2"
            ></ky-timepicker>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🔧</view>
          <view class="card-title">嵌入模式</view>
        </view>
        <view class="card-body">
          <view class="picker-item">
            <ky-timepicker
              :poppable="false"
              title="选择年月"
              v-model="val4"
              :min-date="minDate"
              :max-date="maxDate"
              :columns-type="['year', 'month']"
              :three-dimensional="false"
              @confirm="confirm4"
            ></ky-timepicker>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎨</view>
          <view class="card-title">格式化选项</view>
        </view>
        <view class="card-body">
          <view class="picker-item">
            <view class="picker-label">自定义显示格式</view>
            <ky-button type="primary" size="mini" @click="showPicker4 = !showPicker4">
              {{ formatDate(val5) || '点击选择' }}
            </ky-button>
            <ky-timepicker
              v-model:show="showPicker4"
              title="格式化选项"
              v-model="val5"
              :min-date="minDate"
              :max-date="maxDate"
              :three-dimensional="false"
              :formatter="formatter"
              :filter="filter"
              @confirm="confirm5"
            ></ky-timepicker>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">✨</view>
          <view class="card-title">3D 效果</view>
        </view>
        <view class="card-body">
          <view class="picker-item">
            <view class="picker-label">启用3D滚动效果</view>
            <ky-button type="primary" size="mini" @click="showPicker6 = !showPicker6">
              {{ formatDate(val7) || '点击选择' }}
            </ky-button>
            <ky-timepicker
              v-model:show="showPicker6"
              v-model="val7"
              :min-date="minDate"
              :max-date="maxDate"
              three-dimensional
              @confirm="confirm7"
            ></ky-timepicker>
          </view>
        </view>
      </view>

      <view class="card">
        <view class="card-header">
          <view class="card-icon">🎯</view>
          <view class="card-title">自定义插槽</view>
        </view>
        <view class="card-body">
          <view class="picker-item">
            <view class="picker-label">自定义确认/取消按钮</view>
            <ky-button type="primary" size="mini" @click="showPicker7 = !showPicker7">
              {{ formatDate(val8) || '点击选择' }}
            </ky-button>
            <ky-timepicker
              v-model:show="showPicker7"
              v-model="val8"
              :min-date="minDate"
              :max-date="maxDate"
              :three-dimensional="false"
              @confirm="confirm8"
            >
              <template #confirm>
                <view class="custom-confirm-btn">✅ 确定</view>
              </template>
              <template #cancel>
                <view class="custom-cancel-btn">❌ 取消</view>
              </template>
              <template #columns-top>
                <view class="columns-top-text">请选择您的生日</view>
              </template>
            </ky-timepicker>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import '../index.scss'

const minDate = new Date(2021, 0, 1)
const maxDate = new Date(2035, 11, 31)

const showPicker1 = ref(false)
const val1 = ref(new Date())

const showPicker2 = ref(false)
const val2 = ref(new Date())

const val4 = ref(new Date())

const showPicker4 = ref(false)
const val5 = ref(new Date())

const showPicker6 = ref(false)
const val7 = ref(new Date())

const showPicker7 = ref(false)
const val8 = ref(new Date())

const formatDate = (date: Date) => {
  if (!date || !(date instanceof Date)) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatMonth = (date: Date) => {
  if (!date || !(date instanceof Date)) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

const confirm1 = ({ selectedValue }, date) => {
  console.log('confirm1', selectedValue, date)
  val1.value = date
}

const confirm2 = ({ selectedValue }, date) => {
  console.log('confirm2', selectedValue, date)
  val2.value = date
}

const confirm4 = ({ selectedValue }, date) => {
  console.log('confirm4', selectedValue, date)
  val4.value = date
}

const confirm5 = ({ selectedValue }, date) => {
  console.log('confirm5', selectedValue, date)
  val5.value = date
}

const confirm7 = ({ selectedValue }, date) => {
  console.log('confirm7', selectedValue, date)
  val7.value = date
}

const confirm8 = ({ selectedValue }, date) => {
  console.log('confirm8', selectedValue, date)
  val8.value = date
}

const formatter = (type, option) => {
  switch (type) {
    case 'year':
      option.text += '年'
      break
    case 'month':
      option.text += '月'
      break
    case 'day':
      option.text += '日'
      break
    default:
      option.text += ''
  }
  return option
}

const filter = (type, options) => {
  if (type === 'month') {
    return options.filter((option) => Number(option.value) % 2 === 0)
  }
  return options
}
</script>

<style lang="scss">
.timepicker-demo .picker-item {
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.timepicker-demo .picker-label {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 12rpx;
  padding-left: 8rpx;
}

.timepicker-demo .custom-confirm-btn {
  color: #409eff;
  font-size: 28rpx;
  font-weight: 600;
}

.timepicker-demo .custom-cancel-btn {
  color: #999;
  font-size: 28rpx;
}

.timepicker-demo .columns-top-text {
  text-align: center;
  color: #999;
  font-size: 24rpx;
  padding: 16rpx 0;
}
</style>
