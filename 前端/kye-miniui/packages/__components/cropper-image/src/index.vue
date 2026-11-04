<template>
  <view class="croppper-image-layout" id="croppper-image-layout">
    <!-- 图片展示 -->
    <image id="image" class="image aspectFit" :src="imagePath" mode="aspectFit"></image>

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
      @touchend="fnTouchEnd"
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
        <!-- 四个拖拽点（可点击区域） -->
        <view id="lt" class="lt"></view>
        <view id="lb" class="lb"></view>
        <view id="rt" class="rt"></view>
        <view id="rb" class="rb"></view>

        <!-- 四个拖拽块（用于触摸） -->
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

    <!-- 缩小后的 Canvas（用来绘制并导出） -->
    <canvas
      v-if="state.canvasWidth && state.canvasHeight"
      canvas-id="cropper-canvans"
      id="cropper-canvans"
      class="cropper-canvans"
      :width="state.canvasWidth"
      :height="state.canvasHeight"
      :style="{ width: `${state.canvasWidth}px`, height: `${state.canvasHeight}px` }"
    ></canvas>
  </view>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'
import { reactive, onMounted, nextTick } from 'vue'
import { CropperImageProps, CropperImageState } from './type'
import { canvasDraw } from '@packages/utils/src/plateform/canvas'
import { nativeCanvasToTempFilePathH5, webCanvasToTempFilePathH5 } from './utils'

import './index.scss'

/**
 * 增加 maxCanvasSize prop，避免写死在组件内
 */
const props = withDefaults(defineProps<CropperImageProps>(), {
  minBoxWidthRatio: 0.15,
  minBoxHeightRatio: 0.15,
  initialBoxWidthRatio: 0.6,
  initialBoxHeightRatio: 0.6,
  aspectRatio: null,
  outputFileType: 'jpg',
  quality: 1,
  maxCanvasSize: 1000, // <= 新增：最大 canvas 边长，避免内存溢出
})

const state = reactive<CropperImageState>({
  layoutLeft: 0,
  layoutTop: 0,
  layoutWidth: 0,
  layoutHeight: 0,

  stageLeft: 0,
  stageTop: 0,
  stageWidth: 0,
  stageHeight: 0,

  boxLeft: 0,
  boxTop: 0,
  boxWidth: 0,
  boxHeight: 0,

  imageWidth: 0,
  imageHeight: 0,

  canvasWidth: 0,
  canvasHeight: 0,

  touchStartX: 0,
  touchStartY: 0,
  touchStartBoxLeft: 0,
  touchStartBoxTop: 0,
  touchStartBoxWidth: 0,
  touchStartBoxHeight: 0,
  touchStartDistance: 0,

  imageStageRatio: 1, // 原图像素 / stage 像素（备用）
  minBoxWidth: 0,
  minBoxHeight: 0,
  pixelRatio: 1,
  hasCrop: false,
  ctx: null,

  scale: 1, // canvas = 原图 * scale
})

const emit = defineEmits(['ok'])

const reInit = () => {
  nextTick(() => {
    init()
  })
}

/**
 * 初始化舞台与 canvas 缩放
 */
