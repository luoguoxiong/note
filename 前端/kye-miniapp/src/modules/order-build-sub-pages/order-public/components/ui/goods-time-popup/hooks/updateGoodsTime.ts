import { ModuleType, GoodsTimeFlag, UrgentGoods } from '@order-public-sub-public/constants'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

// 引入复制: import { updateGoodsTime } from '@order-public-sub-public/components/business/goods-time/hooks/updateGoodsTime'
export const updateGoodsTime = (params: {
  goodsTime: string
  goodsTimeFlag: GoodsTimeFlag
  urgentGoods: UrgentGoods | undefined
}) => {
  const { urgentGoods, goodsTime, goodsTimeFlag } = params
  piniaStore.order.updateOrderByType({
    type: ModuleType['货好时间'],
    data: {
      goodsTime,
      goodsTimeFlag: goodsTimeFlag || GoodsTimeFlag.NONE,
      urgentGoods: urgentGoods || undefined,
    },
  })
}
