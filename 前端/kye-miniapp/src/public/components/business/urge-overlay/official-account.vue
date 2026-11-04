<template>
  <ky-overlay class="official-account-box" :show="show" :closeOnClickOverlay="true" position="center">
    <view class="official-account">
      <image
        class="official-account-image"
        src="https://ic-img.ky-express.com/netc/20250715_81628_!!1752588025713_1244_2118.png"
        mode="widthFix"
        @touchstart="handleTouchStart"
        @touchend="handleTouchEnd"
      />
      <span class="official-account-close" @click.stop="() => (show = false)"></span>
    </view>
  </ky-overlay>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import Taro from '@tarojs/taro'
import plateform from '@kye-netc/plateform'

const show = ref<boolean>(false)
async function saveImage() {
  try {
    await plateform.saveImageToPhotosAlbum(
      'https://ic-img.ky-express.com/netc/20250715_81628_!!1752588025713_1244_2118.png',
    )
    Taro.showToast({ title: '保存成功', icon: 'success' })
  } catch (error) {
    Taro.showToast({ title: error.message || '保存失败', icon: 'none' })
  }
}

const timer = ref(null)

function handleTouchStart() {
  timer.value = setTimeout(() => {
    saveImage()
  }, 350) // 超过350ms算长按
}

function handleTouchEnd() {
  if (timer.value) {
    clearTimeout(timer.value)
    timer.value = null
  }
}

const openPopup = (number: string) => {
  show.value = true
}

defineExpose({
  openPopup,
})
</script>

<style lang="scss">
.official-account-box {
  z-index: 100 !important;

  .official-account {
    display: flex;
    align-items: center;
    flex-direction: column;

    .official-account-image {
      width: 622px;
    }

    .official-account-close {
      margin-top: 48px;
      width: 64px;
      height: 64px;
      background: url('https://ic-img.ky-express.com/netc/20250821_44757_!!1755756886540_128_128.png') 0 0 no-repeat;
      background-size: cover;
    }
  }
}
</style>
