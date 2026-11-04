<template>
  <view class="croppper-image-layout" id="croppper-image-layout">
    <!-- 图片展示 -->
    <image id="image" class="image" :src="imagePath" mode="aspectFit"></image>

    <!-- 拖拽区域 -->
    <view
      class="stage"
      :style="{
        width: `${state.stageWidth}px`,
        height: `${state.stageHeight}px`,
        left: `${state.stageLeft}px`,
        top: `${state.stageTop}px`,
      }"
      @touchstart="fnTouchStart"
      @touchmove="fnTouchMove"
      catchMove
    >
      <!-- 裁剪框 -->
      <view
        id="box"
        class="box-t"
        :style="{
          width: `${state.boxWidth}px`,
          height: `${state.boxHeight}px`,
          left: `${state.boxLeft}px`,
          top: `${state.boxTop}px`,
        }"
      >
        <!-- 四个拖拽点 -->
        <view id="lt" class="lt"></view>
        <view id="lb" class="lb"></view>
        <view id="rt" class="rt"></view>
        <view id="rb" class="rb"></view>
        <!-- 四个拖拽块 -->
        <view id="lt-block" class="lt-block" :key="'lt-block'"></view>
        <view id="lb-block" class="lb-block" :key="'lb-block'"></view>
        <view id="rt-block" class="rt-block" :key="'rt-block'"></view>
        <view id="rb-block" class="rb-block" :key="'rb-block'"></view>

        <!-- 辅助线 -->
        <view class="line-v" style="left: 33.3%"></view>
        <view class="line-v" style="left: 66.6%"></view>
        <view class="line-h" style="top: 33.3%"></view>
        <view class="line-h" style="top: 66.6%"></view>
      </view>
    </view>
    <!-- 用于截图的 Canvas -->
    <canvas
      type="2d"
      canvas-id="cropper-canvans"
      id="cropper-canvans"
      class="cropper-canvans"
      :style="{ width: `${state.stageWidth}px`, height: `${state.stageHeight}px` }"
    ></canvas>
  </view>
</template>

<script setup lang="ts">
import Taro, { Canvas } from '@tarojs/taro'
import { reactive, onMounted, nextTick } from 'vue'
import './index.scss'
import { CropperImageProps, CropperImageState } from './type'

const props = withDefaults(defineProps<CropperImageProps>(), {
  minBoxWidthRatio: 0.15,
  minBoxHeightRatio: 0.15,
  initialBoxWidthRatio: 0.6,
  initialBoxHeightRatio: 0.6,
  aspectRatio: null,
  outputFileType: 'jpg',
  quality: 1,
})

// 数据定义
const state = reactive<CropperImageState>({
  // 布局相关
  layoutLeft: 0,
  layoutTop: 0,
  layoutWidth: 0,
  layoutHeight: 0,

  // 舞台相关
  stageLeft: 0,
  stageTop: 0,
  stageWidth: 0,
  stageHeight: 0,

  // 裁剪框相关
  boxLeft: 0,
  boxTop: 0,
  boxWidth: 0,
  boxHeight: 0,

  // 图片相关
  imageWidth: 0,
  imageHeight: 0,

  // Canvas 尺寸
  canvasWidth: 0,
  canvasHeight: 0,

  // 触摸起始点
  touchStartX: 0,
  touchStartY: 0,
  touchStartBoxLeft: 0,
  touchStartBoxTop: 0,
  touchStartBoxWidth: 0,
  touchStartBoxHeight: 0,

  imageStageRatio: 1, // 图片实际尺寸与剪裁舞台大小的比值，用于尺寸换算。

  // 最小盒子宽度
  minBoxWidth: 0,
  minBoxHeight: 0,

  pixelRatio: 1, // todo设备像素密度//暂不使用//
  hasCrop: false,
  ctx: null,
})

const emit = defineEmits(['ok'])

/**
 * 重新init
 */
const reInit = () => {
  nextTick(() => {
    init()
  })
}

