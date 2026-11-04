<template>
  <iframe
    :src="src"
    ref="iframe"
    class="ky-iframe"
    :class="{
      'ky-iframe-pc': isPc,
      'pc-width': isPc,
    }"
    v-if="src"
    @load="handleLoad"
  ></iframe>
</template>

<script setup lang="ts">
import { urlContact } from '@/public/utils'
import plateform from '@kye-netc/plateform'
import './h5.scss'
import { onMounted, onUnmounted, ref } from 'vue'
import { isPc } from '@/public/utils/device'
import Taro from '@tarojs/taro'

defineProps<{ id?: string; src: string }>()

const emit = defineEmits(['message'])
const iframe = ref<HTMLIFrameElement | null>(null)

const postMessage = (data: any) => {
  iframe.value?.contentWindow?.postMessage(data, '*')
}

type MessageData = {
  plateform: string
  method: string
  data?: any
}

/** 封装统一回传 */
const reply = (origin: MessageData, data: any) => {
  postMessage({ ...origin, data })
}

const handlers: Record<string, (params: any, origin: MessageData) => Promise<void> | void> = {
  async chooseImage(params, origin) {
    const res = await Taro.chooseMedia(params)
    const imageList = res.tempFiles.map((item) => {
      return {
        base64: item.thumbTempFilePath,
        name: item.originalFileObj?.name,
        size: item.originalFileObj?.size,
        tempFilePath: item.tempFilePath,
        type: item.fileType,
        data: item.thumbTempFilePath,
      }
    })
    reply(origin, { imgList: imageList })
  },

  async getLocation(params, origin) {
    if (isPc) {
      reply(origin, { latitude: '0', longitude: '0' })
      return
    }
    const res = await plateform.getLocation(params)
    reply(origin, res)
  },

  async scanQRCode(_, origin) {
    if (isPc) {
      reply(origin, { scanResult: '0' })
      return
    }
    const rscan = await plateform.scanCode()
    reply(origin, { scanResult: rscan ? rscan.result : '' })
  },

  navigateTo(params) {
    Taro.navigateTo({ url: params.url })
  },

  switchTab(params) {
    Taro.switchTab({ url: params.url })
  },

  reLaunch(params) {
    Taro.reLaunch({ url: params.url })
  },

  redirectTo(params) {
    Taro.redirectTo({ url: params.url })
  },

  navigateBack(params) {
    Taro.navigateBack(params)
  },

  async openLocation(params, origin) {
    if (isPc) {
      reply(origin, { isOk: '0' })
      return
    }
    await plateform.openLocation(params as any)
  },

  async getClipboardData(_, origin) {
    const res = await plateform.getClipboardData()
    reply(origin, res.data)
  },

  async saveImageToPhotosAlbum(params) {
    await plateform.saveImageToPhotosAlbum(params)
  },
}

const handleMessage = async (event: MessageEvent) => {
  if (event.source !== iframe.value?.contentWindow) {
    // console.error('消息来源不对')
    return
  }

  const message = {
    detail: {
      data: [event.data?.data],
    },
  }
  emit('message', message)

  const data = event.data as MessageData

  if (!data || data.plateform !== 'web') return

  const { method, data: params } = data

  const handler = handlers[method]

  if (!handler) {
    console.warn('[iframe] 未支持的方法:', method)
    return
  }

  try {
    await handler(params, data)
  } catch (err) {
    console.error('[iframe] 方法执行失败:', method, err)
    reply(data, { error: String(err) })
  }
}

let observer: MutationObserver

const handleLoad = () => {
  if (observer) {
    observer?.disconnect()
  }
  const doc = iframe.value?.contentDocument

  // 跨域无法获取
  if (!doc) return
  const titleEl = doc?.querySelector('title')

  document.title = doc?.title || '跨域寄件'

  if (!titleEl) return

  observer = new MutationObserver(() => {
    if (doc?.title) {
      document.title = doc?.title
    }
  })

  observer.observe(titleEl, {
    childList: true,
  })
}
onMounted(() => {
  Taro.onAppShow(() => {
    console.log(111)
  })
  window.addEventListener('message', handleMessage)
})

onUnmounted(() => {
  observer?.disconnect()
  window.removeEventListener('message', handleMessage)
})
</script>