const init = async () => {
  await nextTick()
  Taro.createSelectorQuery()
    .select('.croppper-image-layout')
    .boundingClientRect()
    .exec((rect: any) => {
      if (Array.isArray(rect)) rect = rect[0]
      if (!rect) return

      state.layoutLeft = rect.left
      state.layoutTop = rect.top
      state.layoutWidth = rect.width
      state.layoutHeight = rect.height

      Taro.getImageInfo({
        src: props.imagePath,
        success: (imageInfo: Taro.getImageInfo.SuccessCallbackResult) => {
          // 原图像素尺寸
          state.imageWidth = imageInfo.width
          state.imageHeight = imageInfo.height

          const imageWH = state.imageWidth / state.imageHeight
          const layoutWH = state.layoutWidth / state.layoutHeight

          // 计算 stage（展示区域）尺寸：尽可能适应 layout，等比例
          if (imageWH >= layoutWH) {
            state.stageWidth = state.layoutWidth
            state.stageHeight = state.stageWidth / imageWH
            // imageStageRatio 表示：原图像素 / stage像素 —> 用于部分旧逻辑（不是最终映射）
            state.imageStageRatio = state.imageWidth / state.stageWidth
          } else {
            state.stageHeight = state.layoutHeight
            state.stageWidth = state.stageHeight * imageWH
            state.imageStageRatio = state.imageWidth / state.stageWidth
          }

          // 居中 stage
          state.stageLeft = (state.layoutWidth - state.stageWidth) / 2
          state.stageTop = (state.layoutHeight - state.stageHeight) / 2

          // 最小裁剪框
          state.minBoxWidth = Math.min(5, state.stageWidth * (props.minBoxWidthRatio ?? 0.15))
          state.minBoxHeight = Math.min(5, state.stageHeight * (props.minBoxHeightRatio ?? 0.15))

          // 初始裁剪框尺寸与位置
          if (state.imageWidth > state.imageHeight) {
            let boxWidth = state.stageWidth
            let boxHeight = boxWidth * (state.imageHeight / state.imageWidth)
            if (props.aspectRatio) {
              boxHeight = boxWidth / props.aspectRatio
            }
            state.boxWidth = boxWidth
            state.boxHeight = boxHeight
            state.boxLeft = (state.stageWidth - state.boxWidth) / 2
            state.boxTop = (state.stageHeight - state.boxHeight) / 2
          } else {
            let boxWidth = state.stageWidth
            let boxHeight = 150
            if (props.aspectRatio) {
              boxHeight = boxWidth / props.aspectRatio
            }
            state.boxWidth = boxWidth
            state.boxHeight = boxHeight
            state.boxLeft = (state.stageWidth - state.boxWidth) / 2
            state.boxTop = (state.stageHeight - state.boxHeight) / 2
          }

          // ---------- 关键：计算 canvas 缩放，限制最大边长 ----------
          const maxCanvasSize = props.maxCanvasSize || 1000
          let scale = 1
          if (state.imageWidth > maxCanvasSize || state.imageHeight > maxCanvasSize) {
            scale = Math.min(maxCanvasSize / state.imageWidth, maxCanvasSize / state.imageHeight)
          }
          state.scale = scale
          state.canvasWidth = Math.max(1, Math.floor(state.imageWidth * scale))
          state.canvasHeight = Math.max(1, Math.floor(state.imageHeight * scale))
          // ---------------------------------------------------------
        },
        fail: (err) => {
          console.error('getImageInfo fail', err)
        },
      })
    })
}

/**
 * 两点间距离
 */
