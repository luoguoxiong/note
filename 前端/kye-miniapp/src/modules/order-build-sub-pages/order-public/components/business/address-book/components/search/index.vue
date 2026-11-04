<template>
  <div class="address-book-page-search">
    <KyInput
      clearable
      :placeholder="placeholder"
      :maxlength="50"
      :inputDebounce="600"
      :enableWxNative="true"
      :enableWxNativeFormatter="true"
      :modelValue="keyword"
      :formatter="formatter"
      @update:model-value="onSearch"
      v-keyboard
    >
      <template #left>
        <SvgIcon name="search-icon" class="address-book-list-search-icon" />
      </template>
    </KyInput>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '@order-global-package-order-sub/components/ui/svg-icon/index.vue'
// 组件
import KyInput from '@order-public-sub-public/components/base/ky-input'
// 方法
import { filterAllSpace } from '@order-public-sub-public/utils'
import { filterEmojis } from '@order-public-sub-public/utils/pattern'
import vKeyboard from '@order-global-package-order-sub/directives/keyboard'
import { computed } from 'vue'
import { EAddressPermission } from '../../types'
import { AddressTypeStr } from '@order-public-sub-public/constants'

const props = defineProps({
  shareAddressAuth: {
    default: EAddressPermission.无权限,
  },
  addressType: {
    type: String,
    default: '',
  },
  keyword: {
    type: String,
    default: '',
  },
})

const placeholder = computed(() => {
  if (
    props.shareAddressAuth === EAddressPermission.有权限 &&
    [AddressTypeStr.SENDER, AddressTypeStr.RECEIVE].includes(props.addressType as AddressTypeStr)
  ) {
    return '请输入姓名/地址/手机号/公司名称/创建人手机'
  } else {
    return '请输入姓名/地址/手机号/公司名称'
  }
})

const emit = defineEmits(['update:keyword'])
const onSearch = (value: string) => {
  emit('update:keyword', value)
}

// 格式化空格和表情
const formatter = (value: string): string => filterAllSpace(value.replace(filterEmojis, ''))
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
