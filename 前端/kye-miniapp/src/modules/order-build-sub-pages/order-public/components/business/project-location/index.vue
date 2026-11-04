<template>
  <div class="project-location-content-warp" id="PickupMode" v-if="visible">
    <component :is="moduleStyleMap[props.moduleStyle]" />
  </div>
</template>
<script setup lang="ts">
import { DefineComponent } from 'vue'
import Popup from './popup/index.vue'
import { visible } from './hooks/state'

const props = withDefaults(defineProps<{ moduleStyle: string }>(), {
  moduleStyle: 'popup',
})

type ModuleStyleMap = Record<string, DefineComponent>
const moduleStyleMap: ModuleStyleMap = {
  popup: Popup as DefineComponent,
}
</script>
