<template>
  <ky-picker
    ref="pickerRef"
    :visible-item-count="5"
    :columns="columns"
    v-bind="$attrs"
    v-on="$listeners"
    :show="show"
  />
</template>
<script lang="ts" setup>
import Taro from '@tarojs/taro'
import './index.scss'
import { ref, computed, watch, nextTick } from 'vue'
import dayjs from 'dayjs'
import { dateToWord, getDateFormat } from '../../../utils/date'

const props = withDefaults(
  defineProps<{
    show: boolean
    tips: string
    minDate: Date
    maxDate: Date
    type: string
    timeValue: string
    workData: object
  }>(),
  {
    show: false,
    tips: '',
    minDate: new Date(new Date().getFullYear(), 0, 1),
    maxDate: new Date(new Date().getFullYear(), 1, 31),
    type: '',
    timeValue: '',
    workData: {
      startHour: 8,
      startMinute: 0,
      endHour: 18,
      endMinute: 59,
      weekStartHour: 8,
      weekStartMinute: 0,
      weekEndHour: 18,
      weekEndMinute: 59,
    },
  }
)

watch(
  () => props.show,
  (val) => {
    if (val) {
      init()
      setColumnIndexFn(props.timeValue)
    }
  }
)

const emit = defineEmits(['update:show'])

const handleClose = () => {
  emit('update:show', false)
}

const columns = ref([])

const pickerRef = ref()
const setColumnIndexFn = (timeValue) => {
  if (timeValue) {
    nextTick(() => {
      const timeColIndex = columns.value.findIndex((i) => dayjs(i.date).isSame(dayjs(timeValue), 'day'))
      // 设置第一列
      pickerRef.value.setColumnIndex(0, timeColIndex)
      // 设置第二列
      const timeCol = columns.value.find((i) => dayjs(i.date).isSame(dayjs(timeValue), 'day'))
      const hours = dayjs(timeValue).format('HH') + '点'
      const hourColIndex = timeCol?.children?.findIndex((i) => i.text === hours)
      pickerRef.value.setColumnIndex(1, hourColIndex)
      // 设置第三列
      const minute = dayjs(timeValue).format('mm') + '分'
      const hourCol = timeCol?.children?.find((i) => i.text === hours)
      const minuteColIndex = hourCol?.children?.findIndex((i) => i.text === minute)
      pickerRef.value.setColumnIndex(2, minuteColIndex)
    })
  }
}
const times = (n, iteratee) => {
  if (n < 0) {
    return []
  }
  let index = -1
  const result = Array(n)

  while (++index < n) {
    result[index] = iteratee(index)
  }

  return result
}

const padZero = (num, targetLength = 2) => {
  let str = num + ''

  while (str.length < targetLength) {
    str = '0' + str
  }

  return str
}

const getDateArr = (currentDate, minDate, maxDate) => {
  let result = []
  let days = Math.ceil(dayjs(maxDate).diff(dayjs(minDate), 'day', true))
  // 同一天
  if (days === 1) {
    const a = dayjs(minDate)
    result.push({
      text: dateToWord(a, 'YYYY/MM/DD'),
      date: a.toDate(),
    })
    return result
  }
  for (let i = 0; i <= days; i++) {
    const a = dayjs(minDate).add(i, 'day')
    result.push({
      text: dateToWord(a, 'YYYY/MM/DD'),
      date: a.toDate(),
    })
  }
  return result
}

const getHoursArr = (currentDate, minDate, maxDate) => {
  try {
    let result = []
    let rangeArr = [props.workData.startHour, props.workData.endHour]

    // 如果是周末取周末的上班时间
    if ([0].includes(dayjs(currentDate).day())) {
      rangeArr = [props.workData.weekStartHour, props.workData.weekEndHour]
    }
    rangeArr = rangeArr.map((i) => Number(i))
    if (currentDate.getDate() === minDate.getDate()) {
      rangeArr[0] = minDate.getHours()
    }
    if (currentDate.getDate() === maxDate.getDate()) {
      // rangeArr[1] = maxDate.getHours()
    }
    times(rangeArr[1] - rangeArr[0] + 1, (index) => {
      result.push({
        text: padZero(rangeArr[0] + index) + '点',
        date: dayjs(currentDate)
          .set('hour', rangeArr[0] + index)
          .toDate(),
      })
    })
    return result
  } catch (error) {
    return []
  }
}

