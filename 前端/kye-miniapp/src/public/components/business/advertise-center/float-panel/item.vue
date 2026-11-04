<template>
  <view
    class="float-ad-bottom"
    :id="id"
    v-exposure
    :exposure-report="{
      eventCode: expQt?.event_code,
      otherParams: {
        page_code: expQt?.page_code,
        region_code: expQt?.region_code,
        region_name: expQt?.region_name,
        event_name: expQt?.event_name,
        button_name: data.map((item) => item.advertisementTitle).join('、'),
      },
    }"
  >
    <image
      class="float-ad-image"
      v-for="item in data"
      :key="item?.advertisementTitle"
      :src="item?.advertisementFloatDto.posterLink"
      @tap="handleJump(item)"
    />
    <image
      class="float-ad-close"
      @tap="handleClose"
      src="https://ic-img.ky-express.com/netc/20250730_48195_!!1753868754306_80_80.png"
    />
  </view>
</template>
<script setup lang="ts">
import { useExposureReport } from '@/public/hooks/useExposureReport'
import './index.scss'
import { IdetailList } from '../type'
import { Qt } from './type'

defineProps<{
  isHide?: boolean
  data: IdetailList[]
  expQt?: Qt
  clkQt?: Qt
}>()

const id = `float-ad-bottom-${Math.random().toFixed(0)}-ex`

useExposureReport([id])

const emit = defineEmits(['click', 'close'])

const handleJump = (item: IdetailList) => {
  emit('click', item)
}

const handleClose = () => {
  emit('close')
}
</script>
