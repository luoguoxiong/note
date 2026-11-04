/**
 * useMessageCenterStore
 * 来源: netc-pc-web/src/views/message-center-entry/hooks/useMessageCenterStore.js
 * vuex `messageStore` -> 新项目 Pinia `usePcWebMessageStore`
 */
import { usePcWebMessageStore } from '@/stores/pc-web/messageStore'

export default function useMessageCenterStore() {
  const messageStore = usePcWebMessageStore()

  /** 获取未读消息数(旧 store.dispatch('messageStore/update_unread_message')) */
  const update_unread_message = async () => {
    return await messageStore.update_unread_message()
  }

  return {
    update_unread_message,
  }
}
