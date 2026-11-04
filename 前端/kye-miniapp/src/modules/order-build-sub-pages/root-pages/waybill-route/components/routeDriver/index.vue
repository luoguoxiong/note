<template>
  <view class="driver">
    <view class="driver-box">
      <view class="driver-left">
        <image
          src="https://ic-img.ky-express.com/netc/20250117_7667474250_!!1737085966278_128_128.png"
          mode="scaleToFill"
          class="driver-left-image"
        />
        <view class="driver-left-info">
          <view class="top">
            <view class="name">魏嘉乐</view>
            <view class="cp">浙B9QG50</view>
          </view>
          <view class="bottom">
            <view class="gh">工号:718992</view>
            <view class="id">400001188008081944</view>
          </view>
        </view>
      </view>
      <view class="driver-right">
        <image
          class="driver-right-image"
          src="https://ic-img.ky-express.com/netc/20250117_4067474274_!!1737086926375_64_64.png"
          mode="scaleToFill"
        />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import './index.scss'
import { ref } from 'vue'
const test = () => {
  console.log("完犢子了")
}

const title = ref('司机信息')
</script>
