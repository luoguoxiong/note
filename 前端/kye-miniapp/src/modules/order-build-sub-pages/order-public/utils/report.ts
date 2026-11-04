import { timeTypeItem } from '@order-public-sub-public/types/report'
import { apiList } from '@order-public-sub-public/utils/reportConfig'
import { IGNORE_HTTP } from '@order-public-sub-public/reportUmp/config'

import { sessionStorage } from '@order-public-sub-public/utils/storage'

export const extractVersion = (url: string) => {
  const pattern = /order-config\/(\d+\.\d+\.\d+)/
  const match = url?.match(pattern)
  return match ? match[1] : null
}
//将性能时间计算成业务格式，并排序
export const filterTimeObj = (timeDetailList: timeTypeItem[]) => {
  try {
    //先取html的埋点数据
    const htmlHookData = sessionStorage.getItem('htmlHookData')
    if (htmlHookData) {
      timeDetailList.push(JSON.parse(htmlHookData) as timeTypeItem)
      sessionStorage.removeItem('htmlHookData')
    }
    const list = timeDetailList.sort((a, b) => {
      return a.performanceNow - b.performanceNow
    })
    //先根据时间线排序
    for (let i = 0; i < list.length; i++) {
      const item = list[i]
      const { performanceNow, dateNow } = item
      const preItem = list[i - 1] || {
        performanceNow: 0,
        dateNow: 0,
      }
      item.performanceDuration = performanceNow - preItem.performanceNow
      item.dateDuration = dateNow - preItem.dateNow
    }
    return JSON.stringify(timeDetailList)
  } catch (e) {
    console.error(e)
    return ''
  }
}
//监听页面卡顿，长任务超过1s就上报
export const startMonitoring = () => {
  try {
    new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.duration > 1000) {
          requestIdleCallback(() => {
            const eventObj = {
              startTime: Math.floor(entry.startTime), // 开始时间
              duration: Math.floor(entry.duration), // 持续时间
              lastApi: apiList[apiList.length - 1],
            }
            window.$umpOtherReport(
              'OTHER',
              {
                eventCode: 'other_express_longtask',
              },
              eventObj,
            )
            // console.log('记载卡顿了', eventObj)
          })
        }
      })
    }).observe({ entryTypes: ['longtask'] })
  } catch (e) {
    console.error(e)
  }
}

//收集静态资源的加载耗时
export const getResourcePerformance = () => {
  try {
    let resourceEntries = []
    const entries = window?.performance?.getEntries()
    window?.performance?.clearResourceTimings()
    //默认剔除需要忽略的请求
    //过滤类型
    resourceEntries = entries.filter((entry: any) => {
      return (
        ['other', 'beacon', 'xmlhttprequest'].indexOf(entry.initiatorType) === -1 && !IGNORE_HTTP.includes(entry.name)
      )
    })
    return resourceEntries
  } catch (e) {
    return []
    console.error(e)
  }
}
