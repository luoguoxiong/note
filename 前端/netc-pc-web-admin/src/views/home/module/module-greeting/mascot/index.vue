<template>
  <canvas ref="canvas" role="img" aria-label="小越越" @mouseenter="play"></canvas>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, onActivated, onDeactivated, ref, computed, watch } from 'vue'
import dayjs from 'dayjs'
import { usePcWebRootStore } from '@/stores/pc-web/root'

// 原文件是内嵌 WebP 的序列帧 JSON，各图层通过 ip/op 指定显示区间。
// eslint-disable-next-line @typescript-eslint/no-var-requires
const animation = require('./mascot.json') as {
  w: number
  h: number
  fr: number
  ip: number
  op: number
  assets: { id: string; p: string }[]
  layers: { refId: string; ip: number; op: number }[]
}
// 跳过原素材中偏暗的第 0 帧。
const firstFrame = animation.ip + 1
const storageKey = 'home-mascot-wave-date'
const account = computed(() => usePcWebRootStore().userInfo?.phone || '')
const canvas = ref<HTMLCanvasElement>()
const images = new Map<string, HTMLImageElement>()
let context: CanvasRenderingContext2D | null = null
let requestId = 0
let ready = false
let active = true
let disposed = false
let lastFrame = -1
const playedDates = new Map<string, string>()

function draw(frame: number) {
  if (!context || frame === lastFrame) return
  const layer = animation.layers.find((item) => item.ip <= frame && frame < item.op)
  const image = layer && images.get(layer.refId)
  if (!image) return
  context.clearRect(0, 0, animation.w, animation.h)
  context.drawImage(image, 0, 0, animation.w, animation.h)
  lastFrame = frame
}

function play() {
  if (!ready || !active || requestId) return
  const start = performance.now()
  draw(firstFrame)
  const tick = (now: number) => {
    // 首个 rAF 时间戳可能早于事件中记录的开始时间，避免负帧号。
    const frame = firstFrame + Math.floor((Math.max(0, now - start) * animation.fr) / 1000)
    if (frame >= animation.op) {
      requestId = 0
      draw(animation.op - 1)
      return
    }
    draw(frame)
    requestId = requestAnimationFrame(tick)
  }
  requestId = requestAnimationFrame(tick)
}

function playDaily() {
  if (!ready || !active || !account.value) return
  const key = `${storageKey}:${account.value}`
  const today = dayjs().format('YYYY-MM-DD')
  let playedDate = playedDates.get(key) || ''
  try {
    playedDate = localStorage.getItem(key) || playedDate
  } catch {
    // 存储不可用时，当前组件内仍只自动播放一次。
  }
  if (playedDate === today) return
  play()
  playedDates.set(key, today)
  try {
    localStorage.setItem(key, today)
  } catch {
    // 存储失败不影响动画播放。
  }
}

function stop() {
  cancelAnimationFrame(requestId)
  requestId = 0
}

watch(account, () => {
  stop()
  playDaily()
})

onMounted(async () => {
  const element = canvas.value
  if (!element) return
  const ratio = window.devicePixelRatio || 1
  element.width = animation.w * ratio
  element.height = animation.h * ratio
  context = element.getContext('2d')
  if (!context) return
  context.scale(ratio, ratio)
  try {
    await Promise.all(
      animation.assets.map(async (asset) => {
        const image = new Image()
        image.src = asset.p
        await image.decode()
        if (!disposed) images.set(asset.id, image)
      })
    )
    if (disposed) return
    ready = true
    draw(firstFrame)
    playDaily()
  } catch {
    // 解码失败时保留已加载的首帧。
    draw(firstFrame)
  }
})
onActivated(() => {
  active = true
  playDaily()
})
onDeactivated(() => {
  active = false
  stop()
})
onBeforeUnmount(() => {
  disposed = true
  active = false
  stop()
  images.clear()
})
</script>

<style scoped>
canvas {
  display: block;
  width: 120px;
  height: 160px;
}
</style>
