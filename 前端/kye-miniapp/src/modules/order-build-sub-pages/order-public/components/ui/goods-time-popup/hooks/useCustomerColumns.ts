import dayjs, { Dayjs } from 'dayjs'
import { TimeRange, PeriodType } from '@order-public-sub-public/types'

// 货好时间-当前时间＜15分钟 则隐藏该时间段
const intervalMinuteTime = 15

// # 后台配置：自定义时间
/**
 * @param timeRangeList
 * 可多段配置，每段可自定义：起始日期，起始时间，分钟间隔
 * 1.日期匹配：今天，明天，后天 需要转译显示
 * 2.日期需要过滤掉 过去时间
 * 3.今天时间需要过滤 当前时间 + 5 分钟时间
 * 4.多个时间段按照顺序进行组合
 * 新增: 配置多段时间
 */
// 当前时间

// interface timeItem {
//   text: string
//   value: string
// }
let nowTime = dayjs()

// 结束日期
let endDate = ''

// 开始日期
let startDate = ''

let curData = dayjs()

// 预估时间（即时间范围为： 开始日期：预估时间 ———— 结束日期：预估时间）
let estimated = ''

// eslint-disable-next-line complexity, max-lines-per-function
export const initDefaultColumns = (timeRangeList: TimeRange[], defaultTime?: Dayjs) => {
  estimated = ''
  nowTime = dayjs()
  if (defaultTime) {
    nowTime = defaultTime
  }
  if (!timeRangeList) {
    return []
  }
  const columns = []
  const now = nowTime
  for (let i = 0; i < timeRangeList.length; i++) {
    // 取数据
    let { startTime, endTime, interval } = timeRangeList[i]
    const { timePeriodType } = timeRangeList[i]

    // 如果开始时间和结束时间表示时间点，则取消范围中的开始结束时间的限制
    if (timePeriodType === PeriodType.时间点) {
      estimated = timeRangeList[i].startTime
      startTime = ''
      endTime = ''
    }

    endDate = timeRangeList[i].endDate || ''
    startDate = timeRangeList[i].startDate || ''
    const { minuteStep } = timeRangeList[i] // 配置端为minuteStep，客户后台为interval

    // 空数据兼容
    !endDate && (endDate = nowTime.add(30, 'day').format('YYYY-MM-DD'))
    !startDate && (startDate = nowTime.format('YYYY-MM-DD'))
    !startTime && (startTime = '00:00:00')
    !endTime && (endTime = '23:59:59')
    if (!interval) {
      minuteStep ? (interval = minuteStep) : (interval = 15)
    }

    const buildHourParams = {
      startTime: startTime || '00:00:00',
      endTime: endTime || '23:59:59',
      interval: interval,
    }

    // 组装当天小时数据方法
    const todayHourList = () => {
      return buildHour({
        isNowDay: true,
        ...buildHourParams,
      })
    }

    const useableEstimated = estimated && toTimeObj(estimated).format('HH:mm:ss')

    // 预估时间开始
    const estimatedHourStart = () => {
      return buildHour({
        startTime: useableEstimated || '00:00:00',
        interval: interval || 15,
        estimatedType: 'start',
      })
    }

    // 预估时间结束
    const estimatedHourEnd = () => {
      return buildHour({
        endTime: useableEstimated || '23:59:59',
        interval: interval || 15,
        estimatedType: 'end',
      })
    }

    // 组装通用小时数据
    const otherHourList = buildHour({
      isNowDay: false,
      ...buildHourParams,
    })

    const startDateObj = `${startDate} ${startTime}`
    // 当前可用最早日期
    let nowUseableDate = now.add(intervalMinuteTime + interval, 'minute')

    // 当前时间比配置时间段的结束时间还大，则当天无可用时间，往后推一天
    if (nowUseableDate.isAfter(toTimeObj(endTime)) && isSameDay(nowUseableDate, toTimeObj(endTime))) {
      nowUseableDate = nowUseableDate.add(1, 'day')
    }
    // 过滤掉过去日期
    if (nowUseableDate.isAfter(startDateObj, 'day')) {
      startDate = nowUseableDate.format('YYYY/MM/DD')
    }

    // 组装日期并映射：今天，明天，后天
    curData = dayjs(startDate)
    while (curData.isBefore(dayjs(endDate), 'day') || curData.isSame(dayjs(endDate), 'day')) {
      let label = curData.format('YYYY/MM/DD')
      if (curData.isSame(now, 'day')) {
        label = '今天'
      } else if (curData.isSame(now.add(1, 'day'), 'day')) {
        label = '明天'
      } else if (curData.isSame(now.add(2, 'day'), 'day')) {
        label = '后天'
      }
      let children = []
      if (label === '今天') {
        children = todayHourList()
      } else if (estimated && curData.isSame(dayjs(startDate))) {
        // 预估开始时间场景
        children = estimatedHourStart()
      } else if (estimated && curData.isSame(dayjs(endDate))) {
        // 预估结束时间场景
        children = estimatedHourEnd()
      } else {
        children = otherHourList
      }
      const columnsItem = {
        text: label,
        value: curData.format('YYYY/MM/DD'),
        children: children,
      }
      columns.push(columnsItem)
      curData = curData.add(1, 'day')
    }
  }
  return columns
}

