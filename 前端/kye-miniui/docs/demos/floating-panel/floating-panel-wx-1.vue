<template>
  <div class="ky-floating-panel-demo">
    <div>基本用法1</div>
    <div style="width: 100%; height: 800px">
      <map latitude="23.098994" longitude="113.322520" scale="16" style="width: 100%; height: 100%"></map>
    </div>
    <!-- <view
      class="mask-cover-view"
      :style="{ height: `${height}px` }"
      @touchmove.stop.prevent
      @touchstart.stop.prevent
      @touchend.stop.prevent
    ></view> -->
    <ky-floating-panel-wx
      v-model:height="height"
      :anchors="anchors"
      :contentDraggable="false"
      @heightChange="heightChange"
      @heightChangeEnd="heightChangeEnd"
    >
      <template #header>
        <div>123456</div>
      </template>
      <div style="text-align: center; padding: 15px">
        <p>面板显示高度 {{ height }} px</p>
      </div>
      <div v-for="item in [1,2,3,4,5]" style="width: 100%; height: 40px; border:1px solid blue;">
        {{item}}
      </div>
    </ky-floating-panel-wx>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

const anchors = [300, 400, 500]

const height = ref(anchors[0])

const heightChange = (height: Number) => {
  console.log('heightChange', height)
}

const heightChangeEnd = (height: Number) => {
  console.log('heightChangeEnd', height)
}
</script>

<style lang="scss">
.mask-cover-view {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  touch-action: none;
  -webkit-overflow-scrolling: auto;
}
</style>
