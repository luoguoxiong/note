<template>
  <div>
    <div class="validate-popover flex van-row--align-center">
      <div class="icon"></div>
      <div class="content">{{ content }}</div>
      <div class="close" :data-tip-key="[tipKey]">
        <SvgIcon :name="type === 'warning' ? 'close-tinge' : 'close-light-white'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { tippyTheme } from '@order-public-sub-public/constants'
type KyPopoverProps = {
  content: string
  tipKey: string
  type: tippyTheme | string
}

withDefaults(defineProps<Partial<KyPopoverProps>>(), {
  content: '',
  tipKey: '',
  type: 'warning',
})
</script>

<style scoped lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import 'index';
</style>
