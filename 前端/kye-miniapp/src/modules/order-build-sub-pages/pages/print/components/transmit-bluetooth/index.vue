<template>
  <ky-popup
    :show="transmitBluetooth"
    :closeOnClickOverlay="false"
    position="center"
    class="transmit-bluetooth"
    @click="transmitBluetooth = false"
  >
    <div class="transmit-bluetooth-content">
      <image src="https://ic-img.ky-express.com/netc/20250830_53145_!!1756534305654_560_560.png" />

      <text class="transmit-bluetooth-content-title"
        >正在向打印机传输数据...({{ transmitBluetoothProportion < 100 ? transmitBluetoothProportion : 100 }}%)</text
      >
      <text class="transmit-bluetooth-content-subtitle">请勿退出APP</text>
    </div>

    <image
      class="transmit-bluetooth-close"
      src="https://ic-img.ky-express.com/netc/20250830_84861_!!1756534347658_128_128.png"
      @tap.stop="transmitBluetooth = false"
    />
  </ky-popup>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'
import { ref, computed, watch } from 'vue'
import { transmitBluetooth, transmitBluetoothProportion } from '../../hooks/useData'

const show = ref<boolean>(false)
</script>

<style lang="scss">
@import './index.scss';
</style>
