<template>
  <div class="search-footer">
    <div class="search-footer-left">
      <SvgIcon name="check-icon" class="use-coupon-select" v-if="checkState" @click="selected" />
      <SvgIcon name="no-check-icon" class="use-coupon-select" @click="selected" v-else />
      <span v-if="checkedLength">已选中{{ checkedLength }}票运单</span>
      <span v-else-if="!isCheckAll">全选</span>
    </div>
    <div class="search-footer-right">
      <KyButton :loading="loading" loading-text="打印面单" @click="toPrint" text="打印面单"> </KyButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'

interface searchFooterProps {
  checkState: boolean
  isCheckAll: boolean
  checkedLength: number
  loading: boolean
}

const props = defineProps<searchFooterProps>()

const emits = defineEmits(['selectHandler', 'toPrint'])
const selected = () => {
  emits('selectHandler', !props.checkState)
}
const toPrint = () => {
  emits('toPrint')
}
</script>

<style scoped lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';

@import './index.scss';
</style>
