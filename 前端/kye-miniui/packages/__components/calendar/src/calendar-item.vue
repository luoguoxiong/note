<template>
  <div class="ky-calendar-item" :id="calendarId">
    <CalendarHeader
      :title="props.title"
      :hideOptions="props.hideOptions"
      :options="props.options"
      :firstDayOfWeek="props.firstDayOfWeek"
      :startPlaceholder="props.startPlaceholder"
      :endPlaceholder="props.endPlaceholder"
      @selectTime="v => {
        select(v)
        scrollToDate(v?.[0])
      }"
    ></CalendarHeader>

    <scroll-view ref="calendarRef" class="ky-calendar__body" :scroll-y="true" :scroll-into-view="scrollIntoViewId">
      <CalendarMonth
        v-for="month in monthList"
        :key="`calendar-month-${month.key}`"
        :id="`calendar-month-${month.key}`"
        :date="month.date"
        :firstDayOfWeek="props.firstDayOfWeek"
        :startDate="startDate"
        :endDate="endDate"
        :allowSameDay="props.allowSameDay"
        @click="onClickDay"
      />
    </scroll-view>

    <CalendarFooter
      :showTips="props.showTips"
      :showConfirm="props.showConfirm"
      :confirmDisable="confirmDisable"
      @confirm="onConfirm"
    >
      <template #footer-tips>
        <slot name="footer-tips" />
      </template>
    </CalendarFooter>
  </div>
</template>

<script lang="ts" setup name="ky-calendar-item">
import Taro from '@tarojs/taro'
import CalendarHeader from './components/CalendarHeader.vue'
import CalendarMonth from './components/CalendarMonth.vue'
import CalendarFooter from './components/CalendarFooter.vue'

import { ref, reactive, useSlots, provide, inject, computed, onMounted, nextTick } from 'vue'
import { getToday, getMonthFirstDay, getMonthByOffset, formatDate, cloneDate, cloneDates, compareDay, getPrevDay, calcDateNum, scrollToDay } from './utils'
import { useRefs } from './hooks/useRefs';
import { CalendarProps, CalendarDayItem } from './types'

// const closePopup = inject('closePopup')

const props = withDefaults(defineProps<Omit<CalendarProps, 'popupable' | 'show'>>(), {
  title: '',
  type: 'single',
  defaultDate: '',
  startDate: '',
  endDate: '',
  disabledDate: Function,
  firstDayOfWeek: 0,
  allowSameDay: false,
  showTips: true,
  showConfirm: true,
  startPlaceholder: '开始日期',
  endPlaceholder: '结束日期',
})

const emit = defineEmits(['update:show', 'close', 'select', 'confirm'])

const currentDate = ref(props.defaultDate)
const [monthRefs, setMonthRefs] = useRefs()

provide('type', props.type)
provide('currentDate', currentDate)

onMounted(async () => {
  initScrollDate()
})

const initScrollDate = async () => {
  await nextTick()
  setTimeout(() => {
    let toDate = new Date()
    if (props.type === 'single' && currentDate.value) {
      toDate = currentDate.value
    } else if (props.type === 'range' && currentDate.value.length) {
      toDate = currentDate.value[0]
    }
    scrollToDate(toDate)
  }, 0)
}

// 起始展示日期
const startDate = computed(() => {
  if (!props.startDate) {
    return getMonthByOffset(getMonthFirstDay(), -2)
  }
  return new Date(props.startDate)
})
// 终止展示日期
const endDate = computed(() => {
  if (!props.endDate) {
    return getMonthByOffset(getMonthFirstDay(), 3)
  }
  return new Date(props.endDate)
})

const monthList = computed(() => {
  const start = startDate.value
  const end = endDate.value
  const result = []
  const current = new Date(start)

  // 设置当前日期的月份为第一天
  current.setDate(1)

  // 循环直到当前日期超过结束日期
  while (current <= end) {
    // 创建当前月份第一天的Date对象的副本，并添加到结果数组中
    result.push({
      date: new Date(current),
      key: formatDate(current, 'yyyy-mm'),
    })

    // 将当前日期设置为下一个月的第一天
    current.setMonth(current.getMonth() + 1)
    current.setDate(1)
  }

  return result
})

const confirmDisable = computed(() => {
  // if (props.type === 'single' && currentDate.value === '') {
  //   return true
  // }
  // if (props.type === 'range' && (currentDate.value.length < 2 || (currentDate.value.length === 2 && currentDate.value.some(f=>!f)))) {
  //   return true
  // }
  // ui确认，未选择也不禁用，弹提示
  return false
})

