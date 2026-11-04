import dayjs, { Dayjs } from 'dayjs'
import { TimeRange, PeriodType } from '../goods-time'

/**
 * @description 默认时间间隔（分钟）
 */
const DEFAULT_INTERVAL = 15

/**
 * @description 默认最大可选天数
 */
const MAX_DAYS = 30

/**
 * @description 数字补零函数
 * @param val 需要补零的数字或字符串
 * @returns 补零后的字符串（两位数）
 */
const padZero = (val: string | number): string => String(val).padStart(2, '0')

/**
 * @description 将时间字符串转换为 dayjs 对象
 * @param time 时间字符串（如 '14:30'）
 * @param day 日期字符串（如 '2026/06/04'）
 * @param nowTime 当前时间对象
 * @returns dayjs 对象
 */
const toTimeObj = (time: string, day: string, nowTime: Dayjs): Dayjs => {
  return dayjs(`${day} ${time}`)
}

/**
 * @description 判断两个时间是否为同一天
 * @param time1 第一个时间对象
 * @param time2 第二个时间对象
 * @returns 是否为同一天
 */
const isSameDay = (time1: Dayjs, time2: Dayjs): boolean => {
  if (!time1 || !time2) return false
  try {
    return time1.format('YYYY-MM-DD') === time2.format('YYYY-MM-DD')
  } catch {
    return false
  }
}

/**
 * @description 构建分钟选择列
 * @param interval 时间间隔（分钟）
 * @param nowTime 当前时间对象
 * @param intervalMinuteOffset 时间偏移量（分钟）
 * @param opts 可选配置参数
 * @param opts.isInHour 是否为当前小时
 * @param opts.isToday 是否为今天
 * @param opts.startHour 开始小时
 * @param opts.firstHour 是否为第一个小时
 * @param opts.endTime 结束时间
 * @param opts.startTime 开始时间
 * @param opts.useableDay 可用日期
 * @returns 分钟选项数组
 */
const buildMinutes = (
  interval: number,
  nowTime: Dayjs,
  intervalMinuteOffset: number,
  opts: {
    isInHour?: boolean
    isToday?: boolean
    startHour?: string
    firstHour?: boolean
    endTime?: string
    startTime?: string
    useableDay?: string
  } = {},
): Array<{ text: string; value: string }> => {
  const { isInHour, isToday, startHour, firstHour, endTime, startTime, useableDay } = opts
  const nowMinutes = nowTime.format('mm')
  const endMin = endTime?.split(':')[1]
  const startMin = firstHour ? startTime?.split(':')[1] : undefined
  const result: Array<{ text: string; value: string }> = []

  // 按间隔遍历分钟
  for (let m = 0; m < 60; m += interval) {
    let valid = true

    // 当前小时：过滤已过分钟
    if (isInHour) {
      valid = m > Number(nowMinutes) + intervalMinuteOffset
    }
    // 特定开始小时：确保时间未过期
    else if (startHour && !firstHour) {
      valid =
        !isToday ||
        toTimeObj(`${startHour}:${padZero(m)}`, useableDay || nowTime.format('YYYY/MM/DD'), nowTime).isAfter(
          nowTime.add(intervalMinuteOffset, 'minutes'),
        )
    }
    // 同时有开始和结束分钟限制
    else if (endMin && startMin) {
      valid = m >= Number(startMin) && m <= Number(endMin)
    }
    // 只有结束分钟限制
    else if (endMin) {
      valid = m <= Number(endMin)
    }
    // 只有开始分钟限制
    else if (startMin) {
      valid = m >= Number(startMin)
    }

    if (valid) {
      result.push({ text: padZero(m), value: padZero(m) })
    }
  }

  return result
}

/**
 * @description 构建小时选择列（包含分钟子列）
 * @param startTime 开始时间
 * @param endTime 结束时间
 * @param interval 时间间隔（分钟）
 * @param isNowDay 是否为今天
 * @param nowTime 当前时间对象
 * @param intervalMinuteOffset 时间偏移量（分钟）
 * @param estimated 预估时间（用于时间点模式）
 * @param estimatedType 预估类型（'start' | 'end'）
 * @returns 小时选项数组（包含分钟子选项）
 */
