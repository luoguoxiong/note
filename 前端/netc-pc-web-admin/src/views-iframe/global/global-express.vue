<!-- 国际寄件（Postmate 微前端容器；M3826 的 routePath 为空，地址经 default-url 传入） -->
<template>
  <IframeView menu-code="M3826" router-name="global-express" :default-url="iframeSrc"></IframeView>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import IframeView from '../iframe-view.vue'
import { useLightAppStore } from '@/stores/lightapp'
import { urlContact } from '@/utils/micro-utils'
import { getToken } from '@/utils/auth'

/**
 * 国际寄件（M3826）菜单的 routePath 为空，完整入口地址仅存在于 loadAddress（含 #/place-order），
 * 容器的 microMenuRouteUrl 要求 loadAddress + routePath 同时存在，故自行解析地址经 default-url 传入
 * （IframeView 在 microRemoteUrl 为空时消费 defaultUrl，见其 watch(defaultUrl) 分支）；
 * timestamp/query/params/envId 由容器内部 initIframeUrl / splicingEnvId 统一拼接，此处不重复处理
 */
const lightAppStore = useLightAppStore()
const iframeSrc = ref('')

const initDefaultUrl = async () => {
  const menuInfo = await lightAppStore.getLightApp('M3826')
  if (!menuInfo?.loadAddress) return
  iframeSrc.value = urlContact(menuInfo.loadAddress, {
    token: getToken() || '',
    grayHeader: encodeURIComponent(JSON.stringify(menuInfo.grayHeader || [])),
  })
}

onMounted(() => {
  initDefaultUrl()
})
</script>
