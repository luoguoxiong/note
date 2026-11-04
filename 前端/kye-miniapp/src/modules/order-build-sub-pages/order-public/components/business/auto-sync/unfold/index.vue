<template>
  <div class="return-waybill-auto-sync-content" v-if="visible" @click.stop>
    <div class="auto-radio-content">
      <KyRadio :isChecked="isChecked" @change="(val: boolean) => (isChecked = val)">
        <!-- 修改【去程单】寄方信息将会同步修改【返程单】收方信息 -->
        <div class="return-waybill-auto-sync-content-text">
          修改<text class="waring">【去程单】</text>寄方信息将会<text class="waring">同步修改【返程单】收方信息</text>
        </div>
      </KyRadio>
    </div>
  </div>
</template>
<script setup lang="ts">
import KyRadio from '@order-public-sub-public/components/base/ky-radio-v2/index.vue'
import { visible, isChecked } from '../hooks/state'
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
