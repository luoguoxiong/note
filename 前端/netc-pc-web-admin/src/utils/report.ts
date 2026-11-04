import { timeTypeItem } from '@/types/report'
import { apiList } from '@/utils/reportConfig'

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
              eventObj
            )
            console.log('记载卡顿了', eventObj)
          })
        }
      })
    }).observe({ entryTypes: ['longtask'] })
  } catch (e) {
    console.error(e)
  }
}
