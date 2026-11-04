/**
 * 地址相关类型定义
 * 从 @order-public/apis/address/types 迁移，供 address-ocr / ocr-ui / cropper 组件使用
 */

/** AI 地址解析结果（单个候选地址） */
export interface AiAddrAnalysis {
  name?: string
  mobilePhone?: string
  telPhone?: string
  province?: string
  city?: string
  district?: string
  address?: string
  county?: string
  detailAddress?: string
  title?: string
  telephone?: string
  extension?: string
  mobile?: string
  company?: string
  source?: number
}

/** AI 地址解析响应 */
export interface AiAddrAnalysisRes {
  resultFlag: resultFlagtype // 10.需要 20.不需要
  addressInfos: AiAddrAnalysis[] // 解析结果
  checkResult?: {
    content?: string
  }
  originalAddress?: string
}

export enum resultFlagtype {
  '需要提示' = '20',
  '不需要提示' = '10',
}

/** OCR 图片分析检测信息 */
export interface Detect_information {
  address: string
  company: string
}

/** OCR 图片分析响应 */
export interface OcrAnalysisResponse {
  detectInformation: Detect_information
  fromType: string
}
