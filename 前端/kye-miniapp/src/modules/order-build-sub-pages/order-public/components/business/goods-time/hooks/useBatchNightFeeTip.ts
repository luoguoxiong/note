import { getPackageMsg } from '@order-public-sub-public/apis/batch/index'
import { OrderPageType, ModuleType } from '@order-public-sub-public/constants'
import { GoodsTime } from '@order-public-sub-public/types'
import { debounce } from 'lodash-es'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

/**
 * 货好时间提示
 */
export const getBatchNightFeeTip = debounce(async () => {
  const curOrderPageType = piniaStore.root.getOrderPageType
  if (curOrderPageType !== OrderPageType.批量寄) {
    return
  }
  const goodsTimeData = piniaStore.order.moduleFormData(ModuleType['货好时间'])
  const goodsTime = goodsTimeData?.goodsTime || ''
  const goodsTimeFlag = goodsTimeData?.goodsTimeFlag || ''

  const orderInfoList = piniaStore.order.batchWaybillInfoList
  let produceObj = {
    count: 0,
    weight: 0,
  }

  // 拼装数据：重量总和&件数总和
  if (orderInfoList) {
    produceObj = orderInfoList.reduce((pre, cur) => {
      pre.count += cur.waybillInfo?.productInfo?.count || 0
      pre.weight += cur.waybillInfo?.productInfo?.actualWeight || 0
      return pre
    }, produceObj)
  }

  const res = await getPackageMsg({
    calculateType: 10,
    goodsTime: goodsTime,
    goodsTimeFlag: goodsTimeFlag,
    totalCount: produceObj.count || undefined,
    totalWeight: produceObj.weight || undefined,
  })
  const goodsTimeTips =
    (res.data?.goodsTimePlainTips &&
      `<span style='color: #FF9300;font-size:12px'>${res.data?.goodsTimePlainTips}</span>`) ||
    ''
  piniaStore.schema.updateData({
    data: {
      nightPickFee: {
        nightPickupFeeTips: res.data?.nightFeeRichTips,
      },
      goodsTimeOptimi: {
        goodsTimeOptimiTips: goodsTimeTips,
      },
      serviceMode: {
        serviceTypes: [],
        aiServiceModeTips: '',
        tipsInfos: [],
      },
    },
  })
}, 500)
