<template>
  <view class="route">
    <!-- <WaybillRouteCard /> -->
    <WaybillRouteMap />
    <ky-floating-panel
      v-model:height="height"
      :anchors="anchors"
      :contentDraggable="false"
      @heightChange="heightChange"
      @heightChangeEnd="heightChangeEnd"
    >
      <view class="route-footer">
        <WaybillRouteMenu />
        <WaybillRouteInfo />
      </view>
      <template #header> <WaybillRouteDriver /> </template>
    </ky-floating-panel>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import './index.scss'
// import WaybillRouteCard from './components/routeCard/index.vue'
import WaybillRouteMap from './components/routeMap/index.vue'
import WaybillRouteMenu from './components/routeMenu/index.vue'
import WaybillRouteDriver from './components/routeDriver/index.vue'
import WaybillRouteInfo from './components/routeInfo/index.vue'

const anchors = [300, 400, 500]

const height = ref(anchors[2])

const heightChange = (height: Number) => {
  console.log('heightChange', height)
}

const heightChangeEnd = (height: Number) => {
  console.log('heightChangeEnd', height)
}
</script>
