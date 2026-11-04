<template>
  <view class="customer-intro" @touchmove="touchMove">
    <view class="customer-intro__bg" @click="handleCancel"></view>
    <view class="customer-intro__wrapper">
      <view class="customer-intro__title">
        <view class="customer-intro__title--left">
          <view v-if="type !== 'page'" class="customer-intro__title--back" @click="handleCancel">
            <image
              src="https://ic-img.ky-express.com/netc/20220920_46551702284_!!1663639875852_72_64.png"
            ></image>
          </view>
          了解客户编码
        </view>
        <view v-if="type === 'page'" class="customer-intro__title--right" @click="handleCancel">
          <image
            src="https://ic-img.ky-express.com/netc/20220920_98251702262_!!1663639875851_64_64.png"
          ></image>
        </view>
      </view>
      <view class="customer-intro__list">
        <view v-for="(qa, index) in qaList" :key="index" class="customer-intro__item">
          <view class="customer-intro__item--title">
            <image :src="qa.icon" class="customer-intro__item--icon"></image>
            <text>{{ qa.title }}</text>
          </view>
          <view class="customer-intro__item--text">
            <TextRenderer :text="qa.text" />
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TextRenderer from './text-renderer/index.vue'
import './index.scss'

interface Props {
  type?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: ''
})

const emit = defineEmits<{
  (e: 'cancel'): void
}>()

const qaList = ref([
  {
    title: '客户编码是什么？',
    text:
      '客户编码是【跨越速运】提供给合作公司的企业账号，是跨越客户在【跨越速运】寄件、查件、对账、开票、尊享优惠的身份凭证',
    icon: 'https://ic-img.ky-express.com/netc/20260709_63795_!!1783585371218_64_64.png'
  },
  {
    title: '我一定要绑定客户编码吗？',
    text:
      '是的，为保障贵司运单及运费等信息的安全，绑码后才可下单查件、对账开票、兑换积分礼券、定制企业下单个性化需求等；同时由专属商务为您提供尊享服务',
    icon: 'https://ic-img.ky-express.com/netc/20260709_18797_!!1783585371221_64_64.png'
  },
  {
    title: '还没有客户编码如何申请？',
    text:
      '如贵司已跟跨越合作，您可联系##贵司"负责人"##或跨越对接##"专属商务"##获取贵司客户编码；如贵司未跟跨越合作，您可##向跨越申请专属商务获取贵司客户编码##',
    icon: 'https://ic-img.ky-express.com/netc/20260709_33034_!!1783585371223_64_64.png'
  }
])

const touchMove = (e: TouchEvent) => {
  e.stopPropagation()
}

const handleCancel = () => {
  emit('cancel')
}
</script>