// 初始化方法
const init = async () => {
  await nextTick()
  Taro.createSelectorQuery()
    .select('.croppper-image-layout')
    .boundingClientRect()
    .exec((rect: any) => {
      if (Array.isArray(rect)) {
        rect = rect[0]
      }
      /**
       * 得到外部布局信息
       */
      state.layoutLeft = rect.left
      state.layoutTop = rect.top
      state.layoutWidth = rect.width
      state.layoutHeight = rect.height

      /**
       * 获取图片信息
       */
      Taro.getImageInfo({
        src: props.imagePath,
        success: (imageInfo: Taro.getImageInfo.SuccessCallbackResult) => {
          // 图片宽高
          state.imageWidth = imageInfo.width
          state.imageHeight = imageInfo.height

          // 舞台宽高计算
          const imageWH = state.imageWidth / state.imageHeight
          const layoutWH = state.layoutWidth / state.layoutHeight

          // 如果图片宽高比大于舞台宽高比 表明图片更宽
          if (imageWH >= layoutWH) {
            // 取舞台宽度为图片宽度 实际高度按宽度进行缩放
            state.stageWidth = state.layoutWidth
            state.stageHeight = state.stageWidth / imageWH
            state.imageStageRatio = state.imageHeight / state.stageHeight
          }
          // 如果图片宽高比小于舞台宽高比 表明图片更高
          else {
            // 取舞台高度为图片高度 实际宽度按高度进行缩放
            state.stageHeight = state.layoutHeight
            state.stageWidth = state.stageHeight * imageWH
            state.imageStageRatio = state.imageWidth / state.stageWidth
          }

          // 舞台位置 上下居中效果
          state.stageLeft = (state.layoutWidth - state.stageWidth) / 2
          state.stageTop = (state.layoutHeight - state.stageHeight) / 2

          // 根据舞台宽度和高度+裁剪框最小比例计算出最小框的大小限制
          // state.minBoxWidth = state.stageWidth * props.minBoxWidthRatio
          // state.minBoxHeight = state.stageHeight * props.minBoxHeightRatio

          state.minBoxWidth = 10
          state.minBoxHeight = 10

          // 根据舞台宽度和高度+设置的初始的盒子宽高比计算出盒子的宽度和高度
          let boxWidth = state.stageWidth * props.initialBoxWidthRatio
          let boxHeight = state.stageHeight * props.initialBoxHeightRatio

          // 如果指定了目标宽高比 则根据目标宽高比计算出盒子的高度
          if (props.aspectRatio) {
            boxHeight = boxWidth / props.aspectRatio
          }
          // 如果盒子高度大于舞台高度 则根据舞台高度计算出盒子的高度
          if (boxHeight > state.stageHeight && props.aspectRatio) {
            boxHeight = state.stageHeight
            boxWidth = boxHeight * props.aspectRatio
          }

          // 记录盒子高度和宽度
          state.boxHeight = boxHeight
          state.boxWidth = boxWidth

          // 盒子位置上下居中
          state.boxLeft = (state.stageWidth - state.boxWidth) / 2
          state.boxTop = (state.stageHeight - state.boxHeight) / 2

          // 记录图片的宽高
          state.canvasWidth = state.stageWidth * state.imageStageRatio
          state.canvasHeight = state.stageHeight * state.imageStageRatio
        },
      })
    })
}

// 触摸开始
const fnTouchStart = (e: any) => {
  const touch = e.touches[0]
  // 记录触摸点位置
  state.touchStartX = touch.pageX
  state.touchStartY = touch.pageY

  // 记录当前拖动盒子的位置
  state.touchStartBoxLeft = state.boxLeft
  state.touchStartBoxTop = state.boxTop
  state.touchStartBoxWidth = state.boxWidth
  state.touchStartBoxHeight = state.boxHeight
}

