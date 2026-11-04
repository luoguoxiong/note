<template>
  <custom-wrapper>
    <div class="goods-time-wrap">
      <ky-cell placeholder="请选择" @click="() => handlePopupVisible(true)" :large-value="true" :is-link="true">
        <template #title>
          <div class="font-level3 flex items-center">
            货好时间
            <!-- <image
              class="goods-time-required"
              src="https://ic-img.ky-express.com/netc/20251125_85651_!!1764053762476_22_14.svg+xml"
            /> -->
          </div>
        </template>
        <template #value v-if="showTime">
          <div class="pa-sev-unf-value">
            {{ showTime }}
          </div>
        </template>
      </ky-cell>
      <GoodsTimePopup
        v-model:visible="showGoodsTimePopup"
        :selfSignFlag="goodsTimeStore.goodsTime.selfSignFlag"
        :urgentGoods="goodsTimeConfig.urgentGoods"
        :config="goodsTimeConfig"
        :goodsTime="goodsTimeStore.goodsTime.goodsTime"
        @confirm="handleConfirm"
        @confirmNow="handleConfirmNow"
        @selectTime="handleSelectTime"
      />
    </div>
  </custom-wrapper>
</template>

<script setup lang="ts">
import GoodsTimePopup from '@order-global-package-freight-time/components/ui/goods-time-popup/index.vue'
import { ref, onBeforeMount, onMounted, computed, watch } from 'vue'
import { useFreightTimeStore } from '../../store'
import {
  GoodsTimeType,
  UrgentGoods,
} from '@order-global-package-freight-time/components/ui/goods-time-popup/goods-time'
import type { GoodsTime } from '@order-global-package-freight-time/components/ui/goods-time-popup/goods-time'
import dayjs from 'dayjs'
import { GoodsTimeFlag } from '../../types'
import { getGoodsBatch } from '../../api/index'
import { getSendAddress } from '../sendAndReceive/hooks/useState'
import { getCurrentTimeOption } from '../../utils'
import './index.scss'
import { clk_express_goods_now_v1, other_express_single_goods_times_v1 } from '../../report'

const goodsTimeInterVal = 15

const goodsTimeIntervalMinuteOffset = 15

const goodsTimeConfig = ref<any>({
  alias: '货好时间',
  inputMode: GoodsTimeType.CUSTOM,
  crmGoodsTimeConfig: {
    goodsTips: '请选择货好时间',
    goodsTimeFlag: true,
    timeRange: {
      startDate: dayjs().format('YYYY-MM-DD'),
      startTime: '08:00:00',
      endDate: dayjs().add(7, 'day').format('YYYY-MM-DD'),
      endTime: '21:00:00',
      minuteStep: 15,
      timePeriodType: 20,
      timeBatch: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
    },
    goodsTimeNotifyLater: false,
    isShowAllDay: false,
  },
  erpGoodsTimeConfig: {
    alias: '货好时间',
    packageGoodsTimeType: GoodsTimeType.CUSTOM,
    timeRangeList: [
      {
        startDate: dayjs().format('YYYY-MM-DD'), // 今天
        startTime: '00:00:00', // 开始时间 08:00
        endDate: dayjs().add(30, 'day').format('YYYY-MM-DD'), // 7天后
        endTime: '23:59:59', // 结束时间 21:00
        interval: goodsTimeInterVal, // 时间间隔 15分钟
        intervalMinuteOffset: goodsTimeIntervalMinuteOffset,
      },
    ],
    defaultGoodsTime: 'currentTime',
    goodsTimeFlag: true,
    goodsTips: '',
    goodsTimeNotifyLater: false,
  },
  urgentGoods: 0,
})

const goodsTimeStore = useFreightTimeStore()

const showGoodsTimePopup = ref(false)

const handlePopupVisible = (visible: boolean) => {
  showGoodsTimePopup.value = visible
}

const handleSelectTime = (timeData: { type: string; data: GoodsTime }) => {
  goodsTimeStore.setGoodsTime({
    goodsTime: timeData.data.goodsTime,
    goodsTimeFlag: timeData.data.goodsTimeFlag,
    selfSignFlag: timeData.data.selfSignFlag,
  })
  showGoodsTimePopup.value = false
}

onBeforeMount(() => {
  const defaultGoodsTime = getCurrentTimeOption({
    interval: goodsTimeInterVal,
    intervalMinuteOffset: goodsTimeIntervalMinuteOffset,
  })
  goodsTimeStore.setGoodsTime({
    goodsTime: defaultGoodsTime,
    goodsTimeFlag: GoodsTimeFlag.NONE,
    selfSignFlag: false,
  })
})

const getDefaultBatchTime = (timeBatch: string[]) => {
  const currentHour = dayjs().hour()
  const currentMinute = dayjs().minute()
  const sortedBatch = [...timeBatch].sort()

  for (const batchTime of sortedBatch) {
    const [hour, minute] = batchTime.split(':').map(Number)
    if (hour > currentHour || (hour === currentHour && minute >= currentMinute)) {
      return dayjs().format('YYYY-MM-DD') + ' ' + batchTime
    }
  }

  return dayjs().add(1, 'day').format('YYYY-MM-DD') + ' ' + sortedBatch[0]
}

