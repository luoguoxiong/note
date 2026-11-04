<template>
  <view v-if="visible" class="waybill-card-restrict-tips" :style="style" @click.stop="handleClick">
    <image v-if="tipsImage" :src="tipsImage" class="waybill-card-restrict-tips-icon" mode="aspectFit" />
    <view class="waybill-card-restrict-tips-desc" v-if="showWatermarkType !== 1 && showWatermarkType !== 111">
      <view class="desc">
        <text :max-lines="2" :lines="2" overflow="ellipsis">
          {{ content }}
        </text>
        <slot name="tipsDescRight"></slot>
      </view>

      <view class="desc-btn">
        <slot name="tipsButton"></slot>
      </view>
    </view>
    <view class="waybill-route-header__confirm-bar" @click.stop="onConfirmBarClick" v-if="showWatermarkType === 1 || showWatermarkType === 111">
      <view class="waybill-route-header__confirm-bar__message">{{ content }}</view>
      <image
        class="waybill-route-header__confirm-bar__img"
        src="https://ic-img.ky-express.com/netc/20250605_47472831116_!!1749096826385_56_56.png"
      ></image>
    </view>
    <view v-if="+limitType === 20" @click.stop="handleClose" class="waybill-card-restrict-tips-box">
      <image
        class="waybill-card-restrict-tips-close"
        src="https://ic-img.ky-express.com/default/20250724_5869_!!1753320640586_56_56.png"
        mode="aspectFit"
      />
    </view>
    <image
      v-else-if="management === EManagementStyle.Abnormal || showIcon"
      class="waybill-card-restrict-tips-open"
      src="https://ic-img.ky-express.com/netc/20250605_47472831116_!!1749096826385_56_56.png"
      mode="aspectFit"
    />
  </view>
</template>

<script setup lang="ts">
import './index.scss'
// import Taro from '@tarojs/taro'
import { computed, defineProps, defineEmits } from 'vue'
import { EManagementStyle, TIPS_IMAGE_DIC, TIPS_STYLE_DIC } from '../../constant'

const props = defineProps<{
  visible: boolean
  management: EManagementStyle
  limitReason: EManagementStyle
  limitType: number
  content?: string
  showIcon: boolean
  showWatermarkType: number
}>()

const emit = defineEmits(['close', 'click', 'onConfirmBarClick'])

const tipsImage = computed(() => {
  // 如果是已解除管控，需要展示历史的横幅
  if (+props.showWatermarkType === 110) {
    return TIPS_IMAGE_DIC[props.limitReason]
  } else if (+props.showWatermarkType === 120) {
    // 如果是展馆号,不显示图片
    return ''
  } else if (+props.showWatermarkType === 111) {
    // 同时命中解除管控和报关入仓，展示黄色可点击样式，不显示图片
    return ''
  } else {
    return TIPS_IMAGE_DIC[props.management] || ''
  }
})
const style = computed(() => {
  // 如果是已解除管控，需要展示历史的横幅
  if (+props.showWatermarkType === 110) {
    return TIPS_STYLE_DIC[props.limitReason]
  } else if (+props.showWatermarkType === 120) {
    // 如果是展馆号,不显示图片
    return ''
  } else if (+props.showWatermarkType === 111) {
    // 同时命中解除管控和报关入仓，展示黄色可点击样式，不应用绿色横幅样式
    return ''
  } else {
    return TIPS_STYLE_DIC[props.management] || {}
  }
})

const handleClick = () => emit('click')
const handleClose = () => emit('close')

const onConfirmBarClick = () => {
  emit('onConfirmBarClick', false)
}
</script>
