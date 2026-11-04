import { OrderSuccessType } from '@order-public-sub-public/constants'
import { StatusItem } from '@order-public-sub-root-pages/order-success/types'
import { SuccessOrderInfo } from '@order-public-sub-public/types'
import { BatchSuccessOrderInfo } from '@order-public-sub-public/apis/batch/types'
import { reactive } from 'vue'
import dayjs from 'dayjs'

const NO_GOODS_TIME_MAIN_TITLE = '下单成功，等待司机取货'

// const WAYBILL_CHECK_SUB_TITLE = '因贵司价格过低，运单正在审核中，审核后方可下单，可联系您的商务了解详情'

/**
 * @description 获取主标题
 * @param goodsTime
 */
const getMainTitle = (orderInfo: SuccessOrderInfo) => {
  const { goodsTime, orderTitle } = orderInfo
  if (goodsTime) {
    return (
      <div class="flex font-level1 mt-16 main-title-241106">
        预计&nbsp;<div class="time-highlight">{dayjs(goodsTime).format('YYYY/MM/DD HH:mm')}</div>&nbsp;司机上门取件
      </div>
    )
  }

  return <div class="font-level1 mt-16 main-title-241106">{orderTitle || NO_GOODS_TIME_MAIN_TITLE}</div>
}

/**
 * @description 获取副标题
 * @param subTitle
 * @param waybillLen 票数
 */
const getSubTitle = (orderInfo: SuccessOrderInfo, waybillLen = 1) => {
  const { subTitle, goodsTime } = orderInfo
  if (subTitle) {
    return <div class="sub-title color-sub-title">{subTitle}</div>
  } else {
    if (goodsTime) {
      return <div class="sub-title color-sub-title">已成功下单{waybillLen}票</div>
    }
    return <div></div>
  }
}
// eslint-disable-next-line max-lines-per-function
export const useOrderStatus = (activeTab: number, orderInfoList: BatchSuccessOrderInfo[], _orderTitle: string) => {
  let orderInfo = (orderInfoList &&
    orderInfoList.find((x) => x.orderCompletedPageType === activeTab)) as SuccessOrderInfo
  const list = orderInfoList.find((x) => x.orderCompletedPageType === activeTab)?.waybillList || []
  let waybillLen = list.length

  const priceAdjustmentReview = orderInfoList.find((x) => x.orderCompletedPageType === OrderSuccessType.调价审核)
  // 如果有调价审核 点击到下单成功tab时 icon依然显示调价审核, 且标题只显示运单审核的数量
  if (
    priceAdjustmentReview &&
    (activeTab === OrderSuccessType.产生运单和订单 || activeTab === OrderSuccessType.截单专车)
  ) {
    orderInfo = (priceAdjustmentReview && priceAdjustmentReview) as SuccessOrderInfo
    waybillLen = priceAdjustmentReview?.waybillList?.length
  }

  console.log('orderInfoList', orderInfo)
  const ICON_CONFIGS: Record<OrderSuccessType, StatusItem> = {
    [OrderSuccessType.产生运单和订单]: {
      icon: 'success-waybill2',
      tips: 'tips-waybill',
      mainTitle: getMainTitle(orderInfoList[0]),
      subTitle: getSubTitle(orderInfo, waybillLen),
    },
    // 批量寄没有只产生运单
    [OrderSuccessType.只产生运单]: {
      icon: 'success-waybill2',
      tips: 'tips-waybill',
      mainTitle: <div></div>,
      subTitle: '',
    },
    [OrderSuccessType.服务点自寄]: {
      icon: 'success-waybill2',
      tips: '',
      mainTitle: <div></div>,
      subTitle: '',
    },
    // 批量没有截单专车
    [OrderSuccessType.截单专车]: {
      icon: 'icon-car',
      tips: 'tips-car',
      mainTitle: <div class="flex font-level1 mt-16">{orderInfoList?.[0]?.orderTitle}</div>,
      subTitle: getSubTitle(orderInfo, waybillLen),
      iconUrl: 'https://ic-img.ky-express.com/default/20250730_8738_!!1753866946986_88_80.png',
    },
    [OrderSuccessType.调价审核]: {
      icon: 'icon-wait-audit',
      tips: '',
      mainTitle: <div class="flex font-level1 mt-16 main-title-241111">{orderInfoList?.[0]?.subTitle}</div>,
      subTitle: <div class="sub-title color-sub-title">{_orderTitle}</div>,
    },
    [OrderSuccessType.运单审核]: {
      icon: 'icon-wait-audit',
      tips: '',
      mainTitle: <div class="flex font-level1 mt-16 main-title-241111">{orderInfoList?.[0]?.subTitle}</div>,
      subTitle: <div class="sub-title color-sub-title">{_orderTitle}</div>,
    },
    // 批量寄没有戈壁类型
    [OrderSuccessType.戈壁]: {
      icon: 'success-waybill2',
      tips: 'tips-waybill',
      mainTitle: <div></div>,
      subTitle: '',
    },
  }

  const { icon, tips, mainTitle, subTitle, iconUrl } = ICON_CONFIGS[orderInfo.orderCompletedPageType]

  const result = reactive<StatusItem>({
    icon: icon,
    mainTitle: mainTitle,
    subTitle: subTitle ? subTitle : getSubTitle(orderInfo, list.length),
    tips: tips,
    iconUrl,
  })

  return {
    result,
  }
}
