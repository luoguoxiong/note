export interface ThirdBusinessSignStatus {
  /** 二维码的状态 2 成功 3 失败 */
  qrcodeStatus: 2 | 3
}

export interface ThirdBusinessSignStatusReq {
  /** 上报的二维码UUID */
  uuid: string
  /** 10扫码中 20已扫码 */
  optType: number
}

export interface SiginReq {
  address?: {
    lat: number | string
    lng: number | string
  }
}

export interface SiginRes {
  /** 2 内部员工 */
  isInternalStaff: number
  /** 图片base64 */
  img: string
}
