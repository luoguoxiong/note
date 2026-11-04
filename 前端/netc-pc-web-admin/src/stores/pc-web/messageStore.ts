/**
 * pc-web 旧基座 messageStore 模块 (Pinia 版)
 * 来源: netc-pc-web/src/store/modules/messageStore.js (namespaced: 'messageStore')
 *
 * 使用场景(标注):
 *  - 【消息中心】unReadMessageCount 未读消息数(轮询/进入基座时刷新) /
 *    hasNewMessage 是否存在新消息(getter) —— 顶栏消息图标红点
 */
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { userMessage_getUnreadCount_new } from './deps/api'

export const usePcWebMessageStore = defineStore('pcWebMessage', () => {
  // ==================== state (旧 messageStore.js state) ====================
  const unReadMessageCount = ref(0) // 未读消息数

  // ==================== getters (旧 messageStore.js getters) ====================
  // 是否存在新消息
  const hasNewMessage = computed(() => {
    return unReadMessageCount.value > 0
  })

  // ==================== mutations (旧 messageStore.js mutations) ====================
  function UPDATE_UNREAD_MESSAGE(val: number) {
    unReadMessageCount.value = val
  }

  // ==================== actions (旧 messageStore.js actions) ====================
  /** 【消息中心】获取未读消息数 */
  async function update_unread_message() {
    const params = {
      channelCode: 'pc',
    }
    const res = await userMessage_getUnreadCount_new(params)
    if (res.code === 0) {
      console.log('message-center: update_unread_message')
      UPDATE_UNREAD_MESSAGE(res.data)
    }
  }

  return {
    // state
    unReadMessageCount,
    // getters
    hasNewMessage,
    // mutations
    UPDATE_UNREAD_MESSAGE,
    // actions
    update_unread_message,
  }
})
