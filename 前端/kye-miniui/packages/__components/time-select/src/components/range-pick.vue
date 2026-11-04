<template>
  <view class="range-picker-box">
    <ky-radio-group v-model="activePeriod" direction="vertical" class="range-picker-date" @change="activePeriodChange">
      <ky-radio
        v-for="item in matchPeriods"
        :name="item.periodType"
        :key="item.periodType"
        label-position="left"
        class="range-picker-date-item"
      >
        {{ PERIOD_TYPE_DIC?.[item.periodType] }}
        <view class="range-picker-date-item-label">{{ item.startTime }}-{{ item.endTime }}</view>
      </ky-radio>
      <view class="disable-label-view-box" @click.stop="openCustomTimePicker">
        <view class="disable-label-view"></view>
        <ky-radio
          :name="-1"
          label-position="left"
          class="range-picker-date-item"
        >
          自定义时段
          <view class="range-picker-date-item-label">
            {{ customTimeLabel }}
            <text v-show="customTimeLabel">修改</text>
          </view>
        </ky-radio>
      </view>
    </ky-radio-group>

    <CustomTimePicker
      ref="customTimePickerRef"
      :timeRanges="timeRanges"
      @confirm="customTimeConfirm"
    />
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import KyRadioGroup from '@packages/__components/radiogroup'
import KyRadio from '@packages/__components/radio'
import CustomTimePicker from './custom-time-picker.vue'

const PERIOD_TYPE_DIC = {
  0: '全天',
  1: '上午',
  2: '下午',
  3: '晚上',
  4: '夜间',
  5: '凌晨',
}

const emits = defineEmits(['update:activeTime', 'change'])

const props = withDefaults(
  defineProps<{
    activeTime: null | { startTime: string; endTime: string }
    matchPeriods: Array<{
      periodType: number
      startTime: string
      endTime: string
    }>
    timeRanges:  Array<{
      text: string
      hour: number
      children: Array<{ minute: number }>
    }>
  }>(),
  {
    matchPeriods: () => [],
    timeRanges: () => []
  }
)


const customTimeLabel = ref()

const customTimePickerRef = ref()
const openCustomTimePicker = () => {
  const [startTime, endTime] = customTimeLabel.value?.split('-') || []
  customTimePickerRef.value?.openDialog({
    startTime,
    endTime
  })
}

const customTimeConfirm = ({ startTime, endTime }) => {
  activePeriod.value = -1
  customTimeLabel.value = `${startTime}-${endTime}`
  emits('update:activeTime', {
    startTime: startTime,
    endTime: endTime,
  })
}

const activePeriod = ref<number>()

/* #ifdef h5 */
// 修复h5端切换异常的问题
watch(activePeriod, (newVal) => {
  if (typeof newVal === 'string') {
    activePeriod.value = Number(newVal)
  }
}, { immediate: true })
/* #endif */

const activePeriodChange = (params) => {
  if (params > -1) {
    const currentMatchPeriod = props.matchPeriods.filter(v => Number(v.periodType) === Number(params))?.[0] || {}
    emits('update:activeTime', {
      startTime: currentMatchPeriod.startTime,
      endTime: currentMatchPeriod.endTime,
    })
  } else {
    //
  }
}

const initData = () => {
  // 无值时赋默认值，有值直接展示
  if (props.activeTime === null) {
    activePeriod.value = 0
    activePeriodChange(0)
    customTimeLabel.value = undefined
  } else {
    const currentMatchPeriod = props.matchPeriods.filter(v => v.startTime === props.activeTime.startTime && v.endTime === props.activeTime.endTime)?.[0] || null
    activePeriod.value = currentMatchPeriod ? currentMatchPeriod.periodType : -1
    if (!currentMatchPeriod) {
      customTimeLabel.value = `${props.activeTime.startTime}-${props.activeTime.endTime}`
    }
  }
}

defineExpose({
  initData
})
</script>

<style lang="scss">
.range-picker-box {
  background: #fff;
  flex: 1;
  display: flex;

  .range-picker-date-item {
    padding-top: 22px !important;
    padding-bottom: 22px !important;
    margin-top: 0 !important;
  }

  .disable-label-view-box {
    position: relative;

    .disable-label-view {
      position: absolute;
      top: 0;
      bottom: 0;
      right: 0;
      left: 0;
      z-index: 10;
    }
  }
}

.range-picker-date {
  flex: 1;

  .range-picker-date-item:not(.ky-radio-item) {
    padding: 24px 32px;
    font-size: 28px;
    line-height: 40px;
    margin-bottom: 0;
    color: #24262B;
    display: flex;

    &.ky-radio--active {
      .ky-radio-text {
        color: #8365F6;
        font-weight: 600;

        .range-picker-date-item-label {
          font-weight: 500;
          color: #8365F6;

          text {
            font-weight: 600;
          }
        }
      }
    }

    .range-picker-date-item-label {
      margin-left: 8px;
      font-size: 24px;
      color: #8C8F99;
      display: inline-block;
    }
  }
}
</style>