const getMinutesArr = (currentDate, minDate, maxDate) => {
  let result = []
  let minuteRange = [0, 59]
  // 如果是当天最后一个小时，分钟也要动态
  const { startHour, endMinute, endHour, weekEndMinute, weekEndHour, weekStartHour, weekStartMinute, startMinute } =
    props.workData
  // 如果是周末取周末的上班时间以及第一个小时和最后一个小时的分钟
  if ([0].includes(dayjs(currentDate).day())) {
    if (currentDate.getHours() === weekEndHour) {
      minuteRange = [0, weekEndMinute]
    }
    if (currentDate.getHours() === weekStartHour) {
      minuteRange = [weekStartMinute, 59]
    }
  } else {
    if (currentDate.getHours() === endHour) {
      minuteRange = [0, endMinute]
    }
    if (currentDate.getHours() === startHour) {
      minuteRange = [startMinute, 59]
    }
  }
  let rangeArr = minuteRange
  if (currentDate.getDate() === minDate.getDate() && currentDate.getHours() === minDate.getHours()) {
    rangeArr[0] = minDate.getMinutes()
  }
  if (currentDate.getDate() === maxDate.getDate() && currentDate.getHours() === maxDate.getHours()) {
    rangeArr[1] = maxDate.getMinutes()
  }
  times(rangeArr[1] - rangeArr[0] + 1, (index) => {
    result.push({
      text: padZero(rangeArr[0] + index) + '分',
    })
  })
  return result
}

const init = () => {
  const minDate = props.minDate
  const maxDate = props.maxDate
  console.log('测试数据', minDate)
  columns.value = getDateArr(null, minDate, maxDate).map((item) => ({
    ...item,
    children: getHoursArr(item.date, minDate, maxDate).map((item) => ({
      ...item,
      children: getMinutesArr(item.date, minDate, maxDate),
    })),
  }))
  columns.value = columns.value.filter((item) => item.children?.length)
  console.log(columns.value, 'columnscolumns')
}

/**
 * 初始化选项数据
 */
const initColumns = () => {
  const minDate = dayjs(props.minDate)
  const maxDate = dayjs(props.maxDate)
  const diffDay = Math.ceil(dayjs(maxDate).diff(minDate, 'day', true))
  const minTime = minDate
  const minHour = dayjs(minTime).hour()
  const minMinute = dayjs(minTime).minute()
  const timeArr = []
  for (let i = 0; i <= diffDay; i++) {
    const object = {
      text: dayjs(minTime).add(i, 'day').format('YYYY年MM月DD日'),
    }
    const hourArr = []
    if (i === 0) {
      for (let h = minHour; h < 24; h++) {
        const hourObject = {
          text: ('' + h).padStart(2, '0') + '时',
        }

        const minuteArr = []
        for (let m = h === minHour ? minMinute : 0; m < 60; m++) {
          const minuteObject = {
            text: ('' + m).padStart(2, '0') + '分',
          }
          minuteArr.push(minuteObject)
        }

        hourObject.children = minuteArr

        hourArr.push(hourObject)
      }
    } else {
      for (let h = 0; h < 24; h++) {
        const hourObject = {
          text: ('' + h).padStart(2, '0') + '时',
        }
        const minuteArr = []

        for (let m = 0; m < 60; m++) {
          const minuteObject = {
            text: ('' + m).padStart(2, '0') + '分',
          }
          minuteArr.push(minuteObject)
        }

        hourObject.children = minuteArr

        hourArr.push(hourObject)
      }
    }
    object.children = hourArr
    timeArr.push(object)
  }
  columns.value = timeArr
}
</script>
