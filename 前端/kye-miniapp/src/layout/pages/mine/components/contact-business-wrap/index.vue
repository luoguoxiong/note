<template>
  <view class="contact-business-wrap">
    <view class="contact-business-wrap-avatar">
      <image class="img" :src="salesPic"></image>
    </view>
    <view class="contact-business-wrap-content">
      <view class="contact-business-wrap-content-title">{{ title }}</view>
      <view class="contact-business-wrap-content-txt">{{ txt }}</view>
    </view>
    <view class="contact-business-wrap-opt" @click="handleClick">
      <view class="contact-business-wrap-opt-text">{{ btnName }}</view>
      <view class="contact-business-wrap-opt-icon">
        <image class="img" :src="btnImg"></image>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { navigateWithParams } from '@/layout/pages/home/hooks'
import { ApplicationCodeMap } from '@/public/utils/application/constants'
import { report_CLK_event } from '@/public/utils'
import './index.scss'

const props = defineProps<{
  newCustomerFlag: boolean
  hasSaleFlag: boolean
}>()

const emits = defineEmits(['show-contact-business'])

const GO_TO_APPLY = 'https://ic-img.ky-express.com/netc/20251226_50459_!!1766722502462_24_24.png'
const CALL_US = 'https://ic-img.ky-express.com/netc/20251226_81987_!!1766722502464_24_24.png'

const hasSale = computed(() => {
  return props.newCustomerFlag && props.hasSaleFlag
})

const title = computed(() => (hasSale.value ? '您的专属商务' : '获取专属服务方案'))
const txt = computed(() => {
  return hasSale.value ? '极速响应，全程跟进，让您寄递更安心！' : '为您打造快、稳、准、省的定制化服务'
})
const btnName = computed(() => (hasSale.value ? '联系我' : '去获取'))
const btnImg = computed(() => (hasSale.value ? CALL_US : GO_TO_APPLY))
const salesPic = computed(() => {
  return hasSale.value
    ? 'https://ic-img.ky-express.com/netc/20251120_20722_!!1763632706381_133_133.png'
    : 'https://ic-img.ky-express.com/netc/20251203_79655_!!1764724529597_133_133.png'
})

const handleClick = () => {
  if (hasSale.value) {
    report_CLK_event('clk_home_mine_business', {
      page_code: 'page_home_mine',
      region_code: 'top_information',
      button_name: '联系我',
    })
    emits('show-contact-business')
  } else {
    report_CLK_event('clk_home_mine_business', {
      page_code: 'page_home_mine',
      region_code: 'top_information',
      button_name: '去申请',
    })
    navigateWithParams(ApplicationCodeMap['首页-申请专属商务'], { express_type: '我的', backSence: 10 })
  }
}
</script>
