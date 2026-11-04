import { clearPayMode } from '@order-public-sub-public/components/business/pay-mode/hooks/clearPayMode'
import { clearGoodsTime } from '@order-public-sub-public/components/business/goods-time/hooks/clearGoodsTime'

//待确认补充
const clearMap: any = {
  payMode: clearPayMode, //清空付款方式
  goodsTime: clearGoodsTime, //清空货好时间
}

//执行清空副作用
export const clearValue = (list: string[]) => {
  if (!Array.isArray(list)) {
    return
  }
  list.forEach((i) => {
    const clearFun = clearMap[i]
    if (clearFun && typeof clearFun === 'function') {
      clearFun()
    }
  })
}
