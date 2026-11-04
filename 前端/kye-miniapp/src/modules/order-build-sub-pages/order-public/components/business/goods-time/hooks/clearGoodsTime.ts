import { ModuleType, GoodsTimeFlag } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

// 引入复制: import { clearGoodsTime } from '@order-public-sub-public/components/business/goods-time/hooks/clearGoodsTime'
export const clearGoodsTime = () => {
  piniaStore.order.updateOrderByType({
    type: ModuleType['货好时间'],
    data: {
      goodsTime: '',
      goodsTimeFlag: GoodsTimeFlag.NONE,
      urgentGoods: undefined,
    },
  })
}
