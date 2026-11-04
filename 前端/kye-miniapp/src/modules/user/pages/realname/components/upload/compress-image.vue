<template>
  <canvas
    v-if="canvasInitialized"
    id="compress-image"
    :width="basicSize.width"
    :height="basicSize.height"
    :style="{ width: basicSize.width + 'px', height: basicSize.height + 'px' }"
    canvas-id="compress-image"
    class="compress-image-canvas"
  ></canvas>
</template>

<script lang="ts" setup>
import Taro from '@tarojs/taro'
import { computed, reactive, ref } from 'vue'
import './compress-image.scss'

const KB_BASE = 1024
const CANVAS_MAX_WH = 1800

const targetSize = reactive<{ width: number; height: number }>({ width: 0, height: 0 })
const basicSize = reactive<{ width: number; height: number }>({ width: 0, height: 0 })
const baseFactor = ref(1)

const canvasInitialized = computed(() => {
  return basicSize.width > 0 || basicSize.height > 0
})

const evaluateImageCompression = async (image: Taro.getImageInfo.SuccessCallbackResult) => {
  if (canvasInitialized.value) return

  const max = Math.max(image.width, image.height)

  if (max > CANVAS_MAX_WH) {
    baseFactor.value = max / CANVAS_MAX_WH
  }

  basicSize.width = Math.floor(image.width * baseFactor.value)
  basicSize.height = Math.floor(image.height * baseFactor.value)

  await new Promise((resolve) => setTimeout(resolve)) // 等下一个 eventLoop，确保 canvas 渲染完成
}

const calculateSizeReductionFactor = (size: number, target: number) => {
  const sizeRatio = Math.sqrt(size / KB_BASE / target)
  return Math.max(baseFactor.value, sizeRatio)
}

const compressImage = async (imagePath: string, kb: number): Promise<{ tempFilePath: string }> => {
  const { size } = await new Promise<Taro.getFileInfo.SuccessCallbackResult>((success, fail) =>
    Taro.getFileInfo({ filePath: imagePath, success, fail }),
  )
  if (size / KB_BASE <= kb) {
    return { tempFilePath: imagePath }
  }
  const info = await Taro.getImageInfo({ src: imagePath })
  await evaluateImageCompression(info)

  const factor = calculateSizeReductionFactor(size, kb)
  const targetWidth = Math.floor(info.width / factor)
  const targetHeight = Math.floor(info.height / factor)
  targetSize.width = targetWidth
  targetSize.height = targetHeight

  const ctx = Taro.createCanvasContext('compress-image')
  ctx.drawImage(imagePath, 0, 0, targetWidth, targetHeight)
  return await new Promise((resolve, reject) => {
    ctx.draw(false, () => {
      Taro.canvasToTempFilePath(
        {
          canvasId: 'compress-image',
          width: targetWidth,
          height: targetHeight,
          destWidth: targetWidth,
          destHeight: targetHeight,
          quality: 1,

          async success(res) {
            const result = await new Promise<Taro.getFileInfo.SuccessCallbackResult>((success, fail) => {
              Taro.getFileInfo({ filePath: res.tempFilePath, success, fail })
            })
            console.log('compress-image', result.size / KB_BASE)
            if (result.size && result.size / KB_BASE <= kb) {
              return resolve(res)
            }

            resolve(await compressImage(res.tempFilePath, kb))
          },
          fail: reject,
        },
        this,
      )
    })
  })
}

defineExpose({ compressImage })
</script>
