<!-- 寄件模板（来源: netc-pc-web/src/views/micro-views/default-config/index.vue） -->
<template>
  <div class="wh-full overflow_hidden page--auth-index" ref="expressRef"></div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, getCurrentInstance } from 'vue'
import { useRoute } from 'vue-router'
import IframeBridge from '@/utils/iframeBridge'
import EE from '@/utils/eventemitter'
import { useLightAppStore } from '@/stores/lightapp'
import { useIframeMixin } from '../mixins'
import { getToken } from '@/utils/auth'

const DESTROY_IFRAME_EXPRESS = 'DESTROY_IFRAME_EXPRESS'
const ROUTER_CHANGE = 'ROUTER_CHANGE'

const route = useRoute()
const { proxy } = getCurrentInstance()!
const lightAppStore = useLightAppStore()
const { initIframeUrl, initIframeUrlByParams, splicingEnvId } = useIframeMixin()

const expressRef = ref<HTMLDivElement>()
const pageUrl = ref('')

let iframeBridgeInstance: IframeBridge | null = null

/** 获取子应用地址（loadAddress + routePath + token） */
const getMicroRemoteUrl = () => {
  const url = lightAppStore.microMenuRouteUrl('M3066')
  return initIframeUrlByParams(url, { token: getToken() || '' })
}

/**
 * 初始化iframe
 * @param fullUrl
 * @param isFullUrl 是否是完整url,无需拼接(用于刷新)
 */
const initIframe = (fullUrl: string, isFullUrl = false) => {
  if (!fullUrl) {
    return
  }
  if (iframeBridgeInstance !== null) {
    return
  }
  iframeBridgeInstance = new IframeBridge()
  const goUrl = isFullUrl ? fullUrl : initIframeUrl(fullUrl, { ...route.query }, { ...route.params })
  const params = {
    vm: proxy,
    container: expressRef.value || (document.querySelector('.page--auth-index') as HTMLElement),
    url: splicingEnvId(goUrl),
    classListArray: ['wh-full'],
  }
  return iframeBridgeInstance.loadIframe(params).then(() => {
    EE.once(DESTROY_IFRAME_EXPRESS, () => {
      destroyIframe()
    })
    // 推送当前路由参数
    EE.emit(ROUTER_CHANGE, route)
  })
}

const destroyIframe = () => {
  if (iframeBridgeInstance !== null) {
    iframeBridgeInstance.destroyIframe()
    iframeBridgeInstance = null
  }
}

onMounted(async () => {
  await lightAppStore.init()
  const url = getMicroRemoteUrl()
  if (url) {
    pageUrl.value = url
    initIframe(pageUrl.value)
  }
})

onUnmounted(() => {
  destroyIframe()
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
</style>
