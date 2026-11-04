<template>
  <ky-picker
    ref="pickerRef"
    :visible-item-count="5"
    :columns="columns"
    v-model="modifyStartTime"
    v-model:show="show"
    confirm-button-text=""
    cancel-button-text=""
    :three-dimensional="false"
    title="选择精准时间"
    safeAreaInsetBottom
    @confirm="onConfirm"
    :show-close="true"
    :catchMove="true"
  >
    <template #empty>
      <view class="ky-time-select-empty-state">
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
            class="ky-time-select-reload-btn"
          />
        </ky-empty>
      </view>
    </template>
    <template #bottom>
      <view class="ky-picker__bottom">
        <ky-button
          class="ky-picker__bottom-button"
          type="primary"
          size="large"
          :disabled="isEmpty"
          @click="handleFooterConfirm"
        >
          确定
        </ky-button>
      </view>
    </template>
  </ky-picker>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import dayjs from 'dayjs'
import Taro from '@tarojs/taro'
import 'dayjs/locale/zh-cn'
import KyPicker from '@packages/__components/picker'
import KyEmpty from '@packages/__components/empty'
import KyButton from '@packages/__components/button'
dayjs.locale('zh-cn')

const props = withDefaults(
  defineProps<{
    choosableTimes: Array<{
      date: string
      dayOfWeek: number
      exactTimeRanges: Array<{
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
  (e: 'confirm', time: Date): void
  (e: 'reload', done: () => void): void
}>()

const modifyStartTime = ref<string[]>([])
const show = ref<boolean>(false)
const exactStartTime = ref<Date | null>(null)
const reloadLoading = ref(false)
const pickerRef = ref<any>(null)

// 保存 openDialog 的参数，用于重新加载后回显
const lastOpenParams = ref<{
  timeValue?: string | number | Date
  exactTimeEarliestStartTime?: string | number | Date
} | null>(null)

const isEmpty = computed(() => !props.choosableTimes || props.choosableTimes.length === 0)

const onReload = () => {
  reloadLoading.value = true
  emit('reload', () => {
    reloadLoading.value = false
  })
}

const handleFooterConfirm = () => {
  if (isEmpty.value) {
    Taro.showToast({ title: '请选择精确时间', icon: 'none' })
    return
  }
  pickerRef.value?.handleConfirm()
}

const businessTime = ref({
  weekdays: { start: '08:00', end: '18:00' },
  weekends: { start: '08:00', end: '18:00' },
})

const columns = computed(() => {
  return props.choosableTimes.map((v) => {
    return {
      text: dayjs(v.date).format('MM/DD ddd'),
      date: v.date,
      value: v.date,
      children: v.exactTimeRanges.map((vv) => ({
        text: padZero(vv.hour) + '时',
        hour: vv.hour,
        value: padZero(vv.hour),
        children: vv.children.map((vvv) => ({
          text: padZero(vvv.minute) + '分',
          minute: vvv.minute,
          value: padZero(vvv.minute),
        })),
      })),
    }
  })
})

const padZero = (num: number, targetLength = 2): string => {
  return String(num).padStart(targetLength, '0')
}

const fullMinutes = [
  { text: '00分', minute: 0, value: '00' },
  { text: '30分', minute: 30, value: '30' },
]

const onConfirm = ({ selectedValue }: { selectedValue: string[] }) => {
  modifyStartTime.value = selectedValue
  emit('confirm', dayjs(`${modifyStartTime.value[0]} ${modifyStartTime.value[1]}:${modifyStartTime.value[2]}`).toDate())
  show.value = false
}

const openDialog = async (timeValue?: string | number | Date, exactTimeEarliestStartTime?: string | number | Date) => {
  // 保存参数用于重新加载后回显
  lastOpenParams.value = { timeValue, exactTimeEarliestStartTime }
  const currentTime = dayjs(timeValue || (exactTimeEarliestStartTime ? exactTimeEarliestStartTime : Date.now()))
  modifyStartTime.value = [
    currentTime.startOf('day').format('YYYY-MM-DD'),
    currentTime.startOf('hour').format('HH'),
    currentTime.startOf('minute').format('mm'),
  ]
  // 需做限制拦截选择
  exactStartTime.value = exactTimeEarliestStartTime ? dayjs(exactTimeEarliestStartTime).toDate() : null
  reloadLoading.value = false
  show.value = true
}

// 监听 choosableTimes 变化，数据从空变为非空且弹窗已打开时重新初始化
watch(
  () => props.choosableTimes,
  (newVal, oldVal) => {
    const wasEmpty = !oldVal || oldVal.length === 0
    const nowNotEmpty = newVal && newVal.length > 0
    if (wasEmpty && nowNotEmpty && show.value && lastOpenParams.value) {
      openDialog(lastOpenParams.value.timeValue, lastOpenParams.value.exactTimeEarliestStartTime)
    }
  },
  { deep: true },
)

defineExpose({
  openDialog,
})
</script>

<style lang="scss">
.ky-time-select-empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 480px;
}
.ky-time-select-reload-btn {
  margin: 12px 0 24px;
}
</style>
