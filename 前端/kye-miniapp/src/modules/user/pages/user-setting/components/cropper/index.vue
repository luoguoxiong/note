<template>
  <view v-bind="$attrs" class="cropper-popup" :close-on-click-overlay="false" :lock-scroll="false" v-if="show">
    <view class="cropper">
      <view v-if="describe" class="cropper__describe">{{ describe }}</view>
      <view class="cropper-image-wrap">
        <ky-cropper-image
          :initialBoxWidthRatio="1"
          :aspectRatio="1"
          :imagePath="img"
          @ok="handleComplete"
          ref="cropper"
        />
      </view>
      <view class="cropper__footer">
        <view @click="handleCancel">取消</view>
        <view @click="doComplete">完成</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import './index.scss'

defineOptions({ name: 'CropperPopup' })

defineProps({
  show: { type: Boolean, default: false },
  img: { type: String, default: '' },
  describe: { type: String, default: '截取包含地址的区域' },
  autoCropWidth: { type: Number, default: 400 },
  autoCropHeight: { type: Number, default: 300 },
})

const emit = defineEmits(['cancel', 'complete'])

const cropper = ref()
/**
 * 取消
 */
const handleCancel = () => {
  emit('cancel', {})
}

const doComplete = () => {
  cropper.value.crop()
}

function base64Prefix(base64String: string) {
  const base64PrefixPattern = /^data:[a-z]+\/[a-z]+;base64,/i
  if (!base64PrefixPattern.test(base64String)) {
    return 'data:image/png;base64,' + base64String
  }
  return base64String
}
/**
 * 完成
 */
const handleComplete = async (base64: string) => {
  emit('complete', base64Prefix(base64))
}

onMounted(() => {
  cropper.value?.reInit()
})
</script>
