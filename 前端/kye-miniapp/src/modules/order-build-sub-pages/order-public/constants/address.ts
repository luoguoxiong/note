// 地址相关
export enum Address {
  'SENDER' = 'SENDER', // 寄方
  'SENDER_PAGE' = 'SENDER_PAGE', // 寄方填单页
  'RECEIVE' = 'RECEIVE', // 收方
  'RECEIVE_PAGE' = 'RECEIVE_PAGE', // 收方填单页
  'FIELDS' = 'FIELDS', // 字段维护
  'COMBINATION' = 'COMBINATION', // 组合维护
  'SENDER_ADDRESS_TYPE' = '10', // 寄件地址簿标识
  'RECEIVE_ADDRESS_TYPE' = '20', // 收件地址簿标识
  'RECEIPTER_ADDRESS_TYPE' = '30', // 返单地址表示
  'SENDER_ADDRESS_PAGE_TYPE' = '10', // 寄方跳转场景（地址簿）
  'SENDER_ADDRESS_UNFOLD_TYPE' = '20', // 寄方平铺场景（地址簿）
  'RECEIVE_ADDRESS_UNFOLD_TYPE' = '20', // 收方平铺场景（地址簿）
  'RECEIVE_ADDRESS_PAGE_TYPE' = '20', // 收方跳转场景（地址簿）
  'SENDER_ADDRESS_BOOK_PAGE' = 'SENDER_ADDRESS_BOOK_PAGE', // 寄件地址簿新增或者编辑页面标识
  'RECEIVE_ADDRESS_BOOK_PAGE' = 'RECEIVE_ADDRESS_BOOK_PAGE', // 收件地址簿新增或者编辑页面标识
}

/**
 * @description 地址类型，10寄件，20收件
 */
export enum AddressType {
  'SENDER' = 10,
  'RECEIVE' = 20,
  'RECEIPTER' = 30,
}

export enum AddressTypeStr {
  'SENDER' = '10',
  'RECEIVE' = '20',
}

/**
 * @description 地址校正-完善地址返回类型
 */
export enum CompleteResultType {
  '正常' = '10',
  '异常' = '20',
}

/**
 * @description 地址校正-完善地址是否需要弹窗
 */
export enum CompleteNeedFlag {
  '需要弹窗' = '10',
  '不需要弹窗' = '20',
}

/**
 * @description 地址校正-完善地址场景类型
 */
export enum CompleteAddressSceneType {
  '下单' = '20', // 下单的寄/收场景
  '地址簿' = '40', // 地址簿场景
}

/**
 * @description 地址簿-地址完善标识
 */
export enum AddressCompleteFlag {
  '待完善' = '10',
}

/**
 * @description 是否默认
 */
export enum DefaultType {
  'YES' = 1,
  'NO' = 0,
}

/**
 * @description 地图解析标识
 */
export enum ResolutionOcr {
  '地图' = 1,
  'AI地址推荐' = 0,
}

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
  defaultSwitch?: boolean
}

// 寄收信息页面来源
export enum pageUseAddress {
  'SENDERUNFOLD' = 'sender-unfold', //寄件平铺
  'RECEIVEUNFOLD' = 'receive-unfold', //收件平铺
  'SENDERPAGE' = 'sender-page', //跳转寄件
  'RECEIVEPAGE' = 'receive-page', //跳转收件
  'ADDRESSBOOKSENDER' = 'address-book-sender', //地址簿寄件
  'ADDRESSBOOKRECEIVE' = 'address-book-receive', //地址簿收件
  'INVITEADDRESS' = 'invite-address', //邀请寄收件地址（分享填写页，不展示地址标签）
}

export enum UpdateAddressStatus {
  '重复地址' = 20,
  '公司地址簿已存在' = 30,
}

export const OCR_PLACEHOLDER =
  '粘贴文本或上传图片，自动识别地址信息\r\n例如：跨越越 158xxxxxxxx 广东省深圳市宝安区xx路xx号'

/**
 * @description 下单配置智能识别操作场景
 */
export enum EAM_ORDER_ADDRESS_SCENE_TYPE {
  '填写寄件信息寄件详细地址' = '1001',
  '填写收件件信息寄件详细地址' = '1002',
  '寄件智能识别' = '2001',
  '收件智能识别' = '2002',
  '回单返单识别' = '4001',
}

/**
 * 设置定位信息延迟时间
 */
export const SET_MAP_POSITION_DELAY = 500
