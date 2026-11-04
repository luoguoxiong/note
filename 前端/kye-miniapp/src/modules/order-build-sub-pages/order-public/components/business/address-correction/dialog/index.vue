<template>
  <Popup
    v-model:show="visible"
    position="center"
    round
    :closeOnClickOverlay="false"
    :class="styles.popup"
    :zIndex="16"
  >
    <view :class="styles.card" @click.stop>
      <!-- 标题栏 -->
      <view :class="styles.header">
        <text :class="styles.title">温馨提示</text>
      </view>

      <!-- 提示语 -->
      <view :class="styles.tips">
        <text>{{ tipsText }}</text>
      </view>

      <!-- 当前地址 -->
      <view :class="styles.section">
        <view :class="styles.label">当前地址：</view>
        <view :class="styles.value">{{ currentAddress }}</view>
      </view>

      <!-- 建议修改地址 -->
      <view :class="styles.section">
        <view :class="styles.label">建议修改为：</view>
        <view :class="styles.value">{{ suggestedAddress }}</view>
      </view>

      <!-- 底部按钮 -->
      <view :class="styles.footer">
        <KyButton :class="styles.btn" plain text="暂不修改" @click="onCancel" />
        <KyButton :class="styles.btn" type="primary" text="确定修改" @click="$emit('confirm')" />
      </view>
    </view>
  </Popup>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Popup } from '@kye-netc/kye-miniui'
import KyButton from '@order-global-package-order-sub/components/base/ky-button/index.vue'
import { ModulePageType } from '@order-public-sub-public/components/business/exhibition/hooks/data-config'
import styles from './index.module.scss'

interface PropsType {
  show: boolean
  /** 'sender' | 'receive' */
  type?: string
  /** 当前地址 */
  currentAddress?: string
  /** 建议修改地址 */
  suggestedAddress?: string
}

const props = withDefaults(defineProps<PropsType>(), {
  type: ModulePageType.寄方,
  currentAddress: '',
  suggestedAddress: '',
})

const emit = defineEmits(['update:show', 'confirm', 'cancel'])

const visible = computed({
  get: () => props.show,
  set: (val: boolean) => emit('update:show', val),
})

// 根据type区分寄件/收件提示语（仅寄/收一字之差）
const tipsText = computed(() => {
  const sideText = props.type === ModulePageType.寄方 ? '寄' : '收'
  return `检测到您填写的${sideText}件地址不完整，建议使用校正后的地址，避免产生额外费用以及影响时效`
})

const onCancel = () => {
  visible.value = false
  emit('cancel')
}
</script>

<style lang="scss"></style>
