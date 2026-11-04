<template>
  <div style="height: calc(100% - 32px); margin: 16px">
    <iframe
      id="message-center"
      X-Frame-Options="sameorigin"
      :src="src"
      ref="messageCenterRef"
      width="100%"
      height="100%"
      @load="loaded"
    ></iframe>
  </div>
</template>

<script setup lang="ts">
/**
 * h5-popup 消息中心 iframe 内嵌页 (/admin/message-center 路由页)
 * 来源: netc-pc-web/src/components/ky-message-popup/h5-popup.vue
 *
 * 迁移说明:
 * - element-ui MessageBox -> element-plus ElMessageBox
 * - envSdk.backLogin() -> router.push('/login') (老实现即 router.push('/login'))
 * - $bus.emit('selfTabName') -> eventBus.emit(EE_EVENT.SELF_TAB_NAME)
 * - sessionStorage.getItem('TOKEN') -> getToken() (新项目 token key 为 'Token')
 * - watch $route -> watch route.name (Vue3 路由对象)
 * - 老项目 isAppH5 computed 为死代码(模板未引用), 不迁移
 */
import { nextTick, onActivated, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getToken } from '@/utils/auth'
import { showLogoutDialog } from '@/utils/iframeBridge/logoutDialog'
import eventBus, { EE_EVENT } from '../eventBus'

defineOptions({ name: 'message-center' })

const route = useRoute()
const router = useRouter()

const src = ref('')
const messageCenterRef = ref<HTMLIFrameElement | null>(null)

// 路由监听 <用户消息中心变更路由场景>
watch(
  () => route.name,
  (val, oldVal) => {
    if (val === 'message-center' && (!oldVal || oldVal === 'message-center')) {
      src.value = ''
      nextTick(() => {
        setTimeout(() => {
          renderIframe()
        }, 100)
      })
    }
  }
)

onActivated(() => {
  renderIframe()
})

onUnmounted(() => {
  window.removeEventListener('message', getIframeMessage)
})

const loaded = () => {
  // iframe 可能重复 load（keep-alive 切回、路由变更重渲染），先移除再注册避免监听累积
  window.removeEventListener('message', getIframeMessage)
  window.addEventListener('message', getIframeMessage, false)
}

const getIframeMessage = (msg: MessageEvent) => {
  try {
    if (!msg || !msg.data) return
    let data: Record<string, any> = {}
    if (typeof msg.data === 'string') {
      data = JSON.parse(msg.data) || {}
    } else if (typeof msg.data === 'object') {
      data = msg.data
    }
    /**
     * tokenInvalid: token失效
     * */
    const { type } = data
    if (type === 'tokenInvalid') {
      tokenInvalidated()
    }
    if (data.from === 'message-center') {
      const { path, query } = data.data
      router.push({ path: path, query })
    }
  } catch (ex) {
    console.log('getIframeMessage :>> ', ex)
  }
}

// token 失效，重新登录（统一走全局退登弹窗单例，与其他退登入口互斥）
// 对齐老基座：本场景弹窗前不清缓存（旧实现仅 backLogin 跳登录），点确认后退登时才清
const tokenInvalidated = () => {
  showLogoutDialog({
    message: '用户信息已失效，请重新登录',
    title: '确定登出',
    confirmText: '重新登录',
    reason: 'invalid',
    clearBeforeShow: false,
  })
}

const getUrlParam = (url: string, id: string) => {
  const queryString = url.split('?')[1] || ''
  if (!queryString) {
    return null
  }

  const pairs = queryString.split('&')
  const params = pairs.reduce((acc: Record<string, string>, pair) => {
    const [key, value] = pair.split('=')
    acc[decodeURIComponent(key)] = decodeURIComponent(value || '')
    return acc
  }, {})

  return params[id] || null
}

const renderIframe = () => {
  const { url } = route.query as { url?: string }
  // 老项目 `url.includes('http') > 0` 等价于 includes('http')
  if (url && url.includes('http')) {
    // TODO 精准通知视频地址，拼接token、其他参数...
    // 精准通知视频地址,拼接token 处理
    const tabName = getUrlParam(url, 'tabTitle')
    if (tabName) {
      eventBus.emit(EE_EVENT.SELF_TAB_NAME, tabName)
    }
    const isHasPatner = url.includes('?')
    const token = getToken()
    const link = `${url}${isHasPatner ? '' : '?'}&token=${token}&fromType=速运PC`
    src.value = link
    return false
  }
}
</script>

<style lang="scss" scoped>
.is-app-h5 {
  width: 500px;
  margin: auto;
}
</style>
