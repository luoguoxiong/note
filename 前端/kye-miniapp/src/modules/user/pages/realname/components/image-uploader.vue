<template>
  <view class="image-uploader">
    <view class="upload-area" @click="chooseImage">
      <view v-if="fileUrl" class="image-preview">
        <image :src="fileUrl" mode="aspectFill" class="preview-image" />
        <view class="remove-btn" @click.stop="removeImage">
          <van-icon name="cross" size="16rpx" color="#fff" />
        </view>
      </view>
      <view v-else class="upload-placeholder">
        <van-icon name="photograph" size="48rpx" color="#c8c9cc" />
        <view class="upload-tip">{{ tip }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Taro from '@tarojs/taro'

// Props
interface Props {
  fileUrl?: string
  tip?: string
}

const props = withDefaults(defineProps<Props>(), {
  fileUrl: '',
  tip: '点击上传图片',
})

// Emits
const emit = defineEmits<{
  change: [fileUrl: string]
}>()

// 响应式数据
const fileUrl = ref(props.fileUrl)

// 选择图片
const chooseImage = async () => {
  try {
    const res = await Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
    })

    if (res.tempFilePaths.length > 0) {
      fileUrl.value = res.tempFilePaths[0]
      emit('change', fileUrl.value)

      // 这里可以添加图片上传到服务器的逻辑
      // await uploadImage(res.tempFilePaths[0])
    }
  } catch (error) {
    console.error('选择图片失败:', error)
    Taro.showToast({ title: '选择图片失败', icon: 'none' })
  }
}

// 删除图片
const removeImage = () => {
  fileUrl.value = ''
  emit('change', '')
}

// 上传图片到服务器（模拟实现）
const uploadImage = async (tempFilePath: string): Promise<string> => {
  // 这里实现实际上传到服务器的逻辑
  // 暂时返回模拟的URL
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`https://example.com/upload/${Date.now()}.jpg`)
    }, 1000)
  })
}

// 监听props变化
watch(
  () => props.fileUrl,
  (newUrl) => {
    fileUrl.value = newUrl
  },
)
</script>

<style lang="scss" scoped>
.image-uploader {
  .upload-area {
    width: 200rpx;
    height: 200rpx;
    border: 2rpx dashed #dcdee0;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fafafa;
    position: relative;
    cursor: pointer;

    &:active {
      background: #f5f5f5;
    }
  }

  .image-preview {
    width: 100%;
    height: 100%;
    position: relative;

    .preview-image {
      width: 100%;
      height: 100%;
      border-radius: 6rpx;
    }

    .remove-btn {
      position: absolute;
      top: -12rpx;
      right: -12rpx;
      width: 32rpx;
      height: 32rpx;
      background: #ee0a24;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
  }

  .upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;

    .upload-tip {
      font-size: 24rpx;
      color: #969799;
      margin-top: 16rpx;
    }
  }
}
</style>
