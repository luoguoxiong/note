<template>
  <el-badge :is-dot="hasNewMessage" class="message-center-badge">
    <k-tooltip :disabled="!isMinWidth1280" content="消息中心">
      <k-button text @click="handleBtn" style="color: #fff; padding: 8px">
        <k-icon><NotifyPickup /></k-icon>
        <span v-if="!isMinWidth1280">消息</span>
      </k-button>
    </k-tooltip>
  </el-badge>
</template>

<script setup lang="ts">
/**
 * message-center-button 顶栏消息中心入口按钮
 * 来源: netc-pc-web/src/views/message-center-entry/components/message-center-button.vue
 *
 * 迁移说明:
 * - vuex mapGetters('messageStore', ['hasNewMessage']) -> Pinia usePcWebMessageStore + storeToRefs
 * - $umpother({...}, 'CLK') -> window.$umpOtherReport('CLK', { eventCode }, { ...其余字段 })
 * - el-button type="text" -> type="primary" link (element-plus)
 * - svg-icon icon-class -> name (新项目全局组件)
 * - 老项目 buttonImg(data) 为注释掉的 img 方案遗留, 未在模板使用, 不迁移
 */
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { usePcWebMessageStore } from '@/stores/pc-web/messageStore'
import useMessageCenterStore from '../hooks/useMessageCenterStore'
import applicationUpdateCheck from '@/utils/updateCheck/applicationUpdateCheck'
import { KButton, KTooltip, KIcon } from '@netc-design-pc/ui'
import { NotifyPickup } from '@netc-design-pc/icons'

defineOptions({ name: 'message-center-button' })

withDefaults(
  defineProps<{
    isMinWidth1280?: boolean
  }>(),
  {
    isMinWidth1280: false,
  }
)

const emit = defineEmits(['click'])

/* 是否存在新未读消息 (旧 mapGetters('messageStore', ['hasNewMessage'])) */
const messageStore = usePcWebMessageStore()
const { hasNewMessage } = storeToRefs(messageStore)

const handleBtn = () => {
  // 点击消息中心 埋点
  window.$umpOtherReport(
    'CLK',
    { eventCode: 'clk_navigation_top_button_v1' },
    {
      region_code: 'navigation',
      page_code: 'page_home_navigation_v1',
      button_name: '消息中心',
    }
  )
  emit('click', 'message-center-button')
}

/**
 * 消息中心消息轮询-轻应用更新事件队列追加
 */
const handleUnReadCheck = () => {
  const { update_unread_message } = useMessageCenterStore()
  // 立即执行一次
  update_unread_message()
  // 队列轮询事件
  applicationUpdateCheck.queueAdd({
    name: 'update_unread_message',
    fn: update_unread_message,
  })
}

onMounted(() => {
  handleUnReadCheck()
})
</script>

<style lang="scss" scoped>
/* 消息中心图标 */
.message-center-badge {
  :deep(.el-badge__content.is-fixed.is-dot) {
    right: 8px;
    top: 5px;
    background-color: var(--k-color-red-05);
    border: none;
  }
}
</style>
