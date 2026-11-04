<template>
  <div class="swipe-cell">
    <!-- 默认异步 -->
    <ky-swipe-cell v-if="isAsynchronous" v-bind="$attrs" @before-close="beforeClose">
      <slot />
      <template #right>
        <div class="delete" v-click-report="clk_express_single_address_book_v1('删除')">删除</div>
      </template>
    </ky-swipe-cell>

    <ky-swipe-cell v-else v-bind="$attrs" @click="onDelete">
      <slot />
      <template #right>
        <div class="delete" v-click-report="clk_express_single_address_book_v1('删除')">删除</div>
      </template>
    </ky-swipe-cell>
  </div>
</template>

<script setup lang="ts">
import { clk_express_single_address_book_v1 } from '@order-public-sub-public/components/business/address-book/page/report/index'
defineProps({
  isAsynchronous: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['onDelete', 'onAsynchronousDelete'])

const beforeClose = ({ position }: { position: string }) => {
  switch (position) {
    case 'left':
    case 'cell':
    case 'outside':
      return true
    case 'right':
      emit('onAsynchronousDelete')
  }
}

const onDelete = () => emit('onDelete')
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
