import { getEnvConfig } from '@/public/constants'
import { report_CLK_event, report_EXP_event } from '@public/utils/reportUtil'
import { trackClick } from '@public/utils/report/reportPerformance'

export const report_clk_home_tab = () => {
  trackClick()
  report_CLK_event('clk_home_tab', { page_code: 'page_home_head', button_name: '首页' })
}

export const reportHomePagePerfence = (() => {
  let startTime = 0

  let isOpenHomePage = false

  let isReport = false

  const setReportStart = () => {
    startTime = new Date().getTime()
  }

  const setIsOpenHomePage = (path: string) => {
    isOpenHomePage = path.includes('layout/pages/home/index')
  }

  const reportHomePagePerfence = async () => {
    try {
      if (isOpenHomePage || getEnvConfig().isApp) {
        if (isReport) {
          return
        }
        const firstTime = new Date().getTime() - startTime
        console.error('首页性能：', firstTime)
        isReport = true
        report_EXP_event('other_homepage_browse_v1', {
          time_consum: `${firstTime}`,
          page_code: 'page_homepage_v1',
        })
      } else {
        report_EXP_event('other_homepage_browse_v1_else')
        console.error('当前打开非首页不上报')
      }
    } catch (error) {
      report_EXP_event('reportHomePagePerfenceError')
      console.error(error)
    }
  }

  return {
    setIsOpenHomePage,
    setReportStart,
    reportHomePagePerfence,
  }
})()
