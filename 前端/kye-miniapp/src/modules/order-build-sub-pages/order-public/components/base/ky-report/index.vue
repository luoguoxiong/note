<template>
  <text class="ky-report-component"></text>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

const props = defineProps({
  eventCode: {
    type: String,
    default: '',
  },
  otherParams: {
    type: [Object, Function],
  },
  regionCode: {
    type: String,
    default: '',
  },
  // 包含eventCode，otherParams的数据，
  eventParams: {
    type: [Object, Function],
  },
})

onMounted(() => {
  let event = {
    eventCode: props.eventCode,
  }
  if (props.regionCode) {
    event.regionCode = props.regionCode
  }
  let propsOther = props.otherParams
  if (props.eventParams) {
    // 如果传入了eventParams，则优先使用eventParams的数据，否则使用props的数据
    const { eventCode, regionCode, otherParams } =
      typeof props.eventParams === 'function' ? props.eventParams() : props.eventParams
    if (otherParams) {
      propsOther = otherParams
    }
    if (eventCode) {
      event.eventCode = eventCode
    }
    if (regionCode) {
      event.regionCode = regionCode
    }
  }
  const otherObj = typeof propsOther === 'function' ? propsOther() : propsOther || {}
  console.log('exp_express_nocustomercode_v1-onMounted')
  if (!event.eventCode) return
  umpOtherReport(
    'EXP',
    {
      ...event,
    },
    {
      ...otherObj,
    },
  )
})
</script>

<style lang="scss">
.ky-report-component {
  position: fixed;
  left: -1px;
  top: -1px;
  display: inline;
  width: 0px;
  height: 0px;
}
</style>
