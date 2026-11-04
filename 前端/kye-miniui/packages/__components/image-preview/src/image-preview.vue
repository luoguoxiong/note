<template>
  <Popup
    v-model:show="show"
    safe-area-inset-top
    :closeOnClickOverlay="closeOnClickOverlay"
    :catchMove="false"
    class="ky-image-preview"
  >
    <!-- 功能按钮 -->
    <div v-if="showIndex" class="ky-image-preview__header">{{ activeIndex + 1 }} / {{ images.length }}</div>
    <div class="ky-image-preview__content">
      <KySwiper
        :init-page="activeIndex"
        :auto-play="0"
        :pagination-visible="false"
        :images="images"
        :isPreventDefault="false"
        :touchable="!isH5Pc"
        @change="onChangePagination"
        ref="swiperRef"
        :scale="scale"
      >
        <KySwiperItem
          v-for="(item, index) in images"
          :key="`ky-image-preview__content-item-${index}`"
          class="ky-image-preview__content-item"
          @click.stop="handleOverlayClose"
        >
          <template v-if="shouldRender(index)">
            <img
              :class="[`ky-image-preview__content-item_img_${index}`]"
              :src="item.src"
              style="width: 100%; height: 100%; object-fit: contain"
              :style="{
                transform: `scale(${index === activeIndex ? scale : 1}) rotate(${singleImgRotate[index]}deg) translate(${imageOffset.x}px, ${imageOffset.y}px)`,
                transition: isAnimating ? 'transform 0.3s ease-out' : 'none',
              }"
              mode="aspectFit"
              :show-menu-by-longpress="showMenuByLongpress"
              @touchstart="onTouchStart"
              @touchmove="onTouchMove"
              @touchend="onTouchEnd"
              @load="handleImageLoad($event, index)"
              @longpress="onLongPress(item.src)"
            />
          </template>
          <template v-else>
            <view class="ky-image-preview__placeholder"></view>
          </template>
        </KySwiperItem>
      </KySwiper>
    </div>
    <div class="ky-image-preview__pagination" v-if="showPagination && images.length >= 2">
      <div class="ky-image-preview__pagination-btn ky-image-preview__pagination-left" @click="handlePrev">
        <img class="pagination-icon" src="https://ic-img.ky-express.com/netc/20250806_1296_!!1754466948006_80_80.png" />
      </div>
      <div class="ky-image-preview__pagination-btn ky-image-preview__pagination-right" @click="handleNext">
        <img
          class="pagination-icon"
          src="https://ic-img.ky-express.com/netc/20250806_80419_!!1754466947996_80_80.png"
        />
      </div>
    </div>
    <div class="ky-image-preview__footer" @click="handleOverlayClose">
      <div class="ky-image-preview__footer-left">
        <div v-if="props.closeable" class="ky-image-preview__footer-btn" @click.stop="onClose">
          <img src="https://ic-img.ky-express.com/netc/20250117_40972831194_!!1737083387034_96_96.png" />
        </div>
      </div>
      <div class="ky-image-preview__footer-right">
        <slot name="cover">
          <div class="ky-image-preview__footer-btn" @click.stop="handleDown">
            <img src="https://ic-img.ky-express.com/netc/20250117_91972831178_!!1737083405773_80_80.png" />
          </div>
          <div class="ky-image-preview__footer-btn" @click.stop="handleRotate">
            <img src="https://ic-img.ky-express.com/netc/20250117_29672831191_!!1737083426712_80_80.png" />
          </div>
        </slot>
      </div>
    </div>
    <ActionSheet
      v-model:show="isShowDownLoadSheet"
      :menuItems="sheetMenuItems"
      @choose="toChooseDownLoadSheet"
    ></ActionSheet>
  </Popup>
</template>

