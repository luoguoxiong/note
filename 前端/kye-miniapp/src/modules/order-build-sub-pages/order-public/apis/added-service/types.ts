import {
  OtherPackageServiceEnum,
  PackageServiceEnum,
} from '@order-public-sub-public/components/business/added-service/types'
import { CheckDetail } from '../../types'

export interface receipterAddrInfo {
  companyName: string
  person: string
  mobile: string
  province: string
  city: string
  county: string
  detailAddress: string
}

export interface AddedServiceResponse {
  serviceCost: number
  insureType: string
  tips: string
}

export interface UploadMaterialsParams {
  materialType: number
  waybillNumber: string
  uploadSource?: number
  tempFileIdList?: string[]
  delFileIdList?: string[]
  updateFlag?: boolean
}

export interface WoodenFrameFeeResponse {
  packageServiceFee: { type: PackageServiceEnum; value: number }[]
  allocatePackageServiceFee: { type: OtherPackageServiceEnum; value: number }[]
}

export interface ReceiptParams {
  source: string
  checkAddressInfo: boolean
  defaultSwitch: boolean //true-开启，false-关闭
  addressInfo: receipterAddrInfo
}

export interface ReceiptResponse {
  status: boolean
  checkResultList: CheckDetail[]
}