const buildHours = (
  startTime: string,
  endTime: string,
  interval: number,
  isNowDay: boolean,
  nowTime: Dayjs,
  intervalMinuteOffset: number,
  estimated?: string,
  estimatedType?: string,
): Array<{ text: string; value: string; children: Array<{ text: string; value: string }> }> => {
  const result: Array<{ text: string; value: string; children: Array<{ text: string; value: string }> }> = []
  const realHour = nowTime.hour()
  const nowUseableHour = nowTime.add(interval + intervalMinuteOffset, 'minute').format('HH')
  const useableDay = nowTime.add(interval + intervalMinuteOffset, 'minute').format('YYYY-MM-DD')
  const normalUseableHour = dayjs(`${nowTime.format('YYYY/MM/DD')} ${startTime}`)
    .add(interval, 'minute')
    .format('HH')

  let startHour = Number(startTime.split(':')[0])
  const endHour = Number(endTime.split(':')[0])
  const hourStep = Math.max(Math.floor(interval / 60), 1)
  const estimatedHour = estimated ? dayjs(`${nowTime.format('YYYY/MM/DD')} ${estimated}`).format('HH') : ''

  // 调整开始小时，确保不早于可用时间
  if (isNowDay && startHour < Number(nowUseableHour)) {
    startHour = Number(nowUseableHour)
  } else if (startHour < Number(nowUseableHour)) {
    startHour = Number(normalUseableHour)
  }

  // 遍历小时，构建每小时的分钟选项
  for (let h = startHour; h <= endHour; h += hourStep) {
    const hStr = String(h)
    const isNowHour = isNowDay && realHour === h
    let children: Array<{ text: string; value: string }> = []

    // 根据不同场景构建分钟选项
    if (isNowDay && isNowHour) {
      // 当前小时：过滤已过分钟
      children = buildMinutes(interval, nowTime, intervalMinuteOffset, { isInHour: true })
    } else if (h === Number(nowUseableHour) && String(realHour) !== nowUseableHour) {
      // 切换到下一小时的边界情况
      children = buildMinutes(interval, nowTime, intervalMinuteOffset, {
        startHour: hStr,
        isToday: isNowDay,
        useableDay,
      })
    } else if (estimated && estimatedType === 'start' && h === Number(estimatedHour)) {
      // 时间点模式的开始约束
      children = buildMinutes(interval, nowTime, intervalMinuteOffset, { startTime: estimated })
    } else if (estimated && estimatedType === 'end' && h === Number(estimatedHour)) {
      // 时间点模式的结束约束
      children = buildMinutes(interval, nowTime, intervalMinuteOffset, { endTime: estimated })
    } else if (hStr === startTime.split(':')[0]) {
      // 第一个小时：应用开始时间约束
      children = buildMinutes(interval, nowTime, intervalMinuteOffset, {
        firstHour: true,
        startTime,
        isToday: isNowDay,
      })
    } else if (h === endHour) {
      // 最后一个小时：应用结束时间约束
      children = buildMinutes(interval, nowTime, intervalMinuteOffset, { endTime, isToday: isNowDay })
    } else {
      // 普通小时：全量分钟选项
      children = buildMinutes(interval, nowTime, intervalMinuteOffset)
    }

    result.push({ text: padZero(h), value: padZero(h), children })
  }

  return result
}

/**
 * @description 初始化时间选择器列数据
 * @param timeRangeList 时间范围配置列表
 * @param defaultTime 默认时间（可选，用于测试）
 * @returns 日期选择列数组（包含小时和分钟子列）
 */
export const initDefaultColumns = (timeRangeList: TimeRange[], defaultTime?: Dayjs) => {
  // 没有时间范围配置时返回空数组
  if (!timeRangeList?.length) return []

  const nowTime = defaultTime || dayjs()
  const columns: Array<{
    text: string
    value: string
    children: Array<{ text: string; value: string; children: Array<{ text: string; value: string }> }>
  }> = []

  // 遍历每个时间范围配置
  for (const range of timeRangeList) {
    let { startTime, endTime, interval, intervalMinuteOffset } = range
    const { timePeriodType, startDate, endDate, minuteStep } = range

    // 时间点模式：使用 startTime 作为预估时间
    let estimated = ''
    if (timePeriodType === PeriodType.时间点) {
      estimated = range.startTime || ''
      startTime = ''
      endTime = ''
    }

    // 设置默认值
    const endDt = endDate || nowTime.add(MAX_DAYS, 'day').format('YYYY-MM-DD')
    const startDt = startDate || nowTime.format('YYYY-MM-DD')
    const startTm = startTime || '00:00:00'
    const endTm = endTime || '23:59:59'
    const intv = interval || minuteStep || DEFAULT_INTERVAL

    // 定义不同场景的小时构建函数
    const todayHours = () => buildHours(startTm, endTm, intv, true, nowTime, intervalMinuteOffset, estimated)
    const estStartHours = () =>
      buildHours(estimated || '00:00:00', endTm, intv, false, nowTime, intervalMinuteOffset, estimated, 'start')
    const estEndHours = () =>
      buildHours(startTm, estimated || '23:59:59', intv, false, nowTime, intervalMinuteOffset, estimated, 'end')
    const otherHours = buildHours(startTm, endTm, intv, false, nowTime, intervalMinuteOffset)

    // 计算有效开始日期（考虑时间偏移）
    let useableDate = nowTime.add(intervalMinuteOffset + intv, 'minute')
    if (
      useableDate.isAfter(dayjs(`${nowTime.format('YYYY/MM/DD')} ${endTm}`)) &&
      isSameDay(useableDate, dayjs(`${nowTime.format('YYYY/MM/DD')} ${endTm}`))
    ) {
      useableDate = useableDate.add(1, 'day')
    }

    let effectiveStart = startDt
    if (useableDate.isAfter(`${startDt} ${startTm}`, 'day')) {
      effectiveStart = useableDate.format('YYYY/MM/DD')
    }

    // 遍历日期，构建日期列
    let cur = dayjs(effectiveStart)
    const end = dayjs(endDt)
    while (cur.isBefore(end, 'day') || cur.isSame(end, 'day')) {
      let label = cur.format('YYYY/MM/DD')
      // 替换为友好标签
      if (cur.isSame(nowTime, 'day')) label = '今天'
      else if (cur.isSame(nowTime.add(1, 'day'), 'day')) label = '明天'
      else if (cur.isSame(nowTime.add(2, 'day'), 'day')) label = '后天'

      // 根据日期类型选择对应的小时列
      let children: Array<{ text: string; value: string; children: Array<{ text: string; value: string }> }> = []
      if (label === '今天') children = todayHours()
      else if (estimated && cur.isSame(dayjs(startDt))) children = estStartHours()
      else if (estimated && cur.isSame(dayjs(endDt))) children = estEndHours()
      else children = otherHours

      columns.push({ text: label, value: cur.format('YYYY/MM/DD'), children })
      cur = cur.add(1, 'day')
    }
  }

  return columns
}