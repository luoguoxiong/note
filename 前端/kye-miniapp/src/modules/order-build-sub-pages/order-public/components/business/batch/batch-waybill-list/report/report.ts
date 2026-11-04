import baseReportInstance from '@order-public-sub-public/reportUmp/base'
import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

export const updateWaybillNumberCommonReport = (params?: { index: number; waybillNumber: string }) => {
  const { index = '', waybillNumber = '' } = params || {}
  try {
    baseReportInstance.add('no', index.toString())
    baseReportInstance.add('waybill_number', waybillNumber)
    umpOtherReport('CLK', {
      eventCode: 'clk_express_waybillinfo_v1',
    })
  } catch (e) {
    console.error(e)
  }
}
