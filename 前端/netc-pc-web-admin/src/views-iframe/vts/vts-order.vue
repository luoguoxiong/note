<!-- 整车寄件（来源: netc-pc-web/src/views/micro-views/vts/vts-order.vue + vts/mixins/iframe.js） -->
<template>
  <div id="content">
    <Iframe menu-code="M3847" router-name="vtsOrder" ref="iframeRef"></Iframe>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import Iframe from '../components/iframe/index.vue'

const route = useRoute()
const iframeRef = ref<InstanceType<typeof Iframe> | null>(null)

/**
 * 自定义跳转（对齐老项目 vts/mixins/iframe.js routerReplace）：
 * 子应用经 COMMON routerPush 跳入本页且带 actionType=routerReplace 时，
 * 把 query.params（真实目标路由 JSON 串）转发进 iframe，由子应用内部跳转
 */
const routerReplace = () => {
  // 常驻布局下仅当前路由即本页时才转发，避免误发进其他 VTS 页面的 iframe
  if (!route.path.includes('/admin/vtsOrder')) return
  if (route.query.actionType === 'routerReplace') {
    iframeRef.value?.sendMsg('routerReplace', route.query.params)
  }
}

// 对齐老项目 mixins/iframe.js：子应用加载完成(vtsIframeReady)后补一次转发，
// 覆盖直接带 actionType=routerReplace 进入/刷新场景（此时 iframe 尚未加载完成，路由 watch 已错过时机）
const handleIframeMessage = (event: MessageEvent) => {
  if ((event.data as any)?.type === 'vtsIframeReady') {
    routerReplace()
  }
}

onMounted(() => {
  window.addEventListener('message', handleIframeMessage)
})

onUnmounted(() => {
  window.removeEventListener('message', handleIframeMessage)
})

// 路由变化时转发，覆盖从其他 VTS 页面(如运单"再次下单")经 COMMON routerPush 跳入、iframe 已常驻的场景
watch(
  () => route.fullPath,
  () => {
    routerReplace()
  }
)
</script>

<style lang="scss" scoped>
#content {
  width: 100%;
  height: 100%;
}
</style>
