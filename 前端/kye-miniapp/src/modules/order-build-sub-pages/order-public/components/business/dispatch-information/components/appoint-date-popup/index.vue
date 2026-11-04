<template>
  <BottomPopup
    :show="visible"
    title="预约时间"
    :show-tips="!!config?.optionTips"
    :tip-text="config?.optionTips || ''"
    :close-on-click-overlay="true"
    :loading="loading"
    @onClose="visible = false"
    @onConfirm="onConfirm"
    class="appoint-date-popup"
  >
    <template #tips>
      <span class="appoint-date-title-tip" v-if="config?.optionTips">{{ config?.optionTips }}</span>
    </template>
    <view class="appoint-date-content">
      <view class="appoint-date-tip">
        <SvgIcon class="tip-icon" name="icon-tips" />
        <view>{{ appointDateRemark }}</view>
      </view>
      <view class="appoint-date-time">
        <NotificationTime
          :timeType="timeType"
          :rangeStartTime="rangeStartTime"
          :rangeEndTime="rangeEndTime"
          :rangeCustomFlag="rangeCustomFlag"
          :exactStartTime="exactStartTime"
          :choosableTimes="choosableTimes"
          @time-change="onTimeChange"
          @reload="(done) => onReload(done)"
          :exactTimeEarliestStartTime="exactTimeEarliestStartTime"
        />
      </view>
    </view>
  </BottomPopup>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import BottomPopup from '@order-public-sub-public/components/ui/bottom-popup/index.vue'
import NotificationTime from '@order-public-sub-public/components/business/added-service/components/notification-time/index.vue'
import SvgIcon from '@order-global-package-order-sub/components/ui/svg-icon/index.vue'
import { pickupConfig } from '@order-public-sub-public/apis/pickup/type'
import { IChoosableTimesItem } from '@order-public-sub-public/apis/waybill/types'
import { useStore } from '@order-public-sub-public/store'
import { FeeTypeEnum, WEEK_DAYS } from '@order-public-sub-public/constants'
import { effectBubble } from '@order-public-sub-public/validate/effect/effectBubble'
import { localCheckResult } from '@order-public-sub-public/types'

dayjs.locale('zh-cn')

interface NotificationData {
  timeType?: number
  customFlag?: boolean
  startTime?: string
  endTime?: string
}

const props = defineProps<{
  modelValue: boolean
  config: pickupConfig | null
  notificationData?: NotificationData | null
  choosableTimes: IChoosableTimesItem[]
  exactTimeEarliestStartTime?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
  (e: 'confirm', displayStr: string, notification: NotificationData | null): void
  (e: 'reload', done: () => void): void
}>()

const piniaStore = useStore()

const visible = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const curWaybillNumber = computed(() => piniaStore.order.waybillNumber)

// 获取等通知服务费
const getGoodsControlFee = computed(() => {
  let goodsControlFee = ''
  const responsesMap = piniaStore.globalData.estimatedCost?.responsesMap || {}
  const addedValueDetailTipList =
    responsesMap[curWaybillNumber.value as string]?.feeResponse?.addedValueDetailTipList ?? []
  goodsControlFee =
    (addedValueDetailTipList?.find((v) => v.type === FeeTypeEnum.等通知服务费)?.feeAmount as unknown as string) ?? ''
  return goodsControlFee ? Number(goodsControlFee).toFixed(2) : ''
})

const appointDateRemark = computed(
  () => `设置后，将会收取${getGoodsControlFee.value + (getGoodsControlFee.value ? '元' : '')}等通知服务费`,
)

const loading = ref(false)
const timeType = ref<10 | 20 | ''>('')
const rangeStartTime = ref('')
const rangeEndTime = ref('')
const rangeCustomFlag = ref(false)
const exactStartTime = ref('')

const onTimeChange = (payload: { timeType: 10 | 20; startTime: string; endTime: string; customFlag: boolean }) => {
  timeType.value = payload.timeType
  if (payload.timeType === 20) {
    rangeCustomFlag.value = payload.customFlag
    rangeStartTime.value = payload.startTime
    rangeEndTime.value = payload.endTime
  } else {
    exactStartTime.value = payload.endTime || ''
  }
}

