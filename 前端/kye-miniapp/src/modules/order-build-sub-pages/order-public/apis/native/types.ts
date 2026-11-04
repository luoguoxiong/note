export interface ScanQrCodeResponse {
  waybillInfo: {
    statusCode: number
    waybillStatus: string
    companyNameNo: string
    visitorFlag: string
    waybillNumber: string
  }
  orderInfo: {
    orderStatus: string
  }
  qrCodeType: number // 二维码类型(1运单 2定单)
}
