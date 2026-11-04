import { fileType } from '@order-public-sub-public/apis/pickup/type'

export interface IfileListMap {
  testReportList: fileType[]
  moveReportList: fileType[]
  shopImageList: fileType[]
  inPackImageList: fileType[]
  outPackImageList: fileType[]
  [key: string]: any
}

export interface IBizCodeMap {
  testReport: string
  moveReport: string
  shopImage: string
  inPackImage: string
  outPackImage: string
  [key: string]: any
}

export enum IsHitReviewEnum {
  命中 = '10',
  未命中 = '20',
}
