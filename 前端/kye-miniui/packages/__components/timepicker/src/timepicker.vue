<template>
  <ky-picker
    v-model="state.selectedValue"
    v-model:show="showPicker"
    :confirm-button-text="confirmButtonText"
    :cancel-button-text="cancelButtonText"
    :columns="columns"
    :title="title"
    :three-dimensional="threeDimensional"
    :swipe-duration="swipeDuration"
    :show-toolbar="showToolbar"
    :visible-option-num="visibleOptionNum"
    :option-height="optionHeight"
    :show-footer-btn="true"
    :showClose="showClose"
    @cancel="closeHandler"
    @change="changeHandler"
    @confirm="confirm"
    @open="onOpen"
    v-bind="$attrs"
  >
    <!-- slot 透传   -->
    <template v-for="slotName in Object.keys($slots)" :key="slotName" v-slot:[slotName]>
      <slot :name="slotName"></slot>
    </template>
  </ky-picker>
</template>

<script lang="ts" setup name="ky-datetimepicker">
import { DatetimepickerProps } from './types/index'
import { computed, nextTick, onBeforeMount, reactive, watch } from 'vue'
import KyPicker from '@packages/__components/picker'
import { PickerOption } from '@packages/__components/picker/src/types'
import usePickerStatus from '@packages/__components/picker/src/usePickerStatus'
import { padZero, isDate, arrayToDate } from '@packages/__components/timepicker/src/utils'

const state = reactive({
  currentDate: new Date(),
  selectedValue: [] as Array<any>,
})

const currentYear = new Date().getFullYear()

const withProps = withDefaults(defineProps<DatetimepickerProps>(), {
  columnsType: ['year', 'month', 'day'] as const,
  confirmButtonText: '',
  cancelButtonText: '',
  title: '标题',
  show: false,
  showToolbar: true,
  optionHeight: 36,
  visibleOptionNum: 7,
  filter: null,
  formatter: null,
  threeDimensional: true,
  swipeDuration: 1000,
  minuteStep: 1,
  showClose: false,
})

const props = Object.assign(withProps, {
  minDate: withProps.minDate || new Date(currentYear - 10, 0, 1),
  maxDate: withProps.maxDate || new Date(currentYear + 10, 11, 31),
})

console.log('props time-0.0.8test', props)

const emit = defineEmits(['cancel', 'change', 'confirm', 'open', 'update:modelValue', 'update:show'])

// const { showEmpty } = usePickerStatus(props)

// 是否展示pop
const showPicker = computed({
  get() {
    return props.show
  },
  set(val) {
    emit('update:show', val)
  },
})

const zhCNType: {
  [props: string]: string
} = {
  day: '日',
  year: '年',
  month: '月',
  hour: '时',
  minute: '分',
  seconds: '秒',
}

function getMonthEndDay(year: number, month: number): number {
  return 32 - new Date(year, month - 1, 32).getDate()
}

/* 获取区间最大最小单位值 */
const getBoundary = (type: 'min' | 'max', value: Date) => {
  const boundary = type == 'min' ? props.minDate : props.maxDate
  const year = boundary?.getFullYear()
  let month = 1
  let date = 1
  let hour = 0
  let minute = 0
  if (type === 'max') {
    month = 12
    date = getMonthEndDay(value.getFullYear(), value.getMonth() + 1)
    hour = 23
    minute = 59
  }
  let seconds = minute
  if (value.getFullYear() === year) {
    month = boundary?.getMonth() + 1
    if (value.getMonth() + 1 === month) {
      date = boundary?.getDate()
      if (value.getDate() === date) {
        hour = boundary?.getHours()
        if (value.getHours() === hour) {
          minute = boundary?.getMinutes()
          if (value.getMinutes() === minute) {
            seconds = boundary?.getSeconds()
          }
        }
      }
    }
  }
  return {
    [`${type}Year`]: year,
    [`${type}Month`]: month,
    [`${type}Date`]: date,
    [`${type}Hour`]: hour,
    [`${type}Minute`]: minute,
    [`${type}Seconds`]: seconds,
  }
}

