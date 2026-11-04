<!-- 我的优惠券（来源: netc-pc-web/src/views/coupon/online-coupon.vue） -->
<template>
  <div class="online-coupon-page-container" v-loading="loading">
    <iframe
      ref="iframeRef"
      id="iframe"
      v-if="onlineCouponUrl"
      :src="onlineCouponUrl"
      style="height: 100%; width: 100%"
      @load="loaded"
      allowfullscreen
    ></iframe>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { KMessageBox } from '@netc-design-pc/ui'
import dayjs from 'dayjs'
import { getToken } from '@/utils/auth'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const onlineCouponUrl = ref('')

let lastQuery: Record<string, any> = {}
let lastParams: Record<string, any> = {}

/** 检查参数是否发生变化 */
const checkUrlHasChange = (obj1: Record<string, any>, obj2: Record<string, any>) => {
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

/** 按环境获取优惠券地址 */
const getUrlByEnv = () => {
  const hostname = window.location.hostname
  if (['uc-dev', 'uc-uat', 'localhost'].some((s) => hostname.startsWith(s))) {
    return 'https://crm-h5-uat.ky-express.com/crm-marketing-coupons/pc/home.html#/home'
  } else if (hostname.startsWith('uc-stg')) {
    return 'https://crm-h5-stg.ky-express.com/crm-marketing-coupons/pc/home.html#/home'
  } else if (['uc.ky-express.com'].includes(hostname)) {
    return 'https://crm-h5.ky-express.com/crm-marketing-coupons/pc/home.html#/home'
  }
  return 'https://crm-h5-uat.ky-express.com/crm-marketing-coupons/pc/home.html#/home'
}

/** 初始化 url */
const initUrl = () => {
  const params = new URLSearchParams({
    ...(route.query as Record<string, string>),
    ...(route.params as Record<string, string>),
  }).toString()
  const unix = dayjs().unix().toString()
  return `${getUrlByEnv()}?token=${getToken() || ''}&timestamp=${unix}&unix=${unix}&${params}`
}

const loaded = () => {
  loading.value = false
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
     * 需要支持弹窗和跳内部链接
     * 弹窗需要传递：内容；内部链接需要传递：子路由地址
     */
    const { type } = data
    if (type === 'dialog') {
      const { content, title, confirmButtonText } = data
      if (!content) return
      KMessageBox.alert(content, title || '', {
        confirmButtonText: confirmButtonText || '我知道了',
      })
    } else if (type === 'router') {
      router.push({ path: data.path })
    }
    switch (data.type) {
      case 'INVOICE_PAGE_LOADING':
        loading.value = data.value
        break
    }
    if (data.fn) {
      switch (data.fn) {
        case 'INVOICE_PAGE_LOADING_CLOSE':
          loading.value = false
          break
      }
    }
  } catch (ex) {
    console.log('getIframeMessage :>> ', ex)
  }
}

/** 处理路由变化：query/params 变化时重新加载 iframe */
const onRouterChange = (to: typeof route) => {
  if (to.name === 'coupon') {
    const lastQueryCopy = { ...to.query } as Record<string, any>
    delete lastQueryCopy.actionType
    const queryHasChange = checkUrlHasChange(lastQueryCopy, lastQuery || {})
    const paramsHasChange = checkUrlHasChange(to.params as Record<string, any>, lastParams || {})
    lastQuery = lastQueryCopy
    if (queryHasChange || paramsHasChange) {
      onlineCouponUrl.value = ''
      setTimeout(() => {
        loading.value = true
        onlineCouponUrl.value = initUrl()
      }, 16)
    }
  }
}

onlineCouponUrl.value = initUrl()
lastQuery = { ...(route.query as Record<string, any>) }
delete lastQuery.actionType
lastParams = { ...(route.params as Record<string, any>) }

watch(
  () => route,
  (to) => {
    onRouterChange(to)
  }
)

onUnmounted(() => {
  window.removeEventListener('message', getIframeMessage)
})
</script>

<style lang="scss" scoped>
.online-coupon-page-container {
  height: calc(100% - 3px);

  iframe {
    border: none;
  }
}
</style>
