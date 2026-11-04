<template>
  <div class="project-location-content-warp" id="PickupMode" v-if="visible">
    <component :is="moduleStyleMap[props.moduleStyle]" />
  </div>
</template>
<script setup lang="ts">
import { DefineComponent } from 'vue'
import Unfold from './unfold/index.vue'
import { visible } from '@order-public-sub-public/components/business/auto-sync/hooks/state'

const props = withDefaults(defineProps<{ moduleStyle: string }>(), {
  moduleStyle: 'Unfold',
})

type ModuleStyleMap = Record<string, DefineComponent>
const moduleStyleMap: ModuleStyleMap = {
  Unfold: Unfold as DefineComponent,
}
</script>
