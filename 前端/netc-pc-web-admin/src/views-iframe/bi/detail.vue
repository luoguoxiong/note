<!-- 明细报表（来源: netc-pc-web/src/views/micro-views/bi/detail-data.vue） -->
<template>
  <div class="wh-full overflow_hidden page--bi-index" ref="expressRef">
    <!-- 精准通知 -->
    <MessagePopup ref="messagePopupRef" />
  </div>
</template>
<script setup lang="ts">
import { ref, nextTick, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useBiIframe } from './useBiIframe'
import { useIframeMixin } from '../mixins'
import MessagePopup from '@/components/ky-message-popup/index.vue'

const route = useRoute()

// 老项目明细报表权限 ID 为 '125'（'123' 为数据看板权限）
// ⚠️ expressRef 必须解构暴露到 setup 作用域, 模板 ref="expressRef" 才能绑定(否则 iframe 插错容器导致白屏)
const { expressRef, initPageUrl, reloadIframe, sendResize } = useBiIframe('M3013', () => ({
  hasDetailDataAuth: true, // 能进入此页面说明有权限，clientStore.authorityIds.includes('125'),
}))

const messagePopupRef = ref<InstanceType<typeof MessagePopup> | null>(null)
const { handleNotice, getPopupStatus } = useIframeMixin()

// 时间戳幂等：同一次数据看板跳转不重复刷新（对齐老项目 timeStamp 比较）
const timeStamp = ref('')

onMounted(() => {
  timeStamp.value = (route.query.timeStamp as string) || ''
  // 精准通知：统计分析弹窗会话内仅弹一次（对齐老项目 bi 页面 mounted 逻辑）
  nextTick(() => {
    !getPopupStatus() && handleNotice(messagePopupRef.value)
  })
})

watch(
  () => route,
  (to, from) => {
    // 路由变化时通知子应用 resize（对齐老项目 $route watch）
    sendResize()
    const nextTimeStamp = (to.query.timeStamp as string) || ''
    // 数据分析页跳转过来时刷新（明细报表需要拿到最新查询条件）
    if (from && from.name === 'bi-analytics' && nextTimeStamp !== timeStamp.value) {
      reloadIframe(initPageUrl())
      timeStamp.value = nextTimeStamp
    }
  }
)
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
