<!-- 汇总报表（来源: netc-pc-web/src/views/micro-views/bi/total-data.vue） -->
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

// ⚠️ expressRef 必须解构暴露到 setup 作用域, 模板 ref="expressRef" 才能绑定(否则 iframe 插错容器导致白屏)
const { expressRef } = useBiIframe('M3831', () => ({
  hasDetailDataAuth: true, // 能进入此页面说明有权限，clientStore.authorityIds.includes('125'),
}))

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
