<template>
  <!-- 地址校正提醒提示条（放在地址模块的 #addressCorrectionTip 插槽内） -->
  <AddressCorrectionTip
    v-if="tipVisible"
    :tipText="tipText"
    :loading="modifying"
    @modify="onModify"
    @close="onCloseTip"
  />
  <!-- 地址校正温馨提示弹窗（Popup 不依赖 DOM 层级，可随提示条同处渲染） -->
  <AddressCorrectionDialog
    v-model:show="dialogVisible"
    :type="type"
    :currentAddress="currentAddress"
    :suggestedAddress="suggestedAddress"
    @confirm="onConfirm"
    @cancel="onCancel"
  />
</template>

<script setup lang="ts">
import { ModulePageType } from '@order-public-sub-public/components/business/exhibition/hooks/data-config'
import AddressCorrectionTip from './tip/index.vue'
import AddressCorrectionDialog from './dialog/index.vue'
import { useAddressCorrection } from './hooks/useAddressCorrection'

const props = defineProps<{
  /** 寄方/收方 */
  type: ModulePageType
  /** 是否平铺形态（unfold），影响实名引导、门牌号提示的判断范围 */
  isFlat?: boolean
}>()

const {
  tipVisible,
  tipText,
  modifying,
  dialogVisible,
  currentAddress,
  suggestedAddress,
  onModify,
  onConfirm,
  onCancel,
  onCloseTip,
} = useAddressCorrection(props.type, props.isFlat)
</script>