// eslint-disable-next-line max-lines-per-function, complexity
const buildHour = ({
  startTime = '00:00:00',
  endTime = '23:59:59',
  interval = 15,
  isNowDay = false,
  estimatedType = '',
}: {
  startTime?: string
  endTime?: string
  interval: number
  isNowDay?: boolean
  estimatedType?: string
}) => {
  const hourList = []

  const now = nowTime

  // 当前真实小时数值
  const realHour = now.hour()

  // 获取当前可用开始小时数值, 当前时间需要 + 5分钟, 阶段开始时间不用 + 5分钟
  const nowUseableHour = now.add(interval + intervalMinuteTime, 'minute').format('HH')
  const normalUseableDay = now.add(interval + intervalMinuteTime, 'minute').format('YYYY-MM-DD')

  const normalUseableHour = toTimeObj(startTime).add(interval, 'minute').format('HH')

  // 初始化：开始结束时间数值
  let startHourTime = startTime.split(':')[0]
  const endHourTime = endTime.split(':')[0]

  // 组装通用分钟数据
  const minutesColumns = buildMinutesColumn({
    interval: interval,
    isInHour: false,
    startHourTime: '',
    endTime: '23:59:59',
    startTime: '00:00:00',
  })

  // 开始时间点分钟数据
  const minByEstimatedStart = () => {
    return buildMinutesColumn({
      interval: interval,
      isInHour: false,
      startHourTime: '',
      endTime: '23:59:59',
      startTime: estimated || startTime,
    })
  }

  // 结束时间点分钟数据
  const minByEstimatedEnd = () => {
    return buildMinutesColumn({
      interval: interval,
      isInHour: false,
      startHourTime: '',
      endTime: estimated || '23:59:59',
      startTime: startTime,
    })
  }

  // 如果分钟间隔大于六十，则取整作为小时的step
  let hourStep = Math.floor(interval / 60)
  hourStep = hourStep < 1 ? 1 : hourStep
  /**
   * 今天小时范围逻辑
   * 当前时间 + 5分钟 + interval（设置时间间隔）
   * 如时间间隔设置为 10 分钟，设：当前时间为 13:50:00
   * 则每小时可选点为 0，10，20，30，40，50
   * 则可取时间为 13:50:00 + 5 + 10 = 14：05：00
   * 小时取 14
   */
  // 当天的需要根据当前时间过滤出过去小时
  if (isNowDay && Number(startHourTime) < Number(nowUseableHour)) {
    startHourTime = nowUseableHour
  } else if (Number(startHourTime) < Number(nowUseableHour)) {
    // 非当天的根据开始时间过滤掉不可用小时
    startHourTime = normalUseableHour
  }

  // 自定义多段需要校验,过滤掉过去时间
  while (Number(startHourTime) <= Number(endHourTime)) {
    const isNowHour = isNowDay && Number(realHour) === Number(startHourTime)
    const estimatedHourNumber = toTimeObj(estimated).format('HH')
    let children = []

    if (isNowDay && isNowHour) {
      // 当天 && 当前小时
      children = buildMinutesColumn({ interval, isInHour: true })
    } else if (Number(startHourTime) === Number(nowUseableHour) && Number(nowUseableHour) !== Number(realHour)) {
      /**
       * 如果 当前真实小时 和 当前可用小时不相等，则 为分钟+5 + interval 晋升导致；
       * 如果是通过分钟间隔晋升的小时，存在部分分钟数不可选；
       * 如 interval = 15；当前时间为11：57：00 ；
       *     则开始小时为 12 且 12：00 不可选；12：15可选
       * 为减少循环嵌套，将此场景单独处理，其余情况放外层处理
       */
      children = buildMinutesColumn({
        interval: interval,
        isInHour: false,
        startHourTime: startHourTime,
        endTime: '',
        normalUseableDay: normalUseableDay,
      })
    } else if (estimated && estimatedType === 'start' && Number(startHourTime) === Number(estimatedHourNumber)) {
      children = minByEstimatedStart() || []
    } else if (estimated && estimatedType === 'end' && Number(startHourTime) === Number(estimatedHourNumber)) {
      children = minByEstimatedEnd() || []
    } else if (startHourTime.toString() === startTime.split(':')[0]) {
      // 配置的第一个小时需去除失效的分钟数: 如配置范围 05:34-19:00 且小时数 05 时，需要过滤掉 34 之前的分钟数
      children = buildMinutesColumn({
        interval: interval,
        isInHour: false,
        isFirstHour: true,
        startHourTime: startHourTime,
        startTime: startTime,
      })
    } else if (Number(startHourTime) === Number(endHourTime)) {
      // 最后一小时需要判断是否小于截至时间的分钟数
      children = buildMinutesColumn({
        interval: interval,
        isInHour: false,
        startHourTime: '',
        endTime: endTime,
      })
    } else {
      children = minutesColumns
    }
    const hourItem = {
      text: buildLabel(startHourTime),
      value: buildLabel(startHourTime),
      children: children,
    }
    hourList.push(hourItem)

    startHourTime = `${Number(startHourTime) + hourStep}`
  }
  return hourList
}

