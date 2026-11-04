<template>
  <!-- 遮罩 -->
  <view v-if="gifShow" class="animation-mask" :style="{ opacity: maskOpacity }" />

  <!-- 动画容器（真正的屏幕中心） -->
  <view v-if="gifShow" class="animation-wrapper" :class="{ anisPc: isWebPc }" :animation="animation">
    <view class="sign-text">+{{ integralAmount }}积分</view>
    <image class="moving-image" :src="gifSrc" @load="imageLoaded = true" />
  </view>
</template>

<script setup lang="ts">
import Taro from '@tarojs/taro'
import { onMounted, ref } from 'vue'
import './index.scss'
import { siginPreloadImg } from '../../utils/sigin'
import { isWebPc } from '@/public/utils'

defineProps({
  integralAmount: {
    type: Number,
    default: 30,
  },
})

const emits = defineEmits(['close'])

const anim = Taro.createAnimation({
  duration: 500, // 合理的动画时长
  timingFunction: 'ease',
  delay: 0,
})

// 默认值不能设置为空、undefined或者null，否则动画不连贯
const animation = ref(anim)
const gifShow = ref(false)
// 预加载GIF图片，确保动画播放时图片已经准备好
const imageLoaded = ref(false)
const gifSrc = ref('')
const maskOpacity = ref(0.6)

const showGif = () => {
  // 微信小程序做了限制，相同链接的gif只有第一次加载时才会有动画效果
  gifSrc.value = siginPreloadImg.localImg + '?t=' + Date.now()
  gifShow.value = true
  // 等待图片加载完成后再开始动画
  const waitForImage = () => {
    if (imageLoaded.value) {
      // 图片已加载，开始动画
      if (isWebPc) {
        setTimeout(() => {
          gifShow.value = false
          emits('close')
        }, 2000)
      } else {
        executeAnimation()
      }
    } else {
      // 图片未加载完成，继续等待
      setTimeout(waitForImage, 100)
    }
  }

  waitForImage()
}

const executeAnimation = () => {
  try {
    // 先重置动画状态，确保每次动画效果一致
    const resetAnim = Taro.createAnimation({
      duration: 0,
      timingFunction: 'ease',
    })
    resetAnim.translate(0, 0).scale(1).step()
    animation.value = resetAnim.export()

    // 短暂延迟确保重置生效
    setTimeout(() => {
      const query = Taro.createSelectorQuery()
      query.select('#sign').boundingClientRect()
      query.exec((res) => {
        if (!res || !res[0]) {
          console.error('未找到签到元素')
          gifShow.value = false
          emits('close')
          return
        }

        const signRect = res[0]
        const targetX = signRect.left + signRect.width / 2
        const targetY = signRect.top + signRect.height / 2
        const sys = Taro.getSystemInfoSync()
        const screenWidth = sys.windowWidth
        const screenHeight = sys.windowHeight
        const centerX = screenWidth / 2
        const centerY = screenHeight / 2

        // 计算移动距离（从屏幕中心到目标位置）
        const deltaX = targetX - centerX
        const deltaY = targetY - centerY

        // 重置动画实例，避免多次调用累积效果
        const newAnim = Taro.createAnimation({
          duration: 500,
          timingFunction: 'ease',
          delay: 0,
        })

        // 优化动画步骤，使用更平滑的过渡效果
        for (let i = 1; i < 10; i++) {
          // 非线性的缩放和移动，使动画更自然
          const progress = i / 10
          const easeProgress = 1 - Math.pow(1 - progress, 3) // 使用easeOut三次方曲线

          newAnim
            .translate(deltaX * easeProgress, deltaY * easeProgress)
            .scale(1 - easeProgress)
            .step({ duration: 50, timingFunction: 'ease' })
        }

        // 确保最后一步精确到达目标位置并消失
        newAnim.translate(deltaX, deltaY).scale(0).step({ duration: 50 })

        animation.value = newAnim.export()

        maskOpacity.value = 0

        // 确保定时器时间与动画总时长一致
        setTimeout(() => {
          gifShow.value = false
          gifSrc.value = ''
          maskOpacity.value = 0.6
          // 重置动画状态，为下次动画做准备
          const finalReset = Taro.createAnimation({
            duration: 0,
          })
          finalReset.translate(0, 0).scale(1).step()
          animation.value = finalReset.export()
          emits('close')
        }, 500) // 10个步骤 * 50ms = 500ms
      })
    }, 2000)
  } catch (error) {
    console.error('执行动画时出错:', error)
    // 发生错误时，确保元素能够被隐藏
    setTimeout(() => {
      gifShow.value = false
      maskOpacity.value = 0.6
      emits('close')
    }, 500)
  }
}

onMounted(() => {
  showGif()
})
</script>
