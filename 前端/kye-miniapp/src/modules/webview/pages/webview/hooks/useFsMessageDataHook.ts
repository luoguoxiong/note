/**
 * @Desc: useFsMessageDataHook 飞书H5message
 * @Date: 2025/11/10
 */
import { onMounted, onUnmounted } from 'vue'
import native from '@public/utils/native'

const useFsMessageDataHook = () => {
  const handleMessage = (event: MessageEvent) => {
    console.log('handleMessage', event)
    native(event?.data, 'fs-webview')
  }

  onMounted(() => {
    window?.addEventListener('message', handleMessage)
  })
  onUnmounted(() => {
    window?.removeEventListener('message', handleMessage)
  })
}

export default useFsMessageDataHook
