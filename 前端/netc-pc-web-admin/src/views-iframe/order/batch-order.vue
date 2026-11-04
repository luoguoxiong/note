<template>
  <div class="wh-full" ref="expressRef"></div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted, onUnmounted, getCurrentInstance, watch } from 'vue'
import { useRoute } from 'vue-router'
import IframeBridge from '@/utils/iframeBridge'
import EE from '@/utils/eventemitter'
import eventBus, { EE_EVENT } from '@/views/admin/components/header/eventBus'
import { useLightAppStore } from '@/stores/lightapp'
import { useIframeMixin } from '../mixins'

const DESTROY_IFRAME_EXPRESS = 'DESTROY_IFRAME_EXPRESS'
const ROUTER_CHANGE = 'ROUTER_CHANGE'

const route = useRoute()
const { proxy } = getCurrentInstance()!
const lightAppStore = useLightAppStore()
const { initIframeUrl, splicingEnvId } = useIframeMixin()

const expressRef = ref<HTMLDivElement>()
const pageUrl = ref('')
let iframeBridgeInstance: IframeBridge | null = null
let lastUrl = ''

/** 批量寄件菜单编码（来源: 老项目 store/modules/orderConfig.js M3003） */
const ORDER_BATCH_MENU_CODE = 'M3846'

/** 构建完整的 iframe url（loadAddress + routePath + token/grayHeader） */
const getFullUrl = async (): Promise<string> => {
  const storeUrl = await lightAppStore.getAppUrl(ORDER_BATCH_MENU_CODE)
  return storeUrl
}

// 重置iframe
const reloadIframe = (newUrl?: string) => {
  const iframeUrl = newUrl || pageUrl.value
  const isFullUrl = !!newUrl
  destroyIframe()
  nextTick(() => {
    setTimeout(() => {
      initIframe(iframeUrl, isFullUrl)
    }, 500)
  })
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
  // 当前是否批量页面，只有是打开批量页面才携带路由参数，解决预加载携带参数错乱的问题(对齐老项目)
  const isOrderBatchPage = route.path === '/admin/order-config-batch'
  let goUrl = fullUrl
  if (!isFullUrl) {
    if (isOrderBatchPage) {
      goUrl = initIframeUrl(fullUrl, { ...route.query }, { ...route.params })
    } else {
      goUrl = initIframeUrl(fullUrl)
    }
  }
  const params = {
    vm: proxy,
    container: expressRef.value! || (document.querySelector('.page--order-config-batch') as HTMLElement),
    url: splicingEnvId(goUrl),
    classListArray: ['wh-full'],
  }
  return iframeBridgeInstance
    .loadIframe(params)
    .then((child) => {
      lastUrl = route.fullPath
      // Postmate 创建的 iframe 未设置内联宽高，需手动补充
      const iframe = (child as { frame?: HTMLIFrameElement })?.frame
      if (iframe) {
        iframe.style.width = '100%'
        iframe.style.height = '100%'
        iframe.style.border = 'none'
      }
      EE.once(DESTROY_IFRAME_EXPRESS, () => {
        destroyIframe()
      })
      // 推送当前路由参数(iframeBridge 转发 ON_ROUTE_CHANGE 给子应用)
      EE.emit(ROUTER_CHANGE, route)
    })
    .catch(() => {
      reloadIframe()
    })
}

const destroyIframe = () => {
  if (iframeBridgeInstance !== null) {
    iframeBridgeInstance.destroyIframe()
    iframeBridgeInstance = null
    lastUrl = ''
  }
}

// 手动监听通信事件(对齐老项目 orderBatch.vue onMessage)
const onUpdateOrderConfigUrl = (val: string) => {
  // 轻应用 url 就绪/更新后初始化 iframe
  if (val) {
    pageUrl.value = val
    initIframe(pageUrl.value)
  }
}
const onPageRefresh = (val: { params?: { pageUrl?: string } }) => {
  // 子应用通知刷新当前页面（val.params.pageUrl 为完整刷新 url）
  if (val) {
    reloadIframe(val?.params?.pageUrl)
  }
}
const onOpenHeaderSetting = () => {
  // 子应用打开表头设置(对齐老项目 $bus.emit('waybillV3OpenSetting'))
  eventBus.emit(EE_EVENT.WAYBILL_V3_OPEN_SETTING)
}

const onMessage = () => {
  removeMessage()
  EE.on('UPDATE_ORDER_CONFIG_BATCH_URL', onUpdateOrderConfigUrl)
  EE.on('ORDER_CONFIG_PAGE_REFRESH_orderConfigBatch', onPageRefresh)
  EE.on('OPEN_HEADER_SETTING', onOpenHeaderSetting)
}

const removeMessage = () => {
  EE.off('UPDATE_ORDER_CONFIG_BATCH_URL', onUpdateOrderConfigUrl)
  EE.off('ORDER_CONFIG_PAGE_REFRESH_orderConfigBatch', onPageRefresh)
  EE.off('OPEN_HEADER_SETTING', onOpenHeaderSetting)
}

// 路由兜底: iframe 被销毁后重新进入本路由时重建(预加载场景)
watch(
  () => route.fullPath,
  (fullPath) => {
    if (fullPath.indexOf('order-config') < 0) {
      return
    }
    if (lastUrl === '' && iframeBridgeInstance === null) {
      initIframe(pageUrl.value || '')
      return
    }
    // 路由参数变更时，携带新参数重新加载 iframe
    if (fullPath !== lastUrl) {
      reloadIframe()
    }
  }
)

onMounted(async () => {
  onMessage()
  const fullUrl = await getFullUrl()
  pageUrl.value = fullUrl
  initIframe(fullUrl)
})

onUnmounted(() => {
  removeMessage()
  destroyIframe()
})
</script>

<style scoped>
.wh-full {
  width: 100%;
  height: 100%;
}
</style>
