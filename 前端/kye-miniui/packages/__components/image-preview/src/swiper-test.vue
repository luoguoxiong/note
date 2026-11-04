<template>
  <view class="swiper-container" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
    <view class="swiper-wrapper" :style="wrapperStyle">
      <!-- 仅用于测试     -->
      <!-- <view class="swiper-slide">
        <video
          class="ky-video"
          src="https://wxsnsdy.tc.qq.com/105/20210/snsdyvideodownload?filekey=30280201010421301f0201690402534804102ca905ce620b1241b726bc41dcff44e00204012882540400&bizid=1023&hy=SH&fileparam=302c020101042530230204136ffd93020457e3c4ff02024ef202031e8d7f02030f42400204045a320a0201000400"
          poster="https://misc.aotu.io/booxood/mobile-video/cover_900x500.jpg"
          initial-time="0"
          :controls="true"
          :autoplay="false"
          :loop="false"
          :muted="false"
        />
      </view> -->
      <!--   图片列表   -->
      <view v-for="(item, index) in items" :key="index" class="swiper-slide">
        <slot :item="item" :index="index"></slot>
      </view>
    </view>
    <view class="swiper-pagination" v-if="showPagination">
      <text v-for="(_, index) in items" :key="index" class="pagination-dot" :class="{ active: currentIndex === index }">
      </text>
    </view>
  </view>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  items: any[]
  videos: any[]
  showPagination?: boolean
  autoplay?: boolean
  interval?: number
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  videos: [{ source: 'test' }],
  showPagination: true,
  autoplay: false,
  interval: 3000,
})

const emit = defineEmits(['change'])

const startX = ref(0)
const currentX = ref(0)
const currentIndex = ref(0)
let autoplayTimer: number | null = null

const wrapperStyle = computed(() => {
  return {
    transform: `translateX(${currentX.value}px)`,
    transition: isDragging.value ? 'none' : 'transform 0.3s',
  }
})

const isDragging = ref(false)
const containerWidth = ref(0)

const mergeImages = computed(() => {
  return ([] as any).concat(props.videos).concat(props.items)
  return props.items
})

const handleTouchStart = (e: TouchEvent) => {
  isDragging.value = true
  startX.value = e.touches[0].clientX
  stopAutoplay()
}

const handleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return

  const deltaX = e.touches[0].clientX - startX.value
  const newPosition = -currentIndex.value * containerWidth.value + deltaX

  // Add resistance at edges
  if (newPosition > 0 || newPosition < -(props.items.length - 1) * containerWidth.value) {
    currentX.value = newPosition / 3
  } else {
    currentX.value = newPosition
  }
  console.log('handleTouchMove', currentX.value)
}

const handleTouchEnd = () => {
  isDragging.value = false

  const moveRatio = (currentX.value + currentIndex.value * containerWidth.value) / containerWidth.value
  // 总量数据
  const itemsMerge = mergeImages.value || props.items

  if (Math.abs(moveRatio) > 0.3) {
    if (moveRatio > 0 && currentIndex.value > 0) {
      currentIndex.value--
    } else if (moveRatio < 0 && currentIndex.value < itemsMerge.length - 1) {
      currentIndex.value++
    }
  }

  currentX.value = -currentIndex.value * containerWidth.value
  emit('change', currentIndex.value)
  console.log('handleTouchEnd', currentIndex.value, currentX.value)

  if (props.autoplay) {
    startAutoplay()
  }
}

const startAutoplay = () => {
  if (!props.autoplay) return

  autoplayTimer = window.setInterval(() => {
    if (currentIndex.value >= props.items.length - 1) {
      currentIndex.value = 0
    } else {
      currentIndex.value++
    }
    currentX.value = -currentIndex.value * containerWidth.value
    emit('change', currentIndex.value)
  }, props.interval)
}

const stopAutoplay = () => {
  if (autoplayTimer) {
    clearInterval(autoplayTimer)
    autoplayTimer = null
  }
}

onMounted(() => {
  const container = Taro.createSelectorQuery().select('.swiper-container')
  if (container) {
    container
      .boundingClientRect((rect) => {
        if (rect) {
          containerWidth.value = rect.width
        }
        console.log('boundingClientRect', rect)
      })
      .exec()
  }

  if (props.autoplay) {
    startAutoplay()
  }
})

onUnmounted(() => {
  stopAutoplay()
})
</script>

<style>
.swiper-container {
  width: 100%;
  overflow: hidden;
  position: relative;
  height: 500px;
}

.swiper-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
}

.swiper-slide {
  flex-shrink: 0;
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;
}

.swiper-pagination {
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.pagination-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  transition: background-color 0.3s;
}

.pagination-dot.active {
  background-color: #fff;
}
</style>
