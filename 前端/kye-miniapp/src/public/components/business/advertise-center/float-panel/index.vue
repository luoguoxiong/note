<template>
  <FloatPanel :is-hide="isHide" v-if="adService.length > 0" :topLimit="props.topLimit">
    <FloatItem :data="adService" :expQt="expQt" @click="handleJump" @close="handleClose"></FloatItem>
  </FloatPanel>
</template>

<script setup lang="ts">
import FloatPanel from '@public/components/base/float-panel/index.vue'
import { advertisementJump, getReportSorce } from '@/public/components/business/advertise-center/utils'
import { computed, ref } from 'vue'
import { confirmByUserAdv, reportEvent } from '@/public/components/business/advertise-center/api'
import { IdetailList } from '../type'
import FloatItem from './item.vue'
import { report_CLK_event } from '@/public/utils'

interface Qt {
  event_code: string
  page_code: string
  region_code: string
  region_name: string
  event_name: string
}

const props = defineProps<{
  isHide?: boolean
  expQt?: Qt
  clkQt?: Qt
  topLimit: number
  modelValue: IdetailList[]
}>()

const emit = defineEmits<{
  // eslint-disable-next-line no-unused-vars
  (e: 'update:modelValue', value: IdetailList[]): void
}>()

const adService = computed({
  get() {
    return props.modelValue
  },
  set(value: IdetailList[]) {
    emit('update:modelValue', value)
  },
})

const reportFloatFloatPlaneClick = ({ advertising_code, button_name }) => {
  report_CLK_event('clk_homepage_advertising_space_button_v1', {
    ...props.clkQt,
    button_name,
    advertising_code,
  })
}

/**
 * 点击广告跳转
 */
const handleJump = async (item: IdetailList) => {
  if (!item) return

  const { advertisementCode, showStrategy, advertisementFloatDto, advertisementTitle } = item
  const { buttonIndex } = advertisementFloatDto
  reportFloatFloatPlaneClick({ button_name: advertisementTitle, advertising_code: advertisementCode })
  confirmByUserAdv({
    advertisementCodeList: [advertisementCode],
    eventType: 1,
    buttonIndex,
    ...getReportSorce(),
  })

  reportEvent({
    adCodes: [advertisementCode],
    eventType: 4,
    ...getReportSorce(),
  })

  if (showStrategy === 2) {
    adService.value = adService.value.filter((ad) => ad.advertisementCode !== advertisementCode)
  }

  advertisementJump(advertisementFloatDto as any)
}

/**
 * 关闭广告
 */
const handleClose = () => {
  reportFloatFloatPlaneClick({ button_name: '关闭', advertising_code: '' })
  if (adService.value.length > 0) {
    emit('update:modelValue', [])
    return
  }
}
</script>