<script lang="ts" setup name="ky-image-preview">
import './index.scss'
import Taro from '@tarojs/taro'
import { ref, reactive, watch, computed, nextTick } from 'vue'
import Popup from '@ky-miniui-lib/popup'
import { useSyncPropRef, isAmapMiniApp, isWxMiniApp, miniuiConfig } from '@ky-miniui-lib/utils'
import { funInterceptor } from './Interceptor'
// import SwiperTest from './swiper-test.vue'
import KySwiper from '@ky-miniui-lib/swiper'
import plateform from '@kye-netc/plateform'
import KySwiperItem from '@ky-miniui-lib/swiper-item'
import type { ImageInterface, ImagePreviewProps } from './types'
import { useImagePreviewPreload } from '@packages/__components/image-preview/src/hooks/useImagePreviewPreload'
import { isWxAppIosEnv, isWxAppAndroidEnv, isWxAppOhosEnv } from '@ky-miniui-lib/utils/src/device'
import ActionSheet from '@packages/__components//action-sheet'

const { isH5Pc } = miniuiConfig.config

const props = withDefaults(defineProps<ImagePreviewProps>(), {
  images: [] as ImageInterface[],
  show: false,
  autoplay: 3000,
  isLoop: true,
  showIndex: true,
  closeable: true,
  contentClose: true,
  closeOnClickOverlay: true,
  activeIndex: 0,
  showPagination: true,
  showMenuByLongpress: false,
})

/** 微信小程序 */
const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP
/** 支付宝小程序 */
const isAliMiniApp = Taro.getEnv() === Taro.ENV_TYPE.ALIPAY

const emit = defineEmits([
  'update:show',
  'update:activeIndex',
  'close',
  'change',
  'longPress',
  'shareImage',
  'shareImageError',
])

const activeIndex = useSyncPropRef(
  () => +props.activeIndex,
  (value) => {
    emit('update:activeIndex', value)
  },
)

// watch(
//   () => activeIndex.value,
//   (val) => {
//     console.log('activeIndex.value', val)
//   },
// )

const show = useSyncPropRef(
  () => +props.show,
  (value) => {
    emit('update:show', value)
  },
)

const state = reactive({
  ENV: Taro.getEnv(),
  ENV_TYPE: Taro.ENV_TYPE,
})

const scale = ref<number>(1) // 当前缩放比例
const baseScale = ref<number>(1) // 初始缩放比例
const lastDistance = ref<number>(0) // 上一次手指距离
const zooming = ref<boolean>(false) // 是否在缩放
const moving = ref<boolean>(false)
const isLongImage = ref<boolean>(false)
const singleImgRotate = ref<Array<number>>([])
const imageOffset = ref({ x: 0, y: 0 }) // 图片偏移量
const lastTouchPosition = ref({ x: 0, y: 0 }) // 上一次触摸位置
const isDragging = ref(false) // 是否正在拖动
const isAnimating = ref(false) // 是否正在执行动画
const animationTimer = ref<NodeJS.Timeout | null>(null) // 动画计时器
const imageSizes = ref<Array<{ width: number; height: number }>>([])

/* 预加载swiperItem */
const { preloadIndexes, shouldRender, resetPreview } = useImagePreviewPreload()

// 初始加载-预加载item
preloadIndexes(activeIndex.value, props.images)

watch(
  () => props.images,
  (value) => {
    singleImgRotate.value = new Array(props.images.length).fill(0)
  },
  { immediate: true },
)

// 监听scale变化，当小于1时执行缓动动画
// watch(
//   () => scale.value,
//   (newScale, oldScale) => {
//     if (newScale < 1 && !isAnimating.value) {
//       startScaleAnimation()
//     }
//   },
// )

const onClose = () => {
  funInterceptor(props.beforeClose, {
    args: [activeIndex.value],
    done: () => closeDone(),
  })
}

const closeOnImg = () => {
  if (props.contentClose) {
    onClose()
  }
}

// 执行关闭
const closeDone = () => {
  show.value = false
  scale.value = 1
  imageOffset.value = { x: 0, y: 0 } // 重置偏移量
  resetPreview(activeIndex.value, props.images)
  emit('close')
}

