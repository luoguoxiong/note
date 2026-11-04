<template>
  <div :class="styles['apply-content']" v-if="status !== FeeAuthApplyStatus.申请查看">
    <div
      :class="styles['apply-status']"
      :id="trackingId"
      :exposure-report="exposureReport"
    >
      <SvgIcon :class="styles['status-icon']" name="auth-apply-status" font-size="14" />
      <span :class="styles['status-title']">{{ title }}</span>
      <span :class="styles['status-time']">您于 {{ applyTime }} 已申请查看运费</span>
    </div>
    <div :class="styles['apply-reason']">申请原因：{{ applyReason }}</div>
    <div :class="styles['apply-commerce']">
      <text :class="styles['commerce-desc']">如需加急，可联系{{ contactTypeDesc }}紧急审批</text>
      <img
        v-if="showBusinessQr && modalShow"
        src="https://ic-img.ky-express.com/netc/20250619_6093_!!1750300560568_144_144.png"
        :class="styles['commerce-qr']"
      />
      <text :class="styles['commerce-btn']" @tap="handleContact">
        联系{{ (contactButtonName || '').replace('贵司', '') }}
      </text>
    </div>
  </div>
  <ky-textarea
    v-else
    :class="styles['apply-textarea']"
    :noPadding="true"
    v-model="modelValue"
    :show-word-limit="true"
    :placeholder="`请填写申请原因，便于${contactTypeDesc}为您快速开通`"
    :rows="5"
    enableWxNative
    :maxlength="150"
    :clearable="!textDisable"
    :disabled="textDisable"
    :cursor-spacing="200"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { FeeAuthApplyStatus } from '../../../../../constants'
import KyTextarea from '../../../../base/ky-textarea/index.vue'
import SvgIcon from '../../../../ui/svg-icon/index.vue'
import styles from './index.module.scss'

defineProps<{
  status: number
  title: string
  applyTime?: string
  applyReason?: string
  contactTypeDesc?: string
  contactButtonName?: string
  showBusinessQr?: boolean
  modalShow?: boolean
  textDisable?: boolean
  trackingId?: string
  exposureReport?: { eventCode: string; regionCode: string }
}>()

const emit = defineEmits<{
  contact: []
}>()

defineOptions({ inheritAttrs: false })

const modelValue = defineModel<string>()

const handleContact = () => {
  emit('contact')
}
</script>

<style lang="scss">
@import '../../../../../styles/index.scss';
</style>
<style lang="scss" module src="./index.module.scss"></style>
