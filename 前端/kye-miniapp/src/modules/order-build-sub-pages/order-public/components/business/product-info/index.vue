<template>
  <div
    class="product-info row-item need-short-bottom-line"
    :class="{ disabled: disabled }"
    v-if="visible"
    :type="type"
    :visible="visible"
  >
    <HotZone :moduleType="ModuleType['货物信息']"></HotZone>
    <template v-if="props.config.fieldsConfigType === 'fields'"
      ><component :isDisabled="disabled" :is="moduleStyleMap[props.moduleStyle]"
    /></template>
    <template v-else-if="props.config.fieldsConfigType === 'combination'"><Groups v-bind="props" /></template>
  </div>
</template>

<script lang="ts" setup>
import { provide, DefineComponent } from 'vue'
import { PickModule, ProductInfoConfig } from '@order-public-sub-public/types'
import Unfold from './unfold/index.vue'
import Page from './page/index.vue'
import Popup from './popup/index.vue'
import Groups from './groups/index.vue'
import HotZone from '@order-public-sub-public/components/business/hot-zone/index.vue'
import { ModuleType } from '@order-public-sub-public/constants'

type ModuleStyleMap = Record<string, DefineComponent>

const moduleStyleMap: ModuleStyleMap = {
  unfold: Unfold as DefineComponent,
  page: Page as DefineComponent,
  popup: Popup as DefineComponent,
}

const props = withDefaults(defineProps<PickModule<ProductInfoConfig>>(), {
  visible: false,
  moduleStyle: '',
})

provide('productInfoProps', props)
</script>

<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import './index.scss';
</style>
