<template>
  <!-- 自定义时间段弹窗 -->
  <ky-popup v-model:show="show" :enable="false" safeAreaInsetBottom position="bottom">
    <view class="custom-time-picker-header">
      <image src="https://ic-img.ky-express.com/netc/20251217_32433_!!1765953280468_64_64.png" @tap="show = false" />
      自定义时间段
    </view>

    <view class="custom-time-picker-content">
      <view class="custom-time-picker-content-item custom-time-picker-content-left">
        <text class="title">{{ chooseStartTime?.join(':') }}</text>
        <text class="subtitle">开始时间</text>
        <ky-picker
          :poppable="false"
          v-model="chooseStartTime"
          :showToolbar="false"
          :columns="startColumns"
          @change="({ selectedValue }) => (chooseStartTime = selectedValue)"
        />
      </view>
      <view class="custom-time-picker-content-item custom-time-picker-content-right">
        <text class="title">{{ chooseEndTime?.join(':') }}</text>
        <text class="subtitle">结束时间</text>
        <ky-picker
          :poppable="false"
          v-model="chooseEndTime"
          :showToolbar="false"
          :columns="endColumns"
          @change="({ selectedValue }) => (chooseEndTime = selectedValue)"
        />
      </view>
    </view>

    <view class="custom-time-picker-footer">
      <ky-button block type="primary" size="large" @click="confirm"> 确定 </ky-button>
    </view>
  </ky-popup>
</template>

<script lang="ts" setup>
import { ref, computed, watch, nextTick } from 'vue'
import KyPopup from '@packages/__components/popup'
import KyPicker from '@packages/__components/picker'
import KyButton from '@packages/__components/button'

const props = withDefaults(
  defineProps<{
    timeRanges: Array<{
      text: string
      hour: number
      children: Array<{ minute: number }>
    }>
  }>(),
  {
    timeRanges: () => [],
  },
)

interface ITime {
  startTime: string
  endTime: string
}

const emit = defineEmits<{
  (e: 'confirm', time: ITime): void
}>()

const padZero = (num: number, targetLength = 2): string => {
  return String(num).padStart(targetLength, '0')
}

const chooseStartTime = ref(['00', '00'])
const chooseEndTime = ref(['00', '00'])

const originColumns = computed(() => {
  return props.timeRanges.map((v) => {
    return {
      ...v,
      hour: v.hour,
      text: `${padZero(v.hour)}点`,
      value: `${padZero(v.hour)}`,
      children: v.children.map((vv) => ({
        ...vv,
        text: `${padZero(vv.minute)}分`,
        value: `${padZero(vv.minute)}`,
      })),
    }
  })
})

const getLastTimeInMinutes = () => {
  const lastHour = originColumns.value.at(-1)
  if (!lastHour) return 0

  const lastMinute = lastHour.children.at(-1)
  if (!lastMinute) return 0

  return lastHour.hour * 60 + lastMinute.minute
}

const startColumns = computed(() => {
  if (!originColumns.value.length) return []

  const lastTimeMinutes = getLastTimeInMinutes()
  const maxStartMinutes = lastTimeMinutes - 120

  return originColumns.value
    .map((hourItem) => {
      const hourMinutes = hourItem.hour * 60

      // 这个小时完全超出
      if (hourMinutes > maxStartMinutes) return null

      // 精确过滤分钟
      const children = hourItem.children.filter((child) => {
        return hourMinutes + child.minute <= maxStartMinutes
      })

      if (!children.length) return null

      return {
        ...hourItem,
        children,
      }
    })
    .filter(Boolean)
})

const timeToMinutes = ([hour, minute]: string[]) => {
  return Number(hour) * 60 + Number(minute)
}

const hourToMinutes = (hour: number) => hour * 60

const endColumns = computed(() => {
  if (!originColumns.value.length) return []

  const startMinutes = timeToMinutes(chooseStartTime.value)
  const minEndMinutes = startMinutes + 120

  return originColumns.value
    .map((hourItem) => {
      const hourMinutes = hourToMinutes(hourItem.hour)

      // 整个小时都不够 2 小时，直接丢弃
      if (hourMinutes + 59 < minEndMinutes) return null

      // 过滤分钟
      const children = hourItem.children.filter((child) => {
        return hourMinutes + child.minute >= minEndMinutes
      })

      if (!children.length) return null

      return {
        ...hourItem,
        children,
      }
    })
    .filter(Boolean)
})

watch(
  [endColumns],
  () => {
    if (!endColumns.value.length) return

    const firstHour = endColumns.value[0]
    const firstMinute = firstHour.children[0]

    // 开始时间变化 → 结束时间直接吸附到第一个合法值
    chooseEndTime.value = [firstHour.value, firstMinute.value]
  },
  { immediate: true },
)

const confirm = () => {
  emit('confirm', { startTime: chooseStartTime.value.join(':'), endTime: chooseEndTime.value.join(':') })
  show.value = false
}

const show = ref<boolean>(false)

const openDialog = async ({ startTime, endTime }: ITime) => {
  if (!originColumns.value.length) return
  chooseStartTime.value = startTime?.split(':') || [
    startColumns.value?.[0].value,
    startColumns.value?.[0]?.children[0].value,
  ]
  await nextTick()
  chooseEndTime.value = endTime?.split(':') || [endColumns.value?.[0].value, endColumns.value?.[0]?.children[0].value]
  show.value = true
}

defineExpose({
  openDialog,
})
</script>

<style lang="scss">
.custom-time-picker-header {
  padding: 26px 32px;
  font-size: 34px;
  font-weight: 600;
  line-height: 42px;
  color: #24262b;
  box-sizing: border-box;
  border-bottom: 1px solid #e6e8ed;
  display: flex;
  // justify-content: space-between;
  align-items: center;

  image {
    margin-right: 24px;
    width: 32px;
    height: 32px;
  }
}

.custom-time-picker-content {
  padding: 48px 16px;
  border-radius: 16px;
  // border: 2px solid #e6e8ed;
  display: flex;

  .custom-time-picker-content-item {
    flex: 1;

    .title {
      margin-bottom: 4px;
      font-size: 48px;
      font-weight: 600;
      color: #24262b;
      display: block;
      text-align: center;
    }

    .subtitle {
      margin-bottom: 32px;
      font-size: 24px;
      line-height: 34px;
      color: #8c8f99;
      display: block;
      text-align: center;
    }
  }

  .custom-time-picker-content-left {
    padding-right: 9px;
    border-right: 1px solid #e6e8ed;
  }
  .custom-time-picker-content-right {
    padding-left: 9px;
  }
}

.custom-time-picker-footer {
  padding: 16px 32px;
  border-top: 1px solid #ebedf5;
  box-shadow: 0px -2px 8px 0px rgba(0, 0, 0, 0.05);

  button {
    width: 100%;
  }
}
</style>