const longPress = (image: ImageInterface) => {
  emit('longPress', image)
}

// 开始缩放动画
const startScaleAnimation = () => {
  if (animationTimer.value) {
    clearTimeout(animationTimer.value)
  }

  isAnimating.value = true

  const startTime = Date.now()
  const duration = 200 // 动画持续时间300ms
  const startScaleValue = scale.value
  const targetScale = 1

  const animate = () => {
    const currentTime = Date.now()
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    // 使用缓动函数（easeOutCubic）
    const easeProgress = 1 - Math.pow(1 - progress, 3)

    scale.value = startScaleValue + (targetScale - startScaleValue) * easeProgress

    if (progress < 1) {
      animationTimer.value = setTimeout(animate, 16) // 约60fps
    } else {
      scale.value = 1
      baseScale.value = 1
      isAnimating.value = false
      animationTimer.value = null
    }
  }

  animate()
}

/* 下载当前图片 */
const handleDown = () => {
  console.log('handleDown')
  // 调试下载
  downloadImage(props.images[activeIndex.value])
  emit('download', props.images[activeIndex.value], activeIndex.value)
}

const swiperRef = ref<KySwiper>(null)

const handleRotate = () => {
  console.log('handleRotate')
  const newRotate = singleImgRotate.value[activeIndex.value] - 90
  singleImgRotate.value[activeIndex.value] = newRotate === -360 ? 0 : newRotate
}

/* 点击底部按钮区域 */
const handleOverlayClose = () => {
  if (props.closeOnClickOverlay) {
    onClose()
  }
}

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

// 创建weapp环境的临时地址
const createWxFilePath = (image) => {
  return (
    window.wx.env.USER_DATA_PATH +
    '/' +
    `img_${new Date().valueOf()}_${Math.floor(Math.random() * 10000)}` +
    '.' +
    (image.extendName || 'jpg')
  )
}

const errorImgType = new RegExp(/application\/(bytes|octet-stream)/)

/* 下载图片 */
const downloadImage = async (image) => {
  plateform.saveImageToPhotosAlbum(image.src)
}

const handleSaveImageError = (error: any) => {
  if (state.ENV === state.ENV_TYPE.WEB) {
    Taro.showToast({
      title: '下载失败',
      icon: 'none',
    })
    return
  }
  if (isWeapp && error?.errMsg.includes('fail cancel')) {
    Taro.showToast({
      title: '用户已取消',
      icon: 'none',
    })
    return
  }

  const isApp = isWeapp && isWxMiniApp()
  const isWxMiniProgram = isWxMiniApp && !isApp

  // 非web端进行权限判断
  if (isApp) {
    const authScope = Taro.getAppAuthorizeSetting()
    const hasSavePhotoAuth = authScope?.albumAuthorized === 'authorized'

    if (!hasSavePhotoAuth) {
      showAuthModal(() => Taro.openAppAuthorizeSetting({}), '相册')
      return
    }
  }

  if (isWxMiniProgram && (error?.errMsg?.includes('auth deny') || error?.errMsg?.includes('access deny'))) {
    showAuthModal(() => Taro.openSetting({}), '相册')
    return
  }

  if (isAmapMiniApp && error?.errorMessage?.includes('not allow authorization')) {
    showAuthModal(() => Taro.openSetting({}), '相册')
    return
  }

  if (isAliMiniApp && (error?.error === 2001 || error?.errorMessage?.includes('no permission'))) {
    showAuthModal(() => Taro.openSetting({}), '相册')
    return
  }

  Taro.showToast({
    title: '下载失败',
    icon: 'none',
  })
}

const showAuthModal = (onConfirm: () => void, authName: string) => {
  Taro.showModal({
    title: '温馨提示',
    content: `需要获取您的${authName}权限,用于扫码寄件、查单等服务,您可设置手机${authName}权限`,
    confirmText: '去设置',
    cancelText: '暂不设置',
    confirmColor: '#8365f6',
    cancelColor: '#686B75',
    success: (res) => {
      if (res.confirm) {
        onConfirm()
      } else {
        console.log('用户点击取消')
      }
    },
  })
}

