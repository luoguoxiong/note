<!-- 数据分析（来源: netc-pc-web/src/views/micro-views/bi/analytics-data.vue） -->
<template>
  <div class="wh-full overflow_hidden page--bi-index bi-analytics" ref="expressRef">
    <!-- 精准通知 -->
    <MessagePopup ref="messagePopupRef" />
  </div>
</template>
<script setup lang="ts">
import { ref, nextTick, watch, onMounted, onActivated } from 'vue'
import { useRoute } from 'vue-router'
import { useBiIframe } from './useBiIframe'
import { useIframeMixin } from '../mixins'
import MessagePopup from '@/components/ky-message-popup/index.vue'

const route = useRoute()

// ⚠️ expressRef 必须解构暴露到 setup 作用域, 模板 ref="expressRef" 才能绑定(否则 iframe 插错容器导致白屏)
const { expressRef, initPageUrl, reloadIframe, sendResize } = useBiIframe('M3011', () => ({
  hasDetailDataAuth: true, // 能进入此页面说明有权限clientStore.authorityIds.includes('123'),
  // authPbj: JSON.stringify(clientStore.permissionMap || {}),
  analyticsPageIsAuth: true, // clientStore.authorityIds.includes('123'),
}))

const messagePopupRef = ref<InstanceType<typeof MessagePopup> | null>(null)
const { handleNotice, getPopupStatus } = useIframeMixin()

// 时间戳幂等：同一次 home 跳转不重复刷新（对齐老项目 timeStamp 比较）
const timeStamp = ref('')

onMounted(() => {
  timeStamp.value = (route.query.timeStamp as string) || ''
  // 精准通知：统计分析弹窗会话内仅弹一次（对齐老项目 bi 页面 mounted 逻辑）
  nextTick(() => {
    !getPopupStatus() && handleNotice(messagePopupRef.value)
  })
})

// keep-alive 重新激活时通知子应用 resize（对齐老项目 activated）
onActivated(() => {
  sendResize()
})

watch(
  () => route,
  (to, from) => {
    // 路由变化时通知子应用 resize（对齐老项目 $route watch）
    sendResize()
    const nextTimeStamp = (to.query.timeStamp as string) || ''
    if (to.name === 'bi-analytics' && from && from.name === 'home' && nextTimeStamp !== timeStamp.value) {
      reloadIframe(initPageUrl())
      timeStamp.value = nextTimeStamp
    }
  }
)

// watch(
//   () => clientStore.authorityIds.includes('123'),
//   () => {
//     reloadIframe(initPageUrl())
//   }
// )
</script>

<style lang="scss" scoped>
.wh-full {
  width: 100%;
  height: 100%;
}
.overflow_hidden {
  overflow: hidden;
}
.bi-analytics {
  background-color: #fff;
}
</style>
