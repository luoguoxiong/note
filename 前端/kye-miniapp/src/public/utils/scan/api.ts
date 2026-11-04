import { http } from '@public/utils/request'

export interface IgetJumpPage {
  /** 暂时绿码场景需传值类型=1 其他无需传值 */
  type?: number | ''
  /** 扫一扫参数信息 */
  keyword: string
}

export interface IgetJumpPageRes {
  /** 0 封装号 1 签回联 2 运单号 4绿码 */
  type: 0 | 1 | 2 | 4
  keyword: string
  /** 跳转页面 10-缺省页toast提示 20-查件列表页 30-路由页 40-详情页 50国际件详情 */
  jumpPage: 10 | 20 | 30 | 40 | 50
  waybillNumber: string
  /** 运单号列表(跳转到查件列表页时多个结果查看) */
  waybillNumbers: string[]
  /** 提示语 */
  tips: string
  /** 参数类型0关键字  1运单号 */
  paramType: 0 | 1
}
export interface IorderscanQrCode {
  waybillInfo: WaybillInfo
  orderInfo: OrderInfo
  qrCodeType: number
  beoverdue: boolean
  companyNo: string
  companyName: string
  statusTips?: string
}

export interface InAppletQrcodeParameter {
  appletId: string
  appletMd5: string
}

export interface WaybillInfo {
  waybillNumber: string
  statusCode: number
  isMonthly: string
  customerType: string
  companyNo: string
  companyId: string
  companyName: string
  isNeedBind: string
  isDazaxie: string
  allowToOrderFlag: string
  allowToPayFlag: string
  companyType: string
  belongIndustry: string
  beoverdue: boolean
  receiveDate: number
  verificCodeFlag: string
  isBelongLoquat: string
  contacterName: string
  contactPhone: string
  kyeCustomerType: string
  defaultInsurancePrice: string
  recoveryReceiptFlag: string
  vipshopFlag: string
  otherWarehouseType: string
  modifyShipperFlag: string
  province: string
  city: string
  district: string
  street: string
  village: string
  doorNumber: string
  address: string
  visitorFlag: number
  waybillStatus: number
}

export interface OrderInfo {
  orderName: string
  orderMobile: string
  address: string
  province: string
  city: string
  zone: string
  contactName: string
  contactPhone: string
  customerCode: string
  customerName: string
  orderStatus: string
}

export interface InAppletQrcodeParameterRes {
  sourceId: number
  qrCodeUrl: string
  appletUrl: string
  qrCodeWidth: number
  urlParameter: Array<UrlParameter>
}

export interface UrlParameter {
  key: string
  value: string
}

/** 10: 扫码中转页 20:授权登录页 30:扫码页 */
export type ReportNode = 10 | 20 | 30
export interface IScanGraphicCode {
  scanResult: string
  // 10小程序, 20安卓，30ios
  reportChannel: 10 | 20 | 30 | number
  /** 平台code，如是小程序，则为微信CODE，如为APP 则为极光ID，如此类推 */
  platformCode: string
  reportNode: ReportNode
}

interface IScanGraphicCodeRes {
  codeId: string
  jumpUrl: string
  jumpType: number
  errMsg: string
  errCode: number
  urlParamStr: string
  customParams: Record<string, any>
}

export const getJumpPage = (parmas: IgetJumpPage) => {
  return http<IgetJumpPageRes>('web.query.scan.getJumpPage', parmas)
}

export const scanQrCode = (parmas: { scanCodeText: string }) => {
  return http<IorderscanQrCode>('web.order.scanQrCode', parmas, {
    needVersionFlag: true,
  })
}

export const getAppletQrcodeParameter = (parmas: InAppletQrcodeParameter, hideToast = true) => {
  return http<InAppletQrcodeParameterRes>('web.question.getAppletQrcodeParameter', parmas, { hideToast: hideToast })
}

export const getScanGraphicCode = (parmas: IScanGraphicCode) => {
  return http<IScanGraphicCodeRes>('web.activity.graphicCode.scanGraphicCode', parmas, { hideToast: true })
}
