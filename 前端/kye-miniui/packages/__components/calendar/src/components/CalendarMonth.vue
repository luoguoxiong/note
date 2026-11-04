<template>
  <div class="ky-calendar__month">
    <div class="ky-calendar__month-title">{{ title }}</div>
    <div class="ky-calendar__days">
      <div class="ky-calendar__month-mark">{{ monthMark }}</div>
      <div
        v-for="node in days"
        :key="`ky-calendar__day-${title}-${node.text}`"
        :class="{
          'ky-calendar__day': true,
          active: node.type === 'middle',
          select: ['start-end', 'start', 'end', 'selected', 'multiple-selected'].includes(node.type),
          'select-left': node.type === 'start',
          'select-right': node.type === 'end',
          disabled: node.type === 'disabled',
          'ky-calendar__day-today': !node.bottomInfo && !isSelectedDay(node) && node.isToday,
        }"
        :style="node.style"
        @click="emit('click', node)"
      >
        <span class="ky-calendar__day-text">{{ node.text }}</span>
        <span class="ky-calendar__day-today-text" v-if="!node.bottomInfo && !isSelectedDay(node) && node.isToday"
          >今天</span
        >
        <span v-if="node.bottomInfo" class="ky-calendar__bottom-info">{{ node.bottomInfo }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="calendar-month">
import { ref, computed, inject } from 'vue'
import { CalendarDayType } from '../types'
import { compareDay, getPrevDay, getNextDay } from '../utils'

const type = inject('type')
const currentDate = inject('currentDate')

const props = withDefaults(
  defineProps<{
    firstDayOfWeek: number
    date: Date | Date[]
    startDate: Date
    endDate: Date
    allowSameDay: boolean
  }>(),
  {
    firstDayOfWeek: 0,
    date: new Date(),
    allowSameDay: false,
  },
)

const emit = defineEmits(['click'])

const getMultipleDayType = (day: Date) => {
  const isSelected = (date: Date) => currentDate.value.some((item) => compareDay(item, date) === 0)

  if (isSelected(day)) {
    return 'multiple-selected'
  }

  return ''
}

const getRangeDayType = (day: Date) => {
  const [startDay, endDay] = currentDate.value as Date[]

  if (!startDay) {
    return ''
  }

  const compareToStart = compareDay(day, startDay)

  if (!endDay) {
    return compareToStart === 0 ? 'start' : ''
  }

  const compareToEnd = compareDay(day, endDay)

  if (props.allowSameDay && compareToStart === 0 && compareToEnd === 0) {
    return 'start-end'
  }
  if (compareToStart === 0) {
    return 'start'
  }
  if (compareToEnd === 0) {
    return 'end'
  }
  if (compareToStart > 0 && compareToEnd < 0) {
    return 'middle'
  }

  return ''
}

const getDayType = (day: Date): CalendarDayType => {
  if (
    (props.startDate && compareDay(day, props.startDate) < 0) ||
    (props.endDate && compareDay(day, props.endDate) > 0)
  ) {
    return 'disabled'
  }

  if (currentDate.value === null) {
    return ''
  }

  if (Array.isArray(currentDate.value)) {
    if (type === 'multiple') {
      return getMultipleDayType(day)
    }
    if (type === 'range' || type === 'week') {
      return getRangeDayType(day)
    }
  } else if (type === 'single') {
    return compareDay(day, currentDate.value as Date) === 0 ? 'selected' : ''
  }

  return ''
}

const getBottomInfo = (dayType: CalendarDayType) => {
  if (type === 'range' || type === 'week') {
    if (dayType === 'start') {
      return '开始'
    }
    if (dayType === 'end') {
      return '结束'
    }
    if (dayType === 'start-end') {
      return '开始/结束'
    }
  }
}
/* 是否已选中的day日期 */
const isSelectedDay = (node) => {
  return ['start-end', 'start', 'end', 'selected', 'multiple-selected'].includes(node?.type)
}

export type CalendarDayItem = {
  date?: Date
  text?: Numeric
  type?: CalendarDayType
  topInfo?: string
  className?: unknown
  bottomInfo?: string
  isToday?: boolean
}

const totalDay = computed(() => 32 - new Date(props.date.getFullYear(), props.date.getMonth(), 32).getDate())
const offset = computed(() => {
  const date = props.date.getDate()
  const day = props.date.getDay()
  const realDay = (day - (date % 7) + 8) % 7

  if (props.firstDayOfWeek) {
    return (realDay + 7 - props.firstDayOfWeek) % 7
  }

  return realDay
})

const title = computed(() => {
  const year = props.date.getFullYear()
  const month = String(props.date.getMonth() + 1).padStart(2, '0')
  return `${year}年${month}月`
})

const monthMark = computed(() => {
  return String(props.date.getMonth() + 1)
})

const isRange = computed(() => type.value === 'range')

const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() // 注意：0 表示 1 月
  const day = today.getDate()

  return new Date(year, month, day)
}

