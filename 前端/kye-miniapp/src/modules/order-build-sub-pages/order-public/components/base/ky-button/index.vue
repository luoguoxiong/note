<template>
  <ky-button
    class="ky-button ky-button--h5"
    v-bind="$attrs"
    :type="type"
    :text="text"
    :size="size"
    :class="{ disabled }"
    :disabled="disabled"
  >
    <!-- 自定义加载图标 -->
    <template #loading>
      <span :class="`loading loading--${loadingType}`"></span>
    </template>
  </ky-button>
</template>

<script setup lang="ts">
import { Button as KyButton } from '@kye-netc/kye-miniui'
import { ButtonProps } from '@order-public-sub-public/components/base/ky-button/types'

withDefaults(defineProps<ButtonProps>(), {
  disabled: false,
  type: 'primary',
  text: '确定',
  loadingType: 'primary',
  size: 'large',
})
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import '@order-global-package-order-sub/styles/settings/variable.scss';
@import '@order-global-package-order-sub/styles/tools/mixins.scss';

@import './index.scss';
</style>
