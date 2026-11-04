<template>
  <div class="iframe-content" v-if="iframeSrc && !isError">
    <iframe :src="iframeSrc" id="content" @load="loadPage" :key="iframeSrc" ref="iframeRef"></iframe>
    <!-- 精准通知 -->
    <MessagePopup ref="messagePopupRef" />
  </div>
  <div class="error-scene failToLoad" v-else-if="isError">
    <div class="tips">加载超时，请重新加载</div>
    <button class="reloadBtn" @click="handleReload">重新加载</button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter, type RouteLocationNormalized } from 'vue-router'
import { catchPostMessage } from './postMessage'
import { ElMessage } from 'element-plus'
import { useLightAppStore } from '@/stores/lightapp'
import { Any } from '@/types'
import native from '@/utils/native'
import { storeBridge } from '@/stores/pc-web/storeBridge'
import { checkPsdChangedAndLogout, triggerLogout } from '@/utils/iframeBridge/logout'
import MessagePopup from '@/components/ky-message-popup/index.vue'

const props = defineProps({
  menuCode: { type: String, default: '' },
  routerName: { type: String, default: '' },
  messageCode: { type: String, default: '' },
})

const emit = defineEmits(['message', 'load'])

const route = useRoute()
const router = useRouter()
const lightAppStore = useLightAppStore()

const iframeRef = ref<HTMLIFrameElement>()
const isLoad = ref(false)
const isError = ref(false)
const iframeSrc = ref<string>()
const messagePopupRef = ref<InstanceType<typeof MessagePopup> | null>(null)

let routerDestroy: (() => void) | null = null
let commonDestroy: (() => void) | null = null

// 创建iframe的src属性值
const handleReload = async () => {
  try {
    iframeSrc.value = ''
    isError.value = false
    const baseUrl = await lightAppStore.getAppUrl(props.menuCode)
    if (baseUrl) {
      const params = new URLSearchParams({
        ...(route.query as Record<string, string>),
        ...(route.params as Record<string, string>),
      }).toString()
      const separator = baseUrl.includes('?') ? '&' : '?'
      iframeSrc.value = `${baseUrl}${separator}${params}`
    }
  } catch (e) {
    console.error(e)
    isError.value = true
  }
}

const checkUrlHasChange = (obj1: Record<string, unknown>, obj2: Record<string, unknown>) => {
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
const getRouterChangeMsg = (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
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
const sendMsg = (type: string, data: unknown) => {
  const iframeEl = iframeRef.value
  if (iframeEl && iframeEl.contentWindow) {
    iframeEl.contentWindow.postMessage({ from: props.routerName, type, data }, '*')
  }
}

const emitRouterLeave = (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
  sendMsg('beforeRouteLeave', getRouterChangeMsg(to, from))
}

// 处理接收到的路由相关的postMessage消息
const recievRouterMsg = (event: MessageEvent) => {
  if (route.name !== props.routerName) return
  emit('message', { type: event.data.type, data: event.data.data })
}

// 处理接收到的公共的postMessage消息
const recievCommonMsg = (event: MessageEvent) => {
  if (route.name !== props.routerName) return
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
    // vue-router 4 在 matcher.resolve 阶段即丢弃路由 path 模板中不存在的 params
    //（v3 的 params 透传行为已移除），老业务(如运单列表"再次寄件")经 params 携带的
    // isCopy/needIframeRefresh 等标记到 redirect 时已被清空，此处合并进 query 保住透传契约；
    // data.params 原样保留，带 :token 的路由(如 iframe-code :code)不受影响
    router.push({ ...data, query: { ...data.query, ...data.params } })
  }
}

// Element Plus message 调用
const useElmessage = (data: unknown) => {
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

/** 待弹出的 messageCode：iframeSrc 异步解析、弹窗组件未挂载时先暂存 */
const pendingMessageCode = ref('')

/**
 * 精准通知：按 messageCode 拉取广告弹窗（对齐老项目 iframe/index.vue handleNotice）
 * 老项目在 messageCode === 'pcSearch' 且无广告弹出时兜底展示 time-run-money 时效优化弹窗，
 * 该组件与 getAgingOptimizeNotice 接口未迁移，暂不接入
 */
const handleNotice = () => {
  if (!props.messageCode) return
  if (messagePopupRef.value) {
    // 弹窗组件已挂载，延迟 100ms 对齐老项目交互
    setTimeout(() => {
      messagePopupRef.value?.loadNotice(props.messageCode)
    }, 100)
  } else {
    // 老项目 iframeSrc 为同步 data()，弹窗组件随路由即挂载；新项目 iframeSrc 异步获取，
    // 暂存 messageCode，待 .iframe-content 渲染、弹窗挂载后补弹
    pendingMessageCode.value = props.messageCode
  }
}

// 弹窗组件挂载后补弹暂存的精准通知
watch(messagePopupRef, (popup) => {
  if (!popup || !pendingMessageCode.value) return
  const code = pendingMessageCode.value
  pendingMessageCode.value = ''
  setTimeout(() => {
    messagePopupRef.value?.loadNotice(code)
  }, 100)
})

// 处理路由变化
const onRouterChange = (to: RouteLocationNormalized, from?: RouteLocationNormalized) => {
  if (to.name === props.routerName) {
    handleNotice()
    if (from) {
      sendMsg('onRouteActive', getRouterChangeMsg(to, from))
    }
  }
  if (from && from.name === props.routerName && to.name !== props.routerName) {
    emitRouterLeave(to, from)
  }
}

onMounted(async () => {
  // 子应用直连通道挂载（对齐老项目 index.vue mounted）
  ;(window as any).$nativeMsg = { version: await native.getVersion() }
  ;(window as any).$native = native
  ;(window as any).parentStore = storeBridge
  handleReload()
  routerDestroy = catchPostMessage(recievRouterMsg, props.routerName)
  commonDestroy = catchPostMessage(recievCommonMsg, 'COMMON')
})

onUnmounted(() => {
  routerDestroy && routerDestroy()
  commonDestroy && commonDestroy()
})

watch(
  () => router.currentRoute.value,
  (to, from) => {
    // iframe 页面由 admin 布局 v-for+v-show 常驻渲染，组件不会重新挂载。
    // 二次带新 query 跳入时不重建 iframe（子应用整页重载代价大），与违禁品查询同模式：
    // 通过 onRouteActive 消息把最新路由（含 query）推给子应用，由子应用自行消费参数刷新；
    // 首次加载则由子应用从 iframe src 的 URL query 读参，两条通道互补。
    onRouterChange(to, from)
  },
  // immediate 对齐老项目 $route watch（immediate: true），首次进入页面即触发精准通知
  { immediate: true }
)

defineExpose({
  sendMsg,
  checkUrlHasChange,
  handleReload,
})
</script>

<style lang="scss" scoped>
.iframe-content {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.error-scene {
  width: 100%;
  height: 100%;
  margin-top: 104px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .tips {
    font-size: 13px;
    font-weight: normal;
    line-height: normal;
    text-align: center;
    color: #8c8f99;
    margin: 8px 0;
  }

  .reloadBtn {
    display: block;
    border: none;
    background-color: #7143f0;
    padding: 0 12px;
    font-size: 13px;
    margin: 0 auto;
    width: 76px;
    height: 32px;
    box-sizing: border-box;
    border-radius: 4px;
    color: white;
    cursor: pointer;
    &:hover {
      background-color: #8a61f2;
    }
    &:active {
      background-color: #3e25e9;
    }
  }
}
#content {
  width: 100%;
  height: 100%;
  border: none;
}
</style>
