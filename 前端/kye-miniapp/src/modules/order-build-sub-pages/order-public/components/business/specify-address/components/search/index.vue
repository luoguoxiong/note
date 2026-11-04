<template>
  <div class="specify-address-search">
    <KyInput.Search :modelValue="keyword" clearable :placeholder="placeholder" @update:model-value="onSearch" />
  </div>
</template>

<script setup lang="ts">
// 组件
import KyInput from '@order-public-sub-public/components/base/ky-input'
import { computed } from 'vue'

const props = defineProps({
  keyword: {
    type: String,
    default: '',
  },
  addressVisibleType: {
    type: String,
    default: '',
  },
  fieldsConfigType: {
    type: Boolean,
    default: false,
  },
})

const placeholder = computed(() => {
  let str = ''

  if (props.fieldsConfigType) {
    str = '请输入地址名称/详细地址'
  } else {
    str = '请输入姓名/手机/地址名称/详细地址'
  }

  return str
})

const emit = defineEmits(['update:keyword'])

const onSearch = (value: string) => {
  emit('update:keyword', value)
}
</script>

<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