const onInitComplete = () => {
  console.log('初始化完毕')
}

const onChangePagination = (index) => {
  if (index !== activeIndex.value) {
    // 停止当前动画
    if (animationTimer.value) {
      clearTimeout(animationTimer.value)
      animationTimer.value = null
    }

    scale.value = 1
    baseScale.value = 1
    imageOffset.value = { x: 0, y: 0 } // 切换图片时重置偏移量
    isAnimating.value = false
    activeIndex.value = index
    preloadIndexes(index, props.images)
    emit('change', index)
  }
}
// 获取图片rect-修复加载图片未获取到
const getImageRect = (selector: string, retry = 0) => {
  return new Promise<{ width: number; height: number }>((resolve) => {
    Taro.createSelectorQuery()
      .select(selector)
      .boundingClientRect((rect) => {
        console.log('[rect]', selector, rect?.width)
        if (rect && rect.width > 0 && rect.height > 0) {
          resolve({ width: rect.width, height: rect.height })
        } else if (retry < 5) {
          // 下一帧重试
          setTimeout(() => {
            getImageRect(selector, retry + 1).then(resolve)
          }, 50)
        } else {
          // 超过重试次数仍失败，返回默认值
          resolve({ width: 0, height: 0 })
        }
      })
      .exec()
  })
}

const handleImageLoad = (e, index) => {
  nextTick(async () => {
    const selector = `.ky-image-preview__content-item_img_${index}`
    const rect = await getImageRect(selector)
    imageSizes.value[index] = {
      width: rect.width,
      height: rect.height,
    }
  })
}
// 计算最大偏移量限制
const getMaxOffset = () => {
  const currentImageSize = imageSizes.value[activeIndex.value]
  if (!currentImageSize) {
    return { maxX: 0, maxY: 0 }
  }

  // 获取容器尺寸（假设为屏幕宽度和高度）
  const containerWidth = currentImageSize.width / maxScale
  const containerHeight = currentImageSize.height / maxScale

  // 计算图片在容器中的显示尺寸（保持宽高比）
  const imgRatio = currentImageSize.width / currentImageSize.height
  const containerRatio = containerWidth / containerHeight

  let displayedWidth, displayedHeight
  if (imgRatio > containerRatio) {
    // 图片更宽，宽度填满容器
    displayedWidth = containerWidth
    displayedHeight = containerWidth / imgRatio
  } else {
    // 图片更高，高度填满容器
    displayedHeight = containerHeight
    displayedWidth = containerHeight * imgRatio
  }

  // 计算实际可偏移的最大距离
  const maxX = Math.max(0, (displayedWidth * scale.value - containerWidth) / 2)
  const maxY = Math.max(0, (displayedHeight * scale.value - containerHeight) / 2)
  return { maxX, maxY }
}

// 记录触摸事件
const onTouchStart = (e: TouchEvent) => {
  // 如果正在动画中，停止动画
  if (isAnimating.value && animationTimer.value) {
    clearTimeout(animationTimer.value)
    animationTimer.value = null
    isAnimating.value = false
  }

  if (e.touches.length === 2) {
    // 双指缩放
    zooming.value = true
    isDragging.value = false
    // 计算初始的两指距离
    const distance = Math.sqrt(
      Math.pow(e.touches[0].pageX - e.touches[1].pageX, 2) + Math.pow(e.touches[0].pageY - e.touches[1].pageY, 2),
    )
    lastDistance.value = distance
  } else if (e.touches.length === 1 && scale.value > 1) {
    // 单指拖动（仅在放大状态下）
    isDragging.value = true
    zooming.value = false
    lastTouchPosition.value = {
      x: e.touches[0].pageX,
      y: e.touches[0].pageY,
    }
  }
}

const maxScale = 2