const getDistance = (t1: any, t2: any) => {
  const dx = t1.pageX - t2.pageX
  const dy = t1.pageY - t2.pageY
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * 触摸开始
 */
const fnTouchStart = (e: any) => {
  const touches = e.touches || []

  // 记录识别框初始状态
  state.touchStartBoxLeft = state.boxLeft
  state.touchStartBoxTop = state.boxTop
  state.touchStartBoxWidth = state.boxWidth
  state.touchStartBoxHeight = state.boxHeight

  // 双指：记录初始指间距，作为缩放基准
  if (touches.length >= 2) {
    state.touchStartDistance = getDistance(touches[0], touches[1])
    return
  }

  const touch = touches[0]
  if (!touch) return
  state.touchStartX = touch.pageX
  state.touchStartY = touch.pageY
}

/**
 * 触摸移动（移动裁剪框或调整四角）
 * 完整实现参考你原来的逻辑，加入边界与最小尺寸限制
 */
const fnTouchMove = (e: any) => {
  e && e.preventDefault && e.preventDefault()
  const touches = e.touches || []

  // 手势锁定：大于双指不支持拖拽与缩放
  if (touches.length > 2) return

  // 双指：缩放识别框
  if (touches.length === 2) {
    fnPinchMove(touches)
    return
  }

  // 单指：拖拽识别框或调整四角
  const targetId = e.target?.id || ''
  const touch = touches[0]
  if (!touch) return
  const pageX = touch.pageX
  const pageY = touch.pageY

  const offsetX = pageX - state.touchStartX
  let offsetY = pageY - state.touchStartY

  const {
    stageLeft,
    stageTop,
    layoutWidth,
    layoutHeight,
    minBoxWidth,
    minBoxHeight,
    touchStartBoxWidth,
    touchStartBoxHeight,
    touchStartBoxLeft,
    touchStartBoxTop,
  } = state

  const aspectRatio = props.aspectRatio

  if (targetId === 'box') {
    // 移动裁剪框
    let newBoxLeft = touchStartBoxLeft + offsetX
    let newBoxTop = touchStartBoxTop + offsetY

    // 边界处理（允许超出 stage，但限制在 layout 内）
    newBoxLeft = Math.max(-stageLeft, Math.min(newBoxLeft, layoutWidth - stageLeft - touchStartBoxWidth))
    newBoxTop = Math.max(-stageTop, Math.min(newBoxTop, layoutHeight - stageTop - touchStartBoxHeight))

    state.boxLeft = newBoxLeft
    state.boxTop = newBoxTop
  } else if (targetId === 'lt-block') {
    // 左上角调整
    if (aspectRatio) offsetY = offsetX / aspectRatio

    let newBoxLeft = touchStartBoxLeft + offsetX
    let newBoxTop = touchStartBoxTop + offsetY
    let newBoxWidth = touchStartBoxWidth - offsetX
    let newBoxHeight = touchStartBoxHeight - offsetY

    // 最小尺寸处理
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

    // 边界
    newBoxLeft = Math.max(-stageLeft, newBoxLeft)
    newBoxTop = Math.max(-stageTop, newBoxTop)

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

    // 不能超出右边界（layout 限制）
    if (stageLeft + touchStartBoxLeft + newBoxWidth > layoutWidth) {
      newBoxWidth = layoutWidth - stageLeft - touchStartBoxLeft
      if (aspectRatio) {
        newBoxHeight = newBoxWidth / aspectRatio
        newBoxTop = touchStartBoxTop + touchStartBoxHeight - newBoxHeight
      }
    }

    // 上边界（layout 限制）
    newBoxTop = Math.max(-stageTop, newBoxTop)

    state.boxWidth = newBoxWidth
    state.boxTop = newBoxTop
    state.boxHeight = newBoxHeight
  } else if (targetId === 'lb-block') {
    // 左下角调整
    if (aspectRatio) offsetY = offsetX / aspectRatio

    let newBoxLeft = touchStartBoxLeft + offsetX
    let newBoxWidth = touchStartBoxWidth - offsetX
    let newBoxHeight = touchStartBoxHeight + offsetY

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

    // 左边界（layout 限制）
    newBoxLeft = Math.max(-stageLeft, newBoxLeft)

    // 不能超出下边界（layout 限制）
    if (stageTop + touchStartBoxTop + newBoxHeight > layoutHeight) {
      newBoxHeight = layoutHeight - stageTop - touchStartBoxTop
      if (aspectRatio) {
        newBoxWidth = newBoxHeight * aspectRatio
        newBoxLeft = touchStartBoxLeft + touchStartBoxWidth - newBoxWidth
      }
    }

    state.boxLeft = newBoxLeft
    state.boxWidth = newBoxWidth
    state.boxHeight = newBoxHeight
  } else if (targetId === 'rb-block') {
    // 右下角调整
    if (aspectRatio) offsetY = offsetX / aspectRatio

    let newBoxWidth = touchStartBoxWidth + offsetX
    let newBoxHeight = touchStartBoxHeight + offsetY

    // 最小尺寸限制
    if (newBoxWidth < minBoxWidth) {
      newBoxWidth = minBoxWidth
      if (aspectRatio) newBoxHeight = newBoxWidth / aspectRatio
    }
    if (newBoxHeight < minBoxHeight) {
      newBoxHeight = minBoxHeight
      if (aspectRatio) newBoxWidth = newBoxHeight * aspectRatio
    }

    // 最大边界限制（layout 级别）
    if (stageLeft + touchStartBoxLeft + newBoxWidth > layoutWidth) {
      newBoxWidth = layoutWidth - stageLeft - touchStartBoxLeft
      if (aspectRatio) newBoxHeight = newBoxWidth / aspectRatio
    }
    if (stageTop + touchStartBoxTop + newBoxHeight > layoutHeight) {
      newBoxHeight = layoutHeight - stageTop - touchStartBoxTop
      if (aspectRatio) newBoxWidth = newBoxHeight * aspectRatio
    }

    // 再次确保不小于最小值
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

/**
 * 双指缩放识别框
 * - 以识别框中心为缩放锚点，中心保持不变
 * - 横向/纵向均未触边：宽高同比例缩放
 * - 单方向触边：锁定该方向，另一方向仍可继续变化
 * - 双向均触边：无法放大，但支持缩小
 */
const fnPinchMove = (touches: any[]) => {
  if (!state.touchStartDistance) return

  const ratio = getDistance(touches[0], touches[1]) / state.touchStartDistance

  const {
    stageLeft,
    stageTop,
    layoutWidth,
    layoutHeight,
    minBoxWidth,
    minBoxHeight,
    touchStartBoxLeft,
    touchStartBoxTop,
    touchStartBoxWidth,
    touchStartBoxHeight,
  } = state

  const aspectRatio = props.aspectRatio

  // 缩放锚点：识别框中心（stage 坐标）保持不变
  const centerX = touchStartBoxLeft + touchStartBoxWidth / 2
  const centerY = touchStartBoxTop + touchStartBoxHeight / 2

  // 换算到页面(layout)坐标，计算中心固定时受页面边界约束的最大宽/高
  const layoutCenterX = stageLeft + centerX
  const layoutCenterY = stageTop + centerY
  const maxWidth = 2 * Math.min(layoutCenterX, layoutWidth - layoutCenterX)
  const maxHeight = 2 * Math.min(layoutCenterY, layoutHeight - layoutCenterY)

  // 期望尺寸（宽高同比例缩放）
  const desiredWidth = touchStartBoxWidth * ratio
  const desiredHeight = touchStartBoxHeight * ratio

  let newWidth: number
  let newHeight: number
  if (aspectRatio) {
    // 锁定宽高比：取满足比例且不超出页面边界的最大缩放
    const limit = Math.min(1, maxWidth / desiredWidth, maxHeight / desiredHeight)
    newWidth = desiredWidth * limit
    newHeight = desiredHeight * limit
  } else {
    // 分方向钳制：某方向触边即锁定该方向，另一方向仍可继续变化
    newWidth = Math.min(desiredWidth, maxWidth)
    newHeight = Math.min(desiredHeight, maxHeight)
  }

  // 最小尺寸保护
  newWidth = Math.max(newWidth, minBoxWidth)
  newHeight = Math.max(newHeight, minBoxHeight)

  // 中心固定，重算位置
  state.boxWidth = newWidth
  state.boxHeight = newHeight
  state.boxLeft = centerX - newWidth / 2
  state.boxTop = centerY - newHeight / 2
}

/**
 * 触摸结束：手指数量变化时重设基准，避免手势切换产生跳变
 */
const fnTouchEnd = (e: any) => {
  const touches = e.touches || []

  state.touchStartBoxLeft = state.boxLeft
  state.touchStartBoxTop = state.boxTop
  state.touchStartBoxWidth = state.boxWidth
  state.touchStartBoxHeight = state.boxHeight

  if (touches.length >= 2) {
    state.touchStartDistance = getDistance(touches[0], touches[1])
  } else if (touches.length === 1) {
    state.touchStartX = touches[0].pageX
    state.touchStartY = touches[0].pageY
  }
}

/**
 * 裁剪并导出 base64（考虑 canvas 缩放）
 */
const cropImage = () => {
  return new Promise<string>(async (resolve, reject) => {
    try {
      if (!state.canvasWidth || !state.canvasHeight) {
        return reject(new Error('canvas 未初始化'))
      }

      const context = Taro.createCanvasContext('cropper-canvans')
      const { path } = await Taro.getImageInfo({ src: props.imagePath })

      // 把原图完整绘制到 canvas（使用 canvas 尺寸）
      context.drawImage(path, 0, 0, state.imageWidth, state.imageHeight, 0, 0, state.canvasWidth, state.canvasHeight)

      // 等待 canvas 绘制完成（canvasDraw 应该封装了 context.draw 等）
      await canvasDraw(context)

      // 计算从 stage 坐标到 canvas 像素的缩放比例
      const stageToCanvasX = state.canvasWidth / state.stageWidth
      const stageToCanvasY = state.canvasHeight / state.stageHeight

      // 计算裁剪区域（映射到 canvas 像素）
      let clipLeft = Math.round(state.boxLeft * stageToCanvasX)
      let clipTop = Math.round(state.boxTop * stageToCanvasY)
      let clipWidth = Math.round(state.boxWidth * stageToCanvasX)
      let clipHeight = Math.round(state.boxHeight * stageToCanvasY)

      // 防止为 0 或超界
      clipWidth = Math.max(1, Math.min(clipWidth, state.canvasWidth - clipLeft))
      clipHeight = Math.max(1, Math.min(clipHeight, state.canvasHeight - clipTop))
      clipLeft = Math.max(0, Math.min(clipLeft, state.canvasWidth - 1))
      clipTop = Math.max(0, Math.min(clipTop, state.canvasHeight - 1))

      const cropOptions = {
        canvasId: 'cropper-canvans',
        x: clipLeft,
        y: clipTop,
        width: clipWidth,
        height: clipHeight,
        destWidth: clipWidth,
        destHeight: clipHeight,
        fileType: props.outputFileType || 'jpg',
        quality: props.quality || 1,
      }

      const isWeb = Taro.getEnv() === 'WEB'

      const canvasToBase64 = isWeb ? webCanvasToTempFilePathH5 : nativeCanvasToTempFilePathH5

      const base64 = await canvasToBase64(cropOptions)

      console.error(base64)
      // 导出完成后先清除画布内容（clearRect 需重新 draw 才生效），再销毁节点
      context.clearRect(0, 0, state.canvasWidth, state.canvasHeight)
      await canvasDraw(context)

      resolve(base64)
      emit('ok', base64)
    } catch (err) {
      reject(err)
    }
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
