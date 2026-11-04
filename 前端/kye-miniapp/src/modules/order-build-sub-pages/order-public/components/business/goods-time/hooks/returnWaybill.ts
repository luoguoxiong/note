import { computed } from 'vue'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

// 是否为需返程
export const isReturnSend = computed(() => {
  const orderPageType = piniaStore.root.getOrderPageType
  return orderPageType === 'order-back'
})

export const timeName = computed(() => {
  return isReturnSend.value ? '返程时间' : '货好时间'
})
