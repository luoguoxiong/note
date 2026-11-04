/**
 * @description 文件默认图片
 */
export const THUMBNAIL_ICONS: Record<string, string> = {
  default: 'https://ic-img.ky-express.com/netc/20250710_71251_!!1752154886852_104_104.png',
  jpeg: 'https://ic-img.ky-express.com/netc/20250710_15786_!!1752154913346_104_104.png',
  jpg: 'https://ic-img.ky-express.com/netc/20250619_36938_!!1750314896945_88_88.png',
  doc: 'https://ic-img.ky-express.com/netc/20260106_1643_!!1767703988727_112_112.png',
  docx: 'https://ic-img.ky-express.com/netc/20260106_1643_!!1767703988727_112_112.png',
  pdf: 'https://ic-img.ky-express.com/netc/20260106_80736_!!1767703935799_112_112.png',
  png: 'https://ic-img.ky-express.com/netc/20250710_6697_!!1752154966711_104_104.png',
  xls: 'https://ic-img.ky-express.com/netc/20260106_74994_!!1767703890573_112_112.png',
  xlsx: 'https://ic-img.ky-express.com/netc/20260106_74994_!!1767703890573_112_112.png',
}
/**
 * @description 文件状态
 */
export enum STATUS {
  WAIT = 1,
  FAIL = 2,
  SUCCESS = 3,
  DELETING = 4,
  UPLOADING = 5,
}

/**
 * @description 文件的bizCode
 */
export const fileBizCode = {
  取货资料正式: 'pickup_proxy',
  取货资料临时: 'WEB_ORDER_PICKUP_MATERIALS_TEMPORARY',
  派货资料正式: 'erp_upload_image_preOrder',
  派货资料临时: 'WEB_ORDER_DISPATCH_MATERIALS_TEMPORARY',
  电子回单正式: 'Electronic_receipt_original',
  电子回单临时: 'WEB_ORDER_MATERIALS_TEMPORARY',
  跨越代打正式: 'pinchHit_receipt_original',
  跨越代打临时: 'WEB_ORDER_RECEIPT_HELP_MATERIALS_TEMPORARY',
  安装服务: 'waybill_ruban_pic',
  发货明细临时: 'WEB_ORDER_GOODS_DELIVERY_DETAIL_TEMPORARY',
}

/**
 * @description 文件初始化来源
 */
export enum MaterialSource {
  '下单' = 10,
  '查件' = 20,
  '修改运单' = 30,
}

/**
 * @description 文件初始化materialTypes
 */
export enum MaterialTypes {
  '取货资料' = '10',
  '派货资料' = '20',
  '电子回单' = '30',
  '跨越代打' = '40',
  '货物照片' = '50',
  '发货明细' = '60',
}
