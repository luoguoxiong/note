// useCustomerCodeEvent.ts 客户编码code变化事件
import { watch } from 'vue'
import { useUserGlobalStore } from '@/store/user'
import { isEqualString } from '@public/utils'

type Callback = (_data: string | null) => void

export function useCustomerCodeEvent() {
  const listeners: Callback[] = []
  const store = useUserGlobalStore()

  let isWatching = false

  if (!isWatching) {
    isWatching = true
    watch(
      () => store.customerCode,
      (newVal, oldValue) => {
        const newCode = newVal || ''
        const oldCode = oldValue || ''
        if (isEqualString(newCode, oldCode)) return
        listeners.forEach((cb) => {
          try {
            cb(newCode)
          } catch (e) {
            console.error('[useCustomerCodeEvent] callback error', e)
          }
        })
      },
    )
  }

  /* 订阅-客户编码变化事件 */
  const onRefGlobalDataCustomerCodeChange = (cb: Callback) => {
    listeners.push(cb)
  }
  /* 取消订阅-客户编码变化事件 */
  const offRefGlobalDataCustomerCodeChange = (cb: Callback) => {
    const idx = listeners.indexOf(cb)
    if (idx !== -1) listeners.splice(idx, 1)
  }

  return {
    onRefGlobalDataCustomerCodeChange,
    offRefGlobalDataCustomerCodeChange,
  }
}
