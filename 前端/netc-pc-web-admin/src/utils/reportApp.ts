import umpOtherReport from '@/reportUmp/sceneReport/umpotherReport'
/* eslint-disable @typescript-eslint/no-explicit-any */
export enum ReportAppTimeEnum {
  /**main.js开始执行 */
  mainOnStartTime = 'mainOnStartTime',
  /**首页Create生命周期 */
  homeOnCreateTime = 'homeOnCreateTime',
  /**首页首次完成渲染 */
  homeOnMontedTime = 'homeOnMontedTime',
  /**首页展示用户可视模块  */
  homeOnShowModule = 'homeOnShowModule',
  /** 模块接口开始时间 */
  moduleApiStartTime = 'moduleApiStartTime',
  /** 模块接口结束时间 */
  moduleApiEndTime = 'moduleApiEndTime',
  /**模块接口失败时间 */
  moduleApiFailTime = 'moduleApiFailTime',
}

export enum ReportAppPerformanceTimeEnum {
  /**浏览器html首次渲染时间 */
  domContentLoadedTime = 'domContentLoadedTime',
  /** 资源加载完成时间 */
  webOnloadTime = 'webOnloadTime',
  /** 页面关闭时间 */
  webunloadTime = 'webunloadTime',
  /**首次内容绘制 */
  fcpTime = 'fcpTime',
  /** 网页首次响应时间 */
  ttfbTime = 'ttfbTime',
  /**最大内容绘制 */
  lcpTime = 'lcpTime',
  /**用户首次进行操作时间 */
  fidTime = 'fidTime',
}

export const report = (eventCode: ReportAppPerformanceTimeEnum | ReportAppTimeEnum, extraParmas?: object) => {
  umpOtherReport(
    'OTHER',
    {
      eventCode,
    },
    {
      time: performance.now(),
      ...(extraParmas || {}),
    }
  )
}

report(ReportAppTimeEnum.mainOnStartTime)

window.addEventListener('DOMContentLoaded', () => {
  report(ReportAppPerformanceTimeEnum.domContentLoadedTime)
})

window.addEventListener('beforeunload', () => {
  report(ReportAppPerformanceTimeEnum.webunloadTime)
})

window.addEventListener('load', async () => {
  report(ReportAppPerformanceTimeEnum.webOnloadTime)
  const getWebvitals = (fn: any): Promise<number> =>
    new Promise((resolve) => {
      fn((data: any) => {
        resolve(data.value)
      })
    })
  const { onFID, onLCP, onFCP, onTTFB } = await import('web-vitals/attribution')
  const [fcp, ttfp, lcp, fid] = await Promise.all([
    getWebvitals(onFCP),
    getWebvitals(onTTFB),
    getWebvitals(onLCP),
    getWebvitals(onFID),
  ])
  report(ReportAppPerformanceTimeEnum.fcpTime, {
    fcp,
  })
  report(ReportAppPerformanceTimeEnum.ttfbTime, {
    ttfp,
  })
  report(ReportAppPerformanceTimeEnum.lcpTime, {
    lcp,
  })
  report(ReportAppPerformanceTimeEnum.fidTime, {
    fid,
  })
})
