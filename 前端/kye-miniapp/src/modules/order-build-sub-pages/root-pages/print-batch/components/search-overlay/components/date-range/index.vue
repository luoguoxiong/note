<template>
  <div>
    <div class="label">{{ label }}</div>
    <div class="date-range" @click="handleRangeShow">
      <div class="date-range__time">
        <div>{{ startTime || '开始日期' }}</div>
        <div>-</div>
        <div>{{ endTime || '结束日期' }}</div>
      </div>
      <img
        src="https://ic-img.ky-express.com/netc/20220922_88060601265_!!1663829072158_40_40.png"
        alt=""
        class="date-range__icon"
      />
    </div>
    <KyCalendarRange
      :duration="duration"
      :show="showCalendar"
      :min-date="startDate"
      :defaultValue="defaultDate"
      :max-date="endDate"
      @close="onCloseDate"
      @onConfirmDate="onConfirmDate"
    >
      <template #footer>
        <div class="footer-tip">*可筛选查询180天内运单，选择时间范围不可超过60天</div>
      </template>
    </KyCalendarRange>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

import KyCalendarRange from '@order-public-sub-public/components/base/ky-calendar-range/index.vue'

import { oneYearTime, halfYearTime } from '@order-public-sub-root-pages/print-batch/constants'

interface dateRangeProps {
  label: string
  duration: number
  defaultDateRange?: number
  startTime: number | string
  endTime: number | string
  oneYearWaybillPermission: boolean
}

const props = withDefaults(defineProps<dateRangeProps>(), {
  defaultDateRange: 60,
  duration: 0,
  startTime: '',
  endTime: '',
  oneYearWaybillPermission: false,
})

console.log(props, 'propspropsprops')

// 根据一年运单权限判断时间
const toDay = new Date()
const dayCount = props.oneYearWaybillPermission ? oneYearTime : halfYearTime
console.log(dayCount, 'dayCount')
toDay.setDate(toDay.getDate() - dayCount)
let endDate = new Date()
let startDate = toDay
const defaultDate = ref([startDate, endDate])
const showCalendar = ref(false)

const updateTime = () => {
  const toDay = new Date()
  const dayCount = props.oneYearWaybillPermission ? oneYearTime : halfYearTime
  console.log(dayCount, 'dayCount')
  toDay.setDate(toDay.getDate() - dayCount)
  endDate = new Date()
  startDate = toDay
  defaultDate.value = [startDate, endDate]
  showCalendar.value = false
}

const handleRangeShow = () => {
  updateTime()
  if (props.startTime && props.endTime) {
    defaultDate.value = [new Date(props.startTime), new Date(props.endTime)]
  } else {
    defaultDate.value = [startDate, endDate]
  }
  showCalendar.value = true
}

const onCloseDate = () => {
  showCalendar.value = false
}

const emit = defineEmits(['confirmDate'])
const onConfirmDate = (date: any) => {
  const [startDate, endDate] = date
  console.log(startDate, endDate)
  showCalendar.value = false
  emit('confirmDate', { startDate, endDate })
}
</script>

<style scoped lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';
</style>