const generateList = (list: Array<any>) => {
  switch (props.type) {
    case 'date':
      list = list.slice(0, 3)
      break
    case 'datetime':
      list = list.slice(0, 5)
      break
    case 'time':
      list = list.slice(3, 6)
      break
    case 'year-month':
      list = list.slice(0, 2)
      break
    case 'month-day':
      list = list.slice(1, 3)
      break
    case 'datehour':
      list = list.slice(0, 4)
      break
    case 'hour-minute':
      list = list.slice(3, 5)
      break
  }
  return list
}

/**
 * 根据columnsType-生成列的规则
 * ['year', 'month']>
 *     {
 *       type: 'year',
 *       range: [minYear, maxYear],
 *     },
 *     {
 *       type: 'month',
 *       range: [minMonth, maxMonth],
 *     },
 * @param list
 * @returns {any}
 */
const generateListWithColumnsType = (list: Array<any>) => {
  return props.columnsType.map((type) => {
    switch (type) {
      case 'year':
      case 'month':
      case 'day':
      case 'hour':
      case 'minute':
      case 'seconds': {
        if (type === 'minute') {
          console.log('generateListWithColumnsType')
        }
        const findItem = list.filter((f) => f.type === type)
        return findItem && findItem[0]
      }

      default:
        console.error(`[KyMini] DatePicker: unsupported columns type: ${type}`)
        return []
    }
  })
}

/* 区间数组对象 */
const ranges = computed(() => {
  const { maxYear, maxDate, maxMonth, maxHour, maxMinute, maxSeconds } = getBoundary('max', state.currentDate)

  const { minYear, minDate, minMonth, minHour, minMinute, minSeconds } = getBoundary('min', state.currentDate)
  console.log('ranges>>>>')
  let result = [
    {
      type: 'year',
      range: [minYear, maxYear],
    },
    {
      type: 'month',
      range: [minMonth, maxMonth],
    },
    {
      type: 'day',
      range: [minDate, maxDate],
    },
    {
      type: 'hour',
      range: [minHour, maxHour],
    },
    {
      type: 'minute',
      range: [minMinute, maxMinute],
    },
    {
      type: 'seconds',
      range: [minSeconds, maxSeconds],
    },
  ]
  return generateListWithColumnsType(result)
  // return generateList(result)
})

/* 格式化option */
const formatterOption = (type: string, value: string | number) => {
  const { formatter, isShowChinese } = props
  let fOption = null
  if (formatter) {
    fOption = formatter(type, { text: padZero(value, 2), value: padZero(value, 2) })
  } else {
    const padMin = padZero(value, 2)
    const fatter = isShowChinese ? zhCNType[type] : ''
    fOption = { text: padMin + fatter, value: padMin }
  }

  return fOption
}

// min 最小值  max 最大值  val  当前显示的值   type 类型（year、month、day、time）
const generateValue = (min: number, max: number, val: number | string, type: string, columnIndex: number) => {
  const arr: Array<PickerOption> = []
  let index = 0
  while (min <= max) {
    arr.push(formatterOption(type, min))

    if (type === 'minute') {
      min += props.minuteStep
    } else {
      min++
    }

    if (min <= Number(val)) {
      index++
    }
  }
  ;(state.selectedValue as any)[columnIndex] = arr[index]?.value
  return props.filter ? props.filter(type, arr) : arr
}

const getDateIndex = (type: string) => {
  if (type === 'year') {
    return state.currentDate.getFullYear()
  } else if (type === 'month') {
    return state.currentDate.getMonth() + 1
  } else if (type === 'day') {
    return state.currentDate.getDate()
  } else if (type === 'hour') {
    return state.currentDate.getHours()
  } else if (type === 'minute') {
    return state.currentDate.getMinutes()
  } else if (type === 'seconds') {
    return state.currentDate.getSeconds()
  }
  return 0
}

