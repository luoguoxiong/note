/* eslint-disable */
import clickReport from '@order-public-sub-public/reportUmp/sceneReport/clickReport'
import exposureReport from '@order-public-sub-public/reportUmp/sceneReport/exposureReport'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'
import init from '@order-public-sub-public/reportUmp/init'
import baseReportInstance from '@order-public-sub-public/reportUmp/base'
import { ReportConfigType } from '@order-public-sub-public/reportUmp/type/types'

export default {
  install(Vue: any, configs: ReportConfigType): void {
    init(configs).then(() => {
      clickReport(Vue)
      exposureReport(Vue)
    })
  },
}

export { umpOtherReport, baseReportInstance }
/* eslint-disable */
