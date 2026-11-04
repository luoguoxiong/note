<!-- 子容器组件（来源: netc-pc-web/src/views/micro-views/components/iframe-view.vue） -->
<template>
  <div class="wh-full overflow_hidden page--micro-index" ref="expressRef"></div>
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, getCurrentInstance } from 'vue'
import { useRoute } from 'vue-router'
import IframeBridge from '@/utils/iframeBridge'
import EE from '@/utils/eventemitter'
import { useLightAppStore } from '@/stores/lightapp'
import { useIframeMixin } from './mixins'

const DESTROY_IFRAME_EXPRESS = 'DESTROY_IFRAME_EXPRESS'
const ROUTER_CHANGE = 'ROUTER_CHANGE'

const props = defineProps({
  menuCode: {
    type: String,
    default: '',
  },
  routerName: {
    type: String,
    default: '',
  },
  // iframeUrl默认值
  defaultUrl: {
    type: String,
    default: '',
  },
  // 是否开启切换tab时触发销毁destroy {默认执行销毁事件}
  openTabSwitchDestroy: {
    type: Boolean,
    default: false,
  },
  // 路由变更初始化即推送
  routeChangeEmitImmediate: {
    type: Boolean,
    default: true,
  },
})

const route = useRoute()
const { proxy } = getCurrentInstance()!
const lightAppStore = useLightAppStore()
const { initIframeUrl, splicingEnvId } = useIframeMixin()

const expressRef = ref<HTMLDivElement>()
const pageUrl = ref('')
const iframeBridgeInstance = ref<IframeBridge | null>(null)

const microRemoteUrl = computed(() => lightAppStore.microMenuRouteUrl(props.menuCode))

// 重置iframe
const reloadIframe = (newUrl?: string) => {
  const iframeUrl = newUrl || pageUrl.value
  const isFullUrl = !!newUrl
  destroyIframe()
  setTimeout(() => {
    initIframe(iframeUrl, isFullUrl)
  }, 500)
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
  if (iframeBridgeInstance.value !== null) {
    return
  }
  const instance = new IframeBridge()
  const goUrl = isFullUrl ? fullUrl : initIframeUrl(fullUrl, { ...route.query }, { ...route.params })
  const params = {
    vm: proxy,
    container: expressRef.value || (document.querySelector('.page--micro-index') as HTMLElement),
    url: splicingEnvId(goUrl),
    classListArray: ['wh-full'],
    menuCode: props.menuCode,
  }
  return instance
    .loadIframe(params)
    .then(() => {
      EE.once(DESTROY_IFRAME_EXPRESS, () => {
        destroyIframe()
      })
      if (props.routeChangeEmitImmediate) {
        // 推送当前路由参数
        EE.emit(ROUTER_CHANGE, route)
      }
    })
    .catch(() => {
      reloadIframe()
    })
    .finally(() => {
      iframeBridgeInstance.value = instance
    })
}

const destroyIframe = () => {
  if (iframeBridgeInstance.value !== null) {
    iframeBridgeInstance.value.destroyIframe()
    iframeBridgeInstance.value = null
  }
}

watch(
  () => route,
  (to, from) => {
    if (props.openTabSwitchDestroy && from && from.name === props.routerName && to.name !== props.routerName) {
      destroyIframe()
    }
  }
)

watch(
  () => props.defaultUrl,
  (val) => {
    // 不存在轻应用数据，存在缓存应用数据
    if (!microRemoteUrl.value && iframeBridgeInstance.value === null && val) {
      pageUrl.value = val
      initIframe(val)
    }
  }
)

onMounted(async () => {
  await lightAppStore.init()
  if (microRemoteUrl.value) {
    pageUrl.value = microRemoteUrl.value
    initIframe(pageUrl.value)
  }
})

onUnmounted(() => {
  destroyIframe()
})

defineExpose({
  initIframe,
  destroyIframe,
  reloadIframe,
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
