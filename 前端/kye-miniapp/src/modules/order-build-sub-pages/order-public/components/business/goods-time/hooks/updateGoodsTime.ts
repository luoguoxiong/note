import { ModuleType, GoodsTimeFlag, UrgentGoods } from '@order-public-sub-public/constants'

import { editGoodsTimeByServiceTips, openGoodsTimeByService, timeVisible } from './state'
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

/**
 * 打开货好时间面板
 * @param {string} scene 服务模式(服务方式场景: 1.只显示批次时间,隐藏开关; 2.隐藏现在货好按钮)
 */
export const openGoodsTime = (scene?: 'serviceMode', name?: string) => {
  if (scene === 'serviceMode') {
    openGoodsTimeByService.value = true
    if (name) {
      editGoodsTimeByServiceTips.value = `如需使用【${name}】，请选择以下货好时间`
    }
  } else {
    openGoodsTimeByService.value = false
    editGoodsTimeByServiceTips.value = ''
  }
  timeVisible.value = true
}
