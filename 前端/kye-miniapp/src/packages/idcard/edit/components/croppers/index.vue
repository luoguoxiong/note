<template>
  <view @touchmove="touchMove" class="idcard-cropper-content-warp">
    <template v-if="showCropper">
      <view>
        <view class="idcard-cropper-content">
          <ky-cropper-image ref="cropperRef" :imagePath="imgSrc"></ky-cropper-image>
        </view>

        <view class="flex flex_ai_c flex_jc_b cropper-btn f_s_32 c_fff">
          <text @tap="onCancelBtn">取消</text>
          <text class="confirm" @tap="onCut">确定</text>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  imgSrc: string
  showCropper: boolean
}

const emits = defineEmits(['cancel', 'complete'])

defineProps<Props>()

const cropperRef = ref<any>()

const onCancel = () => {
  emits('cancel')
}

const onCut = async () => {
  if (cropperRef.value) {
    const tempPath = await cropperRef.value?.crop()
    emits('complete', tempPath)
    onCancel()
  }
}

const onCancelBtn = () => {
  onCancel()
  cropperRef.value?.reInit()
}

const touchMove = (e) => {
  e.stopPropagation()
}
</script>

<style lang="scss">
@import './index.scss';
</style>
