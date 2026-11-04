import dayjs, { Dayjs } from 'dayjs'
import { TimeRange, PeriodType } from '../goods-time'

/** 常量 */
const INTERVAL_MINUTE_TIME = 15

/** 类型定义 */
interface MinuteColumn {
  text: string
  value: string
}

interface HourColumn {
  text: string
  value: string
  children: MinuteColumn[]
}

interface DateColumn {
  text: string
  value: string
  children: HourColumn[]
}

interface BuildContext {
  now: Dayjs
  estimated?: string
}

interface NormalizedRange {
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  interval: number
}

/** 入口函数 */
export const initDefaultColumns = (timeRangeList: TimeRange[], defaultTime?: Dayjs): DateColumn[] => {
  if (!timeRangeList?.length) return []

  const ctx: BuildContext = {
    now: defaultTime || dayjs(),
  }

  return timeRangeList.flatMap((range) => buildDateColumns(range, ctx))
}

/** 日期列生成 */
const buildDateColumns = (range: TimeRange, ctx: BuildContext): DateColumn[] => {
  const config = normalizeRange(range, ctx)
  const estimated = range.timePeriodType === PeriodType.时间点 ? range.startTime : undefined
  ctx.estimated = estimated

  const result: DateColumn[] = []
  let current = dayjs(config.startDate)
  const endDate = dayjs(config.endDate)

  while (current.isBefore(endDate, 'day') || current.isSame(endDate, 'day')) {
    result.push({
      text: getDateLabel(current, ctx.now),
      value: current.format('YYYY/MM/DD'),
      children: buildHourColumns(current, config, ctx),
    })
    current = current.add(1, 'day')
  }

  return result
}

/** 小时列生成 */
const buildHourColumns = (currentDate: Dayjs, config: NormalizedRange, ctx: BuildContext): HourColumn[] => {
  const result: HourColumn[] = []

  let startHour = Number(config.startTime.split(':')[0])
  const endHour = Number(config.endTime.split(':')[0])
  const step = Math.max(1, Math.floor(config.interval / 60))
  const nowHour = ctx.now.hour()
  const isToday = currentDate.isSame(ctx.now, 'day')

  if (isToday) {
    startHour = Math.max(startHour, ctx.now.add(INTERVAL_MINUTE_TIME + config.interval, 'minute').hour())
  }

  for (let hour = startHour; hour <= endHour; hour += step) {
    result.push({
      text: pad(hour),
      value: pad(hour),
      children: buildMinuteColumns({ hour, currentDate, config, ctx, isToday }),
    })
  }

  return result
}

/** 分钟列生成 */
interface MinuteParams {
  hour: number
  currentDate: Dayjs
  config: NormalizedRange
  ctx: BuildContext
  isToday: boolean
}

const buildMinuteColumns = (params: MinuteParams): MinuteColumn[] => {
  const { hour, config, ctx, isToday, currentDate } = params
  const result: MinuteColumn[] = []
  const nowMinute = ctx.now.minute()

  for (let minute = 0; minute < 60; minute += config.interval) {
    // 今天小时需要过滤过去分钟
    if (isToday && hour === ctx.now.hour() && minute <= nowMinute + INTERVAL_MINUTE_TIME) {
      continue
    }

    // 第一个小时需要根据 startTime 过滤
    if (hour === Number(config.startTime.split(':')[0]) && minute < Number(config.startTime.split(':')[1])) {
      continue
    }

    // 最后一个小时需要根据 endTime 过滤
    if (hour === Number(config.endTime.split(':')[0]) && minute > Number(config.endTime.split(':')[1])) {
      continue
    }

    // 预估时间过滤
    if (ctx.estimated) {
      const estimatedHour = Number(ctx.estimated.split(':')[0])
      const estimatedMinute = Number(ctx.estimated.split(':')[1])
      if (hour === estimatedHour && minute > estimatedMinute) continue
    }

    result.push({ text: pad(minute), value: pad(minute) })
  }

  return result
}

/** 工具函数 */
const pad = (v: number | string) => String(v).padStart(2, '0')

const normalizeRange = (range: TimeRange, ctx: BuildContext): NormalizedRange => ({
  startDate: range.startDate || ctx.now.format('YYYY-MM-DD'),
  endDate: range.endDate || ctx.now.add(30, 'day').format('YYYY-MM-DD'),
  startTime: range.startTime || '00:00:00',
  endTime: range.endTime || '23:59:59',
  interval: range.interval || range.minuteStep || 15,
})

const getDateLabel = (date: Dayjs, now: Dayjs): string => {
  if (date.isSame(now, 'day')) return '今天'
  if (date.isSame(now.add(1, 'day'), 'day')) return '明天'
  if (date.isSame(now.add(2, 'day'), 'day')) return '后天'
  return date.format('YYYY/MM/DD')
}