const onReload = (done: () => void) => {
  emit('reload', done)
}

// 从外部传入的 notificationData 回显数据
const initFromNotificationData = () => {
  const n = props.notificationData
  console.log(props.notificationData, 'props.notificationData')
  if (n && n.timeType) {
    timeType.value = (n.timeType as 10 | 20) || ''
    rangeCustomFlag.value = n.customFlag || false
    if (n.timeType === 20) {
      rangeStartTime.value = n.startTime || ''
      rangeEndTime.value = n.endTime || ''
      exactStartTime.value = ''
    } else if (n.timeType === 10) {
      exactStartTime.value = n.endTime || ''
      rangeStartTime.value = ''
      rangeEndTime.value = ''
    }
  } else {
    timeType.value = ''
    rangeStartTime.value = ''
    rangeEndTime.value = ''
    rangeCustomFlag.value = false
    exactStartTime.value = ''
  }
  console.log(rangeStartTime.value, 'rangeStartTime.value', rangeEndTime.value)
}

// 组装 notification 对象用于提交
const getNotificationPayload = (): NotificationData | null => {
  if (!timeType.value) return null
  const result: NotificationData = {
    timeType: timeType.value,
    customFlag: rangeCustomFlag.value,
  }
  if (timeType.value === 20) {
    result.startTime = rangeStartTime.value
    result.endTime = rangeEndTime.value
  } else if (timeType.value === 10) {
    result.startTime = ''
    result.endTime = exactStartTime.value
  }
  return result
}

const formatAppointDate = (): string => {
  if (timeType.value === 20) {
    if (!rangeStartTime.value || !rangeEndTime.value) return ''
    const start = dayjs(rangeStartTime.value)
    const end = dayjs(rangeEndTime.value)
    return `${start.format('MM/DD')} ${WEEK_DAYS[start.day()]} ${start.format('HH:mm')}-${end.format('HH:mm')}`
  } else if (timeType.value === 10) {
    if (!exactStartTime.value) return ''
    const t = dayjs(exactStartTime.value)
    return `${t.format('MM/DD')} ${WEEK_DAYS[t.day()]} ${t.format('HH:mm')}`
  }
  return ''
}

const onConfirm = async () => {
  // 校验预约时间
  let validate: localCheckResult = { key: 'addedService.notificationTime', passed: true, content: '' }
  if (!timeType.value) {
    // validate = {
    //   key: 'addedService.notificationTime',
    //   passed: false,
    //   content: '请选择时间段或精准时间',
    // }
    visible.value = false
  } else if (timeType.value === 20) {
    if (!rangeStartTime.value || !rangeEndTime.value) {
      validate = {
        key: 'addedService.deliverySegmentTime',
        passed: false,
        content: '请选择时间段',
        bubbleConfig: { placement: 'top-end', offset: [0, 16] },
      }
    }
  } else if (timeType.value === 10) {
    if (!exactStartTime.value) {
      validate = {
        key: 'addedService.deliveryExactTime',
        passed: false,
        content: '请选择精准时间',
        bubbleConfig: { placement: 'top-end', offset: [0, 16] },
      }
    }
  }

  if (!validate.passed) {
    await effectBubble([validate])
    return
  }

  const displayStr = formatAppointDate()
  const notification = getNotificationPayload()
  emit('confirm', displayStr, notification)
  visible.value = false
}

// 弹窗打开时回显数据
watch(visible, async (v) => {
  if (v) {
    initFromNotificationData()
  }
})
</script>

<style lang="scss">
.appoint-date-title-tip {
  font-size: 24px;
  color: #8c8f99;
  margin-left: 8px;
}
.appoint-date-popup {
  .container__body {
    padding: 0;
  }
  .appoint-date-content {
    .appoint-date-tip {
      font-size: 24px;
      line-height: 34px;
      color: #ff9300;
      padding: 16px 32px;
      background: #fff3e5;
      border-radius: 8px;
      display: flex;
      align-items: center;
      margin-bottom: 16px;

      .tip-icon {
        width: 22px;
        height: 22px;
        padding-top: 2px;
        margin-right: 8px;
        flex-shrink: 0;
      }
    }

    .appoint-date-time {
      padding: 0 32px 16px;
    }
  }
}
</style>
