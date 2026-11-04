import { ref } from 'vue'
import { throttle } from 'lodash-es'
import { useValidate as globalUseValidate } from '@order-public-sub-public/hooks/useValidate'
const { closeTippyGloabl } = globalUseValidate()

export const kaCustomerMapHistoryScroll = ref(0)
export const kaCustomerPageScrollTop = ref(0)

export const useKaCustomerScroll = () => {
  const handleScroll = throttle((e: any) => {
    kaCustomerMapHistoryScroll.value = e.detail.scrollTop
    closeTippyGloabl()
  }, 100)

  return {
    handleScroll,
  }
}
