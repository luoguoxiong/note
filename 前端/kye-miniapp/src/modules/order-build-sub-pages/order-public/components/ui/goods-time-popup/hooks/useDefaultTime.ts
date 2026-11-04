import dayjs from 'dayjs'
import { GoodsTimeConfig } from '@order-public-sub-public/types'
import { initDefaultColumns } from './useCustomerColumns'
import { DefaultGoodsTime, ModuleType, GoodsTimeFlag } from '@order-public-sub-public/constants'
import { PickTime } from '@order-public-sub-public/components/business/goods-time/type'
import { useStore } from '@order-public-sub-public/store'
const piniaStore = useStore()

import { nextTick } from 'vue'

/**
 * 设置默认显示时间
 *    1.表单有选过的时间，默认展示选择的时间
 *        选项为现在货好时；时间Key无值，timeflag 为10
 *    2.货好时间类型为 “自定义” 才有默认时间配置项
 *    3.当前时间 => 现在货好；无需货好 => 空； 1小时后 => 取1小时后最近可选时间
 */
export const useDefaultGoodsTime = (config: GoodsTimeConfig) => {
  let goodsTime = ''
  let goodsTimeFlag = GoodsTimeFlag.NONE

  switch (config.defaultGoodsTime) {
    case DefaultGoodsTime.NO_GOODS_TIME:
      break
    case DefaultGoodsTime.CURRENT_TIME:
      goodsTimeFlag = GoodsTimeFlag.NOW
      break
    case DefaultGoodsTime.ONE_HOURS:
      goodsTime = getOneHourTime(config)
      break
    default:
      break
  }

  nextTick(() => {
    piniaStore.order.updateOrderByType({
      type: ModuleType['货好时间'],
      data: {
        goodsTime,
        goodsTimeFlag,
        urgentGoods: undefined,
      },
    })
  })
}

/**
 * 一小时后逻辑
 *    配置时间段：
 *        如果配置开始时间小于当前时间，则取当前时间+1小时
 *        如果配置开始时间大于当前时间，则取配置开始时间+1小时
 * @param config 时间配置数据
 */

const getOneHourTime = (config: GoodsTimeConfig): string => {
  const MINUTE_ADJUSTMENT = 5

  if (!config?.timeRangeList?.[0]) return ''

  const { startTime, startDate } = config.timeRangeList[0]
  const startDateTime = dayjs(`${startDate} ${startTime}`)
  const now = dayjs()
  let oneHourAfter = now.add(1, 'hour')

  if (now.isAfter(startDateTime)) {
    oneHourAfter = now.add(1, 'hour').subtract(MINUTE_ADJUSTMENT, 'minute')
  } else {
    oneHourAfter = startDateTime.add(1, 'hour').subtract(MINUTE_ADJUSTMENT, 'minute')
  }

  const defaultTime: PickTime[] = initDefaultColumns(config.timeRangeList, oneHourAfter)
  if (defaultTime.length > 0) {
    const [year, hour, minute] = [
      defaultTime[0]?.value,
      defaultTime[0]?.children?.[0]?.value || '',
      defaultTime[0]?.children?.[0]?.children?.[0]?.value || '',
    ]
    return `${year} ${hour}:${minute}`.trim()
  }

  return ''
}
