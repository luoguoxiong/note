/** 时间段下的可选时段项（小时-分钟） */
export interface TimeSelectTimeRange {
  text: string
  hour: number
  children: Array<{ minute: number }>
}

/** 时段匹配项（全天/上午/下午等） */
export interface TimeSelectMatchPeriod {
  periodType: number
  startTime: string
  endTime: string
}

/** 精确时间选择下的可选时段项 */
export interface TimeSelectExactTimeRange {
  text: string
  hour: number
  children: Array<{ minute: number }>
}

/** 可选日期项（聚合两个子组件所需字段，子组件按需读取） */
export interface TimeSelectChoosableTime {
  date: string
  dayOfWeek: number
  matchPeriods?: Array<TimeSelectMatchPeriod>
  timeRanges?: Array<TimeSelectTimeRange>
  exactTimeRanges?: Array<TimeSelectExactTimeRange>
}

/** TimeSelect 组件 props */
export interface TimeSelectProps {
  /** 可选日期及对应时段数据，每项可同时包含 exactTimeRanges / matchPeriods / timeRanges 字段 */
  choosableTimes?: Array<TimeSelectChoosableTime>
}

/** 重新加载回调函数 */
export type TimeSelectReloadDone = () => void

/** TimeSelect 组件事件 */
export interface TimeSelectEmits {
  /** 精确时间选择确认 */
  preciseConfirm: (time: Date) => void
  /** 时间段选择确认 */
  rangeConfirm: (time: { startTime: Date; endTime: Date }) => void
  /** 精确时间数据重新加载 */
  preciseReload: (done: TimeSelectReloadDone) => void
  /** 时间段数据重新加载 */
  rangeReload: (done: TimeSelectReloadDone) => void
}
