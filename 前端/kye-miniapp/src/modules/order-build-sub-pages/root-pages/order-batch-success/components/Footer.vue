<template>
  <div v-if="currentConfig" class="batch_order-footer" :class="currentConfig.length > 2 ? 'footer-tab' : ''">
    <div class="footer-tab-content flex items-center" v-if="currentConfig?.length > 2">
      <div class="footer-tab-item" v-for="item in currentConfig" :key="item.text" @click="item.action()">
        <SvgIcon class="footer-tab-icon" v-if="item.iconName" :name="item.iconName" />
        <div class="footer-tab-item-title">{{ item.text }}</div>
      </div>
    </div>
    <div class="flex items-center" v-if="currentConfig?.length === 2">
      <KyButton
        v-for="item in currentConfig"
        :key="item.text"
        class="button-footer"
        :class="item.type === 'default' ? 'button-left mr-24 border-purple' : ''"
        @click="item.action()"
        :type="buttonTypeFunc(item.type)"
        size="normal"
        :text="item.text"
      ></KyButton>
    </div>
  </div>
</template>
<script setup lang="ts">
import { SuccessOrderInfo } from '@order-public-sub-public/types'
import { toRefs, computed } from 'vue'
import KyButton from '@order-public-sub-public/components/base/ky-button/index.vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'

import { useFooter } from '../hooks/useFooterConfig'
const props = defineProps<{ data?: SuccessOrderInfo; waybillNumber: string }>()

const { data } = toRefs(props)

const buttonTypeFunc = (type: string) => {
  return type as any
}
// 从hooks中获取当前配置
const currentConfig = computed(() => useFooter(data, props.waybillNumber) || [])
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
.batch_order-footer {
  padding: 20px 24px;
  box-shadow: 0px -2px 8px 0px rgba(0, 0, 0, 0.05);
  padding-bottom: calc(20px + env(safe-area-inset-bottom, 20px));
  .footer-tab-icon {
    width: 48px;
    height: 48px;
    overflow: hidden;
    background-size: cover;
  }
  &.footer-tab {
    padding: 0 0 calc(20px + env(safe-area-inset-bottom, 20px)) 0;
    z-index: 1;
  }
  .footer-tab-content {
    width: 100%;
  }
  .footer-tab-item {
    position: relative;
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 120px;
    box-sizing: border-box;
    &-title {
      margin-top: 8px;
      font-size: 22px;
    }
    &::before {
      position: absolute;
      right: 0;
      top: 38px;
      content: '';
      width: 2px;
      height: 54px;
      background: #f2f0f4;
    }
    &:last-child::before {
      width: 0;
    }
  }

  .border-purple {
    border-color: #8365f6;
  }
}
</style>
