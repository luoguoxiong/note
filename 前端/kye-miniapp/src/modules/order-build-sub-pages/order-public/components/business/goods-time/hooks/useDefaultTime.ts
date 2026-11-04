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
  // 无需货好
  if (config.defaultGoodsTime === DefaultGoodsTime.NO_GOODS_TIME) {
    goodsTime = ''
    goodsTimeFlag = GoodsTimeFlag.NONE

    // 现在货好
  } else if (config.defaultGoodsTime === DefaultGoodsTime.CURRENT_TIME) {
    goodsTime = ''
    goodsTimeFlag = GoodsTimeFlag.NOW

    // 1小时以后
  } else if (config.defaultGoodsTime === DefaultGoodsTime.ONE_HOURS) {
    const time = getOneHourTime(config)
    goodsTime = time
    goodsTimeFlag = GoodsTimeFlag.NONE
  }
  nextTick(() => {
    piniaStore.order.updateOrderByType({
      type: ModuleType['货好时间'],
      data: {
        goodsTime: goodsTime,
        goodsTimeFlag: goodsTimeFlag,
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
const getOneHourTime = (config: GoodsTimeConfig) => {
  let oneHourTimeStr = ''
  let oneHourAfter = dayjs().add(1, 'hour')
  if (config?.timeRangeList?.[0]) {
    const { startTime, startDate } = config.timeRangeList[0]
    const start = dayjs(`${startDate} ${startTime}`)
    const now = dayjs()

    // 如果当前时间 > 配置起始时间 则使用当前时间 + 1小时，否则使用配置起点 + 1小时
    if (now.isAfter(start)) {
      oneHourAfter = now.add(1, 'hour').subtract(5, 'minute')
    } else {
      oneHourAfter = start.add(1, 'hour').subtract(5, 'minute')
    }
    const defaultTime: PickTime[] = initDefaultColumns(config.timeRangeList, oneHourAfter)
    if (defaultTime.length) {
      const year = defaultTime[0]?.value
      const hour = defaultTime[0]?.children?.[0]?.value
      const minute = defaultTime[0]?.children?.[0]?.children?.[0]?.value
      oneHourTimeStr = `${year} ${hour || ''}:${minute || ''}`
    }
  }
  return oneHourTimeStr
}
