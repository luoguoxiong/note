import dayjs from 'dayjs'
import { TimeRangeOnline } from '@order-public-sub-public/types'
// # 后台配置：按线上逻辑
/**
 * @param timeRange
 * 时间配置按照线上逻辑
 * 1.timeBatch 有值 表示一配置批次，则采用批次选项
 */
export const initOnlineBatchColumns = (timeRange: TimeRangeOnline) => {
  if (!timeRange?.timeBatch?.length) {
    return []
  }
  // 组装日期
  const columns = buildDate(timeRange)
  return columns
}

// 日期组装方法
const buildDate = (timeRange: TimeRangeOnline) => {
  const columns = []
  const now = dayjs()
  let { startDate } = timeRange
  const { endDate } = timeRange
  const { timeBatch } = timeRange || []

  let nowUseableDate = now.add(5, 'minute')
  const lastTime = timeBatch && timeBatch[timeBatch.length - 1]

  // 当前时间（ps：23：00）大于批次最后的时间（22：00），则过滤掉今天
  if (lastTime && nowUseableDate.isAfter(toTimeObj(lastTime))) {
    nowUseableDate = now.add(1, 'day')
  }

  // 过滤过去日期，当前可用最早时间 > 开始时间; 则开始时间 = 当前可用最早时间
  if (nowUseableDate.isAfter(dayjs(startDate), 'day')) {
    startDate = nowUseableDate.format('YYYY/MM/DD')
  }

  // 转成时间对象
  let curData = dayjs(startDate)

  // 构建当天数据
  const curDayTimeColumns = buildHourAndminutes({ isNowDay: true }, timeBatch || [])

  // 构建通用数据
  const normalTimeColumns = buildHourAndminutes({ isNowDay: false }, timeBatch || [])

  // 组装日期
  while (curData.isBefore(dayjs(endDate), 'day') || curData.isSame(dayjs(endDate), 'day')) {
    let label = curData.format('YYYY/MM/DD')

    // 映射日期为今天明天后天
    if (curData.isSame(now, 'day')) {
      label = '今天'
    } else if (curData.isSame(now.add(1, 'day'), 'day')) {
      label = '明天'
    } else if (curData.isSame(now.add(2, 'day'), 'day')) {
      label = '后天'
    }

    const columnsItem = {
      text: label,
      value: curData.format('YYYY/MM/DD'),
      children: label === '今天' ? curDayTimeColumns : normalTimeColumns,
    }
    columns.push(columnsItem)
    curData = curData.add(1, 'day')
  }
  return columns
}

/**
 * 有timeBatch
 *    如果是当天 - 过滤出小于现在时间的数据
 *    否则直接使用批次数据
 */
const buildHourAndminutes = ({ isNowDay = false }, timeBatch: string[]) => {
  let columns: string[] = []
  const curTime = dayjs().add(5, 'minute').format('HH:mm')
  if (timeBatch.length) {
    columns = timeBatch
    if (isNowDay) {
      columns = timeBatch.filter((str) => toTimeObj(str) > toTimeObj(curTime))
    }
  }

  const result: SelectItem[] = []
  return columns.reduce((pre, cur) => {
    pre.push({
      text: cur,
      value: cur,
    })
    return pre
  }, result)
}

interface SelectItem {
  text: string
  value: string
}

// 时间转化为当天时间对象
const toTimeObj = (time: string) => {
  const testDay = dayjs().format('YYYY/MM/DD')
  return dayjs(`${testDay} ${time}`)
}
