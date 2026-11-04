<!-- 智能大屏（BI 系列接入，菜单 M3851） -->
<template>
  <div class="wh-full overflow_hidden page--bi-index" ref="expressRef">
    <!-- 精准通知 -->
    <MessagePopup ref="messagePopupRef" />
  </div>
</template>
<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import { useBiIframe } from './useBiIframe'
import { useIframeMixin } from '../mixins'
import MessagePopup from '@/components/ky-message-popup/index.vue'

// 路由进出时通知子应用显示/隐藏（对齐老项目 notifyRouteState）
// ⚠️ expressRef 必须解构暴露到 setup 作用域, 模板 ref="expressRef" 才能绑定(否则 iframe 插错容器导致白屏)
const { expressRef } = useBiIframe('M3851', undefined, { routerName: 'smart-screen' })

const messagePopupRef = ref<InstanceType<typeof MessagePopup> | null>(null)
const { handleNotice, getPopupStatus } = useIframeMixin()

// 精准通知：统计分析弹窗会话内仅弹一次（对齐老项目 bi 页面 mounted 逻辑）
onMounted(() => {
  nextTick(() => {
    !getPopupStatus() && handleNotice(messagePopupRef.value)
  })
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
