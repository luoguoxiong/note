<template>
  <div class="address-unfold-companyName" v-if="companyNameConfig.visible" :class="{ 'border-style': !borderStyle }">
    <ky-field
      class="companyName-name"
      clearable
      :placeholder="getPlaceHolder(hasRequiredTag)"
      :maxlength="companyNameConfig.maxlength"
      :modelValue="companyName"
      :style="companyNameConfig.style"
      :disabled="!companyNameConfig.editable"
      :data-validate="companyNameConfig.dataValidate"
      :formatter="companyNameConfig.format"
      :required-tag="hasRequiredTag"
      @onInput="onInputCompanyName"
      @focus="onFocusCompanyName"
      @blur="onBlurCompanyName"
    />
  </div>
</template>

<script setup lang="ts">
// 组件
import { computed } from 'vue'
import KyField from '@order-public-sub-public/components/base/ky-field/index.vue'
// 类型
import { Address } from '@order-public-sub-public/constants'

const props = defineProps({
  clearStatus: {
    type: Boolean,
    default: false,
  },
  source: {
    type: String,
    default: '',
  },
  companyName: {
    type: String,
    default: '',
  },
  companyNameConfig: {
    type: Object,
    default: () => {
      return {
        style: '',
        visible: false,
        editable: false,
        required: false,
        defaultValue: '',
        dataValidate: '',
      }
    },
  },
  usePage: {
    // 是页面来源
    type: String,
    default: '',
  },
})

const emit = defineEmits(['onInputCompanyName', 'onFocusCompanyName', 'onBlurCompanyName'])

const onInputCompanyName = (value: string) => {
  emit('onInputCompanyName', value)
}

const onFocusCompanyName = () => {
  emit('onFocusCompanyName')
}

const onBlurCompanyName = () => {
  emit('onBlurCompanyName')
}

const borderStyle = computed(() => {
  return [
    Address.SENDER,
    Address.RECEIVE,
    Address.SENDER_ADDRESS_BOOK_PAGE,
    Address.RECEIVE_ADDRESS_BOOK_PAGE,
  ].includes(props.source as Address)
})

const getPlaceHolder = (required: boolean) => {
  let placeholder = '公司名称'
  if (!required) {
    placeholder = '公司名称(选填)'
  }
  return placeholder
}

// 是否有必填标签
const hasRequiredTag = computed(() => {
  const { required, editable } = props.companyNameConfig
  // 可编辑且必填的情况，才显示标签
  return required && editable
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
