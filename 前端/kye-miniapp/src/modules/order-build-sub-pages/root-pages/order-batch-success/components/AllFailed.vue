<!--
 * @Description: 全部失败
 * @Date: 2023-11-25 14:19:59
-->
<template>
  <div class="icon-all-failed w-full">
    <div class="order-status-failed" />
    <div class="fail-number mt-40">下单失败{{ failuresNumber }}票</div>
    <div class="retry-order mt-32">可重新下单</div>
    <KyButton
      :loading="loading"
      class="button-footer all-failed-buton"
      @click="reorder"
      type="primary"
      size="normal"
      text="重新下单"
    ></KyButton>
  </div>
</template>
<script setup lang="ts">
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import { toRefs, ref } from 'vue'
import { failReorder } from '../hooks/useFooterConfig'
const props = defineProps<{
  failuresNumber: number
}>()
const { failuresNumber } = toRefs(props)
const loading = ref(false)
const reorder = async () => {
  loading.value = true
  try {
    await failReorder()
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
@import '../index.scss';
</style>
