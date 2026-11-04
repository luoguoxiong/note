<template>
  <div class="notify-time">
    <div class="notify-time__options">
      <div
        class="notify-time__item"
        :class="{ 'is-active': activeTab === 20, 'time-is-error': isErrorSegmentTime }"
        @click="handleTabClick(20)"
      >
        <span class="notify-time__title">时间段</span>
        <span
          class="notify-time__right"
          data-validate="addedService.deliverySegmentTime"
          id="addedService_deliverySegmentTime"
        >
          <span class="notify-time__value" v-if="rangeTimeLabel">{{ rangeTimeLabel }}</span>
          <span class="notify-time__placeholder" v-else>请选择</span>
          <SvgIcon
            name=""
            img-url="https://ic-img.ky-express.com/netc/20260716_45855_!!1784170531110_23_23.png"
            class="notify-time__arrow"
          />
        </span>
      </div>
      <div
        class="notify-time__item"
        :class="{ 'is-active': activeTab === 10, 'time-is-error': isErrorExactTime }"
        @click="handleTabClick(10)"
      >
        <span class="notify-time__title">精准时间</span>
        <span
          class="notify-time__right"
          data-validate="addedService.deliveryExactTime"
          id="addedService_deliveryExactTime"
        >
          <span class="notify-time__value" v-if="exactTimeLabel">{{ exactTimeLabel }}</span>
          <span class="notify-time__placeholder" v-else>请选择</span>
          <SvgIcon
            name=""
            img-url="https://ic-img.ky-express.com/netc/20260716_45855_!!1784170531110_23_23.png"
            class="notify-time__arrow"
          />
        </span>
      </div>
    </div>

    <!-- 时间段选择弹窗 -->
    <KyTimeRangePicker
      ref="timeRangePickerRef"
      :choosableTimes="choosableTimes"
      @confirm="onRangeTimeConfirm"
      @reload="(done) => onReload(done)"
    />

    <!-- 精准时间选择弹窗 -->
    <KyPreciseTimeSelect
      ref="preciseTimeSelectRef"
      :choosableTimes="choosableTimes"
      @confirm="onExactTimeConfirm"
      @reload="(done) => onReload(done)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import dayjs from 'dayjs'
import SvgIcon from '@order-global-package-order-sub/components/ui/svg-icon/index.vue'
import {
  PreciseTimeSelect as KyPreciseTimeSelect,
  TimeRangePicker as KyTimeRangePicker,
} from '@ky-miniui-lib/time-select'
import { toClearNotificationTimeError } from './utils'
import { useValidate as globalUseValidate } from '@order-public-sub-public/hooks/useValidate'
const { validateObj } = globalUseValidate()
import { WEEK_DAYS } from '@order-public-sub-public/constants'

const isErrorSegmentTime = computed(() => {
  return validateObj['addedService.deliverySegmentTime']?.content
})

const isErrorExactTime = computed(() => {
  return validateObj['addedService.deliveryExactTime']?.content
})

const props = defineProps<{
  moduleStyle?: string
  /** 时间类型: 10-精准时间, 20-时间段, ''-未选择 */
  timeType?: 10 | 20 | ''
  /** 时间段开始时间 YYYY/MM/DD HH:mm */
  rangeStartTime?: string
  /** 时间段结束时间 YYYY/MM/DD HH:mm */
  rangeEndTime?: string
  /** 是否自定义时间段 */
  rangeCustomFlag?: boolean
  /** 精准时间 YYYY/MM/DD HH:mm */
  exactStartTime?: string
  /** 接口返回的可选时间数据 */
  choosableTimes: Array<{
    date: string
    dayOfWeek: number
    matchPeriods: Array<{
      periodType: number
      startTime: string
      endTime: string
    }>
    timeRanges: Array<{
      text: string
      hour: number
      children: Array<{ minute: number }>
    }>
  }>
  /** 精准时间最早开始时间 YYYY/MM/DD HH:mm */
  exactTimeEarliestStartTime?: string
}>()

const emit = defineEmits<{
  (
    e: 'time-change',
    payload: {
      timeType: 10 | 20
      startTime: string
      endTime: string
      customFlag: boolean
    },
  ): void
  (e: 'reload', done: () => void): void
}>()

const timeRangePickerRef = ref()
const preciseTimeSelectRef = ref()

/** 时间段独立数据（初始值来自 props） */
const rangeStartTime = ref(props.rangeStartTime || '')
const rangeEndTime = ref(props.rangeEndTime || '')
const rangeCustomFlag = ref(props.rangeCustomFlag || false)

/** 精准时间独立数据（初始值来自 props） */
const exactStartTime = ref(props.exactStartTime || '')

// 当外部 props 变化时同步到内部 ref（如弹窗打开时回显数据）
watch(
  () =>
    [props.rangeStartTime, props.rangeEndTime, props.rangeCustomFlag, props.exactStartTime, props.timeType] as const,
  ([rs, re, cf, es, tt]) => {
    console.log(tt, 'tttttttttttttttttt')
    rangeStartTime.value = rs || ''
    rangeEndTime.value = re || ''
    rangeCustomFlag.value = cf || false
    exactStartTime.value = es || ''
    activeTab.value = tt || ''
  },
)

