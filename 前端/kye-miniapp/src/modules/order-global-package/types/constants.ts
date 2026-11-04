/** 常量定义（从 @order-public/constants 迁移） */

// ==================== OCR 相关常量 ====================

/** Emoji 过滤正则 */
export const filterEmojis =
  // eslint-disable-next-line no-misleading-character-class, no-useless-escape
  /[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF][\u200D|\uFE0F]|[\uD83C|\uD83D|\uD83E][\uDC00-\uDFFF]|[0-9|*|#]\uFE0F\u20E3|[0-9|#]\u20E3|[\u203C-\u3299]\uFE0F\u200D|[\u203C-\u3299]\uFE0F|[\u2122-\u2B55]|\u303D|[\A9|\AE]\u3030|\uA9|\uAE|\u3030/gi

/** OCR 输入框占位文案 */
export const OCR_PLACEHOLDER =
  '粘贴文本 或上传图片，自动识别地址信息\r\n例如：跨越越 158xxxxxxxx 广东省深圳市宝安区xx路xx号'

// ==================== 地址相关常量（原 @order-public/constants/address + global） ====================

/** 地图解析标识 */
export enum ResolutionOcr {
  '地图' = 1,
  'AI地址推荐' = 0,
}

/** 地址值接口 */
export interface AddressValue {
  person?: string
  mobile?: string
  telephone?: string
  extension?: string
  companyName?: string
  province?: string
  city?: string
  county?: string
  detailAddress?: string
  locationName?: string
  addressId?: string
  locationId?: string
  isSelectItem?: boolean
  exhibitionCode?: string
  exhibitionNumber?: string
  exhibitionSiteNumber?: string
  exhibitionProject?: string
  addressLabelCode?: string[]
  source?: number
  id?: string | number
  onlyMdRepeatValue?: string
  defaultFlag?: boolean
  inviteCode?: string
}

/** 图片 Base64 前缀枚举 */
export enum ImageBase64 {
  'png' = 'data:image/png;base64,',
  'jpeg' = 'data:image/jpeg;base64,',
}
