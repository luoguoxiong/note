<template>
  <view class="cropper-image">
    <view class="cropper-content">
      <!-- imagePath="https://ic-img.ky-express.com/netc/20250926_25978_!!1758881447933_3024_4032.jpeg" 
      https://ic-img.ky-express.com/netc/20260527_83643_!!1779863952349_1314_521.png
      https://ic-img.ky-express.com/netc/20260527_56147_!!1779864238075_410_103.png
      https://ic-img.ky-express.com/netc/20260527_40890_!!1779864443816_439_53.png
      https://ic-img.ky-express.com/netc/20260527_75438_!!1779869805145_1200_2670.jpeg
      -->
      <ky-cropper-image ref="cropper" :imagePath="imagePath"></ky-cropper-image>
    </view>
    <view class="footer">
      <ky-button type="primary" @click="showImage">导出图片</ky-button>
    </view>
    <ky-popup v-model:show="show">
      <image :src="image" mode="aspectFit"></image>
    </ky-popup>
  </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import './index.scss'

const show = ref(false)
const image = ref('')
const cropper = ref()
const imagePath = ref('https://ic-img.ky-express.com/netc/20260527_75438_!!1779869805145_1200_2670.jpeg')
const showImage = async () => {
  const tempPath = await cropper.value.crop()
  show.value = true
  image.value = tempPath
}
</script>
