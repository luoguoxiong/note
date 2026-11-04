<template>
  <!-- 选择时间段弹窗 -->
  <ky-popup v-model:show="show" safeAreaInsetBottom position="bottom" :catchMove="true">
    <view class="time-range-picker-header">
      选择时间段
      <view class="time-range-picker-header-close" @tap="show = false">
        <image src="https://ic-img.ky-express.com/netc/20250118_42870395139_!!1737186469837_64_64.png" />
      </view>
    </view>

    <!-- 空数据缺省页 -->
    <view v-if="isEmpty" class="time-range-picker-empty">
      <ky-empty
        type="https://ic-img.ky-express.com/netc/20260713_31594_!!1783933382715_560_560.png"
        description="系统开小差啦~可点击重新加载"
      >
        <ky-button
          :loading="reloadLoading"
          plain
          type="primary"
          size="small"
          text="重新加载"
          loading-text="重新加载"
          @click="onReload"
          class="time-range-reload-btn"
        />
      </ky-empty>
    </view>

    <!-- 正常数据 -->
    <template v-else>
      <view class="time-range-picker-content">
        <DateRadio v-model:activeDate="activeDate" :dateRadioList="dateRadioList" @change="dateRadioChange" />

        <RangePick
          ref="rangePickRef"
          v-model:activeTime="activeTime"
          :matchPeriods="matchPeriods"
          :timeRanges="timeRanges"
        />
      </view>
    </template>
    <view class="time-range-picker-footer">
      <ky-button block type="primary" size="large" :disabled="isEmpty" @click="handleFooterConfirm"> 确定 </ky-button>
    </view>
  </ky-popup>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick, watch } from 'vue'
import dayjs from 'dayjs'
import Taro from '@tarojs/taro'
import KyPopup from '@packages/__components/popup'
import KyButton from '@packages/__components/button'
import KyEmpty from '@packages/__components/empty'
import DateRadio from './date-radio.vue'
import RangePick from './range-pick.vue'
import 'dayjs/locale/zh-cn'
dayjs.locale('zh-cn')

const props = withDefaults(
  defineProps<{
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
  }>(),
  {
    choosableTimes: () => [],
  },
)

const emit = defineEmits<{
  (
    e: 'confirm',
    time: {
      startTime: Date
      endTime: Date
    },
  ): void
  (e: 'reload', done: () => void): void
}>()

const rangePickRef = ref()
const activeDate = ref<null | string>(null)
const activeTime = ref<null | { startTime: string; endTime: string }>(null)
const matchPeriods = ref<
  {
    periodType: number
    startTime: string
    endTime: string
  }[]
>([])
const timeRanges = ref<
  {
    text: string
    hour: number
    children: Array<{ minute: number }>
  }[]
>([])

const reloadLoading = ref(false)

// 保存 openDialog 的参数，用于重新加载后回显
const lastOpenParams = ref<{
  startTime: string | number | Date
  endTime: string | number | Date
} | null>(null)

const dateRadioList = computed(() => {
  return props.choosableTimes.map((v) => {
    return {
      label: dayjs(v.date).format('MM/DD'),
      date: v.date,
      dayOfWeek: v.dayOfWeek,
    }
  })
})

const isEmpty = computed(() => !props.choosableTimes || props.choosableTimes.length === 0)

const handleFooterConfirm = () => {
  if (isEmpty.value) {
    Taro.showToast({ title: '请选择时间段', icon: 'none' })
    return
  }
  confirm()
}

const onReload = () => {
  reloadLoading.value = true
  emit('reload', () => {
    reloadLoading.value = false
  })
}

const dateRadioChange = async (time: string) => {
  activeTime.value = null
  const filterActiveTime = props.choosableTimes.filter((v) => String(v.date) === String(time))?.[0] || {}
  matchPeriods.value =
    filterActiveTime?.matchPeriods?.map((v) => ({
      ...v,
      startTime: v.startTime?.replace(':00', ''),
      endTime: v.endTime?.replace(':00', ''),
    })) || []
  timeRanges.value = filterActiveTime?.timeRanges || []

  await nextTick()
  rangePickRef.value?.initData()
}

const padZero = (num: number, targetLength = 2): string => {
  return String(num).padStart(targetLength, '0')
}

const businessTime = ref({
  weekdays: { start: '08:00', end: '18:00' },
  weekends: { start: '08:00', end: '18:00' },
})

const show = ref<boolean>(false)
const exactStartTime = ref<Date | null>(null)

