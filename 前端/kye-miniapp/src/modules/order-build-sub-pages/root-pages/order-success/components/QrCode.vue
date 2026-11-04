<template>
  <ky-overlay :show="visible" @click="hide">
    <div class="flex flex-column items-center w-full h-full">
      <div class="qrcode-container flex-column items-center" :class="{ 'qr-code-container-full': isWxMiniApp }">
        <img @touchstart.prevent="onTouchStart" @touchend="onTouchEnd" class="w-full h-full" :src="src" />
      </div>
      <SvgIcon @click="hide" class="qr-code-icon-close mt-48" name="icon-close-overlay"></SvgIcon>
    </div>
  </ky-overlay>
</template>
<script setup lang="ts">
import { ref, useModel } from 'vue'
import SvgIcon from '@order-public-sub-public/components/ui/svg-icon/index.vue'
import { isWechatEnv, isWxMiniApp } from '@/public/utils'
import plateform from '@kye-netc/plateform'
import Taro from '@tarojs/taro'

const props = defineProps<{ visible: boolean; src: string }>()

const visible = useModel(props, 'visible')
const emits = defineEmits<{ (event: 'update:visible', visible: boolean): void }>()

const hide = () => emits('update:visible', false)

const timer = ref<number>()

const downloadImageALink = async (image) => {
  const imgUrl = image?.src // 替换为你的图片 URL
  const response = await fetch(imgUrl)
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)

  // 创建下载链接并触发
  const link = document.createElement('a')
  link.href = url
  link.download = 'downloaded-image.jpg'
  link.click()

  // 释放对象 URL
  URL.revokeObjectURL(url)
}

/* 下载图片 */
const downloadImage = async (imageSrc) => {
  try {
    await plateform.saveImageToPhotosAlbum(imageSrc)
    // 1. 下载文件到临时路径
    // const res = await Taro.downloadFile({
    //   url: imageSrc,
    // })
    // if (res?.tempFilePath) {
    //   const tempFilePath = res.tempFilePath

    //   // 2. 保存到相册
    //   await plateform.saveImageToPhotosAlbum(tempFilePath)

    // } else {
    //   throw new Error('图片下载失败')
    // }
  } catch (error) {
    // 处理错误
    if (error.errMsg.includes('auth')) {
      Taro.showModal({
        title: '提示',
        content: '请授权保存图片到相册',
        success: (res) => {
          if (res.confirm) {
            Taro.openSetting()
          }
        },
      })
    } else {
      Taro.showToast({
        title: '下载失败',
        icon: 'none',
      })
      console.error(error)
    }
  }
}

const onTouchStart = () => {
  timer.value = setTimeout(function () {
    downloadImage(props.src)
  }, 300)
}

const onTouchEnd = () => {
  clearTimeout(timer.value)
}
</script>
<style lang="scss">
@import '@order-global-package-order-sub/styles/index.scss';
@import '../index.scss';
</style>
