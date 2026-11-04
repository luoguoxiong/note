<template>
  <ky-button
    class="ky-button-radio"
    block
    v-bind="$attrs"
    :type="type"
    :text="text"
    :class="{ disabled }"
    :disabled="disabled"
    :plain="plain"
  >
    <template #icon>
      <image class="ky-button-radio__check_icon" :src="icon" v-if="icon" />
    </template>
    <template #default>
      <slot v-if="$slots.default" name="default" />
      <template v-else>
        {{ text }}
      </template>
    </template>
  </ky-button>
</template>

<script setup lang="ts">
import { ButtonProps } from '@order-public-sub-public/components/base/ky-button-radio/types'
import { reactive, computed } from 'vue'

const props = withDefaults(defineProps<ButtonProps>(), {
  disabled: false,
  type: 'primary',
  text: '确定',
  loadingType: 'primary',
  isChecked: false,
  needChecked: false,
  disabledIcon: false,
  plain: false,
})

const state = reactive({
  iconChecked: 'https://ic-img.ky-express.com/netc/20250619_23043_!!1750302648826_64_64.png',
  iconNoChecked: 'https://ic-img.ky-express.com/netc/20250619_81060_!!1750313799504_64_64.png',
  disabled: 'https://ic-img.ky-express.com/netc/20250619_70622_!!1750313584275_56_56.png',
})

const icon = computed(() => {
  if (props.disabled || props.disabledIcon) {
    return state.disabled
  }
  if (props.needChecked) {
    return props.isChecked ? state.iconChecked : state.iconNoChecked
  } else {
    return ''
  }
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';

.ky-button-radio__check_icon {
  display: inline-block;
  width: 28px;
  height: 28px;
  margin-right: 4px;
}
</style>
