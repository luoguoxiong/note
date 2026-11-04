import { PropType } from 'vue'
import { isDate } from '../utils'
import { PickerNewProps, PickerOption } from '../../../picker/src/types'

export type Filter = (
  columnType: string,
  options: import('../../../picker/src/types').PickerOption[],
) => import('../../../picker/src/types').PickerOption[]

export type Fomatter = (
  columnType: string,
  options: import('../../../picker/src/types').PickerOption,
) => import('../../../picker/src/types').PickerOption

const currentYear = new Date().getFullYear()

export const datetimepickerProps = {
  modelValue: {
    type: [String, Number],
  },
  type: {
    type: String as DatePickerType,
    default: 'date',
  },
  minDate: {
    type: Date,
    default: () => new Date(currentYear - 10, 0, 1),
    validator: isDate,
  },
  maxDate: {
    type: Date,
    default: () => new Date(currentYear + 10, 11, 31),
    validator: isDate,
  },
  title: {
    type: String,
    default: '',
  },
  confirmButtonText: {
    type: String,
    default: '',
  },
  cancelButtonText: {
    type: String,
    default: '',
  },
  // 是否开启3D效果
  threeDimensional: {
    type: Boolean,
    default: true,
  },
  // 惯性滚动 时长
  swipeDuration: {
    type: [Number, String],
    default: 1000,
  },
  filter: Function as PropType<Filter>,
  formatter: Function as PropType<Filter>,
  showToolbar: {
    type: Boolean,
    default: true,
  },
  visibleOptionNum: {
    type: [Number, String],
    default: 7,
  },
  optionHeight: {
    type: [Number, String],
    default: 36,
  },
  minuteStep: {
    type: Number,
    default: 1,
  },
} as const

export type DatePickerType = 'date' | 'time' | 'year-month' | 'month-day' | 'datehour' | 'datetime' | 'hour-minute'

export type TimePickerColumnType = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'

export type DatetimepickerProps = PickerNewProps &
  Partial<{
    /**
     * 默认选中项
     * @default []
     */
    modelValue: string | number
    /**
     * popup 状态显示变量
     * @default false
     */
    show: boolean
    /**
     * type类型（请使用columnsType替代）
     */
    type: DatePickerType
    /**
     * 列展示数据排列顺序
     * @default ['year', 'month', 'day']
     */
    columnsType: TimePickerColumnType[]
    /**
     * 开始日期
     */
    minDate: Date
    /**
     * 结束日期
     */
    maxDate: Date
    /**
     * 分钟步进值
     */
    minuteStep: number
    threeDimensional: boolean
    /**
     * column 过滤函数
     */
    filter?: () => PropType<Filter> | null
    /**
     * 格式化函数
     */
    formatter?: () => PropType<Filter> | null
    /* 是否展示关闭按钮 */
    showClose: false
  }>
