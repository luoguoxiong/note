<template>
  <scroll-view
    id="globalClickId"
    class="container"
    :scrollY="true"
    type="customer"
    ref="scrollView"
    @scroll="handleScroll"
  >
    <!-- 触发按钮 -->
    <view style="height: 400px"></view>
    <view style="padding-left: 200px">
      <ky-popover v-model:show="show" theme="warning" location="top" listenClickId="globalClickId">
        <template #reference>
          <button class="popover-button" id="popover-test" @click.stop="showPopover" data-popover="true">
            显示 Popover
          </button>
        </template>

        <template #content>
          <view style="max-width: 100px"> 因运单信息变更，请重新核对声明价值 </view>
        </template>
      </ky-popover>
    </view>
    <view style="padding-left: 100px">
      <button class="popover-button" id="popover2" @click.stop="showPopover2" animation="fade" data-popover="true">
        显示 Popover2
      </button>
      <ky-popover ref="popover2" listenClickId="globalClickId">
        <template #content>
          <view style="max-width: 100px"> 因运单信息变更，请重新核对声明价值 </view>
        </template>
      </ky-popover>
    </view>

    <ky-button @click="popupShow = true">展示popup</ky-button>
    <view style="height: 1100px"></view>
    <ky-popup v-model:show="popupShow" position="bottom" @update:show="popupShow = $event">
      <button class="popover-button" id="popover3" @click.stop="showPopover2" animation="fade" data-popover="true">
        显示 Popover2
      </button>
      <ky-popover ref="popover2" listenClickId="globalClickId">
        <template #content>
          <view style="max-width: 100px"> 因运单信息变更，请重新核对声明价值 </view>
        </template>
      </ky-popover>
    </ky-popup>
  </scroll-view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import './index.scss'
const show = ref(false)
const popover2 = ref()
const popupShow = ref()

const showPopover = () => {
  show.value = !show.value
}
const showPopover2 = () => {
  popover2.value.showPopover('popover3', {
    location: 'bottom-start',
    theme: 'error',
    animation: 'bounce',
    offset: [0, 10],
  })
}
const handleScroll = () => {
  show.value = false
  popover2.value.closePopover()
}
</script>
