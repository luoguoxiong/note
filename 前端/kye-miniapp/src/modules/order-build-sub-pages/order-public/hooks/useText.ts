/**
 * @desc 此hook仅为示例
 */
import { ref } from 'vue'

export default function useText(text: string) {
  const msg = ref(text)

  const setMsg = (text: string) => (msg.value = text)

  return {
    msg,
    setMsg,
  }
}
