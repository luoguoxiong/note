<!-- 支付开票（来源: netc-pc-web/src/views/bill/online-settlement.vue） -->
<template>
  <div class="external-page-container" v-loading="loading">
    <iframe
      ref="iframeRef"
      id="iframe"
      :src="onlineSettlementUrl"
      style="height: 100%; width: 100%"
      @load="loaded"
      allowfullscreen
    ></iframe>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { KMessage, KMessageBox } from '@netc-design-pc/ui'
import dayjs from 'dayjs'
import { newGetGrayMenus } from '@/apis/waybillApi'
import { getToken } from '@/utils/auth'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const onlineSettlementUrl = ref('')

/** 按环境覆盖结算中心地址 */
const getUrlByEnv = () => {
  const hostname = window.location.hostname
  if (['uc-dev', 'uc-uat', 'localhost'].some((s) => hostname.startsWith(s))) {
    return 'https://invoice-manager-dev.ky-express.com/pc-fms-online-settlement-h5/'
  } else if (hostname.startsWith('uc-stg')) {
    return 'https://invoice-manager-stg.ky-express.com/pc-fms-online-settlement-h5/'
  } else if (['uc.ky-express.com'].includes(hostname)) {
    return 'https://invoice-manager.ky-express.com/pc-fms-online-settlement-h5/'
  }
  return ''
}

/** 透传运单号等路由参数（query + params，对齐老项目 handleUrlHasWaybillNumber） */
const handleUrlHasWaybillNumber = (baseUrl: string) => {
  const params = new URLSearchParams({
    ...(route.query as Record<string, string>),
    ...(route.params as Record<string, string>),
  }).toString()
  const separator = baseUrl.includes('?') ? '&' : '?'
  return `${baseUrl}${separator}${params}`
}

const loadMenu = async () => {
  loading.value = true
  try {
    // 从首页带链接跳转：直接使用链接 + token
    const { from, link } = route.query as Record<string, string>
    if (from === 'homePage' && link) {
      const url = `&token=${getToken() || ''}&unix=${dayjs().unix()}`
      onlineSettlementUrl.value = decodeURIComponent(link) + url
      return
    }
    const res: any = await newGetGrayMenus(2, 'onlineSettlement')
    const { gray, url } = res.data || {}
    const hasAuth = res.code === 0 && gray === 1 && url
    if (hasAuth) {
      let finalUrl = getUrlByEnv()
      finalUrl = `${finalUrl}?token=${getToken() || ''}&unix=${dayjs().unix()}`
      onlineSettlementUrl.value = handleUrlHasWaybillNumber(finalUrl)
    } else {
      KMessage.warning('您的权限已发生变化，无法继续访问支付开票')
      router.push('/admin/home')
    }
  } catch (e) {
    console.log(e)
  } finally {
    loading.value = false
  }
}

const loaded = () => {
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

watch(
  () => route,
  (to) => {
    if (to.name === 'online-settlement') {
      loadMenu()
    }
  }
)

loadMenu()

onUnmounted(() => {
  window.removeEventListener('message', getIframeMessage)
})
</script>

<style lang="scss" scoped>
.external-page-container {
  height: calc(100% - 3px);

  iframe {
    border: none;
  }
}
</style>