// 触摸移动
const fnTouchMove = (e: any) => {
  const targetId = e.target?.id
  const touch = e.touches[0]
  const pageX = touch.pageX
  const pageY = touch.pageY

  const offsetX = pageX - state.touchStartX
  let offsetY = pageY - state.touchStartY

  // 提取常用变量
  const {
    stageWidth,
    stageHeight,
    minBoxWidth,
    minBoxHeight,
    touchStartBoxWidth,
    touchStartBoxHeight,
    touchStartBoxLeft,
    touchStartBoxTop,
  } = state

  const { aspectRatio } = props

  if (targetId === 'box') {
    // 移动裁剪框
    let newBoxLeft = touchStartBoxLeft + offsetX
    let newBoxTop = touchStartBoxTop + offsetY

    // 边界处理
    newBoxLeft = Math.max(0, Math.min(newBoxLeft, stageWidth - touchStartBoxWidth))
    newBoxTop = Math.max(0, Math.min(newBoxTop, stageHeight - touchStartBoxHeight))

    state.boxLeft = newBoxLeft
    state.boxTop = newBoxTop
  } else if (targetId === 'lt-block') {
    // 左上角调整
    if (aspectRatio) offsetY = offsetX / aspectRatio

    let newBoxLeft = touchStartBoxLeft + offsetX
    let newBoxTop = touchStartBoxTop + offsetY
    let newBoxWidth = touchStartBoxWidth - offsetX
    let newBoxHeight = touchStartBoxHeight - offsetY

    // 边界处理
    if (newBoxWidth < minBoxWidth) {
      newBoxWidth = minBoxWidth
      newBoxLeft = touchStartBoxLeft + touchStartBoxWidth - minBoxWidth
      if (aspectRatio) {
        newBoxHeight = newBoxWidth / aspectRatio
        newBoxTop = touchStartBoxTop + touchStartBoxHeight - newBoxHeight
      }
    }
    if (newBoxHeight < minBoxHeight) {
      newBoxHeight = minBoxHeight
      newBoxTop = touchStartBoxTop + touchStartBoxHeight - minBoxHeight
      if (aspectRatio) {
        newBoxWidth = newBoxHeight * aspectRatio
        newBoxLeft = touchStartBoxLeft + touchStartBoxWidth - newBoxWidth
      }
    }

    // 确保不超出边界
    newBoxLeft = Math.max(0, newBoxLeft)
    newBoxTop = Math.max(0, newBoxTop)

    state.boxLeft = newBoxLeft
    state.boxTop = newBoxTop
    state.boxWidth = newBoxWidth
    state.boxHeight = newBoxHeight
  } else if (targetId === 'rt-block') {
    // 右上角调整
    if (aspectRatio) offsetY = -offsetX / aspectRatio

    let newBoxWidth = touchStartBoxWidth + offsetX
    let newBoxTop = touchStartBoxTop + offsetY
    let newBoxHeight = touchStartBoxHeight - offsetY

    // 边界处理
    if (newBoxWidth < minBoxWidth) {
      newBoxWidth = minBoxWidth
      if (aspectRatio) {
        newBoxHeight = newBoxWidth / aspectRatio
        newBoxTop = touchStartBoxTop + touchStartBoxHeight - newBoxHeight
      }
    }
    if (newBoxHeight < minBoxHeight) {
      newBoxHeight = minBoxHeight
      newBoxTop = touchStartBoxTop + touchStartBoxHeight - minBoxHeight
      if (aspectRatio) {
        newBoxWidth = newBoxHeight * aspectRatio
      }
    }

    // 确保不超出右边界
    if (touchStartBoxLeft + newBoxWidth > stageWidth) {
      newBoxWidth = stageWidth - touchStartBoxLeft
      if (aspectRatio) {
        newBoxHeight = newBoxWidth / aspectRatio
        newBoxTop = touchStartBoxTop + touchStartBoxHeight - newBoxHeight
      }
    }

    state.boxWidth = newBoxWidth
    state.boxTop = newBoxTop
    state.boxHeight = newBoxHeight
  } else if (targetId === 'lb-block') {
    // 左下角调整
    if (aspectRatio) offsetY = offsetX / aspectRatio

    let newBoxLeft = touchStartBoxLeft + offsetX
    let newBoxWidth = touchStartBoxWidth - offsetX
    let newBoxHeight = touchStartBoxHeight + offsetY

    // 边界处理
    if (newBoxWidth < minBoxWidth) {
      newBoxWidth = minBoxWidth
      newBoxLeft = touchStartBoxLeft + touchStartBoxWidth - minBoxWidth
      if (aspectRatio) {
        newBoxHeight = newBoxWidth / aspectRatio
      }
    }
    if (newBoxHeight < minBoxHeight) {
      newBoxHeight = minBoxHeight
      if (aspectRatio) {
        newBoxWidth = newBoxHeight * aspectRatio
        newBoxLeft = touchStartBoxLeft + touchStartBoxWidth - newBoxWidth
      }
    }

    // 确保不超出下边界
    if (touchStartBoxTop + newBoxHeight > stageHeight) {
      newBoxHeight = stageHeight - touchStartBoxTop
      if (aspectRatio) {
        newBoxWidth = newBoxHeight * aspectRatio
        newBoxLeft = touchStartBoxLeft + touchStartBoxWidth - newBoxWidth
      }
    }

    state.boxLeft = newBoxLeft
    state.boxWidth = newBoxWidth
    state.boxHeight = newBoxHeight
  } else if (targetId === 'rb-block') {
    // 右下角调整 - 重点修复部分
    if (aspectRatio) offsetY = offsetX / aspectRatio

    let newBoxWidth = touchStartBoxWidth + offsetX
    let newBoxHeight = touchStartBoxHeight + offsetY

    // 应用最小尺寸限制
    if (newBoxWidth < minBoxWidth) {
      newBoxWidth = minBoxWidth
      if (aspectRatio) newBoxHeight = newBoxWidth / aspectRatio
    }
    if (newBoxHeight < minBoxHeight) {
      newBoxHeight = minBoxHeight
      if (aspectRatio) newBoxWidth = newBoxHeight * aspectRatio
    }

    // 应用最大边界限制
    if (touchStartBoxLeft + newBoxWidth > stageWidth) {
      newBoxWidth = stageWidth - touchStartBoxLeft
      if (aspectRatio) newBoxHeight = newBoxWidth / aspectRatio
    }
    if (touchStartBoxTop + newBoxHeight > stageHeight) {
      newBoxHeight = stageHeight - touchStartBoxTop
      if (aspectRatio) newBoxWidth = newBoxHeight * aspectRatio
    }

    // 最终确保不小于最小值
    if (newBoxWidth < minBoxWidth) {
      newBoxWidth = minBoxWidth
      if (aspectRatio) newBoxHeight = newBoxWidth / aspectRatio
    }
    if (newBoxHeight < minBoxHeight) {
      newBoxHeight = minBoxHeight
      if (aspectRatio) newBoxWidth = newBoxHeight * aspectRatio
    }

    state.boxWidth = newBoxWidth
    state.boxHeight = newBoxHeight
  }
}