/* 所有滚动列数据 */
const columns = computed(() => {
  const val = ranges.value.map((res, columnIndex) => {
    return generateValue(res.range[0], res.range[1], getDateIndex(res.type), res.type, columnIndex)
  })
  return val
})

const closeHandler = (val: any) => {
  emit('cancel', val)
}

/* 触发时间变化 */
const changeHandler = (val: any) => {
  console.log('log time changeHandler')
  // val = { selectedValue: [...] }
  const list = val.selectedValue
  console.log('log time changeHandler list', list)
  // 根据 columnsType 做映射
  const map = {
    year: 0,
    month: 1,
    day: 2,
    hour: 3,
    minute: 4,
    seconds: 5,
  }
  // 使用 != null 检查，这样0和false等有效值会被保留
  const y = Number(list[map.year] != null ? list[map.year] : state.currentDate.getFullYear())
  const m = Number(list[map.month] != null ? list[map.month] : state.currentDate.getMonth() + 1)
  const d = Number(list[map.day] != null ? list[map.day] : state.currentDate.getDate())
  const h = Number(list[map.hour] != null ? list[map.hour] : state.currentDate.getHours())
  const mi = Number(list[map.minute] != null ? list[map.minute] : state.currentDate.getMinutes())
  const s = Number(list[map.second] != null ? list[map.second] : state.currentDate.getSeconds()) // 修正：seconds → second

  // 检查该月天数，防止溢出（比如 Feb 31）
  const endDay = getMonthEndDay(y, m)
  const safeDay = Math.min(d, endDay)

  state.currentDate = new Date(y, m - 1, safeDay, h, mi, s)
  console.log('log time changeHandler end', val, state.currentDate)
  emit('change', val)
}

const getSelectedValue = (time: Date) => {
  const res = [
    time.getFullYear(),
    time.getMonth() + 1,
    time.getDate(),
    time.getHours(),
    time.getMinutes(),
    time.getSeconds(),
  ]
  return generateList(res.map((i) => String(i)))
}

const confirm = (val: any) => {
  console.log('timePicker confirm')
  emit('confirm', val, arrayToDate(val?.selectedValue))
}

const onOpen = (value: boolean) => {
  emit('open', value)
  console.log('open timePicker>>>>', state.selectedValue)
}

const formatValue = (value: Date | (string | number)[]) => {
  if (!isDate(value)) {
    if (Array.isArray(value)) {
      value = arrayToDate(value)
    } else {
      value = props.minDate
    }
  }
  let timestmp = Math.max(value?.getTime(), props.minDate?.getTime())
  timestmp = Math.min(timestmp, props.maxDate?.getTime())

  return new Date(timestmp)
}

onBeforeMount(() => {
  console.log('onBeforeMount')
  state.currentDate = formatValue(props.modelValue)
})

watch(
  () => props.modelValue,
  (value) => {
    const newValues = formatValue(value)
    const isSameValue = JSON.stringify(newValues) === JSON.stringify(state.currentDate)
    if (!isSameValue) {
      state.currentDate = newValues
      state.selectedValue = getSelectedValue(newValues)
      console.log('state.selectedValue', state.selectedValue)
    }
    console.log('props.modelValue', value, newValues)
  },
)

watch(
  () => state.currentDate,
  (newValues) => {
    console.log('timePicker currentDate》》》》》', newValues)

    const isSameValue = JSON.stringify(newValues) === JSON.stringify(props.modelValue)
    if (!isSameValue) {
      emit('update:modelValue', newValues)
      nextTick(() => {
        state.selectedValue = getSelectedValue(newValues)
        console.log('state.selectedValue', state.selectedValue)
      })
    }
  },
)
</script>

<style scoped lang="scss">
.ky-datetimepicker {
}
</style>