const updateBatchInfo = async () => {
  const sendAddr = getSendAddress().value
  const { data } = await getGoodsBatch({
    orderInfo: {
      sender: {
        province: sendAddr.province,
        city: sendAddr.city,
        county: sendAddr.county,
        detailAddress: sendAddr.detailAddress,
      },
    },
  })

  const timeBatch = data?.timeBatch || []

  if (timeBatch.length > 0) {
    goodsTimeConfig.value = {
      alias: '货好时间',
      inputMode: GoodsTimeType.ONLINE,
      crmGoodsTimeConfig: {
        goodsTips: '请选择货好时间',
        timeRange: {
          startDate: dayjs().format('YYYY-MM-DD'),
          startTime: '00:00:00', // 开始时间 08:00
          endDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
          endTime: '23:59:59', // 结束时间 21:00
          minuteStep: 15,
          timePeriodType: 20,
          timeBatch: timeBatch,
        },
        goodsTimeFlag: true,
        goodsTimeNotifyLater: false,
        isShowAllDay: false,
      },
      erpGoodsTimeConfig: {
        alias: '货好时间',
        packageGoodsTimeType: GoodsTimeType.CUSTOM,
        timeRangeList: [
          {
            startDate: dayjs().format('YYYY-MM-DD'), // 今天
            startTime: '00:00:00', // 开始时间 08:00
            endDate: dayjs().add(30, 'day').format('YYYY-MM-DD'), // 7天后
            endTime: '23:59:59', // 结束时间 21:00
            interval: goodsTimeInterVal, // 时间间隔 15分钟
            intervalMinuteOffset: goodsTimeIntervalMinuteOffset,
          },
        ],
        defaultGoodsTime: 'currentTime',
        goodsTimeFlag: true,
        goodsTips: '',
        goodsTimeNotifyLater: false,
      },
      urgentGoods: UrgentGoods.URGENT,
    }
    const currentGoodsTime = goodsTimeStore.goodsTime.goodsTime
    const parsedTime = currentGoodsTime ? dayjs(currentGoodsTime) : null
    const timePart = parsedTime && parsedTime.isValid() ? parsedTime.format('HH:mm') : ''
    const isInBatch = timeBatch.includes(timePart)
    goodsTimeStore.updateGoodsTimeType(!isInBatch)
  }
}

const getBatchInfo = async () => {
  const sendAddr = getSendAddress().value
  const { data } = await getGoodsBatch({
    orderInfo: {
      sender: {
        province: sendAddr.province,
        city: sendAddr.city,
        county: sendAddr.county,
        detailAddress: sendAddr.detailAddress,
      },
    },
  })

  const timeBatch = data?.timeBatch || []

  if (timeBatch.length > 0) {
    goodsTimeConfig.value = {
      alias: '货好时间',
      inputMode: GoodsTimeType.ONLINE,
      crmGoodsTimeConfig: {
        goodsTips: '请选择货好时间',
        timeRange: {
          startDate: dayjs().format('YYYY-MM-DD'),
          startTime: '00:00:00', // 开始时间 08:00
          endDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
          endTime: '23:59:59', // 结束时间 21:00
          minuteStep: 15,
          timePeriodType: 20,
          timeBatch: timeBatch,
        },
        goodsTimeFlag: true,
        goodsTimeNotifyLater: false,
        isShowAllDay: false,
      },
      erpGoodsTimeConfig: {
        alias: '货好时间',
        packageGoodsTimeType: GoodsTimeType.CUSTOM,
        timeRangeList: [
          {
            startDate: dayjs().format('YYYY-MM-DD'), // 今天
            startTime: '00:00:00', // 开始时间 08:00
            endDate: dayjs().add(30, 'day').format('YYYY-MM-DD'), // 7天后
            endTime: '23:59:59', // 结束时间 21:00
            interval: goodsTimeInterVal, // 时间间隔 15分钟
            intervalMinuteOffset: goodsTimeIntervalMinuteOffset,
          },
        ],
        defaultGoodsTime: 'currentTime',
        goodsTimeFlag: true,
        goodsTips: '',
        goodsTimeNotifyLater: false,
      },
      urgentGoods: UrgentGoods.URGENT,
    }
    const defaultGoodsTime = getDefaultBatchTime(timeBatch)
    goodsTimeStore.setGoodsTime({
      goodsTime: defaultGoodsTime,
      goodsTimeFlag: GoodsTimeFlag.NONE,
      selfSignFlag: false,
    })
  } else {
    const defaultGoodsTime = getCurrentTimeOption({
      interval: goodsTimeInterVal,
      intervalMinuteOffset: goodsTimeIntervalMinuteOffset,
    })
    goodsTimeStore.setGoodsTime({
      goodsTime: defaultGoodsTime,
      goodsTimeFlag: GoodsTimeFlag.NONE,
      selfSignFlag: false,
    })
  }
}

const sendAddressRef = getSendAddress()
watch(
  () => sendAddressRef.value,
  (newSender) => {
    if (newSender && (newSender.province || newSender.city || newSender.county || newSender.detailAddress)) {
      updateBatchInfo()
    }
  },
  { deep: true },
)

const showTime = computed(() =>
  goodsTimeStore.goodsTime.goodsTimeFlag === GoodsTimeFlag.NOW ? '现在货好' : goodsTimeStore.goodsTime.goodsTime,
)

const handleConfirm = () => {
  other_express_single_goods_times_v1()
}

const handleConfirmNow = () => {
  clk_express_goods_now_v1()
}

onMounted(() => {
  getBatchInfo()
})
</script>

<style lang="scss">
.goods-time-wrap {
  .ky-cell {
    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
  }
}
</style>
