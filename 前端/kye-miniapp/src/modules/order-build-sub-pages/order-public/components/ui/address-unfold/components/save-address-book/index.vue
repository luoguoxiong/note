<template>
  <div
    v-if="show || (!show && showClear)"
    :class="['address-unfold-save-address-book', { 'is-hidden': !hasVisibleContent }]"
  >
    <div v-if="show" class="block">
      <div class="left">
        <KyRadio
          :modelValue="saveAddressFlag"
          :radio-props="[{ name: true, text: '保存到地址簿' }]"
          @click="onSaveAddress"
        >
          <template #icon>
            <image class="ky-button-radio__check_icon" :src="saveAddressFlag ? iconChecked : iconNoChecked" />
          </template>
        </KyRadio>
      </div>

      <div v-if="clearStatus" class="right__clear1">
        <span class="text" @click.stop="onClear">清空</span>
      </div>
    </div>
    <template v-if="!show && showClear">
      <div class="block" v-if="showSetDefault">
        <div class="left radio-mr">
          <KyRadio
            :modelValue="defaultFlag"
            :radio-props="[{ name: true, text: '设为默认寄件地址' }]"
            @click="onDefaultFlag"
          />
        </div>

        <div class="right__clear2" v-if="clearStatus">
          <span class="text" @click.stop="onClear">清空</span>
        </div>
      </div>
      <div class="block" v-if="!showSetDefault && clearStatus">
        <div class="right__clear2">
          <span class="text" @click.stop="onClear">清空</span>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// 组件
import KyRadio from '@order-public-sub-public/components/base/ky-radio/index.vue'
import { Address } from '@order-public-sub-public/constants'

const iconChecked = 'https://ic-img.ky-express.com/netc/20250619_23043_!!1750302648826_64_64.png'
const iconNoChecked = 'https://ic-img.ky-express.com/netc/20250619_81060_!!1750313799504_64_64.png'

const props = defineProps({
  clearStatus: {
    type: Boolean,
    default: false,
  },
  source: {
    type: String,
    default: '',
  },
  saveAddress: {
    type: Boolean,
    default: false,
  },
  saveAddressFlag: {
    type: Boolean,
    default: false,
  },
  defaultFlag: {
    type: Boolean,
    default: false,
  },
  showSetDefault: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['onClear', 'onSaveAddress', 'onDefaultFlag'])

const onSaveAddress = () => {
  emit('onSaveAddress', props.saveAddressFlag)
}

const onDefaultFlag = () => {
  emit('onDefaultFlag', props.defaultFlag)
}

const onClear = () => {
  emit('onClear')
}

const showClear = computed(() => {
  return [
    Address.SENDER_PAGE,
    Address.RECEIVE_PAGE,
    Address.SENDER_ADDRESS_BOOK_PAGE,
    Address.RECEIVE_ADDRESS_BOOK_PAGE,
  ].includes(props.source as Address)
})

const show = computed(() => {
  return props.saveAddress && showClear.value
})

// 内部是否存在可见元素：均不可见时隐藏整个容器（避免空容器占 margin/padding 空白）
const hasVisibleContent = computed(() => {
  return show.value || (showClear.value && (props.showSetDefault || props.clearStatus))
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
