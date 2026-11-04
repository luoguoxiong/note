import { umpOtherReport } from '@/reportUmp'
import { IGNORE_HTTP } from '@/reportUmp/config'
import { PerformanceCollectType } from '@/reportUmp/type/types'
import { typeJudge } from './../util/index'
/* eslint-disable */
/**
 * 转换并上传performanceSource用于日志分析
 * @param url 可选参数，指定上传的url，为空就是默认所有请求
 * @param ignoreSourceTypes 可选参数，需要排除的上传类型数组
 */
export const performanceSourceCollect = (url = '', params?: PerformanceCollectType) => {
  let resourceEntries = []
  const { ignoreSourceTypes = [],customParams } = params || {}
  const paramsTypeError = !typeJudge(url, 'String') || !typeJudge(ignoreSourceTypes, 'Array')
  const performanceApiError = !typeJudge(window.performance?.getEntriesByType, 'Function')
  try {
    if (paramsTypeError) {
      return console.warn('performanceSourceCollect  函数参数类型错误！')
    }
    if (performanceApiError) {
      return console.warn('performance API is not supported')
    }

    const entries = window.performance.getEntriesByType('resource')
    window.performance.clearResourceTimings()
    //默认剔除需要忽略的请求
    //过滤类型
    resourceEntries = entries.filter((entry: any) => {
      return (
        ['other', 'beacon', ...ignoreSourceTypes].indexOf(entry.initiatorType) === -1 &&
        !IGNORE_HTTP.includes(entry.name)
      )
    })
    //有url就只上传最新的该url的performance
    const firstEntries = resourceEntries.filter((entry) => entry.name.indexOf(url) > -1).pop()
    if(!firstEntries){
      return
    }
    const performance = JSON.stringify(firstEntries)
    umpOtherReport(
        'OTHER',
        {
          eventCode: 'other_express_event_performance_v1',
        },
        {
          ...customParams,
          api:firstEntries?.name,
          performance
        }
    )
    return performance
  } catch (e) {
    console.error(e)
  }
}

/* eslint-disable */
