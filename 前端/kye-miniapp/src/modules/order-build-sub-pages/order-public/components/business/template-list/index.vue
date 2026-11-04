<template>
  <div class="template-list-content" id="templateList" :visible="templateListVisible" v-if="templateListVisible">
    <component :is="moduleStyleMap[props.moduleStyle]" />
  </div>
</template>
<script setup lang="ts">
import { computed, DefineComponent } from 'vue'
import Unfold from './unfold/index.vue'

import { OrderPageType } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

const props = withDefaults(defineProps<{ moduleStyle: string }>(), {
  moduleStyle: 'unfold',
})

const orderPageType = computed(() => piniaStore.root.getOrderPageType)

type ModuleStyleMap = Record<string, DefineComponent>
const moduleStyleMap: ModuleStyleMap = {
  unfold: Unfold as DefineComponent,
}

// 模板列表是否可见
const templateListVisible = computed(() => {
  return orderPageType.value === OrderPageType.单票
})
</script>
