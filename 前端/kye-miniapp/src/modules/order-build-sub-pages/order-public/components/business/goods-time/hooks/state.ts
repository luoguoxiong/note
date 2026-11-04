import { GoodsTimeFlag, ModuleType } from '@order-public-sub-public/constants'
import { GoodsTime, GoodsTimeOptimiDimension, NightPickFeeDimension } from '@order-public-sub-public/types'

import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

export const timeVisible = ref(false)

export const openGoodsTimeByService = ref(false)

export const editGoodsTimeByServiceTips = ref('')

export const goodsTimeData = computed(() => {
  return piniaStore.order.moduleFormData(ModuleType['货好时间'])
})

export const goodsTime = computed(() => {
  return goodsTimeData.value?.goodsTime || ''
})

export const isNowGoodsTime = computed(() => {
  return goodsTimeData.value?.goodsTimeFlag + '' === GoodsTimeFlag.NOW + ''
})

export const nightPickupFeeTips = computed(() => {
  const checkData = piniaStore.schema.moduleDimensionData(ModuleType['夜间取货费'])
  return checkData?.nightPickupFeeTips || ''
})

export const filterTime = (time: string) => {
  if (time) {
    return dayjs(time).format('YYYY/MM/DD HH:mm')
  }
  return '请选择'
}

export const goodsTimeOptimiTips = computed(() => {
  const checkData = piniaStore.schema.moduleDimensionData(ModuleType['重货物一小时内提示'])
  return checkData?.goodsTimeOptimiTips || ''
})

export const iconStyle = computed(() => {
  return nightPickupFeeTips.value || goodsTimeOptimiTips.value ? 'night-pickup-fee-icon' : 'no-night-pickup-fee-icon'
})
