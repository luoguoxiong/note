<template>
  <div class="batch-section">
    <Sender v-bind="senderModuleData"></Sender>
    <GoodsTime v-bind="goodsTimeModuleData"></GoodsTime>
    <PickupInformation v-bind="pickupInformationModuleData"></PickupInformation>
    <MessageToDriver v-bind="messageToDriverModuleData"></MessageToDriver>
  </div>
</template>

<script setup lang="ts">
import { useStore } from '@order-public-sub-public/store'
import Sender from '../../sender/index.vue'
import GoodsTime from '../../goods-time/index.vue'
import PickupInformation from '../../pickup-information/index.vue'
import MessageToDriver from '../../message-to-driver/index.vue'
import { ModuleType } from '@order-public-sub-public/constants'
import { AddressConfig, PickModule, GoodsTimeConfig, WaybillRemarkConfig } from '@order-public-sub-public/types'
import { PickupProps } from '../../pickup-information/types/types'
import { computed } from 'vue'

const senderModuleData = computed(
  () => piniaStore.schema.moduleConfigData(ModuleType['寄方信息'], true) as PickModule<AddressConfig>,
)

const goodsTimeModuleData = computed(
  () => piniaStore.schema.moduleConfigData(ModuleType['货好时间'], true) as PickModule<GoodsTimeConfig>,
)

const pickupInformationModuleData = computed(
  () => piniaStore.schema.moduleConfigData(ModuleType['取货资料'], true) as PickupProps,
)

const messageToDriverModuleData = computed(
  () => piniaStore.schema.moduleConfigData(ModuleType['给司机捎句话'], true) as PickModule<WaybillRemarkConfig>,
)
</script>

<style lang="scss" scoped>
@import '@order-global-package-order-sub/styles/index.scss';
.batch-section {
  .sender {
    &:deep(.address-block) {
      &::after {
        display: none;
      }
    }
    :deep .address-unfold {
      &::after {
        display: none;
      }
    }
  }
}
</style>
