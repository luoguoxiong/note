<template>
  <div class="encrypt-popup-field">
    <div class="encrypt-popup-field-content">
      <div
        v-for="item in encryptConfigList"
        :key="item.key"
        :class="['encrypt-popup-field-content-item', { active: item.value === props.popupFieldValue?.encryptType }]"
        @click="() => handleClick(item.value)"
      >
        {{ item.title }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { EncryptFieldType } from '../../types'
import { WaybillSpecialEncryptRule } from '@order-public-sub-public/types'

const props = defineProps<{ popupFieldValue: WaybillSpecialEncryptRule | null }>()

const encryptConfigList = [
  {
    title: '不加密',
    value: EncryptFieldType.不加密,
    key: EncryptFieldType.不加密,
  },
  {
    title: '半加密',
    value: EncryptFieldType.半加密,
    key: EncryptFieldType.半加密,
  },
  {
    title: '全加密',
    value: EncryptFieldType.全加密,
    key: EncryptFieldType.全加密,
  },
]

const emit = defineEmits(['onClickField'])

const handleClick = (value: EncryptFieldType) => {
  emit('onClickField', value)
}
</script>

<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
