<template>
  <div
    class="address-unfold-specify-address"
    :data-validate="dataValidate"
    @click="onClickSpecifyAddress"
    :data-disabled="disabledAddressItemKey"
  >
    <div v-if="!specifyAddress" class="placeholder-text">
      <span class="text">{{ placeholderText }}</span>
      <SvgIcon class="arrow-r" name="order-miniapp-right-arrow" />
    </div>

    <template v-else>
      <!-- 名称 -->
      <template v-if="addressVisibleType === 'name'">
        <div v-if="!title" class="placeholder-text">
          <span class="text">{{ placeholderText }}</span>
          <SvgIcon class="arrow-r" name="order-miniapp-right-arrow" />
        </div>
        <div v-else class="content">
          <div class="content__header">
            <span class="title">{{ title }}</span>
            <SvgIcon class="arrow-r" name="order-miniapp-right-arrow" />
          </div>
        </div>
      </template>

      <!-- 名称 + 地址 -->
      <template v-if="addressVisibleType === 'all'">
        <div v-if="!specifyAddress && !title" class="placeholder-text">
          <span class="text">{{ placeholderText }}</span>
          <SvgIcon class="arrow-r" name="order-miniapp-right-arrow" />
        </div>
        <div v-else class="content">
          <template v-if="title">
            <div class="content__header">
              <span class="title">{{ title }}</span>
              <SvgIcon class="arrow-r" name="order-miniapp-right-arrow" />
            </div>
            <div class="content__des">{{ specifyAddress }}</div>
          </template>
          <div v-else class="address address-arrow-style">
            <div class="des">{{ specifyAddress }}</div>
            <SvgIcon class="arrow-r" name="order-miniapp-right-arrow" />
          </div>
        </div>
      </template>

      <!-- 地址 -->
      <template v-if="addressVisibleType === 'detail'">
        <div v-if="!specifyAddress" class="placeholder-text">
          <span class="text">{{ placeholderText }}</span>
          <SvgIcon class="arrow-r" name="order-miniapp-right-arrow" />
        </div>
        <div v-else class="address address-arrow-style">
          <div class="des">{{ specifyAddress }}</div>
          <SvgIcon class="arrow-r" name="order-miniapp-right-arrow" />
        </div>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
// 组件
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
// 类型
import { Address } from '@order-public-sub-public/constants'

const props = defineProps({
  addressVisibleType: {
    type: String,
    default: '',
  },
  title: {
    type: String,
    default: '',
  },
  specifyAddress: {
    type: String,
    default: '',
  },
  source: {
    type: String,
    default: '',
  },
  dataValidate: {
    type: String,
    default: '',
  },
  disabledAddressItemKey: {
    type: String,
    default: '',
  },
})

const placeholderText = computed(() => {
  return props.source === Address.SENDER || props.source === Address.SENDER_PAGE ? '请选择寄件地址' : '请选择收件地址'
})

const emit = defineEmits(['onClickSpecifyAddress'])

/**
 * 指定地址
 */
const onClickSpecifyAddress = () => {
  emit('onClickSpecifyAddress')
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
