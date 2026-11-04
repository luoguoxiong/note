import { ref } from 'vue'
import { throttle } from 'lodash-es'
// import { useGlobalPopover } from '@order-public-sub-public/components/business/popover-effect/hooks/useUpdate'
// const { removeValidateSinge } = useGlobalPopover()

export const productPageScrollHistoryScroll = ref(0)
export const productPageScrollTop = ref(0)

export const useProductPageScroll = () => {
  const handleScroll = throttle((e: any) => {
    productPageScrollHistoryScroll.value = e.detail.scrollTop
    // removeValidateSinge()
  }, 100)

  return {
    handleScroll,
  }
}
