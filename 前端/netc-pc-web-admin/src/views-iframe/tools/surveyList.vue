<!-- 问卷调查（来源: netc-pc-web/src/views/survey/pages/list/index.vue） -->
<template>
  <div class="wh-full" ref="surveyListRef"></div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, getCurrentInstance } from 'vue'
import { useRoute } from 'vue-router'
import IframeBridge from '@/utils/iframeBridge'
import EE from '@/utils/eventemitter'
import { useLightAppStore } from '@/stores/lightapp'

/** M3842：问卷调查菜单编码（mock web.lightApplication.getApplicationInfoListByArea.js） */
const MENU_CODE = 'M3842'
const DESTROY_IFRAME_EXPRESS = 'DESTROY_IFRAME_EXPRESS'

const route = useRoute()
const { proxy } = getCurrentInstance()!
const lightAppStore = useLightAppStore()

const surveyListRef = ref<HTMLDivElement>()

let iframeBridgeInstance: IframeBridge | null = null
let lastUrl = ''

const buildPageUrl = async () => {
  debugger
  return lightAppStore.getAppUrl(MENU_CODE)
}

const initIframe = (fullUrl: string) => {
  if (!fullUrl || iframeBridgeInstance !== null) {
    return
  }
  iframeBridgeInstance = new IframeBridge()
  const params = {
    vm: proxy,
    container: surveyListRef.value as HTMLElement,
    url: fullUrl,
    classListArray: ['wh-full'],
  }
  return iframeBridgeInstance.loadIframe(params).then(() => {
    lastUrl = route.fullPath
    EE.once(DESTROY_IFRAME_EXPRESS, () => {
      destroyIframe()
    })
  })
}

const destroyIframe = () => {
  if (iframeBridgeInstance !== null) {
    iframeBridgeInstance.destroyIframe()
    iframeBridgeInstance = null
    lastUrl = ''
  }
}

// 路由重进 survey-list 时重建 iframe（对齐老项目 $route watch）
watch(
  () => route.fullPath,
  async (fullPath) => {
    if (fullPath.indexOf('survey-list') < 0) {
      return
    }
    if (lastUrl === '' && iframeBridgeInstance === null) {
      const fullUrl = await buildPageUrl()
      initIframe(fullUrl)
    }
  }
)

onMounted(async () => {
  const url = await buildPageUrl()
  initIframe(url)
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
</style>
