import { OrderSuccessType } from '@order-public-sub-public/constants'
import { StatusItem } from '../types'
import { SuccessOrderInfo, SuccessWaybill } from '@order-public-sub-public/types'
import { reactive } from 'vue'
import dayjs from 'dayjs'

const NO_GOODS_TIME_MAIN_TITLE = '下单成功，等待司机取货'

// const WAYBILL_CHECK_SUB_TITLE = '因贵司价格过低，运单正在审核中，审核后方可下单，可联系您的商务了解详情'

/**
 * @description 获取主标题
 * @param goodsTime
 */
const getMainTitle = (goodsTime: string) => {
  if (goodsTime) {
    return (
      <div class="flex font-level1 mt-16 main-title-241106">
        预计&nbsp;<div class="time-highlight">{dayjs(goodsTime).format('YYYY/MM/DD HH:mm')}</div>&nbsp;司机上门取件
      </div>
    )
  }

  return <div class="font-level1 mt-16 main-title-241106">{NO_GOODS_TIME_MAIN_TITLE}</div>
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

export const useOrderStatus = (orderInfo: SuccessOrderInfo, list: SuccessWaybill[]) => {
  const { goodsTime, orderTitle } = orderInfo

  const ICON_CONFIGS: Record<OrderSuccessType, StatusItem> = {
    [OrderSuccessType.产生运单和订单]: {
      icon: 'success-waybill2',
      tips: 'tips-waybill',
      mainTitle: getMainTitle(goodsTime),
      subTitle: getSubTitle(orderInfo, list.length),
    },
    [OrderSuccessType.服务点自寄]: {
      icon: 'success-waybill2',
      tips: '',
      mainTitle: <div class="font-28 mt-32">{orderTitle}</div>,
      subTitle: getSubTitle(orderInfo, list.length),
    },
    [OrderSuccessType.只产生运单]: {
      icon: 'success-waybill2',
      tips: 'tips-waybill',
      mainTitle: getMainTitle(goodsTime),
      subTitle: getSubTitle(orderInfo, list.length),
    },
    [OrderSuccessType.截单专车]: {
      icon: 'icon-car',
      tips: 'tips-car',
      mainTitle: getMainTitle(goodsTime),
      subTitle: getSubTitle(orderInfo, list.length),
      iconUrl: 'https://ic-img.ky-express.com/default/20250730_8738_!!1753866946986_88_80.png',
    },
    [OrderSuccessType.调价审核]: {
      icon: 'icon-wait-audit',
      tips: 'tips-waybill',
      mainTitle: <div class="mt-16 main-title-241108">{orderInfo.subTitle}</div>,
      subTitle: <div class="sub-title color-sub-title">运单待审核</div>,
    },
    [OrderSuccessType.运单审核]: {
      icon: 'icon-wait-audit',
      tips: 'tips-waybill',
      mainTitle: <div class="mt-16 main-title-241108">{orderInfo.subTitle}</div>,
      subTitle: <div class="sub-title color-sub-title">运单待审核</div>,
    },
    [OrderSuccessType.戈壁]: {
      icon: 'success-waybill2',
      tips: 'tips-waybill',
      mainTitle: (
        <div class="sub-title-241108 flex text-center">
          请前往<div class="color-warning">酒店大堂</div>跨越寄件点投递
        </div>
      ),
      subTitle: getSubTitle(orderInfo, list.length),
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
