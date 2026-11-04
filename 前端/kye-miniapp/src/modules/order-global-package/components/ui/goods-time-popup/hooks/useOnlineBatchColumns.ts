import dayjs from 'dayjs'
import { TimeRangeOnline } from '../goods-time'

interface SelectItem {
  text: string
  value: string
}

/**
 * 初始化线上批次选择列
 */
export const initOnlineBatchColumns = (timeRange: TimeRangeOnline): SelectItem[] => {
  if (!timeRange?.timeBatch?.length) return []
  return buildDate(timeRange)
}

// 日期组装
const buildDate = (timeRange: TimeRangeOnline): SelectItem[] => {
  const columns: SelectItem[] = []
  const now = dayjs()
  let startDate = dayjs(timeRange.startDate)
  const endDate = dayjs(timeRange.endDate)
  const { timeBatch } = timeRange

  const lastBatchTime = timeBatch[timeBatch.length - 1]
  let earliestAvailable = now.add(5, 'minute')

  // 如果当前时间超过最后批次，开始时间往后推一天
  if (lastBatchTime && earliestAvailable.isAfter(toTimeObj(lastBatchTime))) {
    earliestAvailable = now.add(1, 'day')
  }

  // 如果当前可用时间晚于 startDate，则更新 startDate
  if (earliestAvailable.isAfter(startDate, 'day')) {
    startDate = earliestAvailable
  }

  // 当天和其他天的时间列
  const curDayColumns = buildHourAndMinutes(timeBatch, true, earliestAvailable)
  const normalColumns = buildHourAndMinutes(timeBatch, false)

  let curDate = startDate
  while (!curDate.isAfter(endDate, 'day')) {
    let label = curDate.format('YYYY/MM/DD')

    if (curDate.isSame(now, 'day')) label = '今天'
    else if (curDate.isSame(now.add(1, 'day'), 'day')) label = '明天'
    else if (curDate.isSame(now.add(2, 'day'), 'day')) label = '后天'

    columns.push({
      text: label,
      value: curDate.format('YYYY/MM/DD'),
      children: label === '今天' ? curDayColumns : normalColumns,
    })

    curDate = curDate.add(1, 'day')
  }

  return columns
}

/**
 * 构建小时分钟列
 */
const buildHourAndMinutes = (timeBatch: string[], isToday: boolean, curTime?: dayjs.Dayjs): SelectItem[] => {
  if (!timeBatch.length) return []

  const filtered = isToday && curTime ? timeBatch.filter((t) => toTimeObj(t).isAfter(curTime)) : timeBatch

  return filtered.map((t) => ({ text: t, value: t }))
}

/**
 * 将时间字符串转换为当天 dayjs 对象
 */
const toTimeObj = (time: string) => dayjs(`${dayjs().format('YYYY/MM/DD')} ${time}`)
