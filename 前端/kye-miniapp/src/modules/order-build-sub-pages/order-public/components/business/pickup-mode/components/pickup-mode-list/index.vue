<template>
  <div class="encrypt-popup-field">
    <div class="encrypt-popup-field-content">
      <div
        v-for="item in moduleDemensionData?.pickupModeList"
        :key="item.type"
        :class="['encrypt-popup-field-content-item', { active: item.type === orderFormData.pickupMode }]"
        @click="() => handleClick(item)"
      >
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  moduleDemensionData,
  orderFormData,
} from '@order-public-sub-public/components/business/pickup-mode/hooks/state'
import { pickupModeItem } from '@order-public-sub-public/types'

const emit = defineEmits(['onClickField'])

const handleClick = (item: pickupModeItem) => {
  emit('onClickField', item)
}
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