const nowDay = dayjs().toDate()
const startDate = computed(() => (exactStartTime.value ? exactStartTime.value : nowDay))
const endDate = computed(() => dayjs(nowDay).add(15, 'day'))

const diyTime = computed(() =>
  calendarDefaultDate.value ? `:${dayjs(calendarDefaultDate.value).format('YYYY/MM/DD')}` : '',
)

const calendarShow = ref<boolean>(false)
const calendarDefaultDate = ref<Date>()

const confirm = () => {
  if (!activeDate.value || !activeTime.value || !activeTime.value?.startTime || !activeTime.value?.endTime) {
    Taro.showToast({ title: '日期选择有误', icon: 'none' })
    return
  }
  const startTime = dayjs(`${activeDate.value} ${activeTime.value?.startTime}`)
  const endTime = dayjs(`${activeDate.value} ${activeTime.value?.endTime}`)

  emit('confirm', { startTime: startTime.toDate(), endTime: endTime.toDate() })
  show.value = false
}

const openDialog = async ({
  startTime,
  endTime,
}: {
  startTime: string | number | Date
  endTime: string | number | Date
}) => {
  // 保存参数用于重新加载后回显
  lastOpenParams.value = { startTime, endTime }
  reloadLoading.value = false

  const lastDate = dayjs(startTime).format('YYYY-MM-DD')
  if (dateRadioList.value.find((v) => dayjs(v.date).format('YYYY-MM-DD') === lastDate)) {
    activeDate.value = lastDate
    const filterActiveTime = props.choosableTimes.filter((v) => String(v.date) === String(activeDate.value))?.[0] || {}
    matchPeriods.value =
      filterActiveTime?.matchPeriods?.map((v) => ({
        ...v,
        startTime: v.startTime?.replace(':00', ''),
        endTime: v.endTime?.replace(':00', ''),
      })) || []
    timeRanges.value = filterActiveTime?.timeRanges || []
    if (endTime) {
      const endTimeLabel = dayjs(endTime).format('HH:mm')
      activeTime.value = {
        startTime: dayjs(startTime).format('HH:mm'),
        endTime: endTimeLabel === '00:00' ? '24:00' : endTimeLabel,
      }
    }
  } else {
    if (!dateRadioList.value.length) {
      show.value = true
      return
    }
    const firstDate = dateRadioList.value?.[0]
    activeDate.value = dayjs(firstDate.date).format('YYYY-MM-DD')
    const filterActiveTime = props.choosableTimes.filter((v) => String(v.date) === String(activeDate.value))?.[0] || {}
    matchPeriods.value =
      filterActiveTime?.matchPeriods?.map((v) => ({
        ...v,
        startTime: v.startTime?.replace(':00', ''),
        endTime: v.endTime?.replace(':00', ''),
      })) || []
    timeRanges.value = filterActiveTime?.timeRanges || []
    const firstTime = matchPeriods.value?.[0]
    if (firstTime) {
      activeTime.value = {
        startTime: firstTime.startTime,
        endTime: firstTime.endTime,
      }
    }
  }
  show.value = true
  await nextTick()
  // 赋值后，需要更新range-pick默认值
  rangePickRef.value?.initData()
}

// 监听 choosableTimes 变化，数据从空变为非空且弹窗已打开时重新初始化
watch(
  () => props.choosableTimes,
  (newVal, oldVal) => {
    const wasEmpty = !oldVal || oldVal.length === 0
    const nowNotEmpty = newVal && newVal.length > 0
    if (wasEmpty && nowNotEmpty && show.value && lastOpenParams.value) {
      openDialog(lastOpenParams.value)
    }
  },
  { deep: true },
)

defineExpose({
  openDialog,
})
</script>

<style lang="scss">
.time-range-picker-header {
  // padding: 26px 32px;
  padding: 16px 16px 16px 32px;
  font-size: 34px;
  font-weight: 600;
  line-height: 42px;
  color: #24262b;
  box-sizing: border-box;
  border-bottom: 1px solid #e6e8ed;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .time-range-picker-header-close {
    height: 64px;
    width: 64px;
    display: flex;
    justify-content: center;
    align-items: center;

    image {
      width: 32px;
      height: 32px;
    }
  }
}

.time-range-picker-content {
  max-height: 632px;
  display: flex;
}

.time-range-picker-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 632px;
  .time-range-reload-btn {
    margin: 12px 0 24px;
  }
}

.time-range-picker-footer {
  padding: 16px 32px;
  border-top: 1px solid #ebedf5;
  box-shadow: 0px -2px 8px 0px rgba(0, 0, 0, 0.05);

  button {
    width: 100%;
  }
}
</style>
