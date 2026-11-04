<template>
  <div class="iframe-content" v-if="src">
    <iframe :src="src" id="content" @load="loadPage" :key="src" ref="iframeRef"></iframe>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { catchPostMessage } from './postMessage'
import { ElMessage } from 'element-plus'
import { Any } from '@/types'
import native from '@/utils/native'
import { storeBridge } from '@/stores/pc-web/storeBridge'
import { checkPsdChangedAndLogout, triggerLogout } from '@/utils/iframeBridge/logout'

const props = defineProps({
  src: String,
  routerName: {
    type: String,
    default: '',
  },
  messageCode: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['message', 'load'])

const route = useRoute()
const router = useRouter()

const iframeRef = ref<HTMLIFrameElement>()
const isLoad = ref(false)
let routerDestroy: (() => void) | null = null
let commonDestroy: (() => void) | null = null

/**
 * 处理退登逻辑，清空缓存并显示弹窗
 */
// const handleLogout = (message: string, psdChange?: boolean) => {}

// 检查URL是否发生变化
const checkUrlHasChange = (obj1: Record<string, Any>, obj2: Record<string, Any>) => {
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)
  if (keys1.length !== keys2.length) {
    return true
  }
  for (let key of keys1) {
    if (obj1[key] !== obj2[key]) {
      return true
    }
  }
  return false
}

// 生成路由变化的参数
const getRouterChangeMsg = (to: Any, from: Any) => {
  return {
    to: { params: { ...(to.params || {}) }, query: to.query, path: to.path },
    from: {
      params: from.params,
      path: from.path,
      fullPath: from.fullPath,
    },
  }
}

// 发送消息给iframe
const sendMsg = (type: string, data: Any) => {
  const iframeEl = iframeRef.value
  if (iframeEl && iframeEl.contentWindow) {
    iframeEl.contentWindow.postMessage(
      {
        from: props.routerName,
        type,
        data,
      },
      '*'
    )
  }
}

// 发送routerLeave消息
const emitRouterLeave = (to: Any, from: Any) => {
  sendMsg('beforeRouteLeave', getRouterChangeMsg(to, from))
}

// 处理接收到的路由相关的postMessage消息
const recievRouterMsg = (event: MessageEvent) => {
  if (route.name !== props.routerName) {
    return
  }
  const type = event.data.type
  const data = event.data.data
  emit('message', {
    type,
    data,
  })
}

// 处理接收到的公共的postMessage消息
const recievCommonMsg = (event: MessageEvent) => {
  if (route.name !== props.routerName) {
    return
  }
  const type = event.data.type
  const data = event.data.data
  switch (type) {
    case 'storeDispatch':
      storeDispatch(data)
      break
    case 'storeCommit':
      storeCommit(data)
      break
    case 'routerPush':
      routerPush(data)
      break
    case 'getStoreState':
      routerPush(data)
      break
    case 'loginOut':
      handleLoginOut(data)
      break
    case 'useElmessage':
      useElmessage(data)
      break
    default:
      break
  }
}

// 分发父容器 store 的action(旧 Vuex 通道, 经 storeBridge 兼容层转发 Pinia)
const storeDispatch = ({ key, data }: { key: string; data: Any }) => {
  if (key) {
    storeBridge.dispatch(key, data)
  }
}

// 提交父容器 store 的mutation(旧 Vuex 通道, 经 storeBridge 兼容层转发 Pinia)
const storeCommit = ({ key, data }: { key: string; data: Any }) => {
  if (key) {
    storeBridge.commit(key, data)
  }
}

// 进行路由跳转
const routerPush = (data: Any) => {
  if (typeof data === 'string') {
    router.push(data)
  } else if (data?.path || data?.name) {
    router.push(data)
  }
}

// Element Plus message 调用
const useElmessage = (data: Any) => {
  if (data) {
    ElMessage(data)
  }
}

/*
 * 子应用退登通知处理（对齐老项目 base.vue loginOut 分支:
 * 子应用已携带退登文案(data.msg)时直接弹窗；否则发起退登原因检查后弹窗，
 * 检查逻辑与公共 request 拦截器共用
 */
const handleLoginOut = (data?: Any) => {
  if (data?.msg) {
    triggerLogout(data.msg)
    return
  }
  checkPsdChangedAndLogout()
}

// iframe加载完成时的回调
const loadPage = (event: Event) => {
  isLoad.value = true
  emit('load', event)
}

// 处理路由变化
const onRouterChange = (to: Any, from: Any) => {
  if (to.name === props.routerName) {
    if (from) {
      sendMsg('onRouteActive', getRouterChangeMsg(to, from))
    }
  }
  if (from && from.name === props.routerName) {
    emitRouterLeave(to, from)
  }
}

onMounted(async () => {
  // 子应用直连通道挂载（对齐老项目 base.vue mounted）
  ;(window as any).$nativeMsg = { version: await native.getVersion() }
  ;(window as any).parentStore = storeBridge
  // 捕获路由相关的postMessage消息
  routerDestroy = catchPostMessage(recievRouterMsg, props.routerName)
  // 捕获公共的postMessage消息
  commonDestroy = catchPostMessage(recievCommonMsg, 'COMMON')
})

onUnmounted(() => {
  // 移除消息监听器
  routerDestroy && routerDestroy()
  commonDestroy && commonDestroy()
})

// 监听路由变化（`() => route` 返回同一 proxy 不会触发，需监听 currentRoute，与 index.vue 对齐）
watch(
  () => router.currentRoute.value,
  (to, from) => {
    onRouterChange(to, from)
  }
)

// 暴露方法
defineExpose({
  sendMsg,
  checkUrlHasChange,
})
</script>

<style lang="scss" scoped>
.iframe-content {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
#content {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
