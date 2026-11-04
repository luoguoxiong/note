<template>
  <div class="real-name-wrapper" @click.stop="">
    <div class="repalce-content">
      {{ `识别到您实名姓名为【${realNameGuide}】` }}
    </div>
    <div class="replace-btn" @click="clickRealNameRepalce">一键更换</div>
    <div class="close-tips" @click="closeTips">
      <SvgIcon name="close-right-top" class="close-right-top" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from '@order-public-sub-public/store'

import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'

import { useUpdateData } from '@order-public-sub-public/hooks/address/sender/useUpdateData'
import { showRealNameGuide, realNameGuide, isReplace } from './hooks/useState'

import { SenderDimension, Delivery } from '@order-public-sub-public/types'
import { ModuleType, Address } from '@order-public-sub-public/constants'
const piniaStore = useStore()

defineProps<{ realName?: string }>()

// const isReplace = ref(false)

const closeTips = () => {
  isReplace.value = true
}

const clickRealNameRepalce = () => {
  showRealNameGuide.value = false

  const senderDimensionData = piniaStore.schema.moduleDimensionData(ModuleType['寄方信息'])

  const deliveryInfo = piniaStore.order.moduleFormData(ModuleType['寄方信息'])

  useUpdateData({ moduleStyle: Address.SENDER, remoteCheckKey: 'sender.person', needRemoteCheck: true }).setEditValue({
    item: { ...deliveryInfo, person: realNameGuide.value || senderDimensionData?.realNameGuide || '' },
  })
  // 更新业务组件维度数据
  piniaStore.schema.updateModuleDimensionByType({
    type: ModuleType['寄方信息'],
    data: { realNameGuide: '' },
  })
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
