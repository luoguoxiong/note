import umpOtherReport from '@order-public-sub-public/reportUmp/sceneReport/umpotherReport'

// 下单_寄件页_给司机捎句话_弹窗消失
export const driverRemarkPopupClosedReport = (pageCode?: string) => {
  umpOtherReport(
    'OTHER',
    { eventCode: 'other_express_driver_popup_disappear_v1' },
    pageCode ? { page_code: pageCode } : {},
  )
}