const checkRange = (date: [Date, Date]) => {
  const { maxRange, rangePrompt, showRangePrompt } = props

  if (maxRange && calcDateNum(date) > +maxRange) {
    if (showRangePrompt) {
      Taro.showToast(rangePrompt)
    }
    emit('overRange')
    return false
  }

  return true
}

const getDisabledDate = (disabledDays: CalendarDayItem[], startDay: Date, date: Date): Date | undefined =>
  disabledDays.find((day) => compareDay(startDay, day.date!) === -1 && compareDay(day.date!, date) === -1)?.date

const disabledDays = computed(() =>
  monthRefs.value.reduce((arr, ref) => {
    arr.push(...(ref.disabledDays?.value ?? []))
    return arr
  }, [] as CalendarDayItem[]),
)

const scrollIntoViewId = ref('')
const scrollToDate = (date: Date) => {
  const monthKey = formatDate(date, 'yyyy-mm')
  scrollIntoViewId.value = `calendar-month-${monthKey}`
}

const select = (date: Date | Date[], complete?: boolean) => {
  const setCurrentDate = (date: Date | Date[]) => {
    currentDate.value = date
    emit('select', cloneDates(date))
  }

  if (complete && props.type === 'range') {
    const valid = checkRange(date as [Date, Date])

    if (!valid) {
      // auto selected to max range
      setCurrentDate([(date as Date[])[0], getDayByOffset((date as Date[])[0], +props.maxRange - 1)])
      return
    }
  }

  setCurrentDate(date)

  // if (complete && !props.showConfirm) {
  //   onConfirm()
  // }
}

const checkDate = () => {
  if (props.type === 'single' && currentDate.value === '') {
    Taro.showToast({ title: '请选择日期', icon: 'none' })
    return false
  }
  if (props.type === 'range') {
    if (currentDate.value.length === 0) {
      Taro.showToast({ title: `请选择${props.startPlaceholder}`, icon: 'none' })
      return false
    } else if (currentDate.value.length === 1) {
      if (!props.allowSameDay) {
        Taro.showToast({ title: `请选择${props.endPlaceholder}`, icon: 'none' })
        return false
      } else {
        currentDate.value = [currentDate.value[0], currentDate.value[0]]
      }
    }
  }
  return true
}

const onConfirm = () => {
  if (!checkDate()) return
  emit('confirm', currentDate.value ?? cloneDates(currentDate.value!))
  // closePopup()
}

const onClickDay = (item: CalendarDayItem) => {
  if (props.readonly || !item.date) {
    return
  }

  const { date } = item

  if (props.type === 'range') {
    if (!currentDate.value) {
      select([date])
      return
    }

    const [startDay, endDay] = currentDate.value as [Date, Date]

    if (startDay && !endDay) {
      const compareToStart = compareDay(date, startDay)

      if (compareToStart === 1) {
        // const disabledDay = getDisabledDate(
        //   disabledDays,
        //   startDay,
        //   date,
        // );
        const disabledDay = null

        if (disabledDay) {
          const endDay = getPrevDay(disabledDay)
          if (compareDay(startDay, endDay) === -1) {
            select([startDay, endDay])
          } else {
            select([date])
          }
        } else {
          select([startDay, date], true)
        }
      } else if (compareToStart === -1) {
        select([date])
      } else if (props.allowSameDay) {
        select([date, date], true)
      }
    } else {
      select([date])
    }
  } else if (props.type === 'multiple') {
    if (!currentDate.value) {
      select([date])
      return
    }
    const dates = currentDate.value as Date[]

    const selectedIndex = dates.findIndex((dateItem: Date) => compareDay(dateItem, date) === 0)

    if (selectedIndex !== -1) {
      const [unselectedDate] = dates.splice(selectedIndex, 1)
      emit('unselect', cloneDate(unselectedDate))
    } else if (props.maxRange && dates.length >= +props.maxRange) {
      Taro.showToast(props.rangePrompt)
    } else {
      select([...dates, date])
    }
  } else if (props.type === 'week') {
    const curDate = new Date(date)
    const dayOfWeek = curDate.getDay()

    const startOfWeek = new Date(curDate)
    startOfWeek.setDate(curDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -7 : 1) * props.firstDayOfWeek)
    startOfWeek.setHours(23, 59, 59, 999)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    select([startOfWeek, endOfWeek], true)
  } else {
    select(date, true)
  }
}
</script>

<style lang="scss">
.ky-calendar-item {
  display: flex;
  flex-direction: column;
  height: 100%;

  .ky-calendar__body {
    flex: 1;
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }
}
</style>
