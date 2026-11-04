<!-- 子容器组件 -->
<template>
  <div class="wh-full overflow_hidden page--micro-index" ref="expressRef"></div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  menuCode: { type: String, default: '' },
  routerName: { type: String, default: '' },
  defaultUrl: { type: String, default: '' },
  openTabSwitchDestroy: { type: Boolean, default: false },
  routeChangeEmitImmediate: { type: Boolean, default: true },
})

const emit = defineEmits(['iframe-ready'])

const route = useRoute()

const expressRef = ref<HTMLDivElement>()
const pageUrl = ref('')
let iframeBridgeInstance: any = null

const initIframeUrl = (fullUrl = '') => {
  const separator = fullUrl.includes('?') ? '&' : '?'
  const query = route.query as Record<string, string>
  const params = route.params as Record<string, string>
  const allParams = { timestamp: Date.now().toString(), ...query, ...params }
  const searchParams = new URLSearchParams(allParams)
  return `${fullUrl}${separator}${searchParams.toString()}`
}

const splicingEnvId = (url: string) => {
  const fmkEnv = (window as any).fmkEnv || {}
  if (fmkEnv?.envId) {
    url = `${url}&envId=${fmkEnv.envId}`
  }
  return url
}

// microMenuRouteUrl 方法在 store 中不存在，使用 defaultUrl 作为兜底
const microRemoteUrl = computed(() => {
  return props.defaultUrl
})

const reloadIframe = (newUrl?: string) => {
  const url = newUrl || pageUrl.value
  const isFullUrl = !!newUrl
  destroyIframe()
  setTimeout(() => {
    initIframe(url, isFullUrl)
  }, 500)
}

const initIframe = (fullUrl: string, isFullUrl = false) => {
  if (!fullUrl) return
  if (iframeBridgeInstance !== null) return

  const iframe = document.createElement('iframe')
  const goUrl = isFullUrl ? fullUrl : initIframeUrl(fullUrl)
  iframe.src = splicingEnvId(goUrl)
  iframe.style.width = '100%'
  iframe.style.height = '100%'
  iframe.style.border = 'none'

  if (expressRef.value) {
    expressRef.value.appendChild(iframe)
    iframeBridgeInstance = {
      iframe,
      destroyIframe: () => {
        if (expressRef.value?.contains(iframe)) {
          expressRef.value.removeChild(iframe)
        }
      },
    }
    emit('iframe-ready')
  }
}

const destroyIframe = () => {
  if (iframeBridgeInstance !== null) {
    iframeBridgeInstance.destroyIframe()
    iframeBridgeInstance = null
  }
}

watch(
  () => route,
  (to, from) => {
    if (props.openTabSwitchDestroy && from.name === props.routerName && to.name !== props.routerName) {
      destroyIframe()
    }
  }
)

watch(
  () => props.defaultUrl,
  (val) => {
    if (!microRemoteUrl.value && !iframeBridgeInstance && val) {
      pageUrl.value = val
      initIframe(val)
    }
  },
  { immediate: true }
)

watch(
  () => microRemoteUrl.value,
  (val) => {
    if (val) {
      pageUrl.value = val
      initIframe(val)
    }
  },
  { immediate: true }
)

onMounted(() => {
  if (microRemoteUrl.value) {
    pageUrl.value = microRemoteUrl.value
    initIframe(pageUrl.value)
  }
})

onUnmounted(() => {
  destroyIframe()
})

defineExpose({
  reloadIframe,
  initIframe,
  destroyIframe,
})
</script>

<style lang="scss" scoped>
.wh-full {
  width: 100%;
  height: 100%;
}
.overflow_hidden {
  overflow: hidden;
}
.page--micro-index {
  width: 100%;
  height: 100%;
}
</style>