const todayDate = ref(getTodayDate())

const days = computed(() => {
  const days: CalendarDayItem[] = []
  const year = props.date.getFullYear()
  const month = props.date.getMonth()
  for (let day = 1; day <= totalDay.value; day++) {
    const date = new Date(year, month, day)
    const nodeType = getDayType(date)

    let config: CalendarDayItem = {
      date,
      type: nodeType,
      text: day,
      // bottomInfo: getBottomInfo(nodeType),
      style: {},
      isToday: todayDate.value?.getTime() === date?.getTime(),
    }

    if (day === 1) {
      config.style.marginLeft = `${(100 * offset.value) / 7}%`
    }

    if (offset.value + day > 28) {
      config.style.marginBottom = 0
    }

    // if (props.formatter) {
    //   config = props.formatter(config);
    // }
    days.push(config)
  }

  return days
})
</script>

<style lang="scss">
.ky-calendar__month {
  .ky-calendar__month-title {
    padding: 12px 32px;
    margin: 8px 0;
    font-size: 28px;
    font-weight: 600;
    line-height: 40px;
    text-align: center;
    background-color: #f1f2f7;
    color: #24262b;
  }
  &-mark {
    pointer-events: none;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 0;
    color: rgba(242, 243, 245, 0.8);
    font-size: 280px;
  }

  .ky-calendar__days {
    padding: 0 32px;
    background-color: #fff;
    display: flex;
    flex-wrap: wrap;
    user-select: none;
    position: relative;

    .ky-calendar__day {
      width: 14.285%;
      height: 96px;
      margin-bottom: 8px;
      text-align: center;
      justify-content: center;
      align-items: center;
      display: flex;
      font-size: 28px;
      font-weight: 600;
      color: #24262b;
      position: relative;

      &.active {
        background-color: rgba(131, 101, 246, 0.15);
      }

      &.select {
        .ky-calendar__day-text {
          border-radius: 16px;
          background-color: #8365f6;
          color: #fff;
        }

        &.select-left,
        &.select-right {
          &:before,
          &:after {
            content: '';
            width: 16px;
            height: 16px;
            background-color: #f2effe;
            position: absolute;
            z-index: 1;
          }
          &:before {
            top: 0;
          }
          &:after {
            bottom: 0;
          }
        }
        &.select-left {
          &:before,
          &:after {
            right: 0;
          }
        }
        &.select-right {
          &:before,
          &:after {
            left: 0;
          }
        }
      }

      &.disabled {
        color: #adb0b8;
        pointer-events: none;
      }

      .ky-calendar__day-text {
        flex: 1;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 2;
      }
      &.ky-calendar__day-today {
        color: #8365f6;
        flex-flow: column;
        .ky-calendar__day-text {
          color: inherit;
        }
        .ky-calendar__day-today-text {
          color: inherit;
          font-weight: normal;
          font-size: 20px;
          position: absolute;
          bottom: 0;
        }
      }

      .ky-calendar__bottom-info {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        font-size: 20px;
        font-weight: normal;
        line-height: 28px;
        color: #ffffff;
        z-index: 10;
      }
    }
  }
}
</style>
