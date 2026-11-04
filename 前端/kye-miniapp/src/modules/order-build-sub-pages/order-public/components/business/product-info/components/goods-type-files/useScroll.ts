import { ref } from 'vue'
import { throttle } from 'lodash-es'
import { useValidate as globalUseValidate } from '@order-public-sub-public/hooks/useValidate'
const { closeTippyGloabl } = globalUseValidate()

export const goodsTypeUploadHistoryPageScroll = ref(0)
export const goodsTypeUploadScrollTop = ref(0)

export const useGoodsTypeUploadPageScroll = () => {
  const handleScroll = throttle((e: any) => {
    console.log('kkkkkkasdfsa')
    goodsTypeUploadHistoryPageScroll.value = e.detail.scrollTop
    closeTippyGloabl()
  }, 100)

  return {
    handleScroll,
  }
}
