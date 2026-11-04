<template>
  <view class="splash-ad-container" v-if="show">
    <image :src="banner" mode="aspectFill" class="splash-ad-image" @tap="handleLinkTo" />
    <view class="splash-ad-close-btn" @click.stop="handleClose">跳过 {{ countdown }}s</view>
  </view>
</template>

<script lang="ts" setup>
import './index.scss'
import { ref, onBeforeUnmount, onMounted } from 'vue'
import { confirmByUserAdv, reportEvent } from '../api'
import { advertisementJump, getReportSorce } from '../utils'
import { px2real } from '@/public/utils'
import plateform from '@kye-netc/plateform'
import Taro from '@tarojs/taro'
import { splashManager } from './SplashManager'

const emit = defineEmits(['close', 'willClose'])

const duration = 5

const countdown = ref(duration)

let timer: number | null = null

const show = ref(false)

const banner = ref('')

// 关闭广告
const handleClose = () => {
  splashManager.close()
}

// 清除定时器
const clearTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

// 倒计时逻辑
const startCountdown = () => {
  clearTimer()
  timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      splashManager.close()
    }
    if (countdown.value === duration - 2) {
      emitClose()
    }
  }, 1000) as unknown as number
}

// 闪屏热区(750 设计稿基准,点击命中热区才跳转,需求 task 2325736)
const DESIGN_WIDTH = 750
const HOT_AREA = { width: 640, height: 128, bottom: 128 }

// 点击坐标(视口坐标系)是否命中热区:水平居中,距屏幕物理底部 px2real(bottom),不含安全区
const isHitHotArea = (x: number, y: number) => {
  const { windowHeight } = plateform.getWindowInfo()
  const left = px2real((DESIGN_WIDTH - HOT_AREA.width) / 2)
  const right = left + px2real(HOT_AREA.width)
  const bottom = windowHeight - px2real(HOT_AREA.bottom)
  const top = bottom - px2real(HOT_AREA.height)
  return x >= left && x <= right && y >= top && y <= bottom
}

const handleLinkTo = (event) => {
  const { x, y } = event.detail ?? {}
  const touch = event.changedTouches?.[0]
  const tapX = x ?? touch?.clientX
  const tapY = y ?? touch?.clientY
  if (tapX == null || tapY == null || !isHitHotArea(tapX, tapY)) return
  const { advertisementCode, buttonIndex } = splashManager.getState().adData as any
  confirmByUserAdv({
    advertisementCodeList: [advertisementCode],
    eventType: 1,
    buttonIndex,
    ...getReportSorce(),
  })
  reportEvent({
    adCodes: [advertisementCode],
    eventType: 4,
    ...getReportSorce(),
  })
  splashManager.close()
  // 关闭之后，再跳转至详情页
  Taro.nextTick(() => {
    advertisementJump(splashManager.getState().adData as any)
  })
}

// 开票页关闭只触发一次，倒计时结束还差2s，会触发一次close,倒计时结束又会触发一次，拦截第二次的。
let isEmitClose = false
const emitClose = () => {
  if (!isEmitClose) {
    isEmitClose = true
    emit('close')
  }
}

onMounted(async () => {
  splashManager.onShow(() => {
    banner.value = splashManager.getState().banner
    show.value = true
    Taro.hideTabBar()
    startCountdown()
  })

  splashManager.onHide(() => {
    show.value = false
    emitClose()
    Taro.showTabBar()
    clearTimer()
  })
})

// 卸载清理
onBeforeUnmount(() => {
  clearTimer()
})
</script>
