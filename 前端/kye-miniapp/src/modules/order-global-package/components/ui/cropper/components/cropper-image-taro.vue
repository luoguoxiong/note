<template>
  <view class="croppper-image-layout" id="croppper-image-layout">
    <!-- 图片展示 -->
    <image id="image" class="image" :src="imagePath" mode="aspectFit"></image>

    <!-- 拖拽区域 -->
    <view
      class="stage"
      :style="{ width: `${stageWidth}px`, height: `${stageHeight}px`, left: `${stageLeft}px`, top: `${stageTop}px` }"
      @touchstart="fnTouchStart"
      @touchmove="fnTouchMove"
      @touchend="fnTouchEnd"
      @touchcancel="fnTouchCancel"
      catchMove
    >
      <!-- 裁剪框 -->
      <view
        id="box"
        class="box-t"
        :style="{ width: `${boxWidth}px`, height: `${boxHeight}px`, left: `${boxLeft}px`, top: `${boxTop}px` }"
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
      :style="{ width: `${stageWidth}px`, height: `${stageHeight}px` }"
    ></canvas>
  </view>
</template>

<script>
import { CATCHMOVE } from '@tarojs/runtime'
import Taro from '@tarojs/taro'
import { reactive, onMounted, toRefs, nextTick } from 'vue'
export default {
  name: 'croppper',
  props: {
    /**
     * 文件地址
     */
    imagePath: {
      type: String,
      required: true,
    },
    /**
     * 是否开启debug
     */
    debug: {
      type: Boolean,
      default: false,
    },
    /**
     * 最小剪裁尺寸与原图尺寸的比率，默认0.15，即宽度最小剪裁到原图的0.15宽。
     */
    minBoxWidthRatio: {
      type: Number,
      default: 0.15,
    },
    /**
     * 宽比最小剪裁尺寸与原图尺寸的比率，默认0.15，即高度最小剪裁到原图的0.15高。
     */
    minBoxHeightRatio: {
      type: Number,
      default: 0.15,
    },
    /**
     * 剪裁框初始大小比率。默认值0.6，即剪裁框默认宽度为图片宽度的0.6倍。
     */
    initialBoxWidthRatio: {
      type: Number,
      default: 0.6,
    },
    /**
     * //同initialBoxWidthRatio，当设置aspectRatio时，initialBoxHeightRatio值设置无效。initialBoxHeightRatio值由initialBoxWidthRatio 和 aspectRatio自动计算得到。
     */
    initialBoxHeightRatio: {
      type: Number,
      default: 0.6,
    },
    /**
     * 目标图片的宽高比，默认null，即不限制剪裁宽高比。aspectRatio需大于0
     */
    aspectRatio: {
      type: [Number, null],
      default: null,
    },
    /**
     * 目标文件的类型。默认值为jpg，jpg：输出jpg格式图片；png：输出png格式图片
     */
    outputFileType: {
      type: String,
      default: 'jpg',
    },
    /**
     * 图片质量，范围0-1，默认值为1
     */
    quality: {
      type: Number,
      default: 1,
    },
  },
  emits: ['ok'],
  setup(props, { expose, emit }) {
    // 获取当前组件的作用域引用
    // 获取当前组件实例
    // const instance = getCurrentInstance()
    // const scope = instance?.ctx?.$scope || instance?.ctx
    // 日志打印
    const log = (msg) => {
      if (!props.debug) return
      console.log(msg)
    }

    // 数据定义
    const state = reactive({
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

      //
      imageStageRatio: 1, //图片实际尺寸与剪裁舞台大小的比值，用于尺寸换算。

      //最小盒子宽度
      minBoxWidth: 0,

      minBoxHeight: 0,

      pixelRatio: 1, //todo设备像素密度//暂不使用//
      hasCrop: false,
      ctx: null,
    })

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
        .exec((rect) => {
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
            success: (imageInfo) => {
              // 图片宽高
              state.imageWidth = imageInfo.width
              state.imageHeight = imageInfo.height

              // 舞台宽高计算
              const imageWH = state.imageWidth / state.imageHeight
              const layoutWH = state.layoutWidth / state.layoutHeight

              //如果图片宽高比大于舞台宽高比 表明图片更宽
              if (imageWH >= layoutWH) {
                //取舞台宽度为图片宽度 实际高度按宽度进行缩放
                state.stageWidth = state.layoutWidth
                state.stageHeight = state.stageWidth / imageWH
                state.imageStageRatio = state.imageHeight / state.stageHeight
              }
              //如果图片宽高比小于舞台宽高比 表明图片更高
              else {
                //取舞台高度为图片高度 实际宽度按高度进行缩放
                state.stageHeight = state.layoutHeight
                state.stageWidth = state.stageHeight * imageWH
                state.imageStageRatio = state.imageWidth / state.stageWidth
              }

              // 舞台位置 上下居中效果
              state.stageLeft = (state.layoutWidth - state.stageWidth) / 2
              state.stageTop = (state.layoutHeight - state.stageHeight) / 2

              //根据舞台宽度和高度+裁剪框最小比例计算出最小框的大小限制
              state.minBoxWidth = state.stageWidth * props.minBoxWidthRatio
              state.minBoxHeight = state.stageHeight * props.minBoxHeightRatio

              // 根据舞台宽度和高度+设置的初始的盒子宽高比计算出盒子的宽度和高度
              let boxWidth = state.stageWidth * props.initialBoxWidthRatio
              let boxHeight = state.stageHeight * props.initialBoxHeightRatio

              //如果指定了目标宽高比 则根据目标宽高比计算出盒子的高度
              if (props.aspectRatio) {
                boxHeight = boxWidth / props.aspectRatio
              }
              //如果盒子高度大于舞台高度 则根据舞台高度计算出盒子的高度
              if (boxHeight > state.stageHeight) {
                boxHeight = state.stageHeight
                boxWidth = boxHeight * props.aspectRatio
              }

              //记录盒子高度和宽度
              state.boxHeight = boxHeight
              state.boxWidth = boxWidth

              // 盒子位置上下居中
              state.boxLeft = (state.stageWidth - state.boxWidth) / 2
              state.boxTop = (state.stageHeight - state.boxHeight) / 2

              //记录图片的宽高
              state.canvasWidth = state.stageWidth * state.imageStageRatio
              state.canvasHeight = state.stageHeight * state.imageStageRatio
            },
          })
        })

      // 坐标系缩放（关键！）
      // ctx.scale(state.pixelRatio, state.pixelRatio)
    }

    // 触摸开始
    const fnTouchStart = (e) => {
      log(e)
      const touch = e.touches[0]
      //记录触摸点位置
      state.touchStartX = touch.pageX
      state.touchStartY = touch.pageY

      //记录当前拖动盒子的位置
      state.touchStartBoxLeft = state.boxLeft
      state.touchStartBoxTop = state.boxTop
      state.touchStartBoxWidth = state.boxWidth
      state.touchStartBoxHeight = state.boxHeight
    }

    // 触摸移动
    const fnTouchMove = (e) => {
      const targetId = e.target.id // 当前触摸的元素 ID

      const touch = e.touches[0] // 获取触摸点
      let pageX = touch.pageX // 触摸点的 X 坐标
      let pageY = touch.pageY // 触摸点的 Y 坐标

      let offsetX = pageX - state.touchStartX // X 轴偏移量
      let offsetY = pageY - state.touchStartY // Y 轴偏移量

      //记录当前state的使用值 示例
      // 布局相关

      let stageWidth = state.stageWidth
      let stageHeight = state.stageHeight

      // 最小裁剪框尺寸
      let minBoxWidth = state.minBoxWidth
      let minBoxHeight = state.minBoxHeight

      //触摸裁剪尺寸
      let touchStartBoxWidth = state.touchStartBoxWidth
      let touchStartBoxHeight = state.touchStartBoxHeight
      let touchStartBoxLeft = state.touchStartBoxLeft
      let touchStartBoxTop = state.touchStartBoxTop

      //比例
      let aspectRatio = props.aspectRatio

      if (targetId === 'box') {
        // 移动裁剪框
        let newBoxLeft = state.touchStartBoxLeft + offsetX
        let newBoxTop = state.touchStartBoxTop + offsetY

        //边界处理 不得超过最左和最下边
        if (newBoxLeft < 0) {
          newBoxLeft = 0
        }
        if (newBoxTop < 0) {
          newBoxTop = 0
        }
        // 盒子的左边距离+盒子原来的宽度大于舞台的宽度，代表右边已经超过边界了
        if (newBoxLeft + state.touchStartBoxWidth > state.stageWidth) {
          // 左边的距离等于舞台的宽度减去盒子的宽度 //代表右边界的极限
          newBoxLeft = state.stageWidth - state.touchStartBoxWidth
        }
        // 盒子的上边距离+盒子原来的高度大于舞台的高度，代表下边已经超过边界了
        if (newBoxTop + state.touchStartBoxHeight > state.stageHeight) {
          // 下边超过舞台高度，则下边坐标为舞台高度减去盒子高度
          newBoxTop = state.stageHeight - state.touchStartBoxHeight
        }
        // 更新状态
        state.boxLeft = newBoxLeft
        state.boxTop = newBoxTop
      } else if (targetId === 'lt-block') {
        // 宽高按照比例正常计算 做到斜边拉动整体视图不变的的效果
        if (props.aspectRatio) {
          offsetY = offsetX / props.aspectRatio
        }

        // 左上角调整
        let newBoxLeft = state.touchStartBoxLeft + offsetX
        let newBoxTop = state.touchStartBoxTop + offsetY

        //边界问题的处理
        if (newBoxLeft < 0) {
          newBoxLeft = 0
        }
        if (newBoxTop < 0) {
          newBoxTop = 0
        }

        //边界处理
        if (state.touchStartBoxLeft + state.touchStartBoxWidth - newBoxLeft < state.minBoxWidth) {
          newBoxLeft = state.touchStartBoxLeft + state.touchStartBoxWidth - state.minBoxWidth
        }
        //边界处理
        if (state.touchStartBoxTop + state.touchStartBoxHeight - newBoxTop < state.minBoxHeight) {
          newBoxTop = state.touchStartBoxTop + state.touchStartBoxHeight - state.minBoxHeight
        }

        //重新计算新盒子的宽高 开始的宽度减去移动的距离
        let newBoxWidth = state.touchStartBoxWidth - (newBoxLeft - state.touchStartBoxLeft)
        let newBoxHeight = state.touchStartBoxHeight - (newBoxTop - state.touchStartBoxTop)

        //如果到达临界值
        if (newBoxTop == 0 && props.aspectRatio && newBoxLeft != 0) {
          newBoxWidth = newBoxHeight * props.aspectRatio
          /**
           * 为了保证右边缘位置不变，调整 newBoxLeft 的位置：
           *  原始右边缘位置 = state.touchStartBoxLeft + state.touchStartBoxWidth;
           *  调整后的右边缘位置 = newBoxLeft + newBoxWidth;
           *  为了保证改变后的右边位置不变推导得出
           *  newBoxLeft + newBoxWidth = state.touchStartBoxLeft + state.touchStartBoxWidth
           *  ===>
           */
          newBoxLeft = state.touchStartBoxWidth - newBoxWidth + state.touchStartBoxLeft
        }
        //左边变成了0 代表靠边了
        if (newBoxLeft == 0 && props.aspectRatio) {
          //重新保证高度
          newBoxHeight = newBoxWidth / props.aspectRatio
          newBoxTop = state.touchStartBoxHeight - newBoxHeight + state.touchStartBoxTop
        }

        //如果到达最小值临界
        if (newBoxWidth == state.minBoxWidth && props.aspectRatio) {
          //计算高度保持底部不变
          newBoxHeight = newBoxWidth / props.aspectRatio
          newBoxTop = state.touchStartBoxHeight - newBoxHeight + state.touchStartBoxTop
        }

        // 更新状态
        state.boxLeft = newBoxLeft
        state.boxTop = newBoxTop
        state.boxWidth = newBoxWidth
        state.boxHeight = newBoxHeight
      } else if (targetId === 'rt-block') {
        // 约束比例
        if (props.aspectRatio) {
          offsetY = -offsetX / props.aspectRatio
        }

        let newBoxWidth = touchStartBoxWidth + offsetX
        if (newBoxWidth < minBoxWidth) {
          newBoxWidth = minBoxWidth
        }
        if (touchStartBoxLeft + newBoxWidth > stageWidth) {
          newBoxWidth = stageWidth - touchStartBoxLeft
        }

        let newBoxTop = touchStartBoxTop + offsetY

        if (newBoxTop < 0) {
          newBoxTop = 0
        }

        if (touchStartBoxTop + touchStartBoxHeight - newBoxTop < minBoxHeight) {
          newBoxTop = touchStartBoxTop + touchStartBoxHeight - minBoxHeight
        }
        let newBoxHeight = touchStartBoxHeight - (newBoxTop - touchStartBoxTop)

        //约束比例
        if (newBoxTop == 0 && aspectRatio && newBoxWidth != stageWidth - touchStartBoxLeft) {
          newBoxWidth = newBoxHeight * aspectRatio
        }

        if (newBoxWidth == stageWidth - touchStartBoxLeft && aspectRatio) {
          newBoxHeight = newBoxWidth / aspectRatio
          newBoxTop = touchStartBoxHeight - newBoxHeight + touchStartBoxTop
        }

        if (newBoxWidth == minBoxWidth && aspectRatio) {
          newBoxHeight = newBoxWidth / aspectRatio
          newBoxTop = touchStartBoxHeight - newBoxHeight + touchStartBoxTop
        }

        // 更新状态
        state.boxWidth = newBoxWidth
        state.boxTop = newBoxTop
        state.boxHeight = newBoxHeight
      } else if (targetId === 'lb-block') {
        if (aspectRatio) {
          offsetY = -offsetX / aspectRatio
        }
        let newBoxLeft = touchStartBoxLeft + offsetX

        if (newBoxLeft < 0) {
          newBoxLeft = 0
        }
        if (touchStartBoxLeft + touchStartBoxWidth - newBoxLeft < minBoxWidth) {
          newBoxLeft = touchStartBoxLeft + touchStartBoxWidth - minBoxWidth
        }

        let newBoxWidth = touchStartBoxWidth - (newBoxLeft - touchStartBoxLeft)

        let newBoxHeight = touchStartBoxHeight + offsetY
        if (newBoxHeight < minBoxHeight) {
          newBoxHeight = minBoxHeight
        }
        if (touchStartBoxTop + newBoxHeight > stageHeight) {
          newBoxHeight = stageHeight - touchStartBoxTop
        }

        //约束比例
        if (newBoxHeight == stageHeight - touchStartBoxTop && aspectRatio && newBoxLeft != 0) {
          newBoxWidth = newBoxHeight * aspectRatio
          newBoxLeft = touchStartBoxWidth - newBoxWidth + touchStartBoxLeft
        }
        if (newBoxLeft == 0 && aspectRatio) {
          newBoxHeight = newBoxWidth / aspectRatio
        }

        if (newBoxWidth == minBoxWidth && aspectRatio) {
          newBoxHeight = newBoxWidth / aspectRatio
        }

        // 更新状态
        state.boxWidth = newBoxWidth
        state.boxHeight = newBoxHeight
      } else if (targetId == 'rb-block') {
        if (aspectRatio) {
          offsetY = offsetX / aspectRatio
        }
        let newBoxWidth = touchStartBoxWidth + offsetX
        if (newBoxWidth < minBoxWidth) {
          newBoxWidth = minBoxWidth
        }
        if (touchStartBoxLeft + newBoxWidth > stageWidth) {
          newBoxWidth = stageWidth - touchStartBoxLeft
        }

        let newBoxHeight = touchStartBoxHeight + offsetY
        if (newBoxHeight < minBoxHeight) {
          newBoxHeight = minBoxHeight
        }
        if (touchStartBoxTop + newBoxHeight > stageHeight) {
          newBoxHeight = stageHeight - touchStartBoxTop
        }

        //约束比例
        if (
          newBoxHeight == stageHeight - touchStartBoxTop &&
          aspectRatio &&
          newBoxWidth != stageWidth - touchStartBoxLeft
        ) {
          newBoxWidth = newBoxHeight * aspectRatio
        }

        if (newBoxWidth == stageWidth - touchStartBoxLeft && aspectRatio) {
          newBoxHeight = newBoxWidth / aspectRatio
        }

        if (newBoxWidth == minBoxWidth && aspectRatio) {
          newBoxHeight = newBoxWidth / aspectRatio
        }
        state.boxWidth = newBoxWidth
        state.boxHeight = newBoxHeight
      }
    }

    // 触摸结束
    const fnTouchEnd = () => {
      log('Touch End')
    }

    // 创建画布上下文
    const createContext = () => {
      return new Promise((resolve) => {
        const query = Taro.createSelectorQuery()
        query
          .select('#cropper-canvans')
          .fields({ node: true, size: true })
          .exec((res) => {
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
    const getImageInfo = (canvas, url) => {
      return new Promise((resolve) => {
        const img = canvas.createImage()
        img.src = url
        img.onload = () => resolve(img)
      })
    }

    const cropImage = async () => {
      const { ctx: context, canvas } = await createContext()
      const url = await getImageInfo(canvas, props.imagePath)
      context.save()
      context.rect(state.boxLeft, state.boxTop, state.boxWidth, state.boxHeight)
      context.clip()
      context.drawImage(url, 0, 0, state.stageWidth, state.stageHeight)
      Taro.canvasToTempFilePath(
        {
          canvas,
          success: (res) => {
            emit('ok', res.tempFilePath)
          },
          fail: (err) => {
            console.error('Canvas to temp file failed:', err)
          },
        },
        this,
      )
    }

    expose({
      crop: cropImage,
      reInit: reInit,
    })

    onMounted(() => {
      init()
    })

    return {
      ...toRefs(state),
      fnTouchStart,
      fnTouchMove,
      fnTouchEnd,
      cropImage,
    }
  },
}
</script>

<style lang="scss">
.croppper-image-layout {
  // position: absolute;
  // top: 0;
  // bottom: 0;
  // left: 0;
  // right: 0;
  width: 100%;
  height: 100%;
  background-color: black;

  .cropper-canvans {
    position: fixed;
    background-color: transparent;
    left: 5000rpx;
    // left: 0;
    top: 0;
  }

  .stage {
    position: absolute;
    width: 100%;
    height: 100%;
  }

  .image {
    // position: absolute;
    width: 100%;
    height: 100%;
  }

  .box-t {
    position: absolute;
    border: 2px solid #299ff3;
    box-shadow: 0 0 0 2000px rgba(0, 0, 0, 0.5);
  }

  .lt {
    position: absolute;
    height: 26px;
    width: 26px;
    left: 0;
    /* 相对于裁剪框的内部 */
    top: 0;
    border-left: 3px solid #299ff3;
    border-top: 3px solid #299ff3;
  }

  .lt-block {
    position: absolute;
    height: 45px;
    width: 45px;
    background: transparent;
    border: 0px;
    left: -10px;
    top: -10px;
  }

  .lb {
    position: absolute;
    height: 26px;
    width: 26px;
    left: 0;
    bottom: 0;
    border-left: 3px solid #299ff3;
    border-bottom: 3px solid #299ff3;
  }

  .lb-block {
    position: absolute;
    height: 45px;
    width: 45px;
    background: transparent;
    border: 0px;
    left: -15px;
    bottom: -15px;
  }

  .rt {
    position: absolute;
    height: 26px;
    width: 26px;
    right: 0;
    top: 0;
    border-right: 3px solid #299ff3;
    border-top: 3px solid #299ff3;
  }

  .rt-block {
    position: absolute;
    height: 45px;
    width: 45px;
    background: transparent;
    border: 0px;
    right: -15px;
    top: -15px;
  }

  .rb {
    position: absolute;
    height: 26px;
    width: 26px;
    right: 0;
    bottom: 0;
    border-right: 3px solid #299ff3;
    border-bottom: 3px solid #299ff3;
  }

  .rb-block {
    position: absolute;
    height: 45px;
    width: 45px;
    background: transparent;
    border: 0px;
    right: -15px;
    bottom: -15px;
  }

  .line-v {
    position: absolute;
    width: 1px;
    height: 100%;
    background-color: rgba(255, 255, 255, 1);
  }

  .line-h {
    height: 1px;
    position: absolute;
    width: 100%;
    background-color: rgba(255, 255, 255, 1);
  }
}
</style>