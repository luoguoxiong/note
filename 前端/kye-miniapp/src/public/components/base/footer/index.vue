<template>
  <view class="ky-logo-footer">
    <Logo />
    <view v-if="!env.isProd" class="debug-tag">
      {{ debugTagContent }}
    </view>
  </view>
</template>

<script setup lang="ts" name="Footer">
import Logo from '@public/components/ui/logo/index.vue'
import { getEnvConfig } from '@/public/constants'
import './index.scss'
import { computed } from 'vue'
import { getPlateForm } from '@/public/utils'

const env = getEnvConfig()

const debugTagContent = computed(() => {
  return getPlateForm() + (env.isCompanyWx ? `企业 ${env.name}` : `${env.name}`)
})
</script>

<style lang="scss">
.debug-tag {
  position: absolute;
  left: 16px;
  bottom: 16px;
  padding: 6px 12px;
  border-radius: 8px;
  background-color: rgba(0, 0, 0, 0.4);
  color: #fff;
  font-size: 22px;
}
</style>