const buildLabel = (value: string | number) => {
  if ((value + '').length === 1) {
    return `0${value}`
  } else {
    return value + ''
  }
}

/**
 * @param interval // 间隔
 * @param isInHour // 是否当前时间当前小时
 * @param startHourTime // 开始小时数,处理进阶场景
 * @param startTime // 开始时间
 * @param endTime // 结束时间
 */
// eslint-disable-next-line complexity
const buildMinutesColumn = (params: {
  interval: number
  isInHour?: boolean
  startHourTime?: string
  isFirstHour?: boolean
  endTime?: string
  startTime?: string
  normalUseableDay?: string
}) => {
  const { interval, isInHour, startHourTime, endTime, startTime, normalUseableDay, isFirstHour } = params
  const nowMinutes = nowTime.format('mm')
  const minutesColumns = []
  let pointerValue = 0
  const endMinuteTime = endTime?.split(':')[1]
  const startMinuteTime = startTime?.split(':')[1]
  while (pointerValue < 60) {
    // 当天&&当前 小时逻辑，处理当前可取时间范围
    if (isInHour) {
      if (Number(pointerValue) > Number(nowMinutes) + intervalMinuteTime) {
        minutesColumns.push({
          text: buildLabel(pointerValue),
          value: buildLabel(pointerValue),
        })
      }
    } else if (startHourTime && !isFirstHour) {
      // 判断当前时间"11:57"; 57 + 5 - 60 = 3
      // 兼容跨天比较
      const pointerTime = toTimeObj(`${startHourTime}:${pointerValue}`, normalUseableDay)
      if (pointerTime.isAfter(nowTime.add(intervalMinuteTime, 'minutes'))) {
        minutesColumns.push({
          text: buildLabel(pointerValue),
          value: buildLabel(pointerValue),
        })
      }
    } else if (endMinuteTime && startMinuteTime) {
      // 返程单兼容
      if (Number(pointerValue) <= Number(endMinuteTime) && Number(pointerValue) >= Number(startMinuteTime)) {
        minutesColumns.push({
          text: buildLabel(pointerValue),
          value: buildLabel(pointerValue),
        })
      }
    } else if (endMinuteTime) {
      // 最后一天结束时间
      if (Number(pointerValue) <= Number(endMinuteTime)) {
        minutesColumns.push({
          text: buildLabel(pointerValue),
          value: buildLabel(pointerValue),
        })
      }
    } else if (startMinuteTime) {
      if (Number(pointerValue) >= Number(startMinuteTime)) {
        minutesColumns.push({
          text: buildLabel(pointerValue),
          value: buildLabel(pointerValue),
        })
      }
    } else {
      minutesColumns.push({
        text: buildLabel(pointerValue),
        value: buildLabel(pointerValue),
      })
    }
    pointerValue += interval
  }
  return minutesColumns || []
}

// 时间转化为时间对象
const toTimeObj = (time: string, day?: string) => {
  const testDay = day || nowTime.format('YYYY/MM/DD')
  return dayjs(`${testDay} ${time}`)
}

const isSameDay = (time1: Dayjs, time2: Dayjs) => {
  if (time1 && time2) {
    try {
      return time1.format('YYYY-MM-DD') === time2.format('YYYY-MM-DD')
    } catch (e) {
      console.log(e)
      return false
    }
  }
}