interface CanvasContext {
  ctx: CanvasRenderingContext2D
  canvas: Canvas
  dpr: number
  width: number
  height: number
}

// 创建画布上下文
const createContext = (): Promise<CanvasContext> => {
  return new Promise((resolve) => {
    const query = Taro.createSelectorQuery()
    query
      .select('#cropper-canvans')
      .fields({ node: true, size: true })
      .exec((res: any) => {
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')
        const dpr = Taro.getSystemInfoSync().pixelRatio
        canvas.width = res[0].width * dpr
        canvas.height = res[0].height * dpr
        ctx.scale(dpr, dpr)
        resolve({ ctx, canvas, dpr, width: canvas.width, height: canvas.height })
      })
  })
}

// 获取图片信息
const getImageInfo = (canvas: Canvas, url: string): Promise<Taro.Image> => {
  return new Promise((resolve) => {
    const img = canvas.createImage()
    img.src = url
    img.onload = () => resolve(img)
  })
}

const getFileBase64 = async (tempFilePath: string) => {
  return new Promise((resolve, reject) => {
    const fs = Taro.getFileSystemManager()
    fs.readFile({
      filePath: tempFilePath,
      encoding: 'base64', // 指定编码格式
      success: (res) => resolve(res.data),
      fail: reject,
    })
  })
}

const cropImage = () => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const { ctx: context, canvas } = await createContext()
    const url = (await getImageInfo(canvas, props.imagePath)) as any

    // 计算裁剪区域在原始图像中的像素位置和尺寸
    const sourceX = state.boxLeft * state.imageStageRatio
    const sourceY = state.boxTop * state.imageStageRatio
    const sourceWidth = state.boxWidth * state.imageStageRatio
    const sourceHeight = state.boxHeight * state.imageStageRatio

    // 调整 Canvas 的实际绘制尺寸（避免缩放）
    canvas.width = sourceWidth
    canvas.height = sourceHeight
    context.scale(1, 1) // 重置缩放（如果之前有调整 DPR）

    // 仅绘制裁剪区域
    context.drawImage(
      url,
      sourceX,
      sourceY, // 源图像裁剪起始点 (x, y)
      sourceWidth,
      sourceHeight, // 源图像裁剪尺寸 (w, h)
      0,
      0, // 在 Canvas 上的起始点 (x, y)
      sourceWidth,
      sourceHeight, // 在 Canvas 上的绘制尺寸 (w, h)
    )

    // 导出裁剪后的图像（指定目标尺寸）
    Taro.canvasToTempFilePath({
      canvas,
      x: 0,
      y: 0,
      // width: sourceWidth, // 指定裁剪宽度（像素）
      // height: sourceHeight, // 指定裁剪高度（像素）
      destWidth: sourceWidth, // 目标文件宽度（保持原尺寸）
      destHeight: sourceHeight, // 目标文件高度（保持原尺寸）
      fileType: props.outputFileType || 'jpg',
      quality: props.quality || 1,
      success: async (res: { tempFilePath: string }) => {
        const base64 = (await getFileBase64(res.tempFilePath)) as string

        // 处理微信返回的图片数据（可能没有前缀或格式不规范）
        let localData = base64

        // 情况1：如果返回的是纯base64数据（没有前缀）
        if (!localData.startsWith('data:image')) {
          localData = 'data:image/jpeg;base64,' + localData // 默认补全为jpeg格式
        }

        // 情况2：清理数据（微信可能返回带换行符或不规范的格式）
        localData = localData
          .replace(/\r|\n/g, '') // 移除换行符
          .replace('data:image/jgp', 'data:image/jpeg') // 修正拼写错误

        resolve(localData)
        emit('ok', localData)
      },
      fail: (err: any) => {
        reject(err)
        console.error('Canvas to temp file failed:', err)
      },
    })
  })
}

defineExpose({
  crop: cropImage,
  reInit,
})

onMounted(() => {
  init()
})
</script>
