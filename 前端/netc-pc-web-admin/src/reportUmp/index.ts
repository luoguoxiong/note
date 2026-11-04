/* eslint-disable */
import clickReport from '@/reportUmp/sceneReport/clickReport'
import exposureReport from '@/reportUmp/sceneReport/exposureReport'
import umpOtherReport from '@/reportUmp/sceneReport/umpotherReport'
import init from '@/reportUmp/init'
import baseReportInstance from '@/reportUmp/base'
import {ReportConfigType} from "@/reportUmp/type/types";

export default {
  install(Vue: any, configs: ReportConfigType): void {
    init(configs).then(()=>{
      clickReport(Vue)
      exposureReport(Vue)
    })
  },
}

export { umpOtherReport, baseReportInstance }
/* eslint-disable */