const onTouchMove = (e: TouchEvent) => {
  if (zooming.value && e.touches.length === 2) {
    // 双指缩放处理
    const distance = Math.sqrt(
      Math.pow(e.touches[0].pageX - e.touches[1].pageX, 2) + Math.pow(e.touches[0].pageY - e.touches[1].pageY, 2),
    )

    // 计算缩放比例
    const scaleDelta = distance / lastDistance.value
    const newScale = baseScale.value * scaleDelta

    // 限制缩放范围
    scale.value = Math.max(0.5, Math.min(newScale, maxScale))
  } else if (isDragging.value && e.touches.length === 1 && scale.value > 1) {
    // 单指拖动处理（仅在放大状态下）
    const currentX = e.touches[0].pageX
    const currentY = e.touches[0].pageY

    const deltaX = currentX - lastTouchPosition.value.x
    const deltaY = currentY - lastTouchPosition.value.y

    // 根据旋转角度调整移动方向
    const rotation = singleImgRotate.value[activeIndex.value]
    let adjustedDeltaX = deltaX
    let adjustedDeltaY = deltaY

    // 使用旋转矩阵来正确计算偏移量
    const rad = (rotation * Math.PI) / 180
    const cos = Math.cos(-rad) // 使用负角度进行反向旋转补偿
    const sin = Math.sin(-rad)

    // 将屏幕坐标系的移动转换为图片坐标系的移动
    adjustedDeltaX = deltaX * cos - deltaY * sin
    adjustedDeltaY = deltaX * sin + deltaY * cos

    // 计算新的偏移量
    let newX = imageOffset.value.x + adjustedDeltaX
    let newY = imageOffset.value.y + adjustedDeltaY

    // 限制偏移范围（防止拖出边界）
    const { maxX, maxY } = getMaxOffset()
    newX = Math.max(-maxX, Math.min(maxX, newX))
    newY = Math.max(-maxY, Math.min(maxY, newY))

    imageOffset.value = {
      x: newX,
      y: newY,
    }

    // 更新触摸位置（使用原始坐标，不进行旋转补偿）
    lastTouchPosition.value = {
      x: currentX,
      y: currentY,
    }

    // 阻止默认行为，避免页面滚动
    e.preventDefault()
  }
}

const onTouchEnd = () => {
  if (zooming.value) {
    // 缩放结束，保存当前缩放比例
    zooming.value = false
    baseScale.value = scale.value

    // 如果缩放小于1，启动动画回到1
    // if (scale.value < 1) {
    //   imageOffset.value = {
    //     x: 0,
    //     y: 0,
    //   }
    //   startScaleAnimation()
    // }
  }

  if (isDragging.value) {
    // 拖动结束
    isDragging.value = false
  }
}

/* 下一页 */
const handleNext = () => {
  if ((activeIndex.value || 0) + 1 === props.images?.length) {
    Taro.showToast({ title: '没有更多了', icon: 'none', duration: 1500 })
    return
  }
  imageOffset.value = { x: 0, y: 0 } // 重置偏移量
  scale.value = 1
  swiperRef.value?.next && swiperRef.value?.next()
}
/* 上一页 */
const handlePrev = () => {
  if (activeIndex.value === 0) {
    Taro.showToast({ title: '已经是第一张了', icon: 'none', duration: 1500 })
    return
  }
  imageOffset.value = { x: 0, y: 0 } // 重置偏移量
  scale.value = 1
  swiperRef.value?.prev && swiperRef.value?.prev()
}

const isShowDownLoadSheet = ref(false)
const sheetMenuItems = ref([
  {
    name: '保存图片',
    key: 'download',
  },
])

const toChooseDownLoadSheet = (item) => {
  if (item.key === 'download') {
    handleDown()
  }
}

const onLongPress = (url) => {
  // 如果设置了 showMenuByLongpress，并且环境是app环境，不是小程序环境
  if (props.showMenuByLongpress && (isWxAppIosEnv || isWxAppAndroidEnv || isWxAppOhosEnv)) {
    isShowDownLoadSheet.value = true
  }
}
</script>
