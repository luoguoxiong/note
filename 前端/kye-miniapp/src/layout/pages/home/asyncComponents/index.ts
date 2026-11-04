import { isH5Env } from '@/public/utils'
import { createAsyncComp } from '@/public/utils/createAsyncComponent'
import Taro from '@tarojs/taro'
import { defineAsyncComponent } from 'vue'

export const PrivacePopup = createAsyncComp(
  () => import('@/public/components/business/privacy-popup/index.vue'),
  isH5Env ? 1000 : 200,
)

export const PageWaybillSearch = defineAsyncComponent({
  loader: async () => {
    Taro.showLoading({ title: '加载中...' })
    const comp = await import('@modules/waybill-build/components/waybill-search/index.vue')
    Taro.hideLoading()
    return comp
  },
})