/** 当前活跃 tab，直接映射 timeType */
const activeTab = ref(props.timeType || '')

/** 时间段展示文本 */
const rangeTimeLabel = computed(() => {
  if (!rangeStartTime.value || !rangeEndTime.value) return ''
  const start = dayjs(rangeStartTime.value)
  const end = dayjs(rangeEndTime.value)
  const endStr = end.format('HH:mm').indexOf('00:00') > -1 ? '24:00' : end.format('HH:mm')
  console.log(endStr, 'endStr')
  return `${start.format('MM/DD')} ${WEEK_DAYS[start.day()]} ${start.format('HH:mm')}-${endStr}`
})

/** 精准时间展示文本，如 "07/04 周五 20:00" */
const exactTimeLabel = computed(() => {
  if (!exactStartTime.value) return ''
  const t = dayjs(exactStartTime.value)
  return `${t.format('MM/DD')} ${WEEK_DAYS[t.day()]} ${t.format('HH:mm')}`
})

const toTimeChange = (tab: 10 | 20 | '') => {
  if (tab === 20) {
    emit('time-change', {
      timeType: 20,
      startTime: rangeStartTime.value || '',
      endTime: rangeEndTime.value || '',
      customFlag: rangeCustomFlag.value,
      cancelProcess: true,
    })
    return
  }
  if (tab === 10) {
    emit('time-change', {
      timeType: 10,
      startTime: exactStartTime.value || '',
      endTime: exactStartTime.value || '',
      customFlag: false,
      cancelProcess: true,
    })
    return
  }
}

const handleTabClick = async (tab: 10 | 20) => {
  toClearNotificationTimeError()
  toTimeChange(tab)
  if (tab === 20) {
    timeRangePickerRef.value?.openDialog({ startTime: rangeStartTime.value, endTime: rangeEndTime.value })
  } else {
    preciseTimeSelectRef.value?.openDialog(
      exactStartTime.value ? exactStartTime.value : '',
      props.exactTimeEarliestStartTime || '',
    )
  }
}

/** 时间段确认：更新内部时间段数据 + 通知父组件 */
const onRangeTimeConfirm = ({
  startTime,
  endTime,
  customFlag,
}: {
  startTime: Date
  endTime: Date
  customFlag: boolean
}) => {
  const st = dayjs(startTime).format('YYYY/MM/DD HH:mm')
  let et = dayjs(endTime).format('YYYY/MM/DD HH:mm')

  et = et?.indexOf('00:00') > -1 ? `${dayjs(startTime).format('YYYY/MM/DD')} 24:00` : et

  rangeStartTime.value = st
  rangeEndTime.value = et
  rangeCustomFlag.value = customFlag

  emit('time-change', {
    timeType: 20,
    startTime: st,
    endTime: et,
    customFlag,
  })
}

/** 精准时间确认：更新内部精准时间数据 + 通知父组件 */
const onExactTimeConfirm = (time: Date) => {
  const st = dayjs(time).format('YYYY/MM/DD HH:mm')

  exactStartTime.value = st

  emit('time-change', {
    timeType: 10,
    startTime: st,
    endTime: st,
    customFlag: false,
  })
}

/** 重新加载时间数据 */
const onReload = (done: () => void) => {
  emit('reload', done)
}

defineExpose({
  toClearNotificationTimeError,
})
</script>

<style lang="scss">
.notify-time {
  margin-top: 16px;

  .notify-time__options {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .notify-time__item {
    display: flex;
    align-items: center;
    padding: 24px 16px;
    border-radius: 16px;
    border: 2px solid #e6e8ed;
    background: #fff;
    transition: all 0.2s;

    .notify-time__title {
      font-size: 28px;
      color: #24262b;
      font-weight: 500;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .notify-time__right {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      min-width: 0;
    }

    .notify-time__value {
      font-size: 26px;
      color: #24262b;
      font-weight: 500;
      margin-right: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .notify-time__placeholder {
      font-size: 26px;
      color: #8c8f99;
      margin-right: 8px;
    }

    .notify-time__arrow {
      width: 23px;
      height: 23px;
      flex-shrink: 0;
    }

    &.is-active {
      border-color: #8365f6;
      background: rgba(131, 101, 246, 0.04);

      .notify-time__title {
        color: #8365f6;
      }

      .notify-time__value {
        color: #8365f6;
      }
    }
  }
  .time-is-error {
    .notify-time__placeholder {
      color: #ff706d !important;
    }
  }
}

/* #ifdef h5 */
.time-range-picker-header,
.custom-time-picker-header {
  taro-image-core {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    img {
      width: 32px;
      height: 32px;
    }
  }
}
.custom-time-picker-header {
  taro-image-core {
    width: 32px;
    height: 32px;
    margin-right: 24px;
  }
}
/* #endif */
</style>
