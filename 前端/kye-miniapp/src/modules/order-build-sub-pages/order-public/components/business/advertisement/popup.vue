<template>
  <ky-overlay class="advertisement-netc-popup" :show="show" :close-on-click-overlay="false">
    <div class="flex flex-column items-center">
      <div
        v-exposure-report="{
          eventCode: 'exp_express_result_default_setting_popup_v1',
          regionCode: 'pop',
        }"
        class="container"
      >
        <div v-click-report="clk_express_result_default_setting_popup_v1_type1()" class="first-top" @click="onClick">
          <img class="first-top-img" :src="advertisementPopupDtoData?.posterLink" alt="" />
        </div>
      </div>
      <div
        v-click-report="clk_express_result_default_setting_popup_v1_type2(selected)"
        v-if="advertisementPopupDtoData.noLongerRemind"
        class="advertisement-netc-notice"
        @click="selected = !selected"
      >
        <SvgIcon class="advertisement-checkbox" v-if="selected" name="ad-radio-checked" />
        <SvgIcon class="advertisement-checkbox" v-else name="ad-radio-unchecked" />
        <span class="advertisement-netc-notice-text"> 不再提醒 </span>
      </div>
      <!-- 配置关闭按钮 -->
      <div
        class="advertisement-netc-close"
        v-click-report="clk_express_result_default_setting_popup_v1_type3()"
        v-if="advertisementPopupDtoData && +advertisementPopupDtoData.configCloseButton === TrueOrFalseNumber.TRUE"
      >
        <img
          class="advertisement-netc-close-icon"
          src="https://ic-img.ky-express.com/netc/20250619_38332_!!1750300894338_148_148.png"
          alt=""
          @click="close"
        />
      </div>
    </div>
  </ky-overlay>
</template>
<script setup lang="ts">
import { Popup } from '@order-public-sub-public/apis/waybill/types'
import { computed, ref } from 'vue'
import { confirmByUser, openAdvertisement } from '.'
import { TrueOrFalseNumber } from '@order-public-sub-public/constants'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { pick } from 'lodash-es'
import {
  clk_express_result_default_setting_popup_v1_type1,
  clk_express_result_default_setting_popup_v1_type2,
  clk_express_result_default_setting_popup_v1_type3,
} from '@order-public-sub-public/components/business/advertisement/hooks/report'

const props = defineProps<{ popupList: Popup[] }>()

const advertisementPopupDtoData = computed(() => props.popupList?.[0] || {})

const show = ref(false)

const selected = ref(false)

const open = () => {
  show.value = true
}

/**
 * @description 关闭仅上报
 */
const close = () => {
  console.log('close')
  show.value = false
  const { adDetail, buttonIndex, extraParams } = getReportParams('close')
  confirmByUser(adDetail, buttonIndex, extraParams)
}

/**
 * @description 组装入参
 */
const getReportParams = (eventType: 'click' | 'close') => {
  const map = {
    click: '1',
    close: '2',
  }
  const detail = advertisementPopupDtoData.value.buttonList[0]
  const advInfo = pick(advertisementPopupDtoData.value, [
    'advertisementTitle',
    'advertisementCode',
    'noLongerRemindDays',
  ])
  return {
    adDetail: { ...detail, ...advInfo },
    buttonIndex: detail.buttonIndex,
    extraParams: {
      noLongerRemindFlag: selected.value ? TrueOrFalseNumber.TRUE : TrueOrFalseNumber.FALSE,
      eventType: map[eventType],
    },
  }
}

const onClick = async () => {
  try {
    const { adDetail, buttonIndex, extraParams } = getReportParams('click')
    openAdvertisement(adDetail, buttonIndex, extraParams)
    setTimeout(() => {
      show.value = false
    }, 500)
  } finally {
    show.value = false
  }
}

defineExpose({
  open,
  close,
})
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './popup.scss';
</style>
