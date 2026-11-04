<template>
  <ky-overlay class-name="share-guide-overlay" :show="show" @click="onCancel">
    <div class="share-guide">
      <div class="share-guide__card">
        <img src="https://ic-img.ky-express.com/netc/20250619_32073_!!1750314170552_990_678.png" />
      </div>
    </div>
  </ky-overlay>
</template>
<script setup lang="ts">
import { useShare } from '../hooks/useShare'

const { show, onCancel } = useShare()
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import '../index.scss';
</style>
